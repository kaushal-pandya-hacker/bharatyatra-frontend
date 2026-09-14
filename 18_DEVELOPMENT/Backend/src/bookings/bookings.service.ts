import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, CancelBookingDto, InventoryTypeEnum } from './dto/booking.dto';
import { BookingLifecycleStatus } from '@prisma/client';
import * as crypto from 'crypto';

import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {}

  private generateBookingReference(): string {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `CF-2026-${randomHex}`;
  }

  private isValidUuid(id: string): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
  }

  async createBooking(userId: string, dto: CreateBookingDto, idempotencyHeader?: string) {
    this.logger.log(`[BookingsService] Processing booking creation for User: ${userId}, Type: ${dto.inventoryType}, InventoryId: ${dto.inventoryId}`);

    const idempotencyKey = dto.idempotencyKey || idempotencyHeader;

    // 1. Idempotency Check
    if (idempotencyKey) {
      const existing = await this.prisma.booking.findFirst({
        where: { userId, idempotencyKey },
        include: { supplier: true },
      });
      if (existing) {
        this.logger.log(`[BookingsService] Idempotency match found for key: ${idempotencyKey}. Returning existing booking ${existing.bookingReference}`);
        return { success: true, data: existing, idempotent: true };
      }
    }

    if (!this.isValidUuid(dto.inventoryId)) {
      throw new NotFoundException(`Inventory item with ID '${dto.inventoryId}' not found.`);
    }

    // 2. Database Transaction for Eligibility, Pricing, and Booking Creation
    return await this.prisma.$transaction(async (tx) => {
      let unitPrice = 0;
      let inventoryTitle = '';
      let supplierId: string | null = null;
      let durationDays = 1;

      const type = dto.inventoryType;

      if (!this.isValidUuid(dto.inventoryId)) {
        throw new NotFoundException(`Inventory item with ID '${dto.inventoryId}' not found.`);
      }

      if (type === InventoryTypeEnum.HOTEL) {
        const hotel = await tx.hotel.findUnique({
          where: { id: dto.inventoryId },
          include: { supplier: true },
        });

        if (!hotel) {
          throw new NotFoundException(`Hotel with ID '${dto.inventoryId}' not found.`);
        }

        // Eligibility Checks
        if (hotel.status !== 'ACTIVE') {
          throw new BadRequestException(`Hotel listing '${hotel.name}' is currently inactive or not approved for bookings.`);
        }

        if (hotel.supplier) {
          if (hotel.supplier.status === 'SUSPENDED' || hotel.supplier.status === 'INACTIVE') {
            throw new BadRequestException(`Supplier '${hotel.supplier.businessName}' is currently suspended or inactive.`);
          }
          supplierId = hotel.supplier.id;
        }

        unitPrice = Number(hotel.pricePerNight);
        inventoryTitle = hotel.name;

        // Calculate stay duration
        if (dto.startDate && dto.endDate) {
          const start = new Date(dto.startDate);
          const end = new Date(dto.endDate);
          if (end <= start) {
            throw new BadRequestException('Check-out date must be strictly after check-in date.');
          }
          const diffMs = end.getTime() - start.getTime();
          durationDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (durationDays < 1) durationDays = 1;
        }
      } else if (type === InventoryTypeEnum.RESTAURANT) {
        const rest = await tx.restaurant.findUnique({
          where: { id: dto.inventoryId },
          include: { supplier: true },
        });

        if (!rest) {
          throw new NotFoundException(`Restaurant with ID '${dto.inventoryId}' not found.`);
        }

        if (rest.status !== 'ACTIVE') {
          throw new BadRequestException(`Restaurant listing '${rest.name}' is currently inactive or closed.`);
        }

        if (rest.supplier) {
          if (rest.supplier.status === 'SUSPENDED' || rest.supplier.status === 'INACTIVE') {
            throw new BadRequestException(`Supplier '${rest.supplier.businessName}' is currently suspended or inactive.`);
          }
          supplierId = rest.supplier.id;
        }

        unitPrice = Number(rest.averageCost);
        inventoryTitle = rest.name;
      } else if (type === InventoryTypeEnum.ACTIVITY) {
        const act = await tx.activity.findUnique({
          where: { id: dto.inventoryId },
          include: { supplier: true },
        });

        if (!act) {
          throw new NotFoundException(`Activity with ID '${dto.inventoryId}' not found.`);
        }

        if (act.status !== 'ACTIVE') {
          throw new BadRequestException(`Activity listing '${act.title}' is currently inactive or unavailable.`);
        }

        if (act.supplier) {
          if (act.supplier.status === 'SUSPENDED' || act.supplier.status === 'INACTIVE') {
            throw new BadRequestException(`Supplier '${act.supplier.businessName}' is currently suspended or inactive.`);
          }
          supplierId = act.supplier.id;
        }

        unitPrice = Number(act.priceInr);
        inventoryTitle = act.title;
      } else {
        throw new BadRequestException(`Invalid inventory type '${type}'. Must be HOTEL, RESTAURANT, or ACTIVITY.`);
      }

      // 3. Price Calculation (Server-Side Snapshot)
      const qty = dto.quantity && dto.quantity > 0 ? dto.quantity : 1;
      const adultCount = dto.adultCount && dto.adultCount > 0 ? dto.adultCount : 1;
      const childCount = dto.childCount && dto.childCount >= 0 ? dto.childCount : 0;
      const guestCount = dto.guestCount && dto.guestCount > 0 ? dto.guestCount : adultCount + childCount;

      let subtotal = 0;
      if (type === InventoryTypeEnum.HOTEL) {
        subtotal = unitPrice * qty * durationDays;
      } else {
        subtotal = unitPrice * qty;
      }

      const taxes = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
      const discount = 0;
      const totalAmountInr = subtotal + taxes - discount;

      // Generate Reference
      let bookingRef = this.generateBookingReference();
      let refExists = await tx.booking.findUnique({ where: { bookingReference: bookingRef } });
      while (refExists) {
        bookingRef = this.generateBookingReference();
        refExists = await tx.booking.findUnique({ where: { bookingReference: bookingRef } });
      }

      // Parse Dates
      const startDateParsed = dto.startDate ? new Date(dto.startDate) : new Date();
      const endDateParsed = dto.endDate ? new Date(dto.endDate) : null;

      // 4. Create Immutable Booking Record
      const booking = await tx.booking.create({
        data: {
          bookingReference: bookingRef,
          userId,
          supplierId,
          tripId: dto.tripId || null,
          bookingType: type,
          inventoryType: type,
          inventoryId: dto.inventoryId,
          status: 'PENDING', // Initial status for Phase 3E fulfillment
          startDate: startDateParsed,
          endDate: endDateParsed,
          reservationTime: dto.reservationTime || null,
          quantity: qty,
          adultCount,
          childCount,
          guestCount,
          unitPrice,
          subtotal,
          taxes,
          discount,
          totalAmountInr,
          currency: 'INR',
          customerNotes: dto.customerNotes || null,
          idempotencyKey: idempotencyKey || null,
        },
        include: {
          supplier: true,
          user: {
            select: { id: true, email: true, fullName: true, phoneNumber: true },
          },
        },
      });

      this.logger.log(`[BookingsService] Created Booking ${booking.bookingReference} (Total: ₹${totalAmountInr})`);

      const responseData = {
        ...booking,
        inventoryTitle,
      };

      await this.notificationService.notifyBookingCreated(responseData);

      return {
        success: true,
        data: responseData,
      };
    });
  }

  async getUserBookings(userId: string, filterStatus?: string) {
    const where: any = { userId };

    if (filterStatus && filterStatus !== 'ALL') {
      if (filterStatus === 'UPCOMING') {
        where.status = 'CONFIRMED';
        where.startDate = { gte: new Date() };
      } else if (filterStatus === 'PAST') {
        where.startDate = { lt: new Date() };
      } else if (filterStatus === 'CANCELLED') {
        where.status = 'CANCELLED';
      } else {
        where.status = filterStatus as BookingLifecycleStatus;
      }
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        supplier: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Populate inventory titles for customer view
    const enriched = await Promise.all(
      bookings.map(async (b) => {
        let inventoryTitle = 'Travel Booking';
        if (b.inventoryId && this.isValidUuid(b.inventoryId)) {
          if (b.inventoryType === 'HOTEL') {
            const h = await this.prisma.hotel.findUnique({ where: { id: b.inventoryId } });
            if (h) inventoryTitle = h.name;
          } else if (b.inventoryType === 'RESTAURANT') {
            const r = await this.prisma.restaurant.findUnique({ where: { id: b.inventoryId } });
            if (r) inventoryTitle = r.name;
          } else if (b.inventoryType === 'ACTIVITY') {
            const a = await this.prisma.activity.findUnique({ where: { id: b.inventoryId } });
            if (a) inventoryTitle = a.title;
          }
        }
        return {
          ...b,
          inventoryTitle,
        };
      })
    );

    return {
      success: true,
      data: enriched,
    };
  }

  async getBookingById(userId: string, bookingId: string) {
    if (!this.isValidUuid(bookingId)) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        supplier: true,
        user: { select: { id: true, email: true, fullName: true, phoneNumber: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    // Customer Ownership IDOR Check
    if (booking.userId !== userId) {
      throw new ForbiddenException('Access denied: You do not own this booking reservation.');
    }

    let inventoryDetail: any = null;
    if (booking.inventoryId && this.isValidUuid(booking.inventoryId)) {
      if (booking.inventoryType === 'HOTEL') {
        inventoryDetail = await this.prisma.hotel.findUnique({ where: { id: booking.inventoryId } });
      } else if (booking.inventoryType === 'RESTAURANT') {
        inventoryDetail = await this.prisma.restaurant.findUnique({ where: { id: booking.inventoryId } });
      } else if (booking.inventoryType === 'ACTIVITY') {
        inventoryDetail = await this.prisma.activity.findUnique({ where: { id: booking.inventoryId } });
      }
    }

    return {
      success: true,
      data: {
        ...booking,
        inventoryDetail,
        inventoryTitle: inventoryDetail?.name || inventoryDetail?.title || 'Travel Service',
      },
    };
  }

  async getBookingByReference(bookingReference: string, currentUserId?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingReference },
      include: {
        supplier: true,
        user: { select: { id: true, email: true, fullName: true, phoneNumber: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with reference '${bookingReference}' not found.`);
    }

    if (currentUserId && booking.userId !== currentUserId) {
      throw new ForbiddenException('Access denied: You do not own this booking reservation.');
    }

    return {
      success: true,
      data: booking,
    };
  }

  async cancelBooking(userId: string, bookingId: string, dto: CancelBookingDto) {
    if (!this.isValidUuid(bookingId)) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    // Ownership Verification
    if (booking.userId !== userId) {
      throw new ForbiddenException('Access denied: You do not own this booking reservation.');
    }

    // State Machine Transition Check
    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled.');
    }

    if (booking.status === 'COMPLETED' || booking.status === 'EXPIRED') {
      throw new BadRequestException(`Booking in state '${booking.status}' cannot be cancelled.`);
    }

    const cancellationReason = dto.cancellationReason || dto.reason || 'Cancelled by customer';

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancellationReason,
        cancelledAt: new Date(),
      },
      include: { supplier: true },
    });

    this.logger.log(`[BookingsService] Customer ${userId} cancelled booking ${booking.bookingReference}`);

    return {
      success: true,
      data: updated,
      message: 'Booking cancelled successfully.',
    };
  }

  // ==========================================
  // SUPPLIER BOOKING FULFILLMENT OPERATIONS
  // ==========================================

  private async resolveSupplier(supplierIdOrUserId: string) {
    let supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierIdOrUserId },
    });
    if (!supplier) {
      supplier = await this.prisma.supplier.findUnique({
        where: { userId: supplierIdOrUserId },
      });
    }
    if (!supplier) {
      throw new ForbiddenException('Supplier profile not found.');
    }
    return supplier;
  }

  async getSupplierBookings(supplierIdOrUserId: string, query?: any) {
    const supplier = await this.resolveSupplier(supplierIdOrUserId);

    const page = Math.max(1, parseInt(query?.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query?.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = { supplierId: supplier.id };

    if (query?.status && query.status !== 'ALL') {
      if (query.status === 'UPCOMING') {
        where.status = { in: ['CONFIRMED', 'PENDING'] };
        where.startDate = { gte: new Date() };
      } else {
        where.status = query.status as BookingLifecycleStatus;
      }
    }

    if (query?.inventoryType && query.inventoryType !== 'ALL') {
      where.inventoryType = query.inventoryType;
    }

    if (query?.search) {
      const q = query.search.trim();
      where.OR = [
        { bookingReference: { contains: q, mode: 'insensitive' } },
        { user: { fullName: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (query?.startDate || query?.endDate) {
      where.startDate = {};
      if (query.startDate) where.startDate.gte = new Date(query.startDate);
      if (query.endDate) where.startDate.lte = new Date(query.endDate);
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, fullName: true, phoneNumber: true } },
          supplier: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    // Populate inventory titles for supplier view
    const enriched = await Promise.all(
      bookings.map(async (b) => {
        let inventoryTitle = 'Inventory Service';
        if (b.inventoryId && this.isValidUuid(b.inventoryId)) {
          if (b.inventoryType === 'HOTEL') {
            const h = await this.prisma.hotel.findUnique({ where: { id: b.inventoryId } });
            if (h) inventoryTitle = h.name;
          } else if (b.inventoryType === 'RESTAURANT') {
            const r = await this.prisma.restaurant.findUnique({ where: { id: b.inventoryId } });
            if (r) inventoryTitle = r.name;
          } else if (b.inventoryType === 'ACTIVITY') {
            const a = await this.prisma.activity.findUnique({ where: { id: b.inventoryId } });
            if (a) inventoryTitle = a.title;
          }
        }
        return {
          ...b,
          inventoryTitle,
        };
      })
    );

    return {
      success: true,
      data: enriched,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getSupplierBookingById(supplierIdOrUserId: string, bookingId: string) {
    const supplier = await this.resolveSupplier(supplierIdOrUserId);

    if (!this.isValidUuid(bookingId)) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, email: true, fullName: true, phoneNumber: true } },
        supplier: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    // Strict Tenant Ownership Check (IDOR Enforcement)
    if (booking.supplierId !== supplier.id) {
      throw new ForbiddenException('Access denied: You do not own this booking reservation.');
    }

    let inventoryDetail: any = null;
    if (booking.inventoryId && this.isValidUuid(booking.inventoryId)) {
      if (booking.inventoryType === 'HOTEL') {
        inventoryDetail = await this.prisma.hotel.findUnique({ where: { id: booking.inventoryId } });
      } else if (booking.inventoryType === 'RESTAURANT') {
        inventoryDetail = await this.prisma.restaurant.findUnique({ where: { id: booking.inventoryId } });
      } else if (booking.inventoryType === 'ACTIVITY') {
        inventoryDetail = await this.prisma.activity.findUnique({ where: { id: booking.inventoryId } });
      }
    }

    // Fetch audit history for this booking
    const auditLogs = await this.prisma.auditLog.findMany({
      where: { entityType: 'BOOKING', entityId: bookingId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: {
        ...booking,
        inventoryDetail,
        inventoryTitle: inventoryDetail?.name || inventoryDetail?.title || 'Travel Service',
        auditLogs,
      },
    };
  }

  async acceptSupplierBooking(supplierIdOrUserId: string, bookingId: string, currentUser?: any) {
    const supplier = await this.resolveSupplier(supplierIdOrUserId);

    if (!this.isValidUuid(bookingId)) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
      }

      // IDOR Verification
      if (booking.supplierId !== supplier.id) {
        throw new ForbiddenException('Access denied: You do not own this booking reservation.');
      }

      // State Transition Security & Concurrency Check
      if (booking.status !== 'PENDING') {
        throw new BadRequestException(`Booking in state '${booking.status}' cannot be accepted. Only PENDING bookings can be accepted.`);
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          acceptedAt: new Date(),
        },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          supplier: true,
        },
      });

      await this.auditService.logEvent(
        currentUser?.id || supplier.userId,
        'ACCEPT_BOOKING',
        `Supplier ${supplier.businessName} accepted booking ${booking.bookingReference}`,
        undefined,
        'BOOKING',
        bookingId
      );

      this.logger.log(`[BookingsService] Supplier ${supplier.businessName} ACCEPTED booking ${booking.bookingReference}`);

      await this.notificationService.notifyBookingConfirmed(updated);

      return {
        success: true,
        data: updated,
        message: 'Booking accepted successfully.',
      };
    });
  }

  async rejectSupplierBooking(supplierIdOrUserId: string, bookingId: string, dto: { rejectionReason?: string; reason?: string }, currentUser?: any) {
    const supplier = await this.resolveSupplier(supplierIdOrUserId);

    if (!this.isValidUuid(bookingId)) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    const rejectionReason = (dto.rejectionReason || dto.reason || '').trim();
    if (!rejectionReason) {
      throw new BadRequestException('A valid rejection reason is required to reject a booking.');
    }

    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
      }

      // IDOR Verification
      if (booking.supplierId !== supplier.id) {
        throw new ForbiddenException('Access denied: You do not own this booking reservation.');
      }

      // State Transition Security & Concurrency Check
      if (booking.status !== 'PENDING') {
        throw new BadRequestException(`Booking in state '${booking.status}' cannot be rejected. Only PENDING bookings can be rejected.`);
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'REJECTED',
          rejectionReason,
          rejectedAt: new Date(),
        },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          supplier: true,
        },
      });

      await this.auditService.logEvent(
        currentUser?.id || supplier.userId,
        'REJECT_BOOKING',
        `Supplier ${supplier.businessName} rejected booking ${booking.bookingReference}. Reason: ${rejectionReason}`,
        undefined,
        'BOOKING',
        bookingId,
        rejectionReason
      );

      this.logger.log(`[BookingsService] Supplier ${supplier.businessName} REJECTED booking ${booking.bookingReference}`);

      await this.notificationService.notifyBookingRejected(updated);

      return {
        success: true,
        data: updated,
        message: 'Booking rejected successfully.',
      };
    });
  }

  async startSupplierBooking(supplierIdOrUserId: string, bookingId: string, currentUser?: any) {
    const supplier = await this.resolveSupplier(supplierIdOrUserId);

    if (!this.isValidUuid(bookingId)) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
      }

      if (booking.supplierId !== supplier.id) {
        throw new ForbiddenException('Access denied: You do not own this booking reservation.');
      }

      if (booking.status !== 'CONFIRMED') {
        throw new BadRequestException(`Booking in state '${booking.status}' cannot be started. Only CONFIRMED bookings can be moved to IN_PROGRESS.`);
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'IN_PROGRESS',
          inProgressAt: new Date(),
        },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          supplier: true,
        },
      });

      await this.auditService.logEvent(
        currentUser?.id || supplier.userId,
        'START_BOOKING',
        `Supplier ${supplier.businessName} started fulfillment for booking ${booking.bookingReference}`,
        undefined,
        'BOOKING',
        bookingId
      );

      return {
        success: true,
        data: updated,
        message: 'Booking fulfillment started.',
      };
    });
  }

  async completeSupplierBooking(supplierIdOrUserId: string, bookingId: string, currentUser?: any) {
    const supplier = await this.resolveSupplier(supplierIdOrUserId);

    if (!this.isValidUuid(bookingId)) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
      }

      if (booking.supplierId !== supplier.id) {
        throw new ForbiddenException('Access denied: You do not own this booking reservation.');
      }

      if (booking.status !== 'CONFIRMED' && booking.status !== 'IN_PROGRESS') {
        throw new BadRequestException(`Booking in state '${booking.status}' cannot be completed. Only CONFIRMED or IN_PROGRESS bookings can be completed.`);
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          supplier: true,
        },
      });

      await this.auditService.logEvent(
        currentUser?.id || supplier.userId,
        'COMPLETE_BOOKING',
        `Supplier ${supplier.businessName} completed booking ${booking.bookingReference}`,
        undefined,
        'BOOKING',
        bookingId
      );

      this.logger.log(`[BookingsService] Supplier ${supplier.businessName} COMPLETED booking ${booking.bookingReference}`);

      return {
        success: true,
        data: updated,
        message: 'Booking completed successfully.',
      };
    });
  }

  async cancelSupplierBooking(supplierIdOrUserId: string, bookingId: string, dto: { reason?: string }, currentUser?: any) {
    const supplier = await this.resolveSupplier(supplierIdOrUserId);

    if (!this.isValidUuid(bookingId)) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
      }

      if (booking.supplierId !== supplier.id) {
        throw new ForbiddenException('Access denied: You do not own this booking reservation.');
      }

      if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED' || booking.status === 'REJECTED') {
        throw new BadRequestException(`Booking in state '${booking.status}' cannot be cancelled.`);
      }

      const reason = dto.reason || 'Cancelled by supplier';

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
          cancelledAt: new Date(),
        },
        include: { supplier: true },
      });

      await this.auditService.logEvent(
        currentUser?.id || supplier.userId,
        'CANCEL_BOOKING',
        `Supplier ${supplier.businessName} cancelled booking ${booking.bookingReference}`,
        undefined,
        'BOOKING',
        bookingId,
        reason
      );

      return {
        success: true,
        data: updated,
        message: 'Booking cancelled by supplier.',
      };
    });
  }

  async addSupplierBookingNote(supplierIdOrUserId: string, bookingId: string, note: string, currentUser?: any) {
    const supplier = await this.resolveSupplier(supplierIdOrUserId);

    if (!this.isValidUuid(bookingId)) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    const noteText = (note || '').trim();
    if (!noteText) {
      throw new BadRequestException('Note content cannot be empty.');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    if (booking.supplierId !== supplier.id) {
      throw new ForbiddenException('Access denied: You do not own this booking reservation.');
    }

    const updatedNotes = booking.supplierNotes
      ? `${booking.supplierNotes}\n[${new Date().toISOString()}] ${noteText}`
      : `[${new Date().toISOString()}] ${noteText}`;

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { supplierNotes: updatedNotes },
    });

    await this.auditService.logEvent(
      currentUser?.id || supplier.userId,
      'ADD_BOOKING_NOTE',
      `Added note to booking ${booking.bookingReference}: ${noteText.substring(0, 50)}...`,
      undefined,
      'BOOKING',
      bookingId
    );

    return {
      success: true,
      data: updated,
      message: 'Operational note added to booking.',
    };
  }

  // ==========================================
  // ADMIN BOOKING OPERATIONS
  // ==========================================

  async getAdminBookings(filters?: { status?: string; search?: string; supplierId?: string; inventoryType?: string; page?: string; limit?: string }) {
    const page = Math.max(1, parseInt(filters?.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(filters?.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status as BookingLifecycleStatus;
    }

    if (filters?.supplierId && filters.supplierId !== 'ALL') {
      where.supplierId = filters.supplierId;
    }

    if (filters?.inventoryType && filters.inventoryType !== 'ALL') {
      where.inventoryType = filters.inventoryType;
    }

    if (filters?.search) {
      const q = filters.search.trim();
      where.OR = [
        { bookingReference: { contains: q, mode: 'insensitive' } },
        { user: { fullName: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { supplier: { businessName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, fullName: true, phoneNumber: true } },
          supplier: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    // Populate inventory titles for admin view
    const enriched = await Promise.all(
      bookings.map(async (b) => {
        let inventoryTitle = 'Inventory Service';
        if (b.inventoryId && this.isValidUuid(b.inventoryId)) {
          if (b.inventoryType === 'HOTEL') {
            const h = await this.prisma.hotel.findUnique({ where: { id: b.inventoryId } });
            if (h) inventoryTitle = h.name;
          } else if (b.inventoryType === 'RESTAURANT') {
            const r = await this.prisma.restaurant.findUnique({ where: { id: b.inventoryId } });
            if (r) inventoryTitle = r.name;
          } else if (b.inventoryType === 'ACTIVITY') {
            const a = await this.prisma.activity.findUnique({ where: { id: b.inventoryId } });
            if (a) inventoryTitle = a.title;
          }
        }
        return {
          ...b,
          inventoryTitle,
        };
      })
    );

    return {
      success: true,
      data: enriched,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getAdminBookingById(bookingId: string) {
    if (!this.isValidUuid(bookingId)) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, email: true, fullName: true, phoneNumber: true } },
        supplier: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    let inventoryDetail: any = null;
    if (booking.inventoryId && this.isValidUuid(booking.inventoryId)) {
      if (booking.inventoryType === 'HOTEL') {
        inventoryDetail = await this.prisma.hotel.findUnique({ where: { id: booking.inventoryId } });
      } else if (booking.inventoryType === 'RESTAURANT') {
        inventoryDetail = await this.prisma.restaurant.findUnique({ where: { id: booking.inventoryId } });
      } else if (booking.inventoryType === 'ACTIVITY') {
        inventoryDetail = await this.prisma.activity.findUnique({ where: { id: booking.inventoryId } });
      }
    }

    const auditLogs = await this.prisma.auditLog.findMany({
      where: { entityType: 'BOOKING', entityId: bookingId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: {
        ...booking,
        inventoryDetail,
        inventoryTitle: inventoryDetail?.name || inventoryDetail?.title || 'Travel Service',
        auditLogs,
      },
    };
  }
}
