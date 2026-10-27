import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ItinerariesService } from './itineraries.service';

@ApiTags('Itineraries')
@Controller('itineraries')
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  @Get('trip/:tripId')
  @ApiOperation({ summary: 'Get Active Itinerary & Days for Trip' })
  async getActiveItinerary(@Param('tripId') tripId: string) {
    return this.itinerariesService.getActiveItinerary(tripId);
  }

  @Get('trip/:tripId/versions')
  @ApiOperation({ summary: 'Get Immutable Itinerary Version History' })
  async getItineraryVersions(@Param('tripId') tripId: string) {
    return this.itinerariesService.getVersionHistory(tripId);
  }

  @Post('trip/:tripId/create-version')
  @ApiOperation({ summary: 'Create New Immutable Itinerary Version (Adaptive AI / User Edits)' })
  async createNewVersion(@Param('tripId') tripId: string, @Body() body: any) {
    return this.itinerariesService.createNewVersion(tripId, body);
  }
}
