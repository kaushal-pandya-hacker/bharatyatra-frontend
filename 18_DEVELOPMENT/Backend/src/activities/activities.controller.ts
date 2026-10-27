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
import {
  ActivitiesService,
  ActivitySearchDto,
  ActivityPriceDto,
  RevalidateActivityPriceDto,
  CreateActivityBookingDto,
} from './activities.service';

@ApiTags('Activities & Experiences')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // ─── Health ───────────────────────────────────────────────────────────────

  @Get('health/status')
  @ApiOperation({ summary: 'Activity Provider Health Metrics & Capability Report' })
  async getHealthStatus() {
    const health = await this.activitiesService.getHealthCheck();
    return { success: true, data: health };
  }

  // ─── Search ───────────────────────────────────────────────────────────────

  @Get('search')
  @ApiOperation({ summary: 'Search Activities & Experiences by Destination' })
  @ApiQuery({ name: 'destinationSlug', required: false })
  @ApiQuery({ name: 'destination', required: false })
  @ApiQuery({ name: 'date', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'adults', required: false })
  @ApiQuery({ name: 'children', required: false })
  @ApiQuery({ name: 'category', required: false, description: 'Wildlife & Safari | Culture & Crafts | Adventure | Heritage & History | Spiritual & Pilgrimage | Nature & Marine' })
  @ApiQuery({ name: 'latitude', required: false })
  @ApiQuery({ name: 'longitude', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async searchActivities(@Query() query: ActivitySearchDto) {
    const activities = await this.activitiesService.searchActivities(query);
    return { success: true, count: activities.length, data: activities };
  }

  // ─── Pricing ──────────────────────────────────────────────────────────────

  @Post('calculate-price')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Server-Side Activity Price Calculation (adults + children + taxes + fee)' })
  async calculatePrice(
    @Body() body: ActivityPriceDto & { priceAdultInr: number; priceChildInr?: number },
  ) {
    const breakdown = this.activitiesService.calculateServerPrice(body);
    return { success: true, data: breakdown };
  }

  // ─── Revalidation ─────────────────────────────────────────────────────────

  @Post('revalidate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revalidate Activity Availability & Price Before Checkout' })
  async revalidatePrice(@Body() body: RevalidateActivityPriceDto) {
    const result = await this.activitiesService.revalidatePrice(body);
    return { success: true, data: result };
  }

  // ─── Booking ──────────────────────────────────────────────────────────────

  @Post('book')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Activity Booking with Idempotency & Price Manipulation Defense' })
  async createBooking(
    @Body() body: CreateActivityBookingDto,
    @Headers('x-idempotency-key') idempotencyHeader?: string,
    @Req() req?: any,
  ) {
    const userId = req?.user?.id || '00000000-0000-0000-0000-000000000001';
    const booking = await this.activitiesService.createBooking(userId, body, idempotencyHeader);
    return { success: true, data: booking };
  }

  // ─── My Bookings ──────────────────────────────────────────────────────────

  @Get('bookings/mine')
  @ApiOperation({ summary: 'Get Authenticated User Activity Bookings' })
  async getMyBookings(@Req() req?: any) {
    const userId = req?.user?.id || '00000000-0000-0000-0000-000000000001';
    const bookings = await this.activitiesService.getUserActivityBookings(userId);
    return { success: true, count: bookings.length, data: bookings };
  }

  // ─── Cancellation ─────────────────────────────────────────────────────────

  @Post('cancel/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel Activity Booking' })
  async cancelBooking(
    @Param('id') id: string,
    @Body('reason') reason?: string,
    @Req() req?: any,
  ) {
    const userId = req?.user?.id || '00000000-0000-0000-0000-000000000001';
    const result = await this.activitiesService.cancelBooking(userId, id, reason);
    return { success: true, data: result };
  }

  // ─── Activity Detail ──────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get Activity Detail with Available Slots (7-day window)' })
  async getActivityDetail(@Param('id') id: string) {
    const detail = await this.activitiesService.getActivityDetail(id);
    return { success: true, data: detail };
  }
}
