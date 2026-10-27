import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('User Personalization & Ownership')
@Controller('me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get Current Authenticated User & Account Overview' })
  @ApiResponse({ status: 200, description: 'User account details returned' })
  async getMe(@CurrentUser() user: any) {
    return this.usersService.getMe(user.id);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get Current User Personal Profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update Current User Personal Profile' })
  async updateProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.usersService.updateProfile(user.id, body);
  }

  // ==========================================
  // TRAVELER MANAGEMENT ENDPOINTS
  // ==========================================

  @Get('travelers')
  @ApiOperation({ summary: 'Get Saved Travelers for Authenticated User' })
  async getTravelers(@CurrentUser() user: any) {
    return this.usersService.getTravelers(user.id);
  }

  @Post('travelers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Saved Traveler for Authenticated User' })
  async createTraveler(@CurrentUser() user: any, @Body() body: any) {
    return this.usersService.createTraveler(user.id, body);
  }

  @Patch('travelers/:id')
  @ApiOperation({ summary: 'Update Saved Traveler Record' })
  async updateTraveler(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.usersService.updateTraveler(user.id, id, body);
  }

  @Delete('travelers/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Saved Traveler Record' })
  async deleteTraveler(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.deleteTraveler(user.id, id);
  }

  // ==========================================
  // SAVED DESTINATIONS ENDPOINTS
  // ==========================================

  @Get('saved-destinations')
  @ApiOperation({ summary: 'Get Bookmarked Destinations for Authenticated User' })
  async getSavedDestinations(@CurrentUser() user: any) {
    return this.usersService.getSavedDestinations(user.id);
  }

  @Post('saved-destinations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bookmark Destination for Authenticated User' })
  async saveDestination(@CurrentUser() user: any, @Body() body: { destinationId: string }) {
    return this.usersService.saveDestination(user.id, body.destinationId);
  }

  @Delete('saved-destinations/:destinationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove Bookmarked Destination' })
  async removeSavedDestination(@CurrentUser() user: any, @Param('destinationId') destinationId: string) {
    return this.usersService.removeSavedDestination(user.id, destinationId);
  }

  // ==========================================
  // PREFERENCES ENDPOINTS
  // ==========================================

  @Get('preferences')
  @ApiOperation({ summary: 'Get Authenticated User Preferences' })
  async getPreferences(@CurrentUser() user: any) {
    return this.usersService.getPreferences(user.id);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update Authenticated User Preferences' })
  async updatePreferences(@CurrentUser() user: any, @Body() body: any) {
    return this.usersService.updatePreferences(user.id, body);
  }
}

@ApiTags('Users Module Compatibility')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get Current Authenticated User Profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getMe(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update Current Authenticated User Profile' })
  async updateProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Get('me/preferences')
  @ApiOperation({ summary: 'Get User Preferences' })
  async getPreferences(@CurrentUser() user: any) {
    return this.usersService.getPreferences(user.id);
  }

  @Patch('me/preferences')
  @ApiOperation({ summary: 'Update User Preferences' })
  async updatePreferences(@CurrentUser() user: any, @Body() body: any) {
    return this.usersService.updatePreferences(user.id, body);
  }
}
