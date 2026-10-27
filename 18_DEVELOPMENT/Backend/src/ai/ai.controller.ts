import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';

@ApiTags('AI Engine Boundaries')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-itinerary')
  @ApiOperation({ summary: 'Generate Candidate Multi-Day Travel Itinerary' })
  async generateItinerary(@Body() body: any) {
    return this.aiService.generateCandidateItinerary(body);
  }
}
