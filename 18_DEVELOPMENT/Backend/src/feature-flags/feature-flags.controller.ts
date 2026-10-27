import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FeatureFlagsService, BetaUserGroup, FeatureFlagConfig } from './feature-flags.service';

@ApiTags('Feature Flags')
@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly flagsService: FeatureFlagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get All Feature Flag Configurations' })
  getFlags() {
    return this.flagsService.getFlags();
  }

  @Get('evaluate/:flagKey')
  @ApiOperation({ summary: 'Evaluate Feature Flag for Specific User and Group' })
  evaluateFlag(
    @Param('flagKey') flagKey: string,
    @Query('userId') userId?: string,
    @Query('userGroup') userGroup: BetaUserGroup = 'PUBLIC',
  ) {
    const enabled = this.flagsService.isFeatureEnabled(flagKey, userId, userGroup);
    return { flagKey, enabled, userGroup };
  }

  @Patch(':flagKey')
  @ApiOperation({ summary: 'Update Feature Flag Rollout Settings (Admin Only)' })
  updateFlag(
    @Param('flagKey') flagKey: string,
    @Body() updates: Partial<FeatureFlagConfig>,
  ) {
    return this.flagsService.updateFlag(flagKey, updates);
  }
}
