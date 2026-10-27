import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { TransportService } from '../transport/transport.service';
import {
  UniversalTransportSearchInput,
  NormalizedTransportSearchResult,
  NormalizedTransportItem,
  TransportRevalidateInput,
  TransportRevalidateResult,
  TransportBookingRequest,
  TransportBookingResult,
  TransportCancellationRequest,
  TransportCancellationResult,
} from '../providers/interfaces/transport-provider.interface';

export interface FlightSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  tripType?: 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY';
  multiCityLegs?: Array<{ origin: string; destination: string; departureDate: string }>;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
}

@Injectable()
export class FlightsService {
  private readonly logger = new Logger(FlightsService.name);

  constructor(private readonly transportService: TransportService) {}

  /**
   * Search Flights (Supports One-Way, Round-Trip, Multi-City)
   */
  async search(request: FlightSearchRequest): Promise<NormalizedTransportSearchResult> {
    if (!request.origin || !request.destination) {
      throw new BadRequestException('Flight origin and destination codes are required.');
    }

    this.logger.log(`[FlightsService] Searching flights -> Type: ${request.tripType || 'ONE_WAY'}, ${request.origin} ✈ ${request.destination}`);

    // Call underlying TransportService with FLIGHT type
    const searchResult = await this.transportService.search({
      type: 'FLIGHT',
      origin: request.origin,
      destination: request.destination,
      departureDate: request.departureDate,
      returnDate: request.returnDate,
      tripType: request.tripType || 'ONE_WAY',
      adults: request.adults || 1,
      children: request.children || 0,
      infants: request.infants || 0,
      cabinClass: request.cabinClass || 'ECONOMY',
    });

    // If multi-city, append leg segments
    if (request.tripType === 'MULTI_CITY' && request.multiCityLegs && request.multiCityLegs.length > 0) {
      for (let i = 0; i < request.multiCityLegs.length; i++) {
        const leg = request.multiCityLegs[i];
        try {
          const legRes = await this.transportService.search({
            type: 'FLIGHT',
            origin: leg.origin,
            destination: leg.destination,
            departureDate: leg.departureDate,
            cabinClass: request.cabinClass || 'ECONOMY',
          });
          if (legRes.items.length > 0 && searchResult.items[0]) {
            searchResult.items[0].segments.push(...legRes.items[0].segments.map(s => ({ ...s, segmentOrder: s.segmentOrder + i + 1 })));
          }
        } catch (e) {}
      }
    }

    return searchResult;
  }

  /**
   * Get Flight Details, Fare Rules & Baggage Policy
   */
  async getDetails(flightId: string): Promise<NormalizedTransportItem | null> {
    const details = await this.transportService.getDetails('FLIGHT', flightId);
    if (!details) {
      throw new NotFoundException(`Flight with ID '${flightId}' not found.`);
    }
    return details;
  }

  /**
   * Revalidate Flight Fare & Availability Prior to Checkout
   */
  async revalidate(input: TransportRevalidateInput): Promise<TransportRevalidateResult> {
    return await this.transportService.revalidate(input, 'FLIGHT');
  }

  /**
   * Server-Side Price Calculation
   */
  calculateServerPrice(baseFarePerPassenger: number, passengerCount: number): { baseTotal: number; taxes: number; serviceFee: number; totalAmount: number } {
    const baseTotal = baseFarePerPassenger * passengerCount;
    const taxes = Math.round(baseTotal * 0.1);
    const serviceFee = 100;
    const totalAmount = baseTotal + taxes + serviceFee;
    return { baseTotal, taxes, serviceFee, totalAmount };
  }

  /**
   * Book Flight with Price Manipulation & Idempotency Safeguards
   */
  async createBooking(request: TransportBookingRequest, userId: string = '00000000-0000-0000-0000-000000000001'): Promise<TransportBookingResult> {
    // 1. Verify Flight Details & Calculate Expected Server Price
    const flight = await this.getDetails(request.transportId);
    const expectedPricing = this.calculateServerPrice(flight.price, request.passengers.length);

    // 2. Security Check: Price Tampering Defense
    if (request.agreedFare && Math.abs(request.agreedFare - expectedPricing.baseTotal) > 5 && !request.acceptPriceChange) {
      this.logger.warn(`[SECURITY ALERT] Flight price manipulation detected for user ${userId}. Client fare: ₹${request.agreedFare}, Server base: ₹${expectedPricing.baseTotal}`);
      throw new ConflictException({
        errorCode: 'PRICE_MANIPULATION_REJECTED',
        message: 'Submitted price does not match verified server fare.',
        expectedFare: expectedPricing.baseTotal,
        submittedFare: request.agreedFare,
      });
    }

    // 3. Perform Revalidation & Supplier Booking Orchestration
    return await this.transportService.checkout(
      {
        ...request,
        type: 'FLIGHT',
        providerId: request.providerId || 'prov-tbo-air',
        agreedFare: flight.price,
      },
      userId,
    );
  }

  /**
   * Cancel Flight Booking
   */
  async cancelBooking(request: TransportCancellationRequest, userId: string = '00000000-0000-0000-0000-000000000001'): Promise<TransportCancellationResult> {
    return await this.transportService.cancel(request);
  }

  /**
   * Flight Provider Health Check
   */
  async getHealth() {
    const healthChecks = await this.transportService.getHealthChecks();
    return healthChecks.find(h => h.supportedType === 'FLIGHT') || healthChecks[0];
  }
}
