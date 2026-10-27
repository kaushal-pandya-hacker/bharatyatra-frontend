import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Restaurants & Dining')
@Controller('restaurants')
export class RestaurantsController {
  @Get()
  @ApiOperation({ summary: 'Discover Gujarati Thali & Local Dining Spots' })
  async getRestaurants(@Query('destinationSlug') destinationSlug?: string) {
    return {
      success: true,
      data: [
        {
          id: 'rest-kathiyawadi-1',
          name: 'Shree Swaminarayan Kathiyawadi Dining Hall',
          cuisineType: 'Kathiyawadi Thali / Unlimited Unlimited',
          rating: 4.8,
          averageCostInr: 320,
          provenance: 'VERIFIED_DATA'
        }
      ]
    };
  }
}
