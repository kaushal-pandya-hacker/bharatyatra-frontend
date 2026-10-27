/**
 * BharatYatra — Activities Service
 *
 * Business logic layer for the Activities & Experiences vertical.
 *
 * Architecture:
 *  - Only speaks to suppliers through IActivityProvider
 *  - All pricing calculations are server-authoritative
 *  - Price drift revalidation before every booking
 *  - Idempotency protection for duplicate booking calls
 *  - Full DB audit via Prisma (ActivitySearchRecord, Booking + BookingEvent)
 *
 * PRODUCTION ACTIVATION:
 *  Set ACTIVITY_PROVIDER_MODE=live + ACTIVITY_PROVIDER_API_KEY=<key>
 *  Register the live adapter as the activityProvider injection token.
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SandboxActivityProviderAdapter } from '../providers/activities/sandbox-activity.provider.adapter';
import {
  ActivitySearchInput,
  CheckActivityAvailabilityInput,
} from '../providers/activities/activity-provider.interface';

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface ActivitySearchDto {
  destinationSlug?: string;
  destination?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
  adults?: number;
  children?: number;
  category?: string;
  currency?: string;
  page?: number;
  pageSize?: number;
}

export interface ActivityPriceDto {
  activityId: string;
  slotId?: string;
  date: string;
  adults: number;
  children?: number;
}

export interface RevalidateActivityPriceDto {
  activityId: string;
  slotId?: string;
  date: string;
  adults: number;
  children?: number;
  expectedTotalPrice: number;
}

export interface CreateActivityBookingDto {
  activityId: string;
  activityTitle: string;
  slotId?: string;
  date: string;
  time?: string;
  adults: number;
  children: number;
  totalPrice: number;
  currency?: string;
  acceptPriceChange?: boolean;
  holder: {
    name: string;
    surname: string;
    email: string;
    phone: string;
  };
  participants?: Array<{
    type: 'ADULT' | 'CHILD';
    name: string;
    surname: string;
    age?: number;
  }>;
  specialRequests?: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityProvider: SandboxActivityProviderAdapter,
  ) {}

  // -------------------------------------------------------------------------
  // 1. Search
  // -------------------------------------------------------------------------

  async searchActivities(dto: ActivitySearchDto) {
    const input: ActivitySearchInput = {
      destinationSlug: dto.destinationSlug,
      destination: dto.destination,
      latitude: dto.latitude ? Number(dto.latitude) : undefined,
      longitude: dto.longitude ? Number(dto.longitude) : undefined,
      date: dto.date,
      adults: dto.adults ? Number(dto.adults) : 1,
      children: dto.children ? Number(dto.children) : 0,
      category: dto.category,
      currency: dto.currency || 'INR',
      page: dto.page ? Number(dto.page) : 1,
      pageSize: dto.pageSize ? Number(dto.pageSize) : 20,
    };

    const results = await this.activityProvider.searchActivities(input);

    // Async audit log — never block the response
    try {
      await this.prisma.activitySearchRecord.create({
        data: {
          destination: dto.destination || dto.destinationSlug || 'UNKNOWN',
          date: dto.date ? new Date(dto.date) : null,
          adults: input.adults ?? 1,
          children: input.children ?? 0,
          category: dto.category || null,
          resultCount: results.length,
          rawRequest: JSON.stringify(dto),
        },
      });
    } catch (err: any) {
      this.logger.warn(`Activity search audit failed (non-blocking): ${err?.message}`);
    }

    return results;
  }

  // -------------------------------------------------------------------------
  // 2. Activity Detail
  // -------------------------------------------------------------------------

  async getActivityDetail(activityId: string) {
    const detail = await this.activityProvider.getActivityDetail(activityId);
    if (!detail) {
      throw new NotFoundException(`Activity '${activityId}' not found.`);
    }
    return detail;
  }

  // -------------------------------------------------------------------------
  // 3. Server-Side Price Calculation
  //    Frontend NEVER determines final price — only submits inputs.
  // -------------------------------------------------------------------------

  calculateServerPrice(dto: ActivityPriceDto & { priceAdultInr: number; priceChildInr?: number }) {
    const adults = Math.max(1, dto.adults || 1);
    const children = Math.max(0, dto.children || 0);
    const adultRate = Math.max(0, dto.priceAdultInr);
    const childRate = Math.max(0, dto.priceChildInr ?? adultRate * 0.5);
    const subtotal = adults * adultRate + children * childRate;
    const taxes = Math.round(subtotal * 0.05);    // 5% GST applicable to activities
    const serviceFee = 50;                          // Platform convenience fee
    const totalAmount = subtotal + taxes + serviceFee;

    return {
      adults,
      children,
      priceAdultInr: adultRate,
      priceChildInr: childRate,
      subtotal,
      taxes,
      serviceFee,
      totalAmount,
      currency: 'INR',
    };
  }

  // -------------------------------------------------------------------------
  // 4. Availability Revalidation (pre-checkout)
  // -------------------------------------------------------------------------

  async revalidatePrice(dto: RevalidateActivityPriceDto) {
    const check: CheckActivityAvailabilityInput = {
      activityId: dto.activityId,
      slotId: dto.slotId,
      date: dto.date,
      adults: dto.adults,
      children: dto.children,
    };

    const result = await this.activityProvider.checkAvailability(check);

    if (result.status === 'UNAVAILABLE') {
      return {
        status: 'UNAVAILABLE',
        available: false,
        message: result.message || 'Activity slot is no longer available.',
      };
    }

    const currentPrice = result.totalPrice;
    const priceChanged = Math.abs(currentPrice - dto.expectedTotalPrice) > 1; // ₹1 tolerance for rounding

    if (priceChanged) {
      return {
        status: 'PRICE_CHANGED',
        available: true,
        priceChanged: true,
        oldPrice: dto.expectedTotalPrice,
        newPrice: currentPrice,
        currency: result.currency,
        message: `Activity price updated from ₹${dto.expectedTotalPrice} to ₹${currentPrice}. Customer confirmation required.`,
      };
    }

    return {
      status: 'AVAILABLE',
      available: true,
      priceChanged: false,
      totalPrice: currentPrice,
      currency: result.currency,
      spotsAvailable: result.spotsAvailable,
      cancellationPolicy: result.cancellationPolicy,
      message: 'Availability confirmed and price locked.',
    };
  }

  // -------------------------------------------------------------------------
  // 5. Create Booking
  // -------------------------------------------------------------------------

  async createBooking(
    userId: string,
    dto: CreateActivityBookingDto,
    idempotencyHeader?: string,
  ) {
    if (!dto.activityId) {
      throw new BadRequestException('activityId is required.');
    }
    if (!dto.date) {
      throw new BadRequestException('Activity date is required.');
    }

    const keyToUse =
      idempotencyHeader || `ACT-${userId}-${dto.activityId}-${dto.date}`;

    // ─── Idempotency Guard ───────────────────────────────────────────────────
    const existing = await this.prisma.booking.findFirst({
      where: { userId, idempotencyKey: keyToUse },
      include: { events: true },
    });
    if (existing) {
      this.logger.log(
        `[ActivitiesService] Idempotency hit: returning existing booking ${existing.bookingReference}`,
      );
      return this.formatBookingResponse(existing, dto, true);
    }

    // ─── Mandatory Pre-Booking Availability & Price Check ───────────────────
    const availCheck = await this.activityProvider.checkAvailability({
      activityId: dto.activityId,
      slotId: dto.slotId,
      date: dto.date,
      adults: dto.adults,
      children: dto.children,
    });

    if (availCheck.status === 'UNAVAILABLE') {
      throw new BadRequestException({
        errorCode: 'ACTIVITY_SLOT_UNAVAILABLE',
        message: 'Selected activity slot is no longer available.',
      });
    }

    // ─── Server-Side Price Manipulation Guard ────────────────────────────────
    if (dto.totalPrice <= 0) {
      throw new ConflictException({
        errorCode: 'PRICE_MANIPULATION_REJECTED',
        message: 'Submitted price is invalid.',
      });
    }
    if (availCheck.totalPrice > 0 && dto.totalPrice < availCheck.totalPrice * 0.9) {
      throw new ConflictException({
        errorCode: 'PRICE_MANIPULATION_REJECTED',
        message: 'Submitted price violates server-calculated bounds.',
        expectedPrice: availCheck.totalPrice,
        submittedPrice: dto.totalPrice,
      });
    }

    // ─── Price Change Notification Flow ─────────────────────────────────────
    if (
      availCheck.status === 'PRICE_CHANGED' &&
      Math.abs(availCheck.totalPrice - dto.totalPrice) > 1 &&
      !dto.acceptPriceChange
    ) {
      return {
        status: 'PRICE_CHANGED',
        priceChanged: true,
        oldPrice: dto.totalPrice,
        newPrice: availCheck.totalPrice,
        currency: availCheck.currency,
        message: `Activity price updated from ₹${dto.totalPrice} to ₹${availCheck.totalPrice}. Customer confirmation required.`,
      };
    }

    const finalPrice = availCheck.totalPrice || dto.totalPrice;
    const bookingRef = `CF-ACT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // ─── Call Supplier Adapter ───────────────────────────────────────────────
    const supplierRes = await this.activityProvider.createBooking({
      activityId: dto.activityId,
      activityTitle: dto.activityTitle,
      slotId: dto.slotId,
      date: dto.date,
      time: dto.time,
      adults: dto.adults,
      children: dto.children,
      totalPrice: finalPrice,
      currency: dto.currency || 'INR',
      clientReference: bookingRef,
      holder: dto.holder,
      participants: dto.participants,
      specialRequests: dto.specialRequests,
    });

    const bookingStatus: any =
      supplierRes.status === 'CONFIRMED'
        ? 'CONFIRMED'
        : supplierRes.status === 'TEST_ONLY'
        ? 'PENDING'
        : 'PENDING';

    // ─── Persist to DB ───────────────────────────────────────────────────────
    const activityDate = new Date(dto.date);
    const adultCount = dto.adults;
    const childCount = dto.children || 0;

    const bookingRecord = await this.prisma.booking.create({
      data: {
        bookingReference: bookingRef,
        userId,
        bookingType: 'ACTIVITY',
        inventoryType: 'ACTIVITY',
        inventoryId: dto.activityId,
        status: bookingStatus,
        startDate: activityDate,
        endDate: activityDate,
        adultCount,
        childCount,
        guestCount: adultCount + childCount,
        unitPrice: finalPrice / Math.max(1, adultCount + childCount),
        subtotal: finalPrice,
        totalAmountInr: finalPrice,
        currency: dto.currency || 'INR',
        customerNotes: dto.specialRequests,
        idempotencyKey: keyToUse,
        activityDetail: {
          create: {
            activityId: dto.activityId,
            activityTitle: dto.activityTitle,
            supplierReference: supplierRes.supplierReference,
            providerName: this.activityProvider.providerName,
            activityDate,
            slotId: dto.slotId || null,
            slotTime: dto.time || null,
            cancellationPolicy: supplierRes.cancellationPolicy || 'See activity policy',
            confirmationNotes: supplierRes.confirmationNotes || null,
            voucherUrl: supplierRes.voucherUrl || null,
            sandboxMode: !this.activityProvider.isLive,
            rawSupplierResponse: JSON.stringify(supplierRes),
          },
        },
        events: {
          create: {
            status: bookingStatus,
            actorType: 'CUSTOMER',
            actorId: userId,
            eventDescription: `Activity booking ${supplierRes.status === 'TEST_ONLY' ? '(SANDBOX — no real booking)' : 'confirmed'} via ${this.activityProvider.providerName}.`,
            metadata: JSON.stringify({
              supplierReference: supplierRes.supplierReference,
              activityId: dto.activityId,
              date: dto.date,
              slotId: dto.slotId,
              sandboxMode: !this.activityProvider.isLive,
            }),
          },
        },
      },
      include: { events: true, activityDetail: true },
    });

    return this.formatBookingResponse(bookingRecord, dto, false, supplierRes.supplierReference, supplierRes.confirmationNotes, finalPrice);
  }

  // -------------------------------------------------------------------------
  // 6. Get User Activity Bookings
  // -------------------------------------------------------------------------

  async getUserActivityBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId, bookingType: 'ACTIVITY' },
      include: { events: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // -------------------------------------------------------------------------
  // 7. Cancel Booking
  // -------------------------------------------------------------------------

  async cancelBooking(userId: string, bookingIdOrRef: string, reason?: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingIdOrRef }, { bookingReference: bookingIdOrRef }],
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking '${bookingIdOrRef}' not found.`);
    }
    if (booking.status === 'CANCELLED') {
      return {
        status: 'CANCELLED',
        bookingReference: booking.bookingReference,
        message: 'Booking was already cancelled.',
      };
    }

    const lastEvent = await this.prisma.bookingEvent.findFirst({
      where: { bookingId: booking.id },
      orderBy: { createdAt: 'desc' },
    });

    // Parse supplier reference from last event metadata
    let supplierRef = booking.bookingReference;
    try {
      const meta = JSON.parse(lastEvent?.metadata || '{}');
      supplierRef = meta.supplierReference || supplierRef;
    } catch {}

    let cancelResult: any;
    try {
      cancelResult = await this.activityProvider.cancelBooking({
        supplierReference: supplierRef,
        clientReference: booking.bookingReference,
      });
    } catch (err: any) {
      this.logger.warn(`Supplier cancel failed: ${err.message}. Setting CANCEL_REQUESTED.`);
      cancelResult = {
        status: 'CANCEL_REQUESTED',
        cancellationFee: 0,
        currency: 'INR',
        message: 'Cancellation queued for manual admin processing.',
      };
    }

    const newStatus: any =
      cancelResult.status === 'CANCELLED' ? 'CANCELLED' : 'CANCEL_REQUESTED';

    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: newStatus,
        cancelledAt: new Date(),
        cancellationReason: reason || 'Cancelled by customer',
        events: {
          create: {
            status: newStatus,
            actorType: 'CUSTOMER',
            actorId: userId,
            eventDescription: `Activity booking cancellation: ${newStatus}. ${cancelResult.message}`,
            metadata: JSON.stringify(cancelResult),
          },
        },
      },
    });

    return {
      status: updated.status,
      bookingId: updated.id,
      bookingReference: updated.bookingReference,
      supplierReference: supplierRef,
      cancellationFee: cancelResult.cancellationFee || 0,
      currency: cancelResult.currency || 'INR',
      message: cancelResult.message,
    };
  }

  // -------------------------------------------------------------------------
  // 8. Provider Health Check
  // -------------------------------------------------------------------------

  async getHealthCheck() {
    const health = await this.activityProvider.healthCheck();
    const hasApiKey = Boolean(process.env.ACTIVITY_PROVIDER_API_KEY);
    const mode = process.env.ACTIVITY_PROVIDER_MODE || 'sandbox';

    return {
      providerId: this.activityProvider.providerId,
      providerName: this.activityProvider.providerName,
      environment: mode,
      isLive: this.activityProvider.isLive,
      credentialsConfigured: hasApiKey,
      ...health,
      capabilities: {
        search: true,
        detail: true,
        availability: true,
        pricing: true,
        revalidation: true,
        booking: true,
        cancellation: true,
      },
      lastCheckedAt: new Date().toISOString(),
      activationNote: this.activityProvider.isLive
        ? 'LIVE MODE — real bookings active.'
        : 'SANDBOX MODE — fixture data. Set ACTIVITY_PROVIDER_MODE=live to activate production.',
    };
  }

  // -------------------------------------------------------------------------
  // Helper
  // -------------------------------------------------------------------------

  private formatBookingResponse(
    record: any,
    dto: CreateActivityBookingDto,
    idempotent: boolean,
    supplierReference?: string,
    confirmationNotes?: string,
    finalPrice?: number,
  ) {
    return {
      chaloFarvaBookingId: record.id,
      bookingReference: record.bookingReference,
      supplierReference: supplierReference || record.bookingReference,
      status: record.status,
      activityId: dto.activityId,
      activityTitle: dto.activityTitle,
      date: dto.date,
      time: dto.time,
      slotId: dto.slotId,
      adults: dto.adults,
      children: dto.children,
      holderName: `${dto.holder.name} ${dto.holder.surname}`,
      holderEmail: dto.holder.email,
      holderPhone: dto.holder.phone,
      totalPrice: finalPrice ?? Number(record.totalAmountInr),
      currency: record.currency,
      confirmationNotes: confirmationNotes,
      createdAt: record.createdAt,
      idempotent,
    };
  }
}
