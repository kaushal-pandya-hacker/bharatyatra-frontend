import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TrainsService, TrainSearchRequest } from './trains.service';
import {
  TransportRevalidateInput,
  TransportBookingRequest,
  TransportCancellationRequest,
} from '../providers/interfaces/transport-provider.interface';

@ApiTags('Train Booking Engine')
@Controller('api/v1/trains')
export class TrainsController {
  constructor(private readonly trainsService: TrainsService) {}

  @Get('stations')
  @ApiOperation({ summary: 'Station Search Autocomplete & Code Normalization' })
  async searchStations(@Query('q') q: string) {
    const data = this.trainsService.searchStations(q);
    return { success: true, data };
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search Trains Across Travel Classes (1A, 2A, 3A, SL, CC)' })
  async searchTrainsPost(@Body() body: TrainSearchRequest) {
    const data = await this.trainsService.search(body);
    return { success: true, data };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search Trains Query GET Endpoint' })
  async searchTrainsGet(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('departureDate') departureDate: string,
    @Query('passengers') passengers?: string,
    @Query('cabinClass') cabinClass?: string,
  ) {
    const data = await this.trainsService.search({
      origin: origin || 'ADI',
      destination: destination || 'MAO',
      departureDate: departureDate || new Date().toISOString().split('T')[0],
      passengers: passengers ? parseInt(passengers, 10) : 1,
      cabinClass: cabinClass || '3A',
    });
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Train Details, Route Schedule & Cancellation Policy' })
  async getTrainById(@Param('id') id: string) {
    const data = await this.trainsService.getDetails(id);
    return { success: true, data };
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get Train Quota & Class Availability Status' })
  async getAvailability(@Param('id') id: string, @Query('cabinClass') cabinClass?: string) {
    const data = await this.trainsService.getAvailability(id, cabinClass || '3A');
    return { success: true, data };
  }

  @Post('revalidate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revalidate Live Train Quota & Fare Before Checkout' })
  async revalidateTrain(@Body() body: TransportRevalidateInput) {
    const data = await this.trainsService.revalidate(body);
    return { success: true, data };
  }

  @Post('calculate-price')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate Server-Side Train Booking Fare Breakdown' })
  async calculatePrice(@Body() body: { baseFare: number; passengersCount: number }) {
    const data = this.trainsService.calculateServerPrice(body.baseFare || 1350, body.passengersCount || 1);
    return { success: true, data };
  }

  @Post('book')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Train Booking or Confirmation Request' })
  async createTrainBooking(@Body() body: TransportBookingRequest) {
    const data = await this.trainsService.createBooking(body);
    return { success: true, data };
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request Train Booking Cancellation' })
  async cancelTrainBooking(@Body() body: TransportCancellationRequest) {
    const data = await this.trainsService.cancelBooking(body);
    return { success: true, data };
  }

  @Get('health/status')
  @ApiOperation({ summary: 'IRCTC / Train Provider Integration Health Check' })
  async getTrainHealth() {
    const data = await this.trainsService.getHealth();
    return { success: true, data };
  }
}
