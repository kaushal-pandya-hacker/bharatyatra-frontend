import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UniversalProviderRegistry } from '../providers/registry/universal-provider.registry';
import { PricingEngineService } from '../pricing/pricing-engine.service';
import {
  UniversalSearchInput,
  UniversalSearchResult,
  UniversalProductDetail,
  CheckPriceInput,
  CheckPriceResult,
  UniversalBookingRequest,
  UniversalBookingResponse,
  UniversalCancellationRequest,
  UniversalCancellationResponse,
  ProductTypeEnum,
} from '../providers/interfaces/universal-provider.interface';

@Injectable()
export class UniversalBookingEngineService {
  private readonly logger = new Logger(UniversalBookingEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: UniversalProviderRegistry,
    private readonly pricingEngine: PricingEngineService,
  ) {}

  /**
   * 1. Universal Search across all product types
   */
  async search(input: UniversalSearchInput): Promise<UniversalSearchResult> {
    const provider = this.registry.getProvider(input.productType, input.options?.providerId);
    if (!provider.search) {
      throw new BadRequestException(`Provider '${provider.providerName}' does not support search operations.`);
    }

    const result = await provider.search(input);

    // Apply pricing engine rules to items
    result.items = result.items.map((item) => {
      const priced = this.pricingEngine.calculateCustomerPrice(item.minPrice, item.productType, provider.providerId);
      return {
        ...item,
        minPrice: priced.totalCustomerPrice,
      };
    });

    // Asynchronous audit logging
    try {
      await this.prisma.hotelSearchRecord.create({
        data: {
          destination: input.destination,
          checkIn: new Date(input.checkIn),
          checkOut: new Date(input.checkOut || Date.now() + 2 * 86400000),
          rooms: input.rooms || 1,
          adults: input.adults || 2,
          children: input.children || 0,
          resultCount: result.totalCount,
          rawRequest: JSON.stringify(input),
        },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to log search record: ${err?.message}`);
    }

    return result;
  }

  /**
   * 2. Universal Product Details
   */
  async getProductDetails(productType: ProductTypeEnum, productId: string): Promise<UniversalProductDetail> {
    const provider = this.registry.getProvider(productType);
    if (!provider.getDetails) {
      throw new NotFoundException(`Product details not available for productType ${productType}`);
    }

    const details = await provider.getDetails(productId);
    if (!details) {
      throw new NotFoundException(`Product ${productId} not found.`);
    }

    // Apply pricing calculation
    const priced = this.pricingEngine.calculateCustomerPrice(details.minPrice, productType, provider.providerId);
    details.minPrice = priced.totalCustomerPrice;

    return details;
  }

  /**
   * 3. Universal Price & Availability Recheck
   */
  async checkPrice(input: CheckPriceInput): Promise<CheckPriceResult> {
    const productType = input.productType || 'HOTEL';
    const provider = this.registry.getProvider(productType);
    if (!provider.checkPrice) {
      return {
        status: 'AVAILABLE',
        rateKey: input.rateKey,
        netPrice: 4800,
        currency: 'INR',
        cancellationPolicy: 'Standard Policy',
      };
    }

    const result = await provider.checkPrice(input);
    if (result.status === 'AVAILABLE' || result.status === 'PRICE_CHANGED') {
      const priced = this.pricingEngine.calculateCustomerPrice(result.netPrice, productType, provider.providerId);
      result.grossPrice = priced.totalCustomerPrice;
    }

    return result;
  }

  /**
   * 4. Universal Booking Execution & Idempotency State Machine
   */
  async createBooking(
    userId: string,
    request: UniversalBookingRequest,
    idempotencyHeader?: string,
  ): Promise<UniversalBookingResponse> {
    const idempotencyKey = idempotencyHeader || request.idempotencyKey || `UNI-IDEM-${userId}-${request.rateKey.substring(0, 15)}`;

    // Idempotency Protection
    if (idempotencyKey) {
      const existing = await this.prisma.booking.findFirst({
        where: { userId, idempotencyKey },
        include: { hotelDetail: { include: { guests: true } } },
      });

      if (existing) {
        this.logger.log(`[UniversalBookingEngine] Idempotency match found for key '${idempotencyKey}' -> Booking ${existing.bookingReference}`);
        return {
          chaloFarvaBookingId: existing.id,
          bookingReference: existing.bookingReference,
          supplierReference: existing.hotelDetail?.supplierReference || existing.bookingReference,
          productType: (existing.bookingType as ProductTypeEnum) || request.productType,
          status: (existing.status as any) || 'CONFIRMED',
          productId: existing.inventoryId || request.productId,
          productName: request.productName,
          checkIn: request.checkIn,
          checkOut: request.checkOut,
          rateName: request.rateName,
          boardName: request.boardName,
          holderName: `${request.holder.name} ${request.holder.surname}`,
          holderEmail: request.holder.email,
          holderPhone: request.holder.phone,
          guests: existing.hotelDetail?.guests || [],
          totalPrice: Number(existing.totalAmountInr),
          currency: existing.currency,
          cancellationPolicy: request.cancellationPolicy || 'Standard Policy',
          createdAt: (existing.createdAt instanceof Date ? existing.createdAt : new Date(existing.createdAt || Date.now())).toISOString(),
          idempotent: true,
        };
      }
    }

    // Step 1: Pre-booking Price & Availability Recheck State
    const priceCheck = await this.checkPrice({ rateKey: request.rateKey, productType: request.productType, productId: request.productId });
    if (priceCheck.status === 'UNAVAILABLE') {
      throw new BadRequestException('Selected product/room rate is no longer available. Please select another option.');
    }

    if (priceCheck.status === 'PRICE_CHANGED' && priceCheck.netPrice !== request.price && !request.acceptPriceChange) {
      return {
        chaloFarvaBookingId: '',
        bookingReference: '',
        supplierReference: '',
        productType: request.productType,
        status: 'FAILED',
        productId: request.productId,
        productName: request.productName,
        checkIn: request.checkIn,
        checkOut: request.checkOut,
        rateName: request.rateName,
        holderName: `${request.holder.name} ${request.holder.surname}`,
        holderEmail: request.holder.email,
        holderPhone: request.holder.phone,
        guests: [],
        totalPrice: priceCheck.netPrice,
        currency: priceCheck.currency || 'INR',
        cancellationPolicy: request.cancellationPolicy || 'Standard Policy',
        createdAt: new Date().toISOString(),
        priceChanged: true,
        oldPrice: request.price,
        newPrice: priceCheck.netPrice,
      };
    }

    // Step 2: Invoke Travel Provider via Registry
    const provider = this.registry.getProvider(request.productType);
    if (!provider.createBooking) {
      throw new BadRequestException(`Provider '${provider.providerName}' does not support booking operations.`);
    }

    const supplierBooking = await provider.createBooking(request);

    // Step 3: Calculate Customer Final Price via Pricing Engine
    const finalPriceResult = this.pricingEngine.calculateCustomerPrice(supplierBooking.totalPrice, request.productType, provider.providerId);

    // Step 4: Persist Unified Booking Record to Database
    const bookingRef = `CF-${request.productType.substring(0, 3)}-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const dbRecord = await this.prisma.booking.create({
      data: {
        bookingReference: bookingRef,
        userId,
        bookingType: request.productType,
        inventoryType: request.productType,
        inventoryId: request.productId,
        status: 'CONFIRMED',
        startDate: new Date(request.checkIn),
        endDate: new Date(request.checkOut),
        adultCount: request.paxDetails.filter((p) => p.type === 'AD').length || 1,
        childCount: request.paxDetails.filter((p) => p.type === 'CH').length || 0,
        guestCount: request.paxDetails.length || 1,
        unitPrice: finalPriceResult.totalCustomerPrice,
        subtotal: finalPriceResult.netPrice + finalPriceResult.markupAmount,
        taxes: finalPriceResult.taxAmount,
        totalAmountInr: finalPriceResult.totalCustomerPrice,
        currency: finalPriceResult.currency,
        customerNotes: request.customerNotes,
        idempotencyKey,
        hotelDetail: request.productType === 'HOTEL' ? {
          create: {
            supplierReference: supplierBooking.supplierReference,
            hotelCode: request.productId,
            hotelName: request.productName,
            categoryName: request.categoryName || '4 STARS',
            address: request.address || 'Gujarat',
            destinationName: request.destinationName || 'Gujarat',
            roomName: request.rateName,
            boardName: request.boardName || 'Room Only',
            rateKey: request.rateKey,
            cancellationPolicy: request.cancellationPolicy || 'Standard Cancellation Policy',
            guests: {
              create: request.paxDetails.map((p) => ({
                roomIndex: p.roomId || 1,
                guestType: p.type || 'AD',
                title: p.title || 'Mr/Ms',
                firstName: p.name,
                lastName: p.surname,
                age: p.age,
              })),
            },
          },
        } : undefined,
        events: {
          create: {
            status: 'CONFIRMED',
            actorType: 'CUSTOMER',
            actorId: userId,
            eventDescription: `Universal ${request.productType} booking confirmed via ${provider.providerName}`,
            metadata: JSON.stringify({ supplierReference: supplierBooking.supplierReference, rateKey: request.rateKey }),
          },
        },
      },
      include: {
        hotelDetail: {
          include: { guests: true },
        },
        events: true,
      },
    });

    return {
      chaloFarvaBookingId: dbRecord.id,
      bookingReference: dbRecord.bookingReference,
      supplierReference: supplierBooking.supplierReference,
      productType: request.productType,
      status: 'CONFIRMED',
      productId: request.productId,
      productName: request.productName,
      checkIn: request.checkIn,
      checkOut: request.checkOut,
      rateName: request.rateName,
      boardName: request.boardName,
      holderName: `${request.holder.name} ${request.holder.surname}`,
      holderEmail: request.holder.email,
      holderPhone: request.holder.phone,
      guests: dbRecord.hotelDetail?.guests || request.paxDetails,
      totalPrice: Number(dbRecord.totalAmountInr),
      currency: dbRecord.currency,
      cancellationPolicy: request.cancellationPolicy || 'Standard Cancellation Policy',
      createdAt: dbRecord.createdAt.toISOString(),
    };
  }

  /**
   * 5. Universal My Bookings List
   */
  async getUserBookings(userId: string, filterStatus?: string, productType?: string) {
    const where: any = { userId };

    if (productType && productType !== 'ALL') {
      where.bookingType = productType;
    }

    if (filterStatus && filterStatus !== 'ALL') {
      if (filterStatus === 'UPCOMING') {
        where.status = 'CONFIRMED';
        where.startDate = { gte: new Date() };
      } else if (filterStatus === 'PAST') {
        where.startDate = { lt: new Date() };
      } else if (filterStatus === 'CANCELLED') {
        where.status = 'CANCELLED';
      } else {
        where.status = filterStatus as any;
      }
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        supplier: true,
        hotelDetail: { include: { guests: true } },
        events: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings;
  }

  /**
   * 6. Universal Cancellation
   */
  async cancelBooking(userId: string, request: UniversalCancellationRequest): Promise<UniversalCancellationResponse> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: request.bookingIdOrReference }, { bookingReference: request.bookingIdOrReference }],
      },
      include: { hotelDetail: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${request.bookingIdOrReference} not found.`);
    }

    if (booking.status === 'CANCELLED') {
      return {
        status: 'CANCELLED',
        bookingReference: booking.bookingReference,
        supplierReference: booking.hotelDetail?.supplierReference || booking.bookingReference,
        cancellationFee: 0,
        currency: booking.currency,
        message: 'Booking is already cancelled.',
      };
    }

    const productType = (booking.bookingType as ProductTypeEnum) || 'HOTEL';
    const provider = this.registry.getProvider(productType);
    const supplierRef = booking.hotelDetail?.supplierReference || booking.bookingReference;

    let cancelRes: UniversalCancellationResponse = {
      status: 'CANCELLED',
      bookingReference: booking.bookingReference,
      supplierReference: supplierRef,
      cancellationFee: 0,
      currency: booking.currency,
      message: 'Booking cancelled successfully.',
    };

    if (provider.cancelBooking) {
      cancelRes = await provider.cancelBooking({
        bookingIdOrReference: supplierRef,
        reason: request.reason,
        simulation: request.simulation ?? true,
      });
    }

    // Update DB state
    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: request.reason || 'Cancelled by customer',
        events: {
          create: {
            status: 'CANCELLED',
            actorType: 'CUSTOMER',
            actorId: userId,
            eventDescription: `Universal ${productType} booking cancelled via ${provider.providerName}. ${cancelRes.message}`,
            metadata: JSON.stringify(cancelRes),
          },
        },
      },
    });

    return {
      status: 'CANCELLED',
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      supplierReference: supplierRef,
      cancellationFee: cancelRes.cancellationFee,
      currency: cancelRes.currency,
      message: cancelRes.message,
    };
  }
}
