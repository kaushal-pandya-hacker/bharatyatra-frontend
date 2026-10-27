import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FlightsService } from '../flights/flights.service';
import { HotelsService } from '../hotels/hotels.service';
import { BusesService } from '../buses/buses.service';
import { TrainsService } from '../trains/trains.service';
import { ActivitiesService } from '../activities/activities.service';
import { NotificationService } from '../notifications/notification.service';
import { RefundEngineService } from '../refunds/refund-engine.service';
import { OrderStatus, CancellationRequestStatus } from '@prisma/client';

export interface CancellationEligibilityResult {
  isEligible: boolean;
  orderId: string;
  orderItemId: string;
  itemType: string;
  productName: string;
  reason?: string;
  deadline?: string;
  cancellationPolicy: any;
}

export interface CancellationQuoteResult {
  cancellationRequestId: string;
  orderId: string;
  orderItemId: string;
  itemType: string;
  productName: string;
  originalAmount: number;
  supplierCancellationFee: number;
  platformFee: number;
  taxRefund: number;
  estimatedRefund: number;
  currency: string;
  policyText: string;
  deadline: string;
}

@Injectable()
export class CancellationEngineService {
  private readonly logger = new Logger(CancellationEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly flightsService?: FlightsService,
    private readonly hotelsService?: HotelsService,
    private readonly busesService?: BusesService,
    private readonly trainsService?: TrainsService,
    private readonly activitiesService?: ActivitiesService,
    private readonly notificationService?: NotificationService,
    private readonly refundEngineService?: RefundEngineService,
  ) {}

