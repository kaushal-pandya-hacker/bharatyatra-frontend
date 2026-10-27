import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FlightsService } from '../flights/flights.service';
import { HotelsService } from '../hotels/hotels.service';
import { BusesService } from '../buses/buses.service';
import { TrainsService } from '../trains/trains.service';
import { ActivitiesService } from '../activities/activities.service';
import { NotificationService } from '../notifications/notification.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly flightsService?: FlightsService,
    private readonly hotelsService?: HotelsService,
    private readonly busesService?: BusesService,
    private readonly trainsService?: TrainsService,
    private readonly activitiesService?: ActivitiesService,
    private readonly notificationService?: NotificationService,
  ) {}

  /**
   * Helper to generate unique order reference: CF-ORD-YYYYMMDD-XXXXXX
   */
  public generateOrderReference(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `CF-ORD-${dateStr}-${rand}`;
  }

  /**
   * Create Order from confirmed CheckoutSession after payment verification
   */
  async createOrderFromCheckout(sessionId: string, paymentId?: string) {
    const session = await this.prisma.checkoutSession.findUnique({
      where: { id: sessionId },
      include: {
        cart: {
          include: { items: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`CheckoutSession [${sessionId}] not found`);
    }

    const priceSnapshot = session.priceSnapshot as any;
    const orderRef = this.generateOrderReference();

    // Prevent duplicate orders for the same checkout session
    const existingOrder = await this.prisma.order.findFirst({
      where: { checkoutSessionId: sessionId },
      include: { items: true, allocations: true },
    });

    if (existingOrder) {
      this.logger.log(`Order already exists for session [${sessionId}], returning [${existingOrder.id}]`);
      return existingOrder;
    }

    const order = await this.prisma.order.create({
      data: {
        orderReference: orderRef,
        userId: session.userId || null,
        checkoutSessionId: session.id,
        paymentId: paymentId || null,
        currency: priceSnapshot.currency || 'INR',
        subtotal: priceSnapshot.subtotal || 0,
        taxes: priceSnapshot.taxes || 0,
        serviceFee: priceSnapshot.serviceFee || 0,
        discount: priceSnapshot.discount || 0,
        totalAmountInr: priceSnapshot.totalAmountInr || 0,
        status: 'PAID',
      },
    });

    // Create OrderItems & PaymentAllocations for each cart item
    for (const item of session.cart.items) {
      const orderItem = await this.prisma.orderItem.create({
        data: {
          orderId: order.id,
          itemType: item.itemType,
          referenceId: item.referenceId,
          provider: item.provider,
          productName: item.productName,
          metadata: item.metadata || {},
          amountInr: item.priceSnapshot,
          status: 'PENDING',
          cancellationPolicy: { refundable: true, feePercentage: 10 },
        },
      });

      // Internal payment allocation
      await this.prisma.paymentAllocation.create({
        data: {
          paymentId: paymentId || null,
          orderId: order.id,
          orderItemId: orderItem.id,
          itemType: item.itemType,
          itemReference: item.referenceId,
          amountInr: item.priceSnapshot,
          status: 'ALLOCATED',
        },
      });
    }

    // Mark Cart as COMPLETED
    await this.prisma.cart.update({
      where: { id: session.cartId },
      data: { status: 'COMPLETED' },
    });

    this.logger.log(`Created Order [${order.id}] (${orderRef}) for session [${sessionId}]`);

    // Trigger sequential supplier booking orchestration
    return this.orchestrateOrderBookings(order.id, session.revalidationStatus as any);
  }

  /**
   * Deterministic Booking Orchestration across individual suppliers
   */
  async orchestrateOrderBookings(orderId: string, sessionMetaData?: any) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order [${orderId}] not found`);
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PROCESSING' },
    });

    const contactInfo = sessionMetaData?.contactInfo || {};
    const travelers = sessionMetaData?.travelers || [];
    const userIdToUse = order.userId || '00000000-0000-0000-0000-000000000001';

    let successCount = 0;
    let failCount = 0;

    for (const item of order.items) {
      const idempotencyKey = `order_${order.id}_item_${item.id}`;
      let isSuccess = false;
      let createdBookingId: string | null = null;

      try {
        const meta = (item.metadata as any) || {};

        switch (item.itemType) {
          case 'FLIGHT':
            if (this.flightsService) {
              const res = await this.flightsService.createBooking(
                {
                  transportId: item.referenceId,
                  type: 'FLIGHT',
                  providerId: item.provider || 'prov-tbo-air',
                  currency: 'INR',
                  agreedFare: Number(item.amountInr),
                  contactEmail: contactInfo.email || 'guest@bharatyatra.com',
                  contactPhone: contactInfo.phone || '+919876543210',
                  passengers: travelers.length > 0 ? travelers.map((t: any) => ({
                    title: 'MR',
                    firstName: t.fullName?.split(' ')[0] || 'Guest',
                    lastName: t.fullName?.split(' ')[1] || 'User',
                    passengerType: 'ADULT' as const,
                  })) : [{ title: 'MR', firstName: contactInfo.fullName?.split(' ')[0] || 'Guest', lastName: contactInfo.fullName?.split(' ')[1] || 'User', passengerType: 'ADULT' as const }],
                  idempotencyKey,
                },
                userIdToUse,
              );
              createdBookingId = (res as any)?.chaloFarvaBookingId || null;
              isSuccess = true;
            } else {
              isSuccess = true;
            }
            break;

          case 'HOTEL':
            if (this.hotelsService) {
              const res = await this.hotelsService.createBooking(
                userIdToUse,
                {
                  rateKey: meta.rateKey || item.referenceId,
                  hotelCode: item.referenceId,
                  hotelName: item.productName,
                  checkIn: meta.checkIn || meta.startDate || new Date().toISOString().slice(0, 10),
                  checkOut: meta.checkOut || meta.endDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
                  roomName: meta.roomName || 'Deluxe Room',
                  boardName: meta.boardName || 'Room Only',
                  price: Number(item.amountInr),
                  holder: {
                    name: contactInfo.fullName?.split(' ')[0] || 'Guest',
                    surname: contactInfo.fullName?.split(' ')[1] || 'User',
                    email: contactInfo.email || 'guest@bharatyatra.com',
                    phone: contactInfo.phone || '+919876543210',
                  },
                  paxDetails: travelers.length > 0 ? travelers.map((t: any) => ({
                    type: 'AD' as const,
                    name: t.fullName?.split(' ')[0] || 'Guest',
                    surname: t.fullName?.split(' ')[1] || 'User',
                  })) : [{ type: 'AD' as const, name: 'Guest', surname: 'User' }],
                },
                idempotencyKey,
              );
              createdBookingId = (res as any)?.chaloFarvaBookingId || null;
              isSuccess = true;
            } else {
              isSuccess = true;
            }
            break;

          case 'BUS':
            if (this.busesService) {
              const res = await this.busesService.createBooking(
                {
                  transportId: item.referenceId,
                  type: 'BUS',
                  providerId: item.provider || 'prov-etravelsmart-bus',
                  currency: 'INR',
                  agreedFare: Number(item.amountInr),
                  contactEmail: contactInfo.email || 'guest@bharatyatra.com',
                  contactPhone: contactInfo.phone || '+919876543210',
                  passengers: travelers.length > 0 ? travelers.map((t: any, idx: number) => ({
                    title: 'MR',
                    firstName: t.fullName?.split(' ')[0] || 'Guest',
                    lastName: t.fullName?.split(' ')[1] || 'User',
                    seatNumber: meta.seatNumbers?.[idx] || `S${idx + 1}`,
                    passengerType: 'ADULT' as const,
                  })) : [{ title: 'MR', firstName: 'Guest', lastName: 'User', seatNumber: 'S1', passengerType: 'ADULT' as const }],
                  idempotencyKey,
                },
                userIdToUse,
              );
              createdBookingId = (res as any)?.chaloFarvaBookingId || null;
              isSuccess = true;
            } else {
              isSuccess = true;
            }
            break;

          case 'TRAIN':
            if (this.trainsService) {
              const res = await this.trainsService.createBooking(
                {
                  transportId: item.referenceId,
                  type: 'TRAIN',
                  providerId: item.provider || 'prov-irctc-train',
                  currency: 'INR',
                  agreedFare: Number(item.amountInr),
                  contactEmail: contactInfo.email || 'guest@bharatyatra.com',
                  contactPhone: contactInfo.phone || '+919876543210',
                  passengers: travelers.length > 0 ? travelers.map((t: any) => ({
                    title: 'MR',
                    firstName: t.fullName?.split(' ')[0] || 'Guest',
                    lastName: t.fullName?.split(' ')[1] || 'User',
                    passengerType: 'ADULT' as const,
                  })) : [{ title: 'MR', firstName: 'Guest', lastName: 'User', passengerType: 'ADULT' as const }],
                  idempotencyKey,
                },
                userIdToUse,
              );
              createdBookingId = (res as any)?.chaloFarvaBookingId || null;
              isSuccess = true;
            } else {
              isSuccess = true;
            }
            break;

          case 'ACTIVITY':
            if (this.activitiesService) {
              const res = await this.activitiesService.createBooking(
                userIdToUse,
                {
                  activityId: item.referenceId,
                  activityTitle: item.productName,
                  date: meta.date || new Date().toISOString().slice(0, 10),
                  adults: meta.adults || 1,
                  children: meta.children || 0,
                  totalPrice: Number(item.amountInr),
                  holder: {
                    name: contactInfo.fullName?.split(' ')[0] || 'Guest',
                    surname: contactInfo.fullName?.split(' ')[1] || 'User',
                    email: contactInfo.email || 'guest@bharatyatra.com',
                    phone: contactInfo.phone || '+919876543210',
                  },
                },
                idempotencyKey,
              );
              createdBookingId = (res as any)?.chaloFarvaBookingId || null;
              isSuccess = true;
            } else {
              isSuccess = true;
            }
            break;

          default:
            isSuccess = true;
            break;
        }
      } catch (err: any) {
        this.logger.error(`Failed supplier booking for OrderItem [${item.id}] (${item.productName}): ${err.message}`);
        isSuccess = false;
      }

      if (isSuccess) {
        successCount++;
        await this.prisma.orderItem.update({
          where: { id: item.id },
          data: {
            status: 'CONFIRMED',
            ...(createdBookingId && { bookingId: createdBookingId }),
          },
        });
      } else {
        failCount++;
        await this.prisma.orderItem.update({
          where: { id: item.id },
          data: {
            status: 'FAILED',
            refundStatus: 'REQUESTED',
          },
        });

        await this.prisma.paymentAllocation.updateMany({
          where: { orderItemId: item.id },
          data: { status: 'REFUND_REQUIRED' },
        });
      }
    }

    let finalOrderStatus: OrderStatus = 'CONFIRMED';
    if (failCount > 0 && successCount > 0) {
      finalOrderStatus = 'PARTIALLY_CONFIRMED';
    } else if (failCount > 0 && successCount === 0) {
      finalOrderStatus = 'FAILED';
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: finalOrderStatus },
      include: {
        items: true,
        allocations: true,
      },
    });

    this.logger.log(`Order [${orderId}] orchestration complete. Status: ${finalOrderStatus} (Confirmed: ${successCount}, Failed: ${failCount})`);

    if (this.notificationService && order.userId) {
      try {
        await this.notificationService.dispatch({
          eventId: `order_${orderId}`,
          recipientId: order.userId,
          category: 'BOOKING',
          priority: 'HIGH',
          templateId: 'ORDER_STATUS_UPDATE',
          templateVersion: '1.0',
          channels: ['EMAIL', 'PUSH'],
          variables: {
            orderReference: updatedOrder.orderReference,
            status: finalOrderStatus,
          },
        });
      } catch (e: any) {
        this.logger.warn(`Failed to send order notification: ${e.message}`);
      }
    }

    return updatedOrder;
  }

  /**
   * Cancel an individual order item and calculate refund entitlement
   */
  async cancelOrderItem(
    orderId: string,
    orderItemId: string,
    requestingUserIdOrReason?: string,
    reason?: string,
  ) {
    let requestingUserId: string | undefined;
    let cancellationReason: string | undefined;

    if (reason !== undefined) {
      requestingUserId = requestingUserIdOrReason;
      cancellationReason = reason;
    } else {
      if (
        requestingUserIdOrReason &&
        (requestingUserIdOrReason.includes(' ') || requestingUserIdOrReason.length > 50)
      ) {
        cancellationReason = requestingUserIdOrReason;
      } else {
        requestingUserId = requestingUserIdOrReason;
      }
    }

    const item = await this.prisma.orderItem.findFirst({
      where: { id: orderItemId, orderId },
      include: { order: true },
    });

    if (!item) {
      throw new NotFoundException(`OrderItem [${orderItemId}] not found in order [${orderId}]`);
    }

    // Object-level authorization check: Verify ownership
    if (requestingUserId && item.order?.userId && item.order.userId !== requestingUserId) {
      throw new ForbiddenException('Access denied: You do not own this order.');
    }

    if (item.status === 'CANCELLED') {
      throw new BadRequestException('Order item is already cancelled.');
    }

    const cancellationPolicy = (item.cancellationPolicy as any) || { feePercentage: 10 };
    const feePct = cancellationPolicy.feePercentage ?? 10;
    const grossAmount = Number(item.amountInr);
    const refundAmount = Math.round(grossAmount * (1 - feePct / 100) * 100) / 100;

    await this.prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        status: 'CANCELLED',
        refundStatus: 'REQUESTED',
      },
    });

    await this.prisma.paymentAllocation.updateMany({
      where: { orderItemId },
      data: { status: 'CANCELLED_REFUND_PENDING' },
    });

    this.logger.log(`Cancelled OrderItem [${orderItemId}]. Calculated refund amount: ₹${refundAmount} (${cancellationReason || 'Customer requested'})`);

    return {
      orderItemId,
      status: 'CANCELLED',
      grossAmount,
      feePercentage: feePct,
      refundAmount,
      refundStatus: 'REQUESTED',
    };
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        allocations: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get order by ID or orderReference with object-level authorization
   */
  async getOrderById(orderIdOrRef: string, requestingUserId?: string, isAdmin?: boolean) {
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [{ id: orderIdOrRef }, { orderReference: orderIdOrRef }],
      },
      include: {
        items: {
          include: {
            booking: true,
          },
        },
        allocations: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order [${orderIdOrRef}] not found`);
    }

    // Object-level authorization check
    if (requestingUserId && order.userId && order.userId !== requestingUserId && !isAdmin) {
      throw new ForbiddenException('Access denied: You do not have permission to view this order.');
    }

    return order;
  }

  /**
   * Admin order lookup & dashboard overview
   */
  async getAdminOrders(params: { page?: number; limit?: number; status?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      where.status = params.status as OrderStatus;
    }

    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: true,
          allocations: true,
          user: {
            select: { id: true, email: true, fullName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      orders,
    };
  }
}
