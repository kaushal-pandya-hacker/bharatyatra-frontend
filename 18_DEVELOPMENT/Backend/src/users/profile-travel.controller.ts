import { Controller, Get, Put, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('User Travel Profile & Onboarding')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileTravelController {
  constructor(private readonly usersService: UsersService) {}

  @Get('travel')
  @ApiOperation({ summary: 'Get Authenticated User Travel Profile' })
  async getTravelProfile(@CurrentUser() user: any) {
    return this.usersService.getTravelProfile(user.id);
  }

  @Put('travel')
  @ApiOperation({ summary: 'Save/Replace User Travel Profile' })
  async putTravelProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.usersService.updateTravelProfile(user.id, body);
  }

  @Patch('travel')
  @ApiOperation({ summary: 'Update User Travel Profile' })
  async patchTravelProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.usersService.updateTravelProfile(user.id, body);
  }
}
