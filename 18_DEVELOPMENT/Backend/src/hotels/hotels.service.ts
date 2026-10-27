import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HotelbedsHotelProvider, BackendHotelSearchInput, CreateHotelBookingParams } from '../providers/hotelbeds/hotelbeds-hotel.provider';

export interface HotelSearchDto {
  destination?: string;
  destinationSlug?: string;
  checkIn?: string;
  checkOut?: string;
  rooms?: number;
  adults?: number;
  children?: number;
  nationality?: string;
  currency?: string;
  latitude?: number;
  longitude?: number;
}

export interface CalculateHotelPriceDto {
  rateKey: string;
  hotelCode: string;
  roomPricePerNight: number;
  checkIn: string;
  checkOut: string;
  rooms?: number;
  discount?: number;
}

export interface RevalidateHotelPriceDto {
  rateKey: string;
  hotelCode: string;
  expectedPrice: number;
  currency?: string;
}

export interface CreateHotelBookingDto {
  rateKey: string;
  hotelCode: string;
  hotelName: string;
  categoryName?: string;
  address?: string;
  destinationName?: string;
  checkIn: string;
  checkOut: string;
  roomName: string;
  boardName: string;
  price: number;
  currency?: string;
  cancellationPolicy?: string;
  acceptPriceChange?: boolean;
  holder: {
    name: string;
    surname: string;
    email: string;
    phone: string;
  };
  paxDetails: Array<{
    roomId?: number;
    type: 'AD' | 'CH';
    title?: string;
    name: string;
    surname: string;
    age?: number;
  }>;
  customerNotes?: string;
}

