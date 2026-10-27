import { Injectable, Logger } from '@nestjs/common';
import {
  ITravelProvider,
  ProductTypeEnum,
  UniversalSearchInput,
  UniversalSearchResult,
  UniversalProductDetail,
  CheckPriceInput,
  CheckPriceResult,
  UniversalBookingRequest,
  UniversalBookingResponse,
  UniversalCancellationRequest,
  UniversalCancellationResponse,
  UniversalProductItem,
} from '../interfaces/universal-provider.interface';
import { HotelbedsHotelProvider } from './hotelbeds-hotel.provider';

@Injectable()
export class HotelbedsProviderAdapter implements ITravelProvider {
  private readonly logger = new Logger(HotelbedsProviderAdapter.name);

  public readonly providerId = 'prov-hotelbeds-hbx';
  public readonly providerName = 'Hotelbeds (HBX Group)';
  public readonly supportedProductTypes: ProductTypeEnum[] = ['HOTEL'];

  constructor(private readonly hotelbedsProvider: HotelbedsHotelProvider) {}

  async search(input: UniversalSearchInput): Promise<UniversalSearchResult> {
    this.logger.log(`[HotelbedsAdapter] Universal search -> Destination: ${input.destination}`);
    const results = await this.hotelbedsProvider.searchHotels({
      destination: input.destination,
      checkIn: input.checkIn,
      checkOut: input.checkOut || new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      rooms: input.rooms || 1,
      adults: input.adults || 2,
      children: input.children || 0,
      currency: input.currency || 'INR',
      latitude: input.latitude,
      longitude: input.longitude,
    });

    const normalizedItems: UniversalProductItem[] = results.map((h) => ({
      id: h.hotelId,
      productType: 'HOTEL',
      name: h.name,
      category: h.category,
      starRating: h.starRating,
      address: h.address,
      destination: h.destination,
      latitude: h.latitude,
      longitude: h.longitude,
      images: h.images,
      facilities: h.facilities,
      minPrice: h.minPrice,
      currency: h.currency,
      cancellationPolicy: h.cancellationPolicy,
      provider: this.providerName,
      availableRates: h.rooms.map((r) => ({
        rateKey: r.rateKey,
        name: r.roomName,
        boardName: r.boardName,
        boardCode: r.boardCode,
        netPrice: r.netPrice,
        currency: r.currency,
        cancellationPolicy: r.cancellationPolicy,
        cancellationFrom: r.cancellationFrom,
        cancellationAmount: r.cancellationAmount,
      })),
    }));

    return {
      productType: 'HOTEL',
      searchId: `SRCH-HBX-${Date.now()}`,
      totalCount: normalizedItems.length,
      items: normalizedItems,
      destination: input.destination,
      provider: this.providerName,
    };
  }

  async getDetails(productId: string): Promise<UniversalProductDetail | null> {
    const details = await this.hotelbedsProvider.getHotelDetails(productId);
    if (!details) return null;

    return {
      id: details.hotelId,
      productType: 'HOTEL',
      name: details.name,
      description: details.description,
      category: details.category,
      starRating: details.starRating,
      address: details.address,
      destination: details.destination,
      latitude: details.latitude,
      longitude: details.longitude,
      images: details.images,
      facilities: details.facilities,
      rates: details.rooms.map((r) => ({
        rateKey: r.rateKey,
        name: r.roomName,
        boardName: r.boardName,
        netPrice: r.netPrice,
        currency: r.currency,
        cancellationPolicy: r.cancellationPolicy,
      })),
      minPrice: details.minPrice,
      currency: details.currency,
      cancellationPolicy: details.cancellationPolicy,
      provider: this.providerName,
    };
  }

  async checkPrice(input: CheckPriceInput): Promise<CheckPriceResult> {
    const res = await this.hotelbedsProvider.checkRates(input.rateKey);
    return {
      status: res.status,
      rateKey: res.rateKey,
      netPrice: res.netPrice,
      currency: res.currency,
      cancellationPolicy: res.cancellationPolicy,
      productType: 'HOTEL',
      productId: input.productId,
      productName: res.hotelName,
      rateName: res.roomName,
      boardName: res.boardName,
      message: res.message,
    };
  }

  async createBooking(request: UniversalBookingRequest): Promise<UniversalBookingResponse> {
    const b = await this.hotelbedsProvider.createBooking({
      rateKey: request.rateKey,
      holder: request.holder,
      paxDetails: request.paxDetails,
      clientReference: request.idempotencyKey || `CF-UNI-${Date.now()}`,
    });

    return {
      chaloFarvaBookingId: request.idempotencyKey || b.chaloFarvaBookingId,
      bookingReference: b.chaloFarvaBookingId,
      supplierReference: b.supplierReference,
      productType: 'HOTEL',
      status: b.status === 'CONFIRMED' ? 'CONFIRMED' : 'TEST_ONLY',
      productId: b.hotelId,
      productName: b.hotelName,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      rateName: b.roomName,
      boardName: b.boardName,
      holderName: b.guestHolder,
      holderEmail: request.holder.email,
      holderPhone: request.holder.phone,
      guests: request.paxDetails,
      totalPrice: b.totalPrice,
      currency: b.currency,
      cancellationPolicy: b.cancellationPolicy,
      createdAt: b.createdAt,
    };
  }

  async cancelBooking(request: UniversalCancellationRequest): Promise<UniversalCancellationResponse> {
    const res = await this.hotelbedsProvider.cancelBooking(request.bookingIdOrReference, request.simulation ?? true);
    return {
      status: res.status === 'CANCELLED' ? 'CANCELLED' : 'FAILED',
      bookingReference: request.bookingIdOrReference,
      supplierReference: request.bookingIdOrReference,
      cancellationFee: res.cancellationFee,
      currency: res.currency,
      message: res.message,
    };
  }
}
