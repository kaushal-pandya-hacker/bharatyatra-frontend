import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate AI Trip and Persist to PostgreSQL' })
  @ApiResponse({ status: 201, description: 'Trip generated and persisted' })
  async generateTrip(@CurrentUser() user: any, @Body() body: any) {
    const userId = user?.id || 'usr_demo_123';
    return this.tripsService.generateAndSaveTrip(userId, body);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create New Trip Record' })
  async createTrip(@CurrentUser() user: any, @Body() body: any) {
    const userId = user?.id || 'usr_demo_123';
    return this.tripsService.generateAndSaveTrip(userId, body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get User Trips from PostgreSQL' })
  async getUserTrips(@CurrentUser() user: any) {
    const userId = user?.id || 'usr_demo_123';
    return this.tripsService.getUserTrips(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Detailed Trip Record by ID' })
  async getTripById(@CurrentUser() user: any, @Param('id') id: string) {
    const userId = user?.id || 'usr_demo_123';
    return this.tripsService.getTripById(userId, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Trip Preferences or Dates' })
  async updateTrip(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const userId = user?.id || 'usr_demo_123';
    return this.tripsService.updateTrip(userId, id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive or Delete Trip' })
  async deleteTrip(@CurrentUser() user: any, @Param('id') id: string) {
    const userId = user?.id || 'usr_demo_123';
    return this.tripsService.deleteTrip(userId, id);
  }
}
