import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UniversalBookingEngineService } from './universal-booking-engine.service';
import {
  UniversalSearchInput,
  UniversalBookingRequest,
  UniversalCancellationRequest,
  CheckPriceInput,
  ProductTypeEnum,
} from '../providers/interfaces/universal-provider.interface';
import { isBookingServiceAvailable, ServiceUnavailableException } from '../config/booking-availability.config';

@ApiTags('Universal Booking Engine')
@Controller('universal')
export class UniversalBookingsController {
  constructor(private readonly universalEngine: UniversalBookingEngineService) {}

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Universal Travel Search across Hotels, Buses, Flights, Trains, Activities' })
  async search(@Body() body: UniversalSearchInput) {
    const results = await this.universalEngine.search(body);
    return { success: true, data: results };
  }

  @Get('products/:type/:id')
  @ApiOperation({ summary: 'Get Universal Product Details by Type and ID' })
  async getProductDetails(
    @Param('type') type: ProductTypeEnum,
    @Param('id') id: string,
  ) {
    const details = await this.universalEngine.getProductDetails(type, id);
    return { success: true, data: details };
  }

  @Post('check-rate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Universal Availability & Price Recheck before booking' })
  async checkPrice(@Body() body: CheckPriceInput) {
    const result = await this.universalEngine.checkPrice(body);
    return { success: true, data: result };
  }

  @Post('bookings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Universal Booking for any travel product type' })
  async createBooking(
    @Body() body: UniversalBookingRequest,
    @Headers('x-idempotency-key') idempotencyHeader?: string,
    @Req() req?: any,
  ) {
    const availability = isBookingServiceAvailable(body.productType || 'hotels');
    if (!availability.available) {
      throw new ServiceUnavailableException(body.productType || 'hotels');
    }
    const userId = req?.user?.id || '00000000-0000-0000-0000-000000000001';
    const result = await this.universalEngine.createBooking(userId, body, idempotencyHeader);
    return { success: true, data: result };
  }

  @Get('bookings')
  @ApiOperation({ summary: 'List Unified User Bookings across all travel product types' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'productType', required: false })
  async getUserBookings(
    @Query('status') status?: string,
    @Query('productType') productType?: string,
    @Req() req?: any,
  ) {
    const userId = req?.user?.id || '00000000-0000-0000-0000-000000000001';
    const bookings = await this.universalEngine.getUserBookings(userId, status, productType);
    return { success: true, count: bookings.length, data: bookings };
  }

  @Post('cancellations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel Universal Travel Booking' })
  async cancelBooking(
    @Body() body: UniversalCancellationRequest,
    @Req() req?: any,
  ) {
    const userId = req?.user?.id || '00000000-0000-0000-0000-000000000001';
    const result = await this.universalEngine.cancelBooking(userId, body);
    return { success: true, data: result };
  }
}
