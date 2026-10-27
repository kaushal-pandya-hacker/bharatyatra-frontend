import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DestinationsService } from '../destinations/destinations.service';
import { UniversalProviderRegistry } from '../providers/registry/universal-provider.registry';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(
    private readonly destinationsService: DestinationsService,
    private readonly providerRegistry: UniversalProviderRegistry,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Unified Search Across Destinations, Hotels, Flights, Buses & Trains' })
  @ApiQuery({ name: 'q', required: true })
  async searchAll(@Query('q') query: string) {
    const q = (query || '').trim();
    const destinations = await this.destinationsService.findAll({ search: q, limit: 10 });

    const checkIn = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];

    // Query registered Universal Booking Engine providers dynamically
    let hotels: any[] = [];
    let flights: any[] = [];
    let buses: any[] = [];
    let trains: any[] = [];

    try {
      const hotelProvider = this.providerRegistry.getProvider('HOTEL');
      if (hotelProvider?.search) {
        const res = await hotelProvider.search({ productType: 'HOTEL', destination: q || 'Jaipur', checkIn });
        hotels = res.items.slice(0, 5);
      }
    } catch (e) {}

    try {
      const flightProvider = this.providerRegistry.getProvider('FLIGHT');
      if (flightProvider?.search) {
        const res = await flightProvider.search({ productType: 'FLIGHT', origin: 'BOM', destination: q || 'DEL', checkIn });
        flights = res.items.slice(0, 5);
      }
    } catch (e) {}

    try {
      const busProvider = this.providerRegistry.getProvider('BUS');
      if (busProvider?.search) {
        const res = await busProvider.search({ productType: 'BUS', origin: 'Ahmedabad', destination: q || 'Somnath', checkIn });
        buses = res.items.slice(0, 5);
      }
    } catch (e) {}

    try {
      const trainProvider = this.providerRegistry.getProvider('TRAIN');
      if (trainProvider?.search) {
        const res = await trainProvider.search({ productType: 'TRAIN', origin: 'ADI', destination: q || 'DWK', checkIn });
        trains = res.items.slice(0, 5);
      }
    } catch (e) {}

    return {
      success: true,
      data: {
        query: q,
        destinations: destinations.data,
        hotels,
        flights,
        buses,
        trains,
      },
    };
  }
}