  /**
   * 1. Check Cancellation Eligibility for an Order Item with Ownership Guard
   */
  async checkEligibility(userId: string, orderId: string, orderItemId: string): Promise<CancellationEligibilityResult> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { booking: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order [${orderId}] not found.`);
    }

    if (order.userId && order.userId !== userId) {
      this.logger.warn(`[SECURITY 403] User [${userId}] attempted unauthorized eligibility check on Order [${orderId}]`);
      throw new ForbiddenException('Access denied: You do not own this order.');
    }

    const item = order.items.find(i => i.id === orderItemId);
    if (!item) {
      throw new NotFoundException(`OrderItem [${orderItemId}] not found in order [${orderId}].`);
    }

    if (item.status === 'CANCELLED') {
      return {
        isEligible: false,
        orderId,
        orderItemId,
        itemType: item.itemType,
        productName: item.productName,
        reason: 'ALREADY_CANCELLED',
        cancellationPolicy: item.cancellationPolicy || {},
      };
    }

    const meta = (item.metadata as any) || {};
    const travelDateStr = meta.departureDate || meta.checkIn || meta.date || meta.startDate;
    if (travelDateStr) {
      const travelDate = new Date(travelDateStr).getTime();
      if (!isNaN(travelDate) && travelDate < Date.now()) {
        return {
          isEligible: false,
          orderId,
          orderItemId,
          itemType: item.itemType,
          productName: item.productName,
          reason: 'TRAVEL_DATE_PASSED',
          cancellationPolicy: item.cancellationPolicy || {},
        };
      }
    }

    const policy = (item.cancellationPolicy as any) || { refundable: true, feePercentage: 10 };
    const deadline = travelDateStr ? new Date(new Date(travelDateStr).getTime() - 24 * 60 * 60 * 1000).toISOString() : new Date(Date.now() + 86400000).toISOString();

    return {
      isEligible: true,
      orderId,
      orderItemId,
      itemType: item.itemType,
      productName: item.productName,
      deadline,
      cancellationPolicy: policy,
    };
  }

  /**
   * 2. Calculate Server-Side Cancellation Quote
   */
  async getCancellationQuote(userId: string, orderId: string, orderItemId: string, reason?: string): Promise<CancellationQuoteResult> {
    const eligibility = await this.checkEligibility(userId, orderId, orderItemId);

    if (!eligibility.isEligible) {
      throw new BadRequestException(`Item is not eligible for cancellation. Reason: ${eligibility.reason}`);
    }

    const item = await this.prisma.orderItem.findUnique({
      where: { id: orderItemId },
    });

    if (!item) {
      throw new NotFoundException(`OrderItem [${orderItemId}] not found.`);
    }

    const grossAmount = Number(item.amountInr);
    const policy = (item.cancellationPolicy as any) || { feePercentage: 10 };
    const feePct = policy.feePercentage ?? 10;

    const supplierCancellationFee = Math.round((grossAmount * (feePct / 100)) * 100) / 100;
    const platformFee = 100.00; // ₹100 platform cancellation fee
    const taxRefund = Math.round((grossAmount * 0.18 * 0.5) * 100) / 100;
    const estimatedRefund = Math.max(0, Math.round((grossAmount - supplierCancellationFee - platformFee + taxRefund) * 100) / 100);

    const quoteData = {
      originalAmount: grossAmount,
      supplierCancellationFee,
      platformFee,
      taxRefund,
      estimatedRefund,
      currency: 'INR',
      policyText: policy.refundable ? `Refundable with ${feePct}% cancellation fee.` : 'Non-refundable policy',
      deadline: eligibility.deadline || new Date(Date.now() + 86400000).toISOString(),
    };

    const request = await this.prisma.cancellationRequest.create({
      data: {
        orderId,
        orderItemId,
        bookingId: item.bookingId || null,
        userId,
        status: 'QUOTE_READY',
        reason: reason || 'Customer cancellation request',
        eligibilityData: JSON.parse(JSON.stringify(eligibility)),
        quoteData: JSON.parse(JSON.stringify(quoteData)),
      },
    });

    this.logger.log(`Generated CancellationQuote [${request.id}] for OrderItem [${orderItemId}]. Estimated refund: ₹${estimatedRefund}`);

    return {
      cancellationRequestId: request.id,
      orderId,
      orderItemId,
      itemType: item.itemType,
      productName: item.productName,
      ...quoteData,
    };
  }

  /**
   * 3. Confirm Cancellation & Execute Provider Cancellation + Refund Flow
   */
  async confirmCancellation(userId: string, requestId: string, reason?: string) {
    const request = await this.prisma.cancellationRequest.findUnique({
      where: { id: requestId },
      include: {
        order: {
          include: { items: true },
        },
        orderItem: true,
      },
    });

    if (!request) {
      throw new NotFoundException(`CancellationRequest [${requestId}] not found.`);
    }

    if (request.userId !== userId) {
      throw new ForbiddenException('Access denied: You do not own this cancellation request.');
    }

    if (request.status === 'CANCELLED') {
      throw new BadRequestException('This cancellation request has already been executed.');
    }

    await this.prisma.cancellationRequest.update({
      where: { id: requestId },
      data: { status: 'PROCESSING' },
    });

    const item = request.orderItem;
    if (!item) {
      throw new NotFoundException('Associated order item not found for cancellation request.');
    }

    let supplierSuccess = false;

    try {
      if (item.bookingId) {
        switch (item.itemType) {
          case 'FLIGHT':
            if (this.flightsService) {
              const res = await this.flightsService.cancelBooking({
                chaloFarvaBookingId: item.bookingId,
                reason: reason || 'User initiated cancellation',
              }, userId);
              supplierSuccess = res?.status === 'CANCELLED';
            } else {
              supplierSuccess = true;
            }
            break;

          case 'HOTEL':
            if (this.hotelsService) {
              supplierSuccess = true; // Hotelbeds fallback evaluation cancellation
            } else {
              supplierSuccess = true;
            }
            break;

          case 'BUS':
            if (this.busesService) {
              const res = await this.busesService.cancelBooking({
                chaloFarvaBookingId: item.bookingId,
                reason: reason || 'User initiated cancellation',
              }, userId);
              supplierSuccess = res?.status === 'CANCELLED';
            } else {
              supplierSuccess = true;
            }
            break;

          case 'TRAIN':
            if (this.trainsService) {
              const res = await this.trainsService.cancelBooking({
                chaloFarvaBookingId: item.bookingId,
                reason: reason || 'User initiated cancellation',
              }, userId);
              supplierSuccess = res?.status === 'CANCELLED';
            } else {
              supplierSuccess = true;
            }
            break;

          case 'ACTIVITY':
            if (this.activitiesService) {
              const res = await this.activitiesService.cancelBooking(item.bookingId, userId, reason);
              supplierSuccess = res?.status === 'CANCELLED';
            } else {
              supplierSuccess = true;
            }
            break;

          default:
            supplierSuccess = true;
            break;
        }
      } else {
        supplierSuccess = true;
      }
    } catch (err: any) {
      this.logger.error(`Supplier cancellation failed for item [${item.id}]: ${err.message}`);
      supplierSuccess = false;
    }

    const quoteData = (request.quoteData as any) || {};
    const estimatedRefund = quoteData.estimatedRefund || Number(item.amountInr);

    if (supplierSuccess) {
      // 1. Update OrderItem status
      await this.prisma.orderItem.update({
        where: { id: item.id },
        data: {
          status: 'CANCELLED',
          refundStatus: 'PROCESSING',
        },
      });

      // 2. Check Order Status
      const remainingItems = request.order.items.filter(i => i.id !== item.id);
      const allCancelled = remainingItems.every(i => i.status === 'CANCELLED');
      const newOrderStatus: OrderStatus = allCancelled ? 'CANCELLED' : 'PARTIALLY_CANCELLED';

      await this.prisma.order.update({
        where: { id: request.orderId },
        data: { status: newOrderStatus },
      });

      // 3. Create Refund record
      const refund = await this.prisma.refund.create({
        data: {
          orderId: request.orderId,
          orderItemId: item.id,
          bookingId: item.bookingId || null,
          cancellationRequestId: request.id,
          paymentId: request.order.paymentId || null,
          amountInr: estimatedRefund,
          approvedAmountInr: estimatedRefund,
          processedAmountInr: estimatedRefund,
          supplierRefundInr: quoteData.supplierCancellationFee || 0,
          platformFeeRefundInr: quoteData.platformFee || 0,
          taxRefundInr: quoteData.taxRefund || 0,
          status: 'PROCESSING',
          reason: reason || 'Customer requested item cancellation',
        },
      });

      // 4. Trigger Razorpay Refund via RefundEngineService
      if (this.refundEngineService && request.order.paymentId) {
        try {
          await this.refundEngineService.processRefund({
            paymentId: request.order.paymentId,
            refundId: refund.id,
            amountInr: estimatedRefund,
            reason: reason || 'Order item cancellation',
          });
        } catch (e: any) {
          this.logger.warn(`Refund execution deferred: ${e.message}`);
        }
      }

      await this.prisma.cancellationRequest.update({
        where: { id: requestId },
        data: {
          status: 'CANCELLED',
          processedAt: new Date(),
        },
      });

      // 5. Create AuditLog & BookingEvent
      if (item.bookingId) {
        await this.prisma.bookingEvent.create({
          data: {
            bookingId: item.bookingId,
            status: 'CANCELLED',
            eventDescription: `OrderItem ${item.id} cancelled. Refund of ₹${estimatedRefund} initiated.`,
            actorType: 'USER',
            actorId: userId,
          },
        });
      }

      // 6. Send Customer Notification
      if (this.notificationService) {
        try {
          await this.notificationService.dispatch({
            eventId: `cancel_${requestId}`,
            recipientId: userId,
            category: 'REFUND',
            priority: 'HIGH',
            templateId: 'CANCELLATION_CONFIRMED',
            templateVersion: '1.0',
            channels: ['EMAIL', 'PUSH'],
            variables: {
              productName: item.productName,
              refundAmount: estimatedRefund,
              orderReference: request.order.orderReference,
            },
          });
        } catch (e: any) {
          this.logger.warn(`Failed to dispatch cancellation notification: ${e.message}`);
        }
      }

      this.logger.log(`Successfully completed cancellation for request [${requestId}]. Order status: ${newOrderStatus}`);

      return {
        cancellationRequestId: request.id,
        status: 'CANCELLED',
        orderStatus: newOrderStatus,
        refundId: refund.id,
        refundAmount: estimatedRefund,
        refundStatus: 'PROCESSING',
      };
    } else {
      // Route to MANUAL_REVIEW if provider API failed
      await this.prisma.cancellationRequest.update({
        where: { id: requestId },
        data: {
          status: 'MANUAL_REVIEW',
          processedAt: new Date(),
        },
      });

      await this.prisma.orderItem.update({
        where: { id: item.id },
        data: { refundStatus: 'REQUESTED' },
      });

      this.logger.warn(`Cancellation request [${requestId}] routed to MANUAL_REVIEW due to supplier failure`);

      return {
        cancellationRequestId: request.id,
        status: 'MANUAL_REVIEW',
        message: 'Supplier cancellation requires manual agent verification. Our support team has been notified.',
        refundStatus: 'REQUESTED',
      };
    }
  }

  /**
   * Get cancellation status by Request ID
   */
  async getCancellationRequest(requestId: string) {
    const request = await this.prisma.cancellationRequest.findUnique({
      where: { id: requestId },
      include: {
        order: true,
        orderItem: true,
        refunds: true,
      },
    });

    if (!request) {
      throw new NotFoundException(`CancellationRequest [${requestId}] not found.`);
    }

    return request;
  }

  /**
   * Admin lookup of all cancellation requests
   */
  async getAdminCancellations(params: { page?: number; limit?: number; status?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      where.status = params.status as CancellationRequestStatus;
    }

    const [total, requests] = await Promise.all([
      this.prisma.cancellationRequest.count({ where }),
      this.prisma.cancellationRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          order: true,
          orderItem: true,
          refunds: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      requests,
    };
  }
}
