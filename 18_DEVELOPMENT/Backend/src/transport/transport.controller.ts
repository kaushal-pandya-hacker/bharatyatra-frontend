import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { TransportService } from './transport.service';
import {
  TransportTypeEnum,
  UniversalTransportSearchInput,
  TransportRevalidateInput,
  TransportBookingRequest,
  TransportCancellationRequest,
} from '../providers/interfaces/transport-provider.interface';

@Controller('api/v1/transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Post('search')
  @HttpCode(HttpStatus.OK)
  async search(@Body() body: UniversalTransportSearchInput) {
    return await this.transportService.search(body);
  }

  @Get('search')
  async searchGet(
    @Query('type') type: TransportTypeEnum,
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('departureDate') departureDate: string,
    @Query('returnDate') returnDate?: string,
    @Query('passengers') passengers?: string,
    @Query('cabinClass') cabinClass?: string,
  ) {
    return await this.transportService.search({
      type: type || 'FLIGHT',
      origin: origin || 'BOM',
      destination: destination || 'DEL',
      departureDate: departureDate || new Date().toISOString().split('T')[0],
      returnDate: returnDate,
      passengers: passengers ? parseInt(passengers, 10) : 1,
      cabinClass: cabinClass,
    });
  }

  @Get('details/:type/:id')
  async getDetails(@Param('type') type: TransportTypeEnum, @Param('id') id: string) {
    return await this.transportService.getDetails(type, id);
  }

  @Post('revalidate')
  @HttpCode(HttpStatus.OK)
  async revalidate(@Body() body: TransportRevalidateInput & { type: TransportTypeEnum }) {
    return await this.transportService.revalidate(body, body.type);
  }

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  async checkout(@Body() body: TransportBookingRequest) {
    return await this.transportService.checkout(body);
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(@Body() body: TransportCancellationRequest) {
    return await this.transportService.cancel(body);
  }

  @Get('capabilities')
  async getCapabilities() {
    const health = await this.transportService.getHealthChecks();
    return health.map(h => ({
      providerId: h.providerId,
      providerName: h.providerName,
      supportedType: h.supportedType,
      capabilities: h.capabilities,
    }));
  }

  @Get('health')
  async getHealth() {
    return await this.transportService.getHealthChecks();
  }
}
