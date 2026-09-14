import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Travel Packages')
@Controller('packages')
export class PackagesController {
  @Get()
  @ApiOperation({ summary: 'Get Pre-Planned Gujarat Travel Packages' })
  async getPackages() {
    return {
      success: true,
      data: [
        {
          id: 'pkg-saurashtra-darshan',
          title: '5D/4N Saurashtra Darshan & Wildlife Tour',
          durationDays: 5,
          pricePerPersonInr: 14500,
          destinationsCovered: ['Somnath', 'Gir National Park', 'Dwarka'],
          inclusions: ['GSRTC AC Bus Transit', '3-Star Resort Stay', 'Gir Safari Ticket', 'Breakfast & Dinner']
        }
      ]
    };
  }
}
