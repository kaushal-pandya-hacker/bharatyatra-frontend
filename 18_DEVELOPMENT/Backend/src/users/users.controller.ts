import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get Current Authenticated User Profile' })
  async getProfile(@Request() req) {
    const userId = req.user?.id || 'usr_demo_123';
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update Current Authenticated User Profile' })
  async updateProfile(@Request() req, @Body() body: any) {
    const userId = req.user?.id || 'usr_demo_123';
    return this.usersService.updateProfile(userId, body);
  }

  @Get('me/preferences')
  @ApiOperation({ summary: 'Get User Preferences' })
  async getPreferences(@Request() req) {
    const userId = req.user?.id || 'usr_demo_123';
    return this.usersService.getPreferences(userId);
  }

  @Patch('me/preferences')
  @ApiOperation({ summary: 'Update User Preferences' })
  async updatePreferences(@Request() req, @Body() body: any) {
    const userId = req.user?.id || 'usr_demo_123';
    return this.usersService.updatePreferences(userId, body);
  }
}
