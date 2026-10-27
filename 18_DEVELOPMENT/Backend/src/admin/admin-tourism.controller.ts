import { Controller, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminTourismService } from './admin-tourism.service';

@ApiTags('Admin — Tourism CMS')
@Controller('admin/tourism')
export class AdminTourismController {
  constructor(private readonly adminTourismService: AdminTourismService) {}

  @Post('states')
  @ApiOperation({ summary: 'Create or Update State' })
  async upsertState(@Body() body: any) {
    const state = await this.adminTourismService.upsertState(body);
    return { success: true, data: state };
  }

  @Post('districts')
  @ApiOperation({ summary: 'Create or Update District' })
  async upsertDistrict(@Body() body: any) {
    const district = await this.adminTourismService.upsertDistrict(body);
    return { success: true, data: district };
  }

  @Post('cities')
  @ApiOperation({ summary: 'Create or Update City' })
  async upsertCity(@Body() body: any) {
    const city = await this.adminTourismService.upsertCity(body);
    return { success: true, data: city };
  }

  @Post('destinations')
  @ApiOperation({ summary: 'Create or Update Destination' })
  async upsertDestination(@Body() body: any) {
    const destination = await this.adminTourismService.upsertDestination(body);
    return { success: true, data: destination };
  }

  @Put('destinations/:slug/status')
  @ApiOperation({ summary: 'Update Destination Status (DRAFT, PUBLISHED, ARCHIVED, ACTIVE)' })
  async setStatus(
    @Param('slug') slug: string,
    @Body('status') status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'ACTIVE'
  ) {
    const res = await this.adminTourismService.setDestinationStatus(slug, status);
    return { success: true, data: res };
  }
}
