import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FlightsService, FlightSearchRequest } from './flights.service';
import {
  TransportRevalidateInput,
  TransportBookingRequest,
  TransportCancellationRequest,
} from '../providers/interfaces/transport-provider.interface';

@ApiTags('Flight Booking Engine')
@Controller('api/v1/flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search Flights (One-Way, Round-Trip, Multi-City)' })
  async searchFlights(@Body() body: FlightSearchRequest) {
    const data = await this.flightsService.search(body);
    return { success: true, data };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search Flights Query GET Endpoint' })
  async searchFlightsGet(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('departureDate') departureDate: string,
    @Query('returnDate') returnDate?: string,
    @Query('tripType') tripType?: 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY',
    @Query('adults') adults?: string,
    @Query('children') children?: string,
    @Query('infants') infants?: string,
    @Query('cabinClass') cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST',
  ) {
    const data = await this.flightsService.search({
      origin: origin || 'BOM',
      destination: destination || 'DEL',
      departureDate: departureDate || new Date().toISOString().split('T')[0],
      returnDate,
      tripType: tripType || 'ONE_WAY',
      adults: adults ? parseInt(adults, 10) : 1,
      children: children ? parseInt(children, 10) : 0,
      infants: infants ? parseInt(infants, 10) : 0,
      cabinClass: cabinClass || 'ECONOMY',
    });
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Flight Details, Segments, Fare Rules & Baggage Allowance' })
  async getFlightById(@Param('id') id: string) {
    const data = await this.flightsService.getDetails(id);
    return { success: true, data };
  }

  @Post('revalidate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revalidate Live Flight Fare & Availability Before Checkout' })
  async revalidateFlight(@Body() body: TransportRevalidateInput) {
    const data = await this.flightsService.revalidate(body);
    return { success: true, data };
  }

  @Post('book')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Flight Booking, PNR Issuance & Server Price Calculation' })
  async createFlightBooking(@Body() body: TransportBookingRequest) {
    const data = await this.flightsService.createBooking(body);
    return { success: true, data };
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request Flight Booking Cancellation' })
  async cancelFlightBooking(@Body() body: TransportCancellationRequest) {
    const data = await this.flightsService.cancelBooking(body);
    return { success: true, data };
  }

  @Get('health/status')
  @ApiOperation({ summary: 'TBO Flight Provider Integration Health Check' })
  async getFlightHealth() {
    const data = await this.flightsService.getHealth();
    return { success: true, data };
  }
}
