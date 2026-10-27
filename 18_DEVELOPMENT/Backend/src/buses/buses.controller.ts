import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BusesService, BusSearchRequest } from './buses.service';
import {
  TransportRevalidateInput,
  TransportBookingRequest,
  TransportCancellationRequest,
} from '../providers/interfaces/transport-provider.interface';

@ApiTags('Bus Booking Engine')
@Controller('api/v1/buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search Bus Routes (GSRTC & Private Operators)' })
  async searchBusesPost(@Body() body: BusSearchRequest) {
    const data = await this.busesService.search(body);
    return { success: true, data };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search Bus Routes Query GET Endpoint' })
  async searchBusesGet(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('departureDate') departureDate: string,
    @Query('travelDate') travelDate?: string,
    @Query('passengers') passengers?: string,
  ) {
    const data = await this.busesService.search({
      origin: origin || 'Ahmedabad',
      destination: destination || 'Surat',
      departureDate: departureDate || travelDate || new Date().toISOString().split('T')[0],
      passengers: passengers ? parseInt(passengers, 10) : 1,
    });
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Bus Route Details, Boarding/Dropping Points & Cancellation Policy' })
  async getBusById(@Param('id') id: string) {
    const data = await this.busesService.getDetails(id);
    return { success: true, data };
  }

  @Get(':id/seats')
  @ApiOperation({ summary: 'Get Interactive Bus Seat Layout Map' })
  async getSeatMap(@Param('id') id: string) {
    const data = await this.busesService.getSeatMap(id);
    return { success: true, data };
  }

  @Get(':id/seat-layout')
  @ApiOperation({ summary: 'Get Bus Seat Layout Map (Legacy compatibility)' })
  async getSeatLayoutLegacy(@Param('id') id: string) {
    const data = await this.busesService.getSeatMap(id);
    return { success: true, data };
  }

  @Post('revalidate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revalidate Live Bus Seat Availability & Fare Prior to Checkout' })
  async revalidateBus(@Body() body: TransportRevalidateInput) {
    const data = await this.busesService.revalidate(body);
    return { success: true, data };
  }

  @Post('calculate-price')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate Server-Side Bus Booking Pricing Breakdown' })
  async calculatePrice(@Body() body: { baseFare: number; passengersCount: number }) {
    const data = this.busesService.calculateServerPrice(body.baseFare || 450, body.passengersCount || 1);
    return { success: true, data };
  }

  @Post('book')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Bus Booking & Issue E-Ticket' })
  async createBusBooking(@Body() body: TransportBookingRequest) {
    const data = await this.busesService.createBooking(body);
    return { success: true, data };
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request Bus Ticket Cancellation' })
  async cancelBusBooking(@Body() body: TransportCancellationRequest) {
    const data = await this.busesService.cancelBooking(body);
    return { success: true, data };
  }

  @Get('health/status')
  @ApiOperation({ summary: 'Etravelsmart / GSRTC Bus Provider Integration Health Check' })
  async getBusHealth() {
    const data = await this.busesService.getHealth();
    return { success: true, data };
  }
}
