import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DestinationsService } from './destinations.service';

@ApiTags('Destinations & Travel Inventory')
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  @ApiOperation({ summary: 'Discover & Filter Gujarat Destinations' })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async getDestinations(
    @Query('region') region?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.destinationsService.findAll({ region, category, search, status, limit, offset });
  }

  // Static Inventory Sub-routes placed BEFORE parameterized :slug routes
  @Get('inventory/hotels/:id')
  @ApiOperation({ summary: 'Get Hotel Details by ID' })
  async getHotelById(@Param('id') id: string) {
    return this.destinationsService.findHotelById(id);
  }

  @Get('inventory/restaurants/:id')
  @ApiOperation({ summary: 'Get Restaurant Details by ID' })
  async getRestaurantById(@Param('id') id: string) {
    return this.destinationsService.findRestaurantById(id);
  }

  @Get('inventory/activities/:id')
  @ApiOperation({ summary: 'Get Activity Details by ID' })
  async getActivityById(@Param('id') id: string) {
    return this.destinationsService.findActivityById(id);
  }

  // Parameterized Destination Routes
  @Get(':slug')
  @ApiOperation({ summary: 'Get Destination Detailed Record by Slug' })
  async getDestinationBySlug(@Param('slug') slug: string) {
    const destination = await this.destinationsService.findBySlug(slug);
    return { success: true, data: destination };
  }

  @Get(':slug/attractions')
  @ApiOperation({ summary: 'Get Attractions for a Destination' })
  async getDestinationAttractions(@Param('slug') slug: string) {
    return this.destinationsService.findAttractionsBySlug(slug);
  }

  @Get(':slug/activities')
  @ApiOperation({ summary: 'Get Activities for a Destination' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'duration', required: false })
  async getDestinationActivities(
    @Param('slug') slug: string,
    @Query('category') category?: string,
    @Query('maxPrice') maxPrice?: number,
    @Query('duration') duration?: number,
  ) {
    return this.destinationsService.findActivitiesBySlug(slug, { category, maxPrice, duration });
  }

  @Get(':slug/hotels')
  @ApiOperation({ summary: 'Get Hotels for a Destination' })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'starRating', required: false })
  @ApiQuery({ name: 'category', required: false })
  async getDestinationHotels(
    @Param('slug') slug: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('starRating') starRating?: number,
    @Query('category') category?: string,
  ) {
    return this.destinationsService.findHotelsBySlug(slug, { minPrice, maxPrice, starRating, category });
  }

  @Get(':slug/restaurants')
  @ApiOperation({ summary: 'Get Restaurants for a Destination' })
  @ApiQuery({ name: 'cuisine', required: false })
  @ApiQuery({ name: 'priceRange', required: false })
  @ApiQuery({ name: 'minRating', required: false })
  async getDestinationRestaurants(
    @Param('slug') slug: string,
    @Query('cuisine') cuisine?: string,
    @Query('priceRange') priceRange?: string,
    @Query('minRating') minRating?: number,
  ) {
    return this.destinationsService.findRestaurantsBySlug(slug, { cuisine, priceRange, minRating });
  }
}