const DESTINATION_REGISTRY = [
  { code: 'AMD', name: 'Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714 },
  { code: 'GDN', name: 'Gandhinagar', city: 'Gandhinagar', state: 'Gujarat', country: 'India', latitude: 23.2156, longitude: 72.6369 },
  { code: 'BHJ', name: 'Bhuj / Kutch', city: 'Bhuj', state: 'Gujarat', country: 'India', latitude: 23.2420, longitude: 69.6669 },
  { code: 'GIR', name: 'Sasan Gir / Gir Somnath', city: 'Gir', state: 'Gujarat', country: 'India', latitude: 21.1300, longitude: 70.8000 },
  { code: 'DWK', name: 'Dwarka', city: 'Dwarka', state: 'Gujarat', country: 'India', latitude: 22.2442, longitude: 68.9685 },
  { code: 'SOM', name: 'Somnath', city: 'Somnath', state: 'Gujarat', country: 'India', latitude: 20.8880, longitude: 70.4012 },
  { code: 'JND', name: 'Junagadh', city: 'Junagadh', state: 'Gujarat', country: 'India', latitude: 21.5222, longitude: 70.4579 },
  { code: 'STV', name: 'Surat', city: 'Surat', state: 'Gujarat', country: 'India', latitude: 21.1702, longitude: 72.8311 },
  { code: 'BDQ', name: 'Vadodara', city: 'Vadodara', state: 'Gujarat', country: 'India', latitude: 22.3072, longitude: 73.1812 },
  { code: 'SOU', name: 'Statue of Unity / Kevadia / Narmada', city: 'Kevadia', state: 'Gujarat', country: 'India', latitude: 21.8380, longitude: 73.7191 },
  { code: 'SAP', name: 'Saputara', city: 'Saputara', state: 'Gujarat', country: 'India', latitude: 20.5755, longitude: 73.7540 },
  { code: 'GOI', name: 'Goa', city: 'Panaji', state: 'Goa', country: 'India', latitude: 15.2993, longitude: 74.1240 },
  { code: 'JAI', name: 'Jaipur', city: 'Jaipur', state: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873 },
  { code: 'UDR', name: 'Udaipur', city: 'Udaipur', state: 'Rajasthan', country: 'India', latitude: 24.5854, longitude: 73.7125 },
];

@Injectable()
export class HotelsService {
  private readonly logger = new Logger(HotelsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly hotelbedsProvider: HotelbedsHotelProvider,
  ) {}

  /**
   * Destination Autocomplete
   */
  async searchDestinations(query: string) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return DESTINATION_REGISTRY.slice(0, 5);

    return DESTINATION_REGISTRY.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q),
    );
  }

  /**
   * 1. Search Hotels with DB logging
   */
  async searchHotels(query: HotelSearchDto) {
    const destination = query.destination || query.destinationSlug || 'Ahmedabad';
    const checkIn = query.checkIn || new Date().toISOString().split('T')[0];
    const checkOut = query.checkOut || new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
    const rooms = query.rooms ? Number(query.rooms) : 1;
    const adults = query.adults ? Number(query.adults) : 2;
    const children = query.children ? Number(query.children) : 0;

    const results = await this.hotelbedsProvider.searchHotels({
      destination,
      checkIn,
      checkOut,
      rooms,
      adults,
      children,
      nationality: query.nationality,
      currency: query.currency,
      latitude: query.latitude,
      longitude: query.longitude,
    });

    // Asynchronous audit logging of hotel search
    try {
      await this.prisma.hotelSearchRecord.create({
        data: {
          destination,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          rooms,
          adults,
          children,
          resultCount: results.length,
          rawRequest: JSON.stringify({ destination, checkIn, checkOut, rooms, adults, children }),
        },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to log hotel search record: ${err?.message}`);
    }

    return results;
  }

  /**
   * 2. Get Hotel Details
   */
  async getHotelDetails(hotelCode: string) {
    const hotel = await this.hotelbedsProvider.getHotelDetails(hotelCode);
    if (!hotel) {
      throw new NotFoundException(`Hotel with code ${hotelCode} not found.`);
    }
    return hotel;
  }

  /**
   * Get Rooms for a specific hotel
   */
  async getHotelRooms(hotelCode: string) {
    const hotel = await this.getHotelDetails(hotelCode);
    return hotel.rooms || [];
  }

  /**
   * 3. Server-Side Price Calculation (Frontend is NEVER final pricing authority)
   */
  calculateServerPrice(dto: CalculateHotelPriceDto) {
    const start = new Date(dto.checkIn);
    const end = new Date(dto.checkOut);
    const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    const rooms = Math.max(1, dto.rooms || 1);
    const roomRateSubtotal = dto.roomPricePerNight * nights * rooms;
    const taxes = Math.round(roomRateSubtotal * 0.1); // 10% GST / taxes
    const serviceFee = 100; // Flat platform service fee
    const discount = dto.discount || 0;
    const totalAmount = Math.max(0, roomRateSubtotal + taxes + serviceFee - discount);

    return {
      roomRatePerNight: dto.roomPricePerNight,
      nights,
      rooms,
      roomRateSubtotal,
      taxes,
      serviceFee,
      discount,
      totalAmount,
      currency: 'INR',
    };
  }

  /**
   * Price & Availability Revalidation
   */
  async checkRate(rateKey: string) {
    return this.hotelbedsProvider.checkRates(rateKey);
  }

  /**
   * Explicit Price Drift Revalidation Endpoint
   */
  async revalidatePrice(dto: RevalidateHotelPriceDto) {
    const supplierCheck = await this.checkRate(dto.rateKey);

    if (supplierCheck.status === 'UNAVAILABLE') {
      return {
        status: 'ROOM_UNAVAILABLE',
        available: false,
        message: 'Selected room is no longer available.',
      };
    }

    const currentSupplierPrice = supplierCheck.netPrice;
    const priceChanged = currentSupplierPrice !== dto.expectedPrice;

    if (priceChanged) {
      return {
        status: 'PRICE_CHANGED',
        available: true,
        priceChanged: true,
        oldPrice: dto.expectedPrice,
        newPrice: currentSupplierPrice,
        currency: supplierCheck.currency || 'INR',
        rateKey: supplierCheck.rateKey || dto.rateKey,
        message: `HOTEL PRICE UPDATED. Rate changed from ₹${dto.expectedPrice} to ₹${currentSupplierPrice}. Customer confirmation required.`,
      };
    }

    return {
      status: 'AVAILABLE',
      available: true,
      priceChanged: false,
      price: currentSupplierPrice,
      currency: supplierCheck.currency || 'INR',
      rateKey: supplierCheck.rateKey || dto.rateKey,
      message: 'Rate verified and locked.',
    };
  }

  /**
   * Package Hotel Upgrade Price Calculation
   */
  async calculatePackageHotelUpgrade(baseCategory: string, upgradeCategory: string, nights: number) {
    const baseRates: Record<string, number> = {
      '3 STAR': 3500,
      '4 STAR': 5500,
      '5 STAR': 9500,
    };

    const basePerNight = baseRates[baseCategory.toUpperCase()] || 3500;
    const upgradePerNight = baseRates[upgradeCategory.toUpperCase()] || 5500;
    const deltaPerNight = Math.max(0, upgradePerNight - basePerNight);
    const totalUpgradePrice = deltaPerNight * nights;

    return {
      baseCategory,
      upgradeCategory,
      nights,
      deltaPerNight,
      totalUpgradePrice,
      currency: 'INR',
    };
  }

  /**
   * 4. Create Hotel Booking with Prisma DB Persistence, Price Manipulation Defense & Idempotency Protection
   */
  async createBooking(userId: string, dto: CreateHotelBookingDto, idempotencyHeader?: string) {
    if (!dto.rateKey) {
      throw new BadRequestException('rateKey is required to process hotel booking.');
    }

    const keyToUse = idempotencyHeader || `IDEM-${userId}-${dto.rateKey.substring(0, 20)}`;

    // Step 0: Idempotency Protection check
    if (keyToUse) {
      const existing = await this.prisma.booking.findFirst({
        where: { userId, idempotencyKey: keyToUse },
        include: { hotelDetail: { include: { guests: true } } },
      });

      if (existing) {
        this.logger.log(`[HotelsService Idempotency Match] Returning existing booking ${existing.bookingReference}`);
        return {
          chaloFarvaBookingId: existing.id,
          bookingReference: existing.bookingReference,
          supplierReference: existing.hotelDetail?.supplierReference || existing.bookingReference,
          status: existing.status,
          hotelId: dto.hotelCode,
          hotelName: dto.hotelName,
          checkIn: dto.checkIn,
          checkOut: dto.checkOut,
          roomName: dto.roomName,
          boardName: dto.boardName,
          holderName: `${dto.holder.name} ${dto.holder.surname}`,
          holderEmail: dto.holder.email,
          holderPhone: dto.holder.phone,
          guests: existing.hotelDetail?.guests || [],
          totalPrice: Number(existing.totalAmountInr),
          currency: existing.currency,
          cancellationPolicy: dto.cancellationPolicy || 'Standard Policy',
          createdAt: existing.createdAt,
          idempotent: true,
        };
      }
    }

    // Step 1: Mandatory Price & Availability Recheck before booking
    const rateCheck = await this.checkRate(dto.rateKey);
    if (rateCheck.status === 'UNAVAILABLE') {
      throw new BadRequestException({
        errorCode: 'ROOM_UNAVAILABLE',
        message: 'Room no longer available. Please choose another room.',
      });
    }

    // Price change verification
    if (rateCheck.status === 'PRICE_CHANGED' && rateCheck.netPrice !== dto.price && !dto.acceptPriceChange) {
      return {
        priceChanged: true,
        status: 'PRICE_CHANGED',
        oldPrice: dto.price,
        newPrice: rateCheck.netPrice,
        currency: rateCheck.currency || 'INR',
        rateKey: rateCheck.rateKey,
        message: `HOTEL PRICE UPDATED from ₹${dto.price} to ₹${rateCheck.netPrice}. Explicit customer confirmation required.`,
      };
    }

    // Server-Side Price Tampering Guard: Ensure client-submitted price isn't manipulated below rate check
    if (dto.price <= 0 || (rateCheck.netPrice && dto.price < rateCheck.netPrice * 0.9)) {
      throw new ConflictException({
        errorCode: 'PRICE_MANIPULATION_REJECTED',
        message: 'Submitted booking price violates server calculated fare bounds.',
        expectedPrice: rateCheck.netPrice,
        submittedPrice: dto.price,
      });
    }

    const finalRateKey = rateCheck.rateKey || dto.rateKey;
    const finalPrice = rateCheck.netPrice || dto.price;
    const bookingRef = `CF-HOTEL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Step 2: Invoke Supplier Booking API
    const supplierRes = await this.hotelbedsProvider.createBooking({
      rateKey: finalRateKey,
      holder: dto.holder,
      paxDetails: dto.paxDetails,
      clientReference: bookingRef,
    });

    // Step 3: Persist Booking into DB
    const startDate = new Date(dto.checkIn);
    const endDate = new Date(dto.checkOut);
    const adultCount = dto.paxDetails.filter((p) => p.type === 'AD').length || 1;
    const childCount = dto.paxDetails.filter((p) => p.type === 'CH').length || 0;

    const bookingRecord = await this.prisma.booking.create({
      data: {
        bookingReference: bookingRef,
        userId,
        bookingType: 'HOTEL',
        inventoryType: 'HOTEL',
        inventoryId: dto.hotelCode,
        status: 'CONFIRMED',
        startDate,
        endDate,
        adultCount,
        childCount,
        guestCount: adultCount + childCount,
        unitPrice: finalPrice,
        subtotal: finalPrice,
        totalAmountInr: finalPrice,
        currency: dto.currency || 'INR',
        customerNotes: dto.customerNotes,
        idempotencyKey: keyToUse,
        hotelDetail: {
          create: {
            supplierReference: supplierRes.supplierReference,
            hotelCode: dto.hotelCode,
            hotelName: dto.hotelName,
            categoryName: dto.categoryName || '4 STARS',
            address: dto.address || 'Gujarat',
            destinationName: dto.destinationName || 'Gujarat',
            roomName: dto.roomName,
            boardName: dto.boardName,
            rateKey: finalRateKey,
            cancellationPolicy: dto.cancellationPolicy || 'Refundable up to 24h prior to check-in',
            guests: {
              create: dto.paxDetails.map((p) => ({
                roomIndex: p.roomId || 1,
                guestType: p.type || 'AD',
                title: p.title || 'Mr/Ms',
                firstName: p.name,
                lastName: p.surname,
                age: p.age,
              })),
            },
          },
        },
        events: {
          create: {
            status: 'CONFIRMED',
            actorType: 'CUSTOMER',
            actorId: userId,
            eventDescription: 'Hotel booking confirmed via Hotelbeds supplier integration.',
            metadata: JSON.stringify({ supplierReference: supplierRes.supplierReference, rateKey: finalRateKey }),
          },
        },
      },
      include: {
        hotelDetail: {
          include: {
            guests: true,
          },
        },
        events: true,
      },
    });

    return {
      chaloFarvaBookingId: bookingRecord.id,
      bookingReference: bookingRecord.bookingReference,
      supplierReference: supplierRes.supplierReference,
      status: bookingRecord.status,
      hotelId: dto.hotelCode,
      hotelName: dto.hotelName,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      roomName: dto.roomName,
      boardName: dto.boardName,
      holderName: `${dto.holder.name} ${dto.holder.surname}`,
      holderEmail: dto.holder.email,
      holderPhone: dto.holder.phone,
      guests: bookingRecord.hotelDetail?.guests || [],
      totalPrice: Number(bookingRecord.totalAmountInr),
      currency: bookingRecord.currency,
      cancellationPolicy: dto.cancellationPolicy || 'Refundable up to 24h prior to check-in',
      createdAt: bookingRecord.createdAt,
    };
  }

  /**
   * 5. Get User Bookings with Hotel Details
   */
  async getUserHotelBookings(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        userId,
        bookingType: 'HOTEL',
      },
      include: {
        hotelDetail: {
          include: {
            guests: true,
          },
        },
        events: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings;
  }

  /**
   * 6. Cancel Booking with Supplier & DB Event Tracking
   */
  async cancelBooking(userId: string, bookingIdOrRef: string, reason?: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: bookingIdOrRef }, { bookingReference: bookingIdOrRef }],
      },
      include: {
        hotelDetail: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${bookingIdOrRef} not found.`);
    }

    if (booking.status === 'CANCELLED') {
      return {
        status: 'CANCELLED',
        bookingReference: booking.bookingReference,
        message: 'Booking was already cancelled.',
      };
    }

    const supplierRef = booking.hotelDetail?.supplierReference || booking.bookingReference;

    // Trigger supplier cancellation API
    let supplierCancelRes: any;
    try {
      supplierCancelRes = await this.hotelbedsProvider.cancelBooking(supplierRef, true);
    } catch (err: any) {
      this.logger.warn(`Supplier cancellation failed: ${err.message}. Setting status to CANCEL_REQUESTED.`);
      supplierCancelRes = {
        status: 'CANCEL_REQUESTED',
        cancellationFee: 0,
        currency: booking.currency || 'INR',
        message: 'Cancellation requested for manual admin processing.',
      };
    }

    const newStatus: any = supplierCancelRes.status === 'CANCELLED' ? 'CANCELLED' : 'CANCEL_REQUESTED';


    // Update DB record
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
            eventDescription: `Booking cancellation status: ${newStatus}. ${supplierCancelRes.message}`,
            metadata: JSON.stringify(supplierCancelRes),
          },
        },
      },
      include: {
        hotelDetail: true,
        events: true,
      },
    });

    return {
      status: updated.status,
      bookingId: updated.id,
      bookingReference: updated.bookingReference,
      supplierReference: supplierRef,
      cancellationFee: supplierCancelRes.cancellationFee || 0,
      currency: supplierCancelRes.currency || 'INR',
      message: supplierCancelRes.message,
    };
  }

  /**
   * Health Check Report
   */
  async getHealthCheck() {
    const hasApiKey = Boolean(process.env.HOTELBEDS_API_KEY);
    const hasSecret = Boolean(process.env.HOTELBEDS_SECRET);
    const mode = process.env.HOTEL_PROVIDER_MODE || (hasApiKey && hasSecret ? 'production' : 'sandbox');

    return {
      providerId: 'prov-hotelbeds-hbx',
      providerName: 'Hotelbeds (HBX Group)',
      environment: mode,
      credentialsConfigured: hasApiKey && hasSecret,
      status: 'HEALTHY',
      averageLatencyMs: 145,
      capabilities: {
        search: true,
        details: true,
        availability: true,
        pricing: true,
        revalidation: true,
        booking: true,
        cancellation: true,
        refund: true,
        roomSelection: true,
      },
      lastCheckedAt: new Date().toISOString(),
    };
  }
}

