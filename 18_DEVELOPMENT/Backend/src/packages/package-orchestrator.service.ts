import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PackagesService } from './packages.service';
import { UniversalProviderRegistry } from '../providers/registry/universal-provider.registry';
import { QuoteEngineService } from './quote-engine.service';
import { UniversalBookingRequest } from '../providers/interfaces/universal-provider.interface';

export type BookingState =
  | 'DRAFT'
  | 'QUOTE_CREATED'
  | 'AVAILABILITY_CHECKED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_SUCCESS'
  | 'SUPPLIER_BOOKING_PENDING'
  | 'PARTIALLY_CONFIRMED'
  | 'CONFIRMED'
  | 'CANCELLATION_REQUESTED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'FAILED'
  | 'EXPIRED';

export interface CalculatePackageLivePriceDto {
  packageSlug: string;
  travelDate: string;
  travellers: number;
  rooms?: number;
  hotelSelection?: string;
  transportSelection?: string;
  selectedActivityIds?: string[];
  expectedPrice?: number;
}

export interface OrchestratePackageBookingDto {
  packageSlug: string;
  travelDate: string;
  travellers: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  hotelSelection?: string;
  transportSelection?: string;
  selectedActivityIds?: string[];
  expectedPrice?: number;
  acceptedPriceChange?: boolean;
  specialRequests?: string;
}

export interface InitiatePackageBookingInput {
  quoteReference: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests?: string;
}

export interface FulfillPackageBookingInput {
  bookingId: string;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  paymentMethod?: string;
}


@Injectable()
export class PackageOrchestratorService {
  private readonly logger = new Logger(PackageOrchestratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly packagesService: PackagesService,
    private readonly quoteEngine: QuoteEngineService,
    private readonly providerRegistry: UniversalProviderRegistry,
  ) {}

  /**
   * Allowed State Machine Transitions (Section 2)
   */
  private readonly ALLOWED_TRANSITIONS: Record<BookingState, BookingState[]> = {
    DRAFT: ['QUOTE_CREATED', 'EXPIRED', 'FAILED'],
    QUOTE_CREATED: ['AVAILABILITY_CHECKED', 'PAYMENT_PENDING', 'EXPIRED', 'FAILED'],
    AVAILABILITY_CHECKED: ['PAYMENT_PENDING', 'EXPIRED', 'FAILED'],
    PAYMENT_PENDING: ['PAYMENT_PROCESSING', 'PAYMENT_SUCCESS', 'FAILED', 'EXPIRED'],
    PAYMENT_PROCESSING: ['PAYMENT_SUCCESS', 'FAILED'],
    PAYMENT_SUCCESS: ['SUPPLIER_BOOKING_PENDING', 'FAILED'],
    SUPPLIER_BOOKING_PENDING: ['CONFIRMED', 'PARTIALLY_CONFIRMED', 'FAILED'],
    PARTIALLY_CONFIRMED: ['CONFIRMED', 'CANCELLATION_REQUESTED', 'CANCELLED'],
    CONFIRMED: ['CANCELLATION_REQUESTED', 'CANCELLED'],
    CANCELLATION_REQUESTED: ['CANCELLED', 'REFUND_PENDING', 'FAILED'],
    CANCELLED: ['REFUND_PENDING', 'REFUNDED'],
    REFUND_PENDING: ['REFUNDED', 'FAILED'],
    REFUNDED: [],
    FAILED: ['REFUND_PENDING'],
    EXPIRED: [],
  };

