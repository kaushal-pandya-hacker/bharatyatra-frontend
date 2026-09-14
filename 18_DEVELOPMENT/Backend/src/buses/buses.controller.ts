import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MockBusProvider } from '../providers/mocks/mock-bus.provider';

@ApiTags('Buses')
@Controller('buses')
export class BusesController {
  constructor(private readonly mockBusProvider: MockBusProvider) {}

  @Get('search')
  @ApiOperation({ summary: 'Search GSRTC & Private Bus Routes' })
  async searchBuses(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('travelDate') travelDate: string,
  ) {
    const buses = await this.mockBusProvider.searchBuses(
      origin || 'Ahmedabad',
      destination || 'Somnath',
      travelDate || '2026-10-15'
    );
    return { success: true, data: buses };
  }

  @Get(':id/seat-layout')
  @ApiOperation({ summary: 'Get Bus Seat Layout Map' })
  async getSeatLayout(@Param('id') id: string) {
    const layout = await this.mockBusProvider.getSeatLayout(id);
    return { success: true, data: layout };
  }
}
