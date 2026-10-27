import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Reviews & Ratings')
@Controller('reviews')
export class ReviewsController {
  @Get()
  @ApiOperation({ summary: 'Get Destination / Hotel Reviews' })
  async getReviews(@Query('entityId') entityId: string) {
    return {
      success: true,
      data: [
        {
          id: 'rev_1',
          entityId: entityId || 'dest-somnath',
          rating: 5,
          comment: 'Breathtaking evening Light and Sound show on the seashore! Must visit in Gujarat.',
          createdAt: '2026-09-11T12:00:00Z'
        }
      ]
    };
  }
}
