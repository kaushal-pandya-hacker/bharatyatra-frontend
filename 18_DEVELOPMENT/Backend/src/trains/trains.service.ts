import { Injectable, Logger, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
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

export interface TrainSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  passengers?: number;
  cabinClass?: string; // 1A, 2A, 3A, SL, CC, 2S, EC
}

export interface TrainStation {
  stationCode: string;
  stationName: string;
  city: string;
  state: string;
}

export interface TrainAvailabilityStatus {
  trainId: string;
  cabinClass: string;
  status: 'AVAILABLE' | 'RAC' | 'WAITLIST' | 'NOT_AVAILABLE' | 'CONFIRMATION_REQUIRED';
  seatsAvailable: number;
  racNumber?: number;
  waitlistNumber?: number;
  fare: number;
  currency: string;
}

@Injectable()
export class TrainsService {
  private readonly logger = new Logger(TrainsService.name);

  private readonly normalizedStations: TrainStation[] = [
    { stationCode: 'ADI', stationName: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat' },
    { stationCode: 'MAO', stationName: 'Madgaon Goa Junction', city: 'Madgaon', state: 'Goa' },
    { stationCode: 'BOM', stationName: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
    { stationCode: 'DEL', stationName: 'New Delhi Railway Station', stationCodeAlt: 'NDLS', city: 'New Delhi', state: 'Delhi' } as any,
    { stationCode: 'NDLS', stationName: 'New Delhi Railway Station', city: 'New Delhi', state: 'Delhi' },
    { stationCode: 'ST', stationName: 'Surat Railway Station', city: 'Surat', state: 'Gujarat' },
    { stationCode: 'DWK', stationName: 'Dwarka Station', city: 'Dwarka', state: 'Gujarat' },
    { stationCode: 'BRC', stationName: 'Vadodara Junction', city: 'Vadodara', state: 'Gujarat' },
    { stationCode: 'RJT', stationName: 'Rajkot Junction', city: 'Rajkot', state: 'Gujarat' },
    { stationCode: 'HWH', stationName: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal' },
    { stationCode: 'MAS', stationName: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
    { stationCode: 'SBC', stationName: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka' },
  ];

  constructor(private readonly transportService: TransportService) {}

  /**
   * Station Autocomplete & Code Normalization
   */
  searchStations(query: string): TrainStation[] {
    if (!query || query.trim().length === 0) return this.normalizedStations.slice(0, 6);
    const q = query.trim().toLowerCase();
    return this.normalizedStations.filter(
      s => s.stationCode.toLowerCase().includes(q) || s.stationName.toLowerCase().includes(q) || s.city.toLowerCase().includes(q),
    );
  }

  /**
   * Normalize Station Code from Free Text or Code
   */
  normalizeStationCode(input: string): string {
    const q = (input || '').trim().toLowerCase();
    const found = this.normalizedStations.find(s => s.stationCode.toLowerCase() === q || s.city.toLowerCase() === q || s.stationName.toLowerCase().includes(q));
    return found ? found.stationCode : input.toUpperCase();
  }

  /**
   * Search Trains Across Travel Classes
   */
  async search(request: TrainSearchRequest): Promise<NormalizedTransportSearchResult> {
    const originCode = this.normalizeStationCode(request.origin || 'ADI');
    const destCode = this.normalizeStationCode(request.destination || 'MAO');

    this.logger.log(`[TrainsService] Searching trains -> Origin: ${originCode}, Dest: ${destCode}, Date: ${request.departureDate}`);

    return await this.transportService.search({
      type: 'TRAIN',
      origin: originCode,
      destination: destCode,
      departureDate: request.departureDate,
      passengers: request.passengers || 1,
      cabinClass: request.cabinClass || '3A',
    });
  }

  /**
   * Get Train Route Details, Timetable & Cancellation Rules
   */
  async getDetails(trainId: string): Promise<NormalizedTransportItem | null> {
    const details = await this.transportService.getDetails('TRAIN', trainId);
    if (!details) {
      throw new NotFoundException(`Train with ID '${trainId}' not found.`);
    }
    return details;
  }

  /**
   * Get Train Class Availability Status
   */
  async getAvailability(trainId: string, cabinClass: string = '3A'): Promise<TrainAvailabilityStatus> {
    const train = await this.getDetails(trainId);
    const fare = train.price || 1350;

    return {
      trainId,
      cabinClass,
      status: train.seatsAvailable > 0 ? 'AVAILABLE' : 'CONFIRMATION_REQUIRED',
      seatsAvailable: train.seatsAvailable || 20,
      fare,
      currency: 'INR',
    };
  }

  /**
   * Revalidate Train Quota Availability & Fare Before Checkout
   */
  async revalidate(input: TransportRevalidateInput): Promise<TransportRevalidateResult> {
    return await this.transportService.revalidate(input, 'TRAIN');
  }

  /**
   * Server-Side Price Calculation
   */
  calculateServerPrice(baseFare: number, passengersCount: number): { baseTotal: number; taxes: number; serviceFee: number; totalAmount: number } {
    const baseTotal = baseFare * passengersCount;
    const taxes = Math.round(baseTotal * 0.1);
    const serviceFee = 100;
    const totalAmount = baseTotal + taxes + serviceFee;
    return { baseTotal, taxes, serviceFee, totalAmount };
  }

  /**
   * Create Train Booking (Handles Direct Booking vs Request Confirmation Mode)
   */
  async createBooking(request: TransportBookingRequest, userId: string = '00000000-0000-0000-0000-000000000001'): Promise<TransportBookingResult> {
    // 1. Fetch train details
    const train = await this.getDetails(request.transportId);
    const expectedPricing = this.calculateServerPrice(train.price, request.passengers.length);

    // 2. Price Manipulation Defense
    if (request.agreedFare && Math.abs(request.agreedFare - expectedPricing.baseTotal) > 5 && !request.acceptPriceChange) {
      this.logger.warn(`[SECURITY ALERT] Train price manipulation detected for user ${userId}. Client fare: ₹${request.agreedFare}, Server base: ₹${expectedPricing.baseTotal}`);
      throw new ConflictException({
        errorCode: 'PRICE_MANIPULATION_REJECTED',
        message: 'Submitted price does not match verified server fare.',
        expectedFare: expectedPricing.baseTotal,
        submittedFare: request.agreedFare,
      });
    }

    // 3. Delegate to Universal Transport Service for Orchestration
    return await this.transportService.checkout(
      {
        ...request,
        type: 'TRAIN',
        providerId: request.providerId || 'prov-train-irctc',
        agreedFare: train.price,
      },
      userId,
    );
  }

  /**
   * Cancel Train Ticket Request
   */
  async cancelBooking(request: TransportCancellationRequest, userId: string = '00000000-0000-0000-0000-000000000001'): Promise<TransportCancellationResult> {
    return await this.transportService.cancel(request);
  }

  /**
   * Provider Health Check
   */
  async getHealth() {
    const healthChecks = await this.transportService.getHealthChecks();
    return healthChecks.find(h => h.supportedType === 'TRAIN') || healthChecks[0];
  }
}
