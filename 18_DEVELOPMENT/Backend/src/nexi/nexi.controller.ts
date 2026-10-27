import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { NexiService } from './nexi.service';

import { RateLimit } from '../security/rate-limit.decorator';

@ApiTags('NEXI 24/7 AI Travel Support Assistant')
@Controller('nexi')
export class NexiController {
  constructor(private readonly nexiService: NexiService) {}

  @Post('chat')
  @UseGuards(OptionalJwtAuthGuard)
  @RateLimit({ points: parseInt(process.env.RATE_LIMIT_NEXI_POINTS || '30', 10), duration: 60, keyPrefix: 'nexi_chat' })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send message to NEXI 24/7 AI Travel Assistant' })
  async chat(
    @Req() req: any,
    @Body() body: { message: string; conversationId?: string },
  ) {
    const userId = req.user?.id || req.user?.sub || null;

    if (!body.message || !body.message.trim()) {
      throw new BadRequestException('Message string is required.');
    }

    if (body.message.length > 2000) {
      throw new BadRequestException('Message exceeds maximum permitted length of 2,000 characters.');
    }

    return this.nexiService.processChatMessage(userId, body.conversationId, body.message);
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch authenticated user\'s NEXI conversation history' })
  async getConversations(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('Authenticated user identity required.');
    }

    const conversations = await this.nexiService.getUserConversations(userId);
    return { success: true, conversations };
  }
}
