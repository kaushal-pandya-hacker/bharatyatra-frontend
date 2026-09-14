import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MockHotelProvider } from '../providers/mocks/mock-hotel.provider';

@ApiTags('Hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly mockHotelProvider: MockHotelProvider) {}

  @Get('search')
  @ApiOperation({ summary: 'Search Hotel Stays via Provider Adapter' })
  async searchHotels(@Query('destinationSlug') destinationSlug: string) {
    const hotels = await this.mockHotelProvider.searchHotels({
      destinationSlug: destinationSlug || 'somnath-temple',
      checkInDate: '2026-10-15',
      checkOutDate: '2026-10-17',
      guestsCount: 2
    });
    return { success: true, data: hotels };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Hotel Details by ID' })
  async getHotelDetails(@Param('id') id: string) {
    const details = await this.mockHotelProvider.getHotelDetails(id);
    return { success: true, data: details };
  }
}
