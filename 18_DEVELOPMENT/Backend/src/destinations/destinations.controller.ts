import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DestinationsService } from './destinations.service';

@ApiTags('Destinations & Travel Inventory')
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  @ApiOperation({ summary: 'Discover & Filter India & Gujarat Tourism Destinations' })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'subCategory', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isUNESCO', required: false })
  @ApiQuery({ name: 'isHeritage', required: false })
  @ApiQuery({ name: 'isReligious', required: false })
  @ApiQuery({ name: 'isWildlife', required: false })
  @ApiQuery({ name: 'isNature', required: false })
  @ApiQuery({ name: 'isAdventure', required: false })
  @ApiQuery({ name: 'isBeach', required: false })
  @ApiQuery({ name: 'permitRequired', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async getDestinations(
    @Query('state') state?: string,
    @Query('region') region?: string,
    @Query('category') category?: string,
    @Query('subCategory') subCategory?: string,
    @Query('search') search?: string,
    @Query('isUNESCO') isUNESCO?: boolean,
    @Query('isHeritage') isHeritage?: boolean,
    @Query('isReligious') isReligious?: boolean,
    @Query('isWildlife') isWildlife?: boolean,
    @Query('isNature') isNature?: boolean,
    @Query('isAdventure') isAdventure?: boolean,
    @Query('isBeach') isBeach?: boolean,
    @Query('permitRequired') permitRequired?: boolean,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.destinationsService.findAll({
      state,
      region,
      category,
      subCategory,
      search,
      isUNESCO,
      isHeritage,
      isReligious,
      isWildlife,
      isNature,
      isAdventure,
      isBeach,
      permitRequired,
      status,
      limit,
      offset,
    });
  }

  // Static sub-routes placed BEFORE parameterized :slug routes
  @Get('search')
  @ApiOperation({ summary: 'Global Tourism Search with Alias Matching (Bangalore -> Bengaluru, Bombay -> Mumbai)' })
  @ApiQuery({ name: 'q', required: true })
  async searchDestinations(@Query('q') query: string) {
    return this.destinationsService.searchGlobal(query);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get Nearby Destinations by Coordinates (Lat/Lng)' })
  @ApiQuery({ name: 'lat', required: true })
  @ApiQuery({ name: 'lng', required: true })
  @ApiQuery({ name: 'radiusKm', required: false })
  async getNearbyDestinations(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radiusKm') radiusKm?: number
  ) {
    return this.destinationsService.findNearby(Number(lat), Number(lng), Number(radiusKm || 150));
  }

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
