import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LaunchService } from './launch.service';

@ApiTags('Public Launch Operations')
@Controller('launch')
export class LaunchController {
  constructor(private readonly launchService: LaunchService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get Live Gujarat Public Launch Dashboard & Go/No-Go Gate Metrics' })
  getDashboard() {
    return this.launchService.getLaunchDashboard();
  }
}
