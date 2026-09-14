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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, CancelBookingDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Customer Bookings & Reservations')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create New Travel Booking (Hotel, Restaurant, Activity)' })
  async createBooking(
    @CurrentUser() user: any,
    @Body() body: CreateBookingDto,
    @Headers('x-idempotency-key') idempotencyHeader?: string,
  ) {
    return this.bookingsService.createBooking(user.id, body, idempotencyHeader);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List Authenticated Customer Bookings' })
  @ApiQuery({ name: 'status', required: false, description: 'ALL, UPCOMING, PAST, CANCELLED' })
  async getUserBookings(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.bookingsService.getUserBookings(user.id, status);
  }

  @Get('reference/:bookingReference')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Booking Details by Public Reference (e.g. CF-2026-A1B2C3)' })
  async getBookingByReference(
    @Param('bookingReference') bookingReference: string,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.getBookingByReference(bookingReference, user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Detailed Customer Booking Record by ID' })
  async getBookingById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bookingsService.getBookingById(user.id, id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel Customer Booking Reservation' })
  async cancelBooking(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: CancelBookingDto,
  ) {
    return this.bookingsService.cancelBooking(user.id, id, body);
  }
}
