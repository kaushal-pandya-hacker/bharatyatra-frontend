import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import {
  HotelsService,
  HotelSearchDto,
  CalculateHotelPriceDto,
  RevalidateHotelPriceDto,
  CreateHotelBookingDto,
} from './hotels.service';

@ApiTags('Hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get('destinations')
  @ApiOperation({ summary: 'Destination Autocomplete for Cities, Codes & Regions' })
  @ApiQuery({ name: 'q', required: false })
  async searchDestinations(@Query('q') query?: string) {
    const destinations = await this.hotelsService.searchDestinations(query || '');
    return { success: true, count: destinations.length, data: destinations };
  }

  @Get('health/status')
  @ApiOperation({ summary: 'Get Provider Health Metrics & Supported Capabilities' })
  async getHealthStatus() {
    const health = await this.hotelsService.getHealthCheck();
    return { success: true, data: health };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search Normalized Hotels via Hotelbeds Supplier Adapter' })
  @ApiQuery({ name: 'destination', required: false })
  @ApiQuery({ name: 'destinationSlug', required: false })
  @ApiQuery({ name: 'checkIn', required: false })
  @ApiQuery({ name: 'checkOut', required: false })
  @ApiQuery({ name: 'rooms', required: false })
  @ApiQuery({ name: 'adults', required: false })
  @ApiQuery({ name: 'children', required: false })
  @ApiQuery({ name: 'nationality', required: false })
  @ApiQuery({ name: 'currency', required: false })
  async searchHotels(@Query() query: HotelSearchDto) {
    const hotels = await this.hotelsService.searchHotels(query);
    return { success: true, count: hotels.length, data: hotels };
  }

  @Post('calculate-price')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Server-Side Price Calculation (Room Rate, Taxes, Fees, Total)' })
  async calculateServerPrice(@Body() body: CalculateHotelPriceDto) {
    const breakdown = this.hotelsService.calculateServerPrice(body);
    return { success: true, data: breakdown };
  }

  @Post('revalidate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revalidate Rate & Room Availability Before Checkout' })
  async revalidatePrice(@Body() body: RevalidateHotelPriceDto) {
    const result = await this.hotelsService.revalidatePrice(body);
    return { success: true, data: result };
  }

  @Post('check-rate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Availability & Price Recheck before booking' })
  async checkRate(@Body('rateKey') rateKey: string) {
    const result = await this.hotelsService.checkRate(rateKey);
    return { success: true, data: result };
  }

  @Post('package-upgrade')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate Package Hotel Upgrade Differential Price' })
  async calculatePackageUpgrade(
    @Body() body: { baseCategory: string; upgradeCategory: string; nights: number },
  ) {
    const result = await this.hotelsService.calculatePackageHotelUpgrade(
      body.baseCategory || '3 Star',
      body.upgradeCategory || '4 Star',
      body.nights || 1,
    );
    return { success: true, data: result };
  }

  @Post('book')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Execute Hotel Booking with Guest Details & DB Audit' })
  async createBooking(
    @Body() body: CreateHotelBookingDto,
    @Headers('x-idempotency-key') idempotencyHeader?: string,
    @Req() req?: any,
  ) {
    const userId = req?.user?.id || '00000000-0000-0000-0000-000000000001';
    const booking = await this.hotelsService.createBooking(userId, body, idempotencyHeader);
    return { success: true, data: booking };
  }

  @Post('cancel/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel Hotel Booking Reservation' })
  async cancelBooking(
    @Param('id') id: string,
    @Body('reason') reason?: string,
    @Req() req?: any,
  ) {
    const userId = req?.user?.id || '00000000-0000-0000-0000-000000000001';
    const result = await this.hotelsService.cancelBooking(userId, id, reason);
    return { success: true, data: result };
  }

  @Get(':id/rooms')
  @ApiOperation({ summary: 'Get Available Rooms & Rate Types for Hotel' })
  async getHotelRooms(@Param('id') id: string) {
    const rooms = await this.hotelsService.getHotelRooms(id);
    return { success: true, count: rooms.length, data: rooms };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Detailed Hotel Metadata & Rooms by ID / Supplier Code' })
  async getHotelDetails(@Param('id') id: string) {
    const details = await this.hotelsService.getHotelDetails(id);
    return { success: true, data: details };
  }
}

