import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { SandboxPaymentProvider } from '../adapters/sandbox-payment.provider';
import { NotificationService } from '../../notifications/notification.service';
import { PaymentLifecycleStatus, SettlementStatus, BookingLifecycleStatus } from '@prisma/client';

export interface CreateOrderDto {
  bookingId: string;
  userId: string;
  paymentMethod?: string;
  idempotencyKey?: string;
}

export interface VerifyPaymentDto {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
  userId?: string;
}

export interface ProcessRefundDto {
  bookingId: string;
  amountInr?: number;
  reason: string;
  actorId?: string;
  actorEmail?: string;
}

@Injectable()
export class PaymentOrderService {
  private readonly logger = new Logger(PaymentOrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly sandboxProvider: SandboxPaymentProvider,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Create Payment Order derived strictly from server-side Booking.totalAmountInr
   */
  async createOrder(dto: CreateOrderDto) {
    const { bookingId, userId, paymentMethod = 'SANDBOX_UPI', idempotencyKey } = dto;

    // 1. Idempotency Protection
    if (idempotencyKey) {
      const existingPayment = await this.prisma.payment.findUnique({
        where: { idempotencyKey },
        include: { booking: true },
      });
      if (existingPayment) {
        this.logger.warn(`[PaymentOrderService] Duplicate payment order request prevented by idempotencyKey (${idempotencyKey})`);
        return existingPayment;
      }
    }

    // 2. Retrieve Authoritative Booking
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found.`);
    }

    // 3. Ownership & Eligibility Check
    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only create payment orders for your own bookings.');
    }

    if (booking.status === BookingLifecycleStatus.CANCELLED || booking.status === BookingLifecycleStatus.REJECTED) {
      throw new BadRequestException(`Cannot initiate payment for a ${booking.status} booking.`);
    }

    const totalAmount = Number(booking.totalAmountInr);
    if (totalAmount <= 0) {
      throw new BadRequestException('Payable amount must be greater than zero.');
    }

    // 4. Invoke Provider Abstraction (TEST / SANDBOX)
    const providerResult = await this.sandboxProvider.createPaymentOrder({
      bookingId,
      customerId: userId,
      amountInr: totalAmount,
      paymentMethod,
      idempotencyKey,
    });

    // 5. Persist Payment Record in Database
    const payment = await this.prisma.payment.create({
      data: {
        bookingId,
        customerId: userId,
        provider: 'SANDBOX',
        gatewayOrderId: providerResult.gatewayOrderId,
        amountInr: totalAmount,
        currency: 'INR',
        status: PaymentLifecycleStatus.CREATED,
        paymentMethod,
        idempotencyKey: idempotencyKey || `idem_pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      },
      include: {
        booking: true,
      },
    });

    this.logger.log(`[PaymentOrderService] Created payment order ${payment.id} (Gateway Order ID: ${payment.gatewayOrderId}) for Booking ${booking.bookingReference}`);

    return {
      paymentId: payment.id,
      gatewayOrderId: payment.gatewayOrderId,
      bookingReference: booking.bookingReference,
      amountInr: totalAmount,
      currency: 'INR',
      status: payment.status,
      checkoutUrl: providerResult.checkoutUrl,
    };
  }

  /**
   * Server-Side Payment Verification & Atomic Confirmation Engine
   */
  async verifyPayment(dto: VerifyPaymentDto) {
    const { gatewayOrderId, gatewayPaymentId, signature, userId } = dto;

    // 1. Locate Payment
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayOrderId },
      include: { booking: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment record for Gateway Order ${gatewayOrderId} not found.`);
    }

    // Check ownership if userId provided
    if (userId && payment.customerId && payment.customerId !== userId) {
      throw new ForbiddenException('You cannot verify payments belonging to another customer.');
    }

    // Idempotency check: If already PAID, return clean idempotent response
    if (payment.status === PaymentLifecycleStatus.PAID) {
      this.logger.warn(`[PaymentOrderService] Re-verification callback for already PAID payment ${payment.id}`);
      const comm = await this.prisma.commissionRecord.findUnique({ where: { bookingId: payment.bookingId } });
      return {
        success: true,
        paymentId: payment.id,
        status: 'PAID',
        bookingStatus: payment.booking.status,
        note: 'Payment was already verified successfully.',
        commission: comm,
      };
    }

    // 2. Verify Provider Signature
    const isValid = await this.sandboxProvider.verifyPaymentSignature({
      gatewayOrderId,
      gatewayPaymentId,
      signature,
    });

    if (!isValid) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentLifecycleStatus.FAILED,
          failureReason: 'Invalid signature verification',
        },
      });
      throw new BadRequestException('Server-side payment signature verification failed.');
    }

    // 3. Execute Atomic Database Transaction
    const grossAmount = Number(payment.amountInr);
    const commissionRate = 10.00; // Default 10% platform commission
    const commissionAmount = Number(((grossAmount * commissionRate) / 100).toFixed(2));
    const supplierPayable = Number((grossAmount - commissionAmount).toFixed(2));

    const result = await this.prisma.$transaction(async (tx) => {
      // a. Update Payment to PAID
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentLifecycleStatus.PAID,
          gatewayTransactionId: gatewayPaymentId,
          paidAt: new Date(),
        },
      });

      // b. Update Booking status (PENDING -> CONFIRMED)
      const updatedBooking = await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: BookingLifecycleStatus.CONFIRMED,
          acceptedAt: payment.booking.acceptedAt || new Date(),
        },
      });

      // c. Upsert Commission Snapshot
      const commissionRecord = await tx.commissionRecord.upsert({
        where: { bookingId: payment.bookingId },
        create: {
          bookingId: payment.bookingId,
          supplierId: payment.booking.supplierId,
          grossAmountInr: grossAmount,
          commissionRate,
          commissionAmountInr: commissionAmount,
          supplierPayableInr: supplierPayable,
        },
        update: {
          grossAmountInr: grossAmount,
          commissionAmountInr: commissionAmount,
          supplierPayableInr: supplierPayable,
        },
      });

      // d. Upsert Supplier Settlement Record (if supplier attached)
      let settlementRecord = null;
      if (payment.booking.supplierId) {
        settlementRecord = await tx.settlementRecord.upsert({
          where: { bookingId: payment.bookingId },
          create: {
            supplierId: payment.booking.supplierId,
            bookingId: payment.bookingId,
            grossAmountInr: grossAmount,
            commissionAmountInr: commissionAmount,
            payableAmountInr: supplierPayable,
            status: SettlementStatus.PENDING,
            settlementReference: `STL-REF-${payment.booking.bookingReference}`,
          },
          update: {
            grossAmountInr: grossAmount,
            commissionAmountInr: commissionAmount,
            payableAmountInr: supplierPayable,
          },
        });
      }

      return { updatedPayment, updatedBooking, commissionRecord, settlementRecord };
    });

    // 4. Record Audit Log
    await this.auditService.logEvent({
      userId: payment.customerId || undefined,
      action: 'PAYMENT_SUCCESS',
      details: `Payment of ₹${grossAmount} verified for Booking ${payment.booking.bookingReference}`,
      entityType: 'PAYMENT',
      entityId: payment.id,
    });

    await this.notificationService.notifyPaymentSuccess(result.updatedPayment, result.updatedBooking);

    return {
      success: true,
      paymentId: result.updatedPayment.id,
      status: result.updatedPayment.status,
      bookingStatus: result.updatedBooking.status,
      bookingReference: result.updatedBooking.bookingReference,
      amountInr: grossAmount,
      commission: result.commissionRecord,
      settlement: result.settlementRecord,
    };
  }

  /**
   * Payment Retry Engine
   */
  async retryPayment(dto: CreateOrderDto) {
    return this.createOrder(dto);
  }

  /**
   * Process Refund
   */
  async processRefund(dto: ProcessRefundDto) {
    const { bookingId, amountInr, reason, actorId, actorEmail } = dto;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true, refunds: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found.`);
    }

    const paidPayments = booking.payments.filter(p => p.status === PaymentLifecycleStatus.PAID);
    if (paidPayments.length === 0) {
      throw new BadRequestException('No paid payments found for this booking.');
    }

    const totalPaid = paidPayments.reduce((sum, p) => sum + Number(p.amountInr), 0);
    const existingRefundsTotal = booking.refunds.reduce((sum, r) => sum + Number(r.amountInr), 0);
    const refundAmount = amountInr || (totalPaid - existingRefundsTotal);

    if (refundAmount <= 0) {
      throw new BadRequestException('Refund amount must be greater than zero.');
    }

    if (existingRefundsTotal + refundAmount > totalPaid) {
      throw new BadRequestException(`Refund amount ₹${refundAmount} exceeds eligible paid balance (₹${totalPaid - existingRefundsTotal}).`);
    }

    const primaryPayment = paidPayments[0];

    // Invoke Sandbox Provider Refund
    const providerRefund = await this.sandboxProvider.processRefund({
      paymentId: primaryPayment.id,
      gatewayTransactionId: primaryPayment.gatewayTransactionId || undefined,
      amountInr: refundAmount,
      reason,
    });

    // Execute DB Transaction
    const refundRecord = await this.prisma.$transaction(async (tx) => {
      const ref = await tx.refund.create({
        data: {
          bookingId,
          paymentId: primaryPayment.id,
          providerRefundId: providerRefund.providerRefundId,
          amountInr: refundAmount,
          status: 'COMPLETED',
          reason,
        },
      });

      const newTotalRefunded = existingRefundsTotal + refundAmount;
      const isFullRefund = newTotalRefunded >= totalPaid;

      await tx.payment.update({
        where: { id: primaryPayment.id },
        data: {
          status: isFullRefund ? PaymentLifecycleStatus.REFUNDED : PaymentLifecycleStatus.PARTIALLY_REFUNDED,
          refundedAt: new Date(),
        },
      });

      // Update Settlement record if ON_HOLD / CANCELLED
      if (booking.supplierId) {
        await tx.settlementRecord.updateMany({
          where: { bookingId },
          data: { status: SettlementStatus.ON_HOLD, failureReason: `Booking refunded: ${reason}` },
        });
      }

      return ref;
    });

    await this.auditService.logEvent({
      userId: actorId,
      adminEmail: actorEmail,
      action: 'PROCESS_REFUND',
      details: `Refund of ₹${refundAmount} processed for Booking ${booking.bookingReference}`,
      entityType: 'REFUND',
      entityId: refundRecord.id,
      reason,
    });

    await this.notificationService.notifyRefundProcessed(refundRecord, booking);

    return refundRecord;
  }

  /**
   * Supplier Financial Directory (Strictly Scoped)
   */
  async getSupplierPayments(supplierId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { supplierId },
      include: {
        payments: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const bookingIds = bookings.map(b => b.id);

    const commissions = await this.prisma.commissionRecord.findMany({
      where: { bookingId: { in: bookingIds } },
    });

    const settlements = await this.prisma.settlementRecord.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'desc' },
    });

    const commissionMap = new Map(commissions.map(c => [c.bookingId, c]));

    const items = bookings.map(b => {
      const comm = commissionMap.get(b.id);
      const paidPayment = b.payments.find(p => p.status === PaymentLifecycleStatus.PAID);
      const gross = Number(b.totalAmountInr);
      const commissionAmount = comm ? Number(comm.commissionAmountInr) : Number((gross * 0.10).toFixed(2));
      const payableAmount = comm ? Number(comm.supplierPayableInr) : Number((gross - commissionAmount).toFixed(2));

      return {
        bookingId: b.id,
        bookingReference: b.bookingReference,
        bookingType: b.bookingType,
        customerName: b.user.fullName,
        startDate: b.startDate,
        status: b.status,
        paymentStatus: paidPayment ? 'PAID' : (b.payments[0]?.status || 'UNPAID'),
        grossAmountInr: gross,
        commissionRate: comm ? Number(comm.commissionRate) : 10.00,
        commissionAmountInr: commissionAmount,
        supplierPayableInr: payableAmount,
        createdAt: b.createdAt,
      };
    });

    const totalGross = items.filter(i => i.paymentStatus === 'PAID').reduce((sum, i) => sum + i.grossAmountInr, 0);
    const totalCommission = items.filter(i => i.paymentStatus === 'PAID').reduce((sum, i) => sum + i.commissionAmountInr, 0);
    const totalNetPayable = items.filter(i => i.paymentStatus === 'PAID').reduce((sum, i) => sum + i.supplierPayableInr, 0);

    return {
      metrics: {
        totalGrossValueInr: Number(totalGross.toFixed(2)),
        totalCommissionDeductedInr: Number(totalCommission.toFixed(2)),
        totalNetPayableInr: Number(totalNetPayable.toFixed(2)),
        pendingSettlementsCount: settlements.filter(s => s.status === 'PENDING').length,
      },
      transactions: items,
      settlements,
    };
  }

  /**
   * Admin Financial Summary Dashboard (Real Database Metrics)
   */
  async getAdminFinanceSummary() {
    const paidPayments = await this.prisma.payment.findMany({
      where: { status: PaymentLifecycleStatus.PAID },
    });

    const failedPayments = await this.prisma.payment.count({
      where: { status: PaymentLifecycleStatus.FAILED },
    });

    const commissions = await this.prisma.commissionRecord.findMany();
    const settlements = await this.prisma.settlementRecord.findMany();
    const refunds = await this.prisma.refund.findMany({ where: { status: 'COMPLETED' } });

    const totalPaidBookings = paidPayments.length;
    const grossBookingValueInr = paidPayments.reduce((sum, p) => sum + Number(p.amountInr), 0);
    const platformCommissionInr = commissions.reduce((sum, c) => sum + Number(c.commissionAmountInr), 0);
    const netSupplierPayableInr = commissions.reduce((sum, c) => sum + Number(c.supplierPayableInr), 0);
    const totalRefundsInr = refunds.reduce((sum, r) => sum + Number(r.amountInr), 0);
    const pendingSettlementsInr = settlements.filter(s => s.status === 'PENDING').reduce((sum, s) => sum + Number(s.payableAmountInr), 0);

    return {
      totalPaidBookings,
      failedPaymentsCount: failedPayments,
      grossBookingValueInr: Number(grossBookingValueInr.toFixed(2)),
      platformCommissionInr: Number(platformCommissionInr.toFixed(2)),
      netSupplierPayableInr: Number(netSupplierPayableInr.toFixed(2)),
      totalRefundsInr: Number(totalRefundsInr.toFixed(2)),
      pendingSettlementsInr: Number(pendingSettlementsInr.toFixed(2)),
      settlementsCount: settlements.length,
    };
  }
}
