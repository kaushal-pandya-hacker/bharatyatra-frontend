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

export interface BusSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  passengers?: number;
  busType?: string;
  operator?: string;
}

export interface BusSeat {
  seatNumber: string;
  deck: 'LOWER' | 'UPPER';
  row: number;
  column: number;
  seatType: 'SLEEPER' | 'SEATER';
  status: 'AVAILABLE' | 'SELECTED' | 'BOOKED' | 'RESTRICTED' | 'FEMALE_ONLY';
  price: number;
}

@Injectable()
export class BusesService {
  private readonly logger = new Logger(BusesService.name);

  constructor(private readonly transportService: TransportService) {}

  /**
   * Search Bus Routes Across GSRTC and Partner Operators
   */
  async search(request: BusSearchRequest): Promise<NormalizedTransportSearchResult> {
    if (!request.origin || !request.destination) {
      throw new BadRequestException('Bus origin and destination locations are required.');
    }

    this.logger.log(`[BusesService] Searching buses -> ${request.origin} ➔ ${request.destination} on ${request.departureDate}`);

    return await this.transportService.search({
      type: 'BUS',
      origin: request.origin,
      destination: request.destination,
      departureDate: request.departureDate,
      passengers: request.passengers || 1,
    });
  }

  /**
   * Get Bus Route Details, Boarding/Dropping Points & Cancellation Policy
   */
  async getDetails(busId: string): Promise<NormalizedTransportItem | null> {
    const details = await this.transportService.getDetails('BUS', busId);
    if (!details) {
      throw new NotFoundException(`Bus route with ID '${busId}' not found.`);
    }
    return details;
  }

  /**
   * Get Interactive Bus Seat Layout Map
   */
  async getSeatMap(busId: string): Promise<{ busId: string; totalSeats: number; seats: BusSeat[] }> {
    const bus = await this.getDetails(busId);
    const basePrice = bus.price || 450;

    const mockSeats: BusSeat[] = [
      // Lower Deck Sleeper/Seater
      { seatNumber: 'L1', deck: 'LOWER', row: 1, column: 1, seatType: 'SLEEPER', status: 'BOOKED', price: basePrice + 100 },
      { seatNumber: 'L2', deck: 'LOWER', row: 1, column: 2, seatType: 'SLEEPER', status: 'AVAILABLE', price: basePrice + 100 },
      { seatNumber: 'L3', deck: 'LOWER', row: 2, column: 1, seatType: 'SLEEPER', status: 'FEMALE_ONLY', price: basePrice + 100 },
      { seatNumber: 'L4', deck: 'LOWER', row: 2, column: 2, seatType: 'SLEEPER', status: 'AVAILABLE', price: basePrice + 100 },
      { seatNumber: 'S1', deck: 'LOWER', row: 3, column: 1, seatType: 'SEATER', status: 'AVAILABLE', price: basePrice },
      { seatNumber: 'S2', deck: 'LOWER', row: 3, column: 2, seatType: 'SEATER', status: 'AVAILABLE', price: basePrice },
      { seatNumber: 'S3', deck: 'LOWER', row: 4, column: 1, seatType: 'SEATER', status: 'BOOKED', price: basePrice },
      { seatNumber: 'S4', deck: 'LOWER', row: 4, column: 2, seatType: 'SEATER', status: 'AVAILABLE', price: basePrice },

      // Upper Deck Sleeper
      { seatNumber: 'U1', deck: 'UPPER', row: 1, column: 1, seatType: 'SLEEPER', status: 'AVAILABLE', price: basePrice + 150 },
      { seatNumber: 'U2', deck: 'UPPER', row: 1, column: 2, seatType: 'SLEEPER', status: 'AVAILABLE', price: basePrice + 150 },
      { seatNumber: 'U3', deck: 'UPPER', row: 2, column: 1, seatType: 'SLEEPER', status: 'BOOKED', price: basePrice + 150 },
      { seatNumber: 'U4', deck: 'UPPER', row: 2, column: 2, seatType: 'SLEEPER', status: 'RESTRICTED', price: basePrice + 150 },
      { seatNumber: 'U5', deck: 'UPPER', row: 3, column: 1, seatType: 'SLEEPER', status: 'AVAILABLE', price: basePrice + 150 },
      { seatNumber: 'U6', deck: 'UPPER', row: 3, column: 2, seatType: 'SLEEPER', status: 'AVAILABLE', price: basePrice + 150 },
    ];

    return {
      busId,
      totalSeats: mockSeats.length,
      seats: mockSeats,
    };
  }

  /**
   * Revalidate Bus Availability & Fare Before Checkout
   */
  async revalidate(input: TransportRevalidateInput): Promise<TransportRevalidateResult> {
    return await this.transportService.revalidate(input, 'BUS');
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
   * Create Bus Booking with Price & Seat Security Validation
   */
  async createBooking(request: TransportBookingRequest, userId: string = '00000000-0000-0000-0000-000000000001'): Promise<TransportBookingResult> {
    // 1. Fetch live bus details and seat map
    const bus = await this.getDetails(request.transportId);
    const expectedPricing = this.calculateServerPrice(bus.price, request.passengers.length);

    // 2. Security Check: Price Tampering Defense
    if (request.agreedFare && Math.abs(request.agreedFare - expectedPricing.baseTotal) > 5 && !request.acceptPriceChange) {
      this.logger.warn(`[SECURITY ALERT] Bus price manipulation detected for user ${userId}. Client fare: ₹${request.agreedFare}, Server base: ₹${expectedPricing.baseTotal}`);
      throw new ConflictException({
        errorCode: 'PRICE_MANIPULATION_REJECTED',
        message: 'Submitted price does not match verified server fare.',
        expectedFare: expectedPricing.baseTotal,
        submittedFare: request.agreedFare,
      });
    }

    // 3. Security Check: Seat Availability Verification
    const seatMap = await this.getSeatMap(request.transportId);
    for (const pax of request.passengers) {
      if (pax.seatNumber) {
        const targetSeat = seatMap.seats.find(s => s.seatNumber === pax.seatNumber);
        if (targetSeat && (targetSeat.status === 'BOOKED' || targetSeat.status === 'RESTRICTED')) {
          throw new ConflictException({
            errorCode: 'SEAT_UNAVAILABLE',
            message: `Selected seat '${pax.seatNumber}' is already booked or restricted.`,
            seatNumber: pax.seatNumber,
          });
        }
      }
    }

    // 4. Perform Supplier Booking Orchestration
    return await this.transportService.checkout(
      {
        ...request,
        type: 'BUS',
        providerId: request.providerId || 'prov-etravelsmart-bus',
        agreedFare: bus.price,
      },
      userId,
    );
  }

  /**
   * Cancel Bus Ticket
   */
  async cancelBooking(request: TransportCancellationRequest, userId: string = '00000000-0000-0000-0000-000000000001'): Promise<TransportCancellationResult> {
    return await this.transportService.cancel(request);
  }

  /**
   * Bus Provider Health Check
   */
  async getHealth() {
    const healthChecks = await this.transportService.getHealthChecks();
    return healthChecks.find(h => h.supportedType === 'BUS') || healthChecks[0];
  }
}