  /**
   * Validate state transition safety
   */
  private validateTransition(current: BookingState, next: BookingState) {
    const allowed = this.ALLOWED_TRANSITIONS[current] || [];
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Invalid booking state transition from '${current}' to '${next}'. Allowed transitions: [${allowed.join(', ')}]`,
      );
    }
  }

  /**
   * Legacy / direct calculation endpoint wrapper
   */
  async calculatePackageLivePrice(dto: CalculatePackageLivePriceDto) {
    const quote = await this.quoteEngine.createQuote({
      packageSlug: dto.packageSlug,
      travelDate: dto.travelDate,
      adultsCount: dto.travellers,
      roomsCount: dto.rooms,
      hotelCategory: dto.hotelSelection,
      transportOption: dto.transportSelection,
      selectedActivityIds: dto.selectedActivityIds,
    });

    return {
      packageId: quote.packageId,
      packageSlug: quote.packageSlug,
      packageTitle: quote.packageTitle,
      packageBasePrice: quote.supplierCostInr,
      hotelPrice: 0,
      transportPrice: 0,
      activityPrice: 0,
      taxes: quote.taxInr,
      serviceFees: quote.platformFeeInr,
      discount: quote.discountInr,
      total: quote.totalAmountInr,
      perPersonPrice: quote.perPersonPriceInr,
      currency: quote.currency,
      priceTimestamp: quote.createdTimestamp,
      availabilityStatus: quote.isExpired ? 'EXPIRED' : 'AVAILABLE',
      statusNotes: [],
      quoteReference: quote.quoteReference,
    };
  }

  /**
   * Legacy / direct orchestration endpoint wrapper
   */
  async orchestratePackageBooking(dto: OrchestratePackageBookingDto) {
    const quote = await this.quoteEngine.createQuote({
      packageSlug: dto.packageSlug,
      travelDate: dto.travelDate,
      adultsCount: dto.travellers,
      hotelCategory: dto.hotelSelection,
      transportOption: dto.transportSelection,
      selectedActivityIds: dto.selectedActivityIds,
    });

    return this.initiateBooking({
      quoteReference: quote.quoteReference,
      userId: 'usr_guest',
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      specialRequests: dto.specialRequests,
    });
  }

  /**
   * Step 1: Create Quote & Check Live Availability (Section 3 & 5)
   */

  async createLiveQuote(input: any) {
    this.logger.log(`[PackageOrchestrator] Generating live quote for package '${input.packageSlug}'...`);
    const quote = await this.quoteEngine.createQuote(input);
    
    // Log Audit event
    await this.logAuditEvent({
      userId: input.userId,
      action: 'QUOTE_CREATED',
      entityType: 'PACKAGE_QUOTE',
      entityId: quote.quoteId,
      details: `Created quote ${quote.quoteReference} for ₹${quote.totalAmountInr}`,
    });

    return quote;
  }

  /**
   * Step 2: Initiate Booking & Move to PAYMENT_PENDING state (Section 3 & 4)
   * System does NOT call supplier booking before payment!
   */
  async initiateBooking(input: InitiatePackageBookingInput) {
    this.logger.log(`[PackageOrchestrator] Validating quote ${input.quoteReference} before booking initiation...`);
    const quote = await this.quoteEngine.validateQuote(input.quoteReference);

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `CF-PKG-${todayStr}-${randomSuffix}`;

    // Create Main Booking Record in PAYMENT_PENDING state
    const booking = await this.prisma.booking.create({
      data: {
        bookingReference,
        userId: input.userId,
        bookingType: 'PACKAGE',
        inventoryType: 'PACKAGE',
        inventoryId: quote.packageId,
        status: 'PAYMENT_PENDING' as any,
        startDate: new Date(quote.travelDate),
        endDate: new Date(new Date(quote.travelDate).getTime() + 3 * 86400000),
        adultCount: quote.adultsCount,
        childCount: quote.childrenCount,
        guestCount: quote.adultsCount + quote.childrenCount,
        unitPrice: quote.totalAmountInr,
        subtotal: quote.supplierCostInr + quote.markupInr + quote.platformFeeInr,
        taxes: quote.taxInr,
        discount: quote.discountInr,
        totalAmountInr: quote.totalAmountInr,
        currency: quote.currency,
        customerNotes: input.specialRequests,
        idempotencyKey: `IDEM-PKG-INIT-${quote.quoteReference}`,
        events: {
          create: {
            status: 'PAYMENT_PENDING',
            actorType: 'CUSTOMER',
            actorId: input.userId,
            eventDescription: `Initiated package booking ${bookingReference} for quote ${quote.quoteReference}`,
            metadata: JSON.stringify({ quoteReference: quote.quoteReference, customerName: input.customerName }),
          },
        },
      },
    });

    // Also create or update PackageBooking record for legacy compatibility
    try {
      await this.prisma.packageBooking.create({
        data: {
          bookingReference,
          packageId: quote.packageId,
          userId: input.userId,
          travelDate: new Date(quote.travelDate),
          adultsCount: quote.adultsCount,
          childrenCount: quote.childrenCount,
          basePriceInr: quote.supplierCostInr,
          addonsPriceInr: quote.markupInr + quote.platformFeeInr,
          taxAmountInr: quote.taxInr,
          totalPriceInr: quote.totalAmountInr,
          status: 'PAYMENT_PENDING',
          bookingMode: 'instant',
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          notes: input.specialRequests,
        },
      });
    } catch (e: any) {
      this.logger.warn(`[PackageOrchestrator] Legacy PackageBooking create warning: ${e?.message}`);
    }

    await this.logAuditEvent({
      userId: input.userId,
      action: 'BOOKING_INITIATED',
      entityType: 'BOOKING',
      entityId: booking.id,
      details: `Created booking ${bookingReference} in PAYMENT_PENDING state`,
    });

    return {
      success: true,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      status: 'PAYMENT_PENDING',
      amountInr: Number(booking.totalAmountInr),
      currency: booking.currency,
      quote,
    };
  }

  /**
   * Step 3: Fulfill Supplier Bookings ONLY AFTER Server-Side Verified Payment (Section 4 & 9 & 10 & 11)
   */
  async fulfillBookingAfterVerifiedPayment(input: FulfillPackageBookingInput) {
    this.logger.log(`[PackageOrchestrator] Fulfilling booking ${input.bookingId} post-verified payment...`);

    const booking = await this.prisma.booking.findUnique({
      where: { id: input.bookingId },
      include: { user: true, supplierBookings: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking '${input.bookingId}' not found.`);
    }

    // Idempotency: If already confirmed or supplier booking pending, return existing state
    if (['CONFIRMED', 'PARTIALLY_CONFIRMED', 'SUPPLIER_BOOKING_PENDING'].includes(booking.status as string)) {
      this.logger.log(`[PackageOrchestrator] Idempotency catch: Booking ${booking.bookingReference} already processed with status ${booking.status}`);
      return {
        success: true,
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        status: booking.status,
        message: `Booking ${booking.bookingReference} has already been processed.`,
      };
    }

    // Move to PAYMENT_SUCCESS -> SUPPLIER_BOOKING_PENDING
    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'SUPPLIER_BOOKING_PENDING' as any,
        acceptedAt: new Date(),
        events: {
          create: {
            status: 'SUPPLIER_BOOKING_PENDING',
            actorType: 'SYSTEM',
            actorId: 'PAYMENT_ENGINE',
            eventDescription: `Verified payment received (${input.gatewayPaymentId}). Starting multi-service supplier booking orchestration.`,
            metadata: JSON.stringify({ gatewayOrderId: input.gatewayOrderId, gatewayPaymentId: input.gatewayPaymentId }),
          },
        },
      },
    });

    // 10. Multi-Service Supplier Booking Engine Execution
    const supplierResults: Array<{ serviceType: string; status: 'CONFIRMED' | 'FAILED'; ref?: string; error?: string }> = [];

    // Service 1: Hotel Booking Execution
    try {
      const hotelProvider = this.providerRegistry.getProvider('HOTEL');
      if (hotelProvider && hotelProvider.createBooking) {
        const hotelReq: UniversalBookingRequest = {
          rateKey: `HBX-RATE-${booking.inventoryId}`,
          productType: 'HOTEL',
          productId: booking.inventoryId || 'HBX-HOTEL-DEFAULT',
          productName: 'Gujarat Heritage Resort & Hotel',
          checkIn: booking.startDate ? booking.startDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
          checkOut: booking.endDate ? booking.endDate.toISOString().slice(0, 10) : new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
          rateName: 'Deluxe Heritage Room',
          price: Number(booking.totalAmountInr) * 0.5,
          holder: {
            name: booking.user?.fullName?.split(' ')[0] || 'Customer',
            surname: booking.user?.fullName?.split(' ').slice(1).join(' ') || 'User',
            email: booking.user?.email || 'guest@bharatyatra.com',
            phone: booking.user?.phoneNumber || '+919624282521',
          },
          paxDetails: [{
            type: 'AD',
            name: booking.user?.fullName?.split(' ')[0] || 'Customer',
            surname: booking.user?.fullName?.split(' ').slice(1).join(' ') || 'User',
          }],
        };

        const res = await hotelProvider.createBooking(hotelReq);
        const supplierRef = res.supplierReference || `HBX-REF-${Date.now()}`;

        // Save SupplierBookingRecord
        await this.prisma.supplierBookingRecord.create({
          data: {
            bookingId: booking.id,
            supplierName: 'Hotelbeds / Universal Provider',
            supplierBookingId: supplierRef,
            serviceType: 'HOTEL',
            requestId: `REQ-HOTEL-${Date.now()}`,
            status: 'CONFIRMED',
            amountInr: Number(booking.totalAmountInr) * 0.5,
            currency: 'INR',
            cancellationPolicy: 'Non-refundable within 48 hours of check-in',
            confirmationData: JSON.stringify({ voucherCode: supplierRef, roomType: 'Deluxe Heritage Room' }),
          },
        });

        supplierResults.push({ serviceType: 'HOTEL', status: 'CONFIRMED', ref: supplierRef });
      }
    } catch (e: any) {
      this.logger.error(`[PackageOrchestrator] Hotel supplier booking failed: ${e?.message}`);
      
      await this.prisma.supplierBookingRecord.create({
        data: {
          bookingId: booking.id,
          supplierName: 'Hotelbeds / Universal Provider',
          serviceType: 'HOTEL',
          requestId: `REQ-HOTEL-${Date.now()}`,
          status: 'FAILED',
          amountInr: Number(booking.totalAmountInr) * 0.5,
          currency: 'INR',
          errorMessage: e?.message || 'Hotel supplier connection error',
        },
      });

      supplierResults.push({ serviceType: 'HOTEL', status: 'FAILED', error: e?.message });
    }

    // Service 2: Transport Booking Execution (Bus/Train/Flight/Transfer)
    try {
      const busProvider = this.providerRegistry.getProvider('BUS');
      if (busProvider && busProvider.createBooking) {
        const busReq: UniversalBookingRequest = {
          rateKey: `BUS-RATE-${booking.id}`,
          productType: 'BUS',
          productId: 'GSRTC-EXPRESS-101',
          productName: 'GSRTC Volvo AC Seater/Sleeper',
          checkIn: booking.startDate ? booking.startDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
          checkOut: booking.startDate ? booking.startDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
          rateName: 'AC Sleeper Seat A1, A2',
          price: Number(booking.totalAmountInr) * 0.3,
          holder: {
            name: booking.user?.fullName?.split(' ')[0] || 'Customer',
            surname: booking.user?.fullName?.split(' ').slice(1).join(' ') || 'User',
            email: booking.user?.email || 'guest@bharatyatra.com',
            phone: booking.user?.phoneNumber || '+919624282521',
          },
          paxDetails: [{
            type: 'AD',
            name: booking.user?.fullName?.split(' ')[0] || 'Customer',
            surname: booking.user?.fullName?.split(' ').slice(1).join(' ') || 'User',
          }],
        };

        const res = await busProvider.createBooking(busReq);
        const supplierRef = res.supplierReference || `BUS-REF-${Date.now()}`;

        await this.prisma.supplierBookingRecord.create({
          data: {
            bookingId: booking.id,
            supplierName: 'GSRTC / Universal Bus Provider',
            supplierBookingId: supplierRef,
            serviceType: 'BUS',
            requestId: `REQ-BUS-${Date.now()}`,
            status: 'CONFIRMED',
            amountInr: Number(booking.totalAmountInr) * 0.3,
            currency: 'INR',
            confirmationData: JSON.stringify({ ticketNumber: supplierRef, seatNumbers: ['A1', 'A2'] }),
          },
        });

        supplierResults.push({ serviceType: 'BUS', status: 'CONFIRMED', ref: supplierRef });
      }
    } catch (e: any) {
      this.logger.warn(`[PackageOrchestrator] Bus transport supplier warning: ${e?.message}`);
      
      await this.prisma.supplierBookingRecord.create({
        data: {
          bookingId: booking.id,
          supplierName: 'GSRTC / Universal Bus Provider',
          serviceType: 'BUS',
          requestId: `REQ-BUS-${Date.now()}`,
          status: 'FAILED',
          amountInr: Number(booking.totalAmountInr) * 0.3,
          currency: 'INR',
          errorMessage: e?.message || 'Bus provider seat allocation timeout',
        },
      });

      supplierResults.push({ serviceType: 'BUS', status: 'FAILED', error: e?.message });
    }

    // Determine Final Booking State (Section 11: Partial Failure Handling)
    const hasFailures = supplierResults.some((r) => r.status === 'FAILED');
    const hasSuccesses = supplierResults.some((r) => r.status === 'CONFIRMED');

    let finalStatus: BookingState = 'CONFIRMED';
    if (hasFailures && hasSuccesses) {
      finalStatus = 'PARTIALLY_CONFIRMED';
    } else if (hasFailures && !hasSuccesses) {
      finalStatus = 'FAILED';
    }

    // If PARTIALLY_CONFIRMED or FAILED, create an OperationalTask for Admin Queue (Section 27)
    if (finalStatus === 'PARTIALLY_CONFIRMED' || finalStatus === 'FAILED') {
      const failedServices = supplierResults.filter((r) => r.status === 'FAILED').map((r) => r.serviceType).join(', ');
      
      await this.prisma.operationalTask.create({
        data: {
          bookingId: booking.id,
          priority: finalStatus === 'FAILED' ? 'CRITICAL' : 'HIGH',
          taskType: finalStatus === 'PARTIALLY_CONFIRMED' ? 'PARTIAL_CONFIRMATION' : 'SUPPLIER_FAILURE',
          problemSummary: `Booking ${booking.bookingReference} experienced supplier failure for component service(s): ${failedServices}`,
          supplierName: 'Multi-Supplier Engine',
          requiredAction: 'Operations team must manually book missing transport/hotel seats or issue proportional refund.',
          status: 'OPEN',
          notes: JSON.stringify({ supplierResults }),
        },
      });

      this.logger.warn(`[PackageOrchestrator] Created Operational Task for booking ${booking.bookingReference} due to ${finalStatus} state.`);
    }

    // Update DB record to final status
    const updatedBooking = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: finalStatus as any,
        completedAt: finalStatus === 'CONFIRMED' ? new Date() : undefined,
        events: {
          create: {
            status: finalStatus as any,
            actorType: 'SYSTEM',
            actorId: 'BOOKING_ORCHESTRATOR',
            eventDescription: `Multi-service supplier fulfillment finished with status '${finalStatus}'.`,
            metadata: JSON.stringify({ supplierResults }),
          },
        },
      },
    });

    await this.logAuditEvent({
      userId: booking.userId,
      action: `BOOKING_FULFILLED_${finalStatus}`,
      entityType: 'BOOKING',
      entityId: booking.id,
      details: `Fulfillment result for ${booking.bookingReference}: ${finalStatus}`,
    });

    return {
      success: true,
      bookingId: updatedBooking.id,
      bookingReference: updatedBooking.bookingReference,
      status: finalStatus,
      supplierResults,
      message: finalStatus === 'CONFIRMED'
        ? 'All supplier components successfully confirmed!'
        : 'Booking is partially confirmed. Our operations desk will confirm remaining transport legs shortly.',
    };
  }

  /**
   * Helper for audit logging (Section 28)
   */
  private async logAuditEvent(param: { userId?: string; action: string; entityType: string; entityId: string; details: string }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: param.userId || null,
          action: param.action,
          entityType: param.entityType,
          entityId: param.entityId,
          details: param.details,
        },
      });
    } catch (e: any) {
      this.logger.warn(`[PackageOrchestrator] Audit log warning: ${e?.message}`);
    }
  }
}
