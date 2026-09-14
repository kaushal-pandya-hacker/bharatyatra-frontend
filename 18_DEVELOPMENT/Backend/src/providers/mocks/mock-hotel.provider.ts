import { Injectable, Logger } from '@nestjs/common';
import { HotelProvider, HotelSearchInput } from '../interfaces/hotel-provider.interface';

@Injectable()
export class MockHotelProvider implements HotelProvider {
  private readonly logger = new Logger(MockHotelProvider.name);
  public readonly isDevelopmentMock = true;

  async searchHotels(input: HotelSearchInput): Promise<any[]> {
    this.logger.log(`[DEVELOPMENT MOCK] Searching mock hotels in ${input.destinationSlug}`);
    return [
      {
        provider: 'DEVELOPMENT MOCK - HOTEL SUPPLIER',
        hotelId: 'mock-hotel-somnath-1',
        name: 'Lords Inn Somnath',
        rating: 4.6,
        pricePerNightInr: 4200,
        availableRooms: 5,
        isDevelopmentMock: true
      },
      {
        provider: 'DEVELOPMENT MOCK - HOTEL SUPPLIER',
        hotelId: 'mock-hotel-kutch-1',
        name: 'Rann Resort Tent City',
        rating: 4.8,
        pricePerNightInr: 8500,
        availableRooms: 3,
        isDevelopmentMock: true
      }
    ];
  }

  async getHotelDetails(hotelId: string): Promise<any> {
    return {
      hotelId,
      name: 'Lords Inn Somnath',
      isDevelopmentMock: true
    };
  }

  async checkAvailability(hotelId: string, roomTypeId: string): Promise<boolean> {
    return true;
  }

  async createBooking(params: any): Promise<any> {
    return {
      providerBookingId: `MOCK_HTL_BK_${Date.now()}`,
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
