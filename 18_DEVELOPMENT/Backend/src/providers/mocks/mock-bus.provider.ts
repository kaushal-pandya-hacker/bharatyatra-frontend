import { Injectable, Logger } from '@nestjs/common';
import { BusProvider } from '../interfaces/bus-provider.interface';

@Injectable()
export class MockBusProvider implements BusProvider {
  private readonly logger = new Logger(MockBusProvider.name);
  public readonly isDevelopmentMock = true;

  async searchBuses(origin: string, destination: string, travelDate: string): Promise<any[]> {
    this.logger.log(`[DEVELOPMENT MOCK] Searching GSRTC mock buses from ${origin} to ${destination}`);
    return [
      {
        provider: 'DEVELOPMENT MOCK - GSRTC BUS',
        busId: 'mock-gsrtc-101',
        operatorName: 'GSRTC Volvo AC Seater/Sleeper',
        origin,
        destination,
        departureTime: '21:00 IST',
        arrivalTime: '06:00 IST (+1 day)',
        fareInr: 650,
        availableSeatsCount: 14,
        isDevelopmentMock: true
      }
    ];
  }

  async getSeatLayout(busId: string): Promise<any> {
    return {
      busId,
      totalSeats: 36,
      availableSeatNumbers: ['A1', 'A2', 'B5', 'B6', 'C1', 'C2'],
      isDevelopmentMock: true
    };
  }

  async createBooking(params: any): Promise<any> {
    return {
      providerBookingId: `MOCK_BUS_BK_${Date.now()}`,
      status: 'MOCK_CONFIRMED',
      isDevelopmentMock: true
    };
  }

  async cancelBooking(bookingId: string): Promise<any> {
    return {
      status: 'MOCK_CANCELLED',
      isDevelopmentMock: true
    };
  }
}
