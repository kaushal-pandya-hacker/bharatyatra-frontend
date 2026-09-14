import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Activities & Experiences')
@Controller('activities')
export class ActivitiesController {
  @Get()
  @ApiOperation({ summary: 'Discover Verified Local Activities & Safari Bookings' })
  async getActivities(@Query('destinationSlug') destinationSlug?: string) {
    return {
      success: true,
      data: [
        {
          id: 'act-gir-safari',
          title: 'Gir Lion Jungle Safari Trail 3',
          destination: destinationSlug || 'gir-national-park',
          priceInr: 1200,
          durationMinutes: 180,
          provenance: 'VERIFIED_DATA'
        },
        {
          id: 'act-kutch-craft',
          title: 'Khabda Artisan Embroidery Workshop',
          destination: destinationSlug || 'rann-of-kutch',
          priceInr: 450,
          durationMinutes: 120,
          provenance: 'VERIFIED_DATA'
        }
      ]
    };
  }
}
