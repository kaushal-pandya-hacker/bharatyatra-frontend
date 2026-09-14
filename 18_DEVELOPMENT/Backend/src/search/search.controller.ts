import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DestinationsService } from '../destinations/destinations.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  @ApiOperation({ summary: 'Unified Search Across Destinations, Hotels, Buses & Activities' })
  @ApiQuery({ name: 'q', required: true })
  async searchAll(@Query('q') query: string) {
    const destinations = await this.destinationsService.findAll({ search: query, limit: 5 });
    return {
      success: true,
      data: {
        query,
        destinations: destinations.data,
        hotels: [
          { id: 'search-htl-1', name: `Lords Inn near ${query || 'Somnath'}`, rating: 4.5, priceInr: 4200 }
        ],
        buses: [
          { id: 'search-bus-1', operator: 'GSRTC Volvo AC Express', origin: 'Ahmedabad', destination: query || 'Somnath', fareInr: 650 }
        ],
        activities: [
          { id: 'search-act-1', title: `Guided Heritage Walking Tour in ${query || 'Somnath'}`, priceInr: 350 }
        ]
      }
    };
  }
}
