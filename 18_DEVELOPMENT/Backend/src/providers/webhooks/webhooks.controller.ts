import {
  Controller,
  Post,
  Body,
  Param,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { Request } from 'express';

@ApiTags('Webhooks Integrations')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post(':provider/:event')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive Signed External Provider Webhook Events' })
  async handleWebhook(
    @Param('provider') provider: string,
    @Param('event') event: string,
    @Body() payload: any,
    @Req() req: Request,
    @Headers('x-razorpay-signature') razorpaySignature?: string,
    @Headers('x-provider-signature') providerSignature?: string,
    @Headers('x-webhook-timestamp') timestamp?: string,
  ) {
    const signature = razorpaySignature || providerSignature;
    if (!signature || signature.trim().length === 0) {
      throw new BadRequestException('Missing required cryptographic webhook signature.');
    }

    // Exact raw body buffer or string required for HMAC-SHA256 signature verification
    const rawBody =
      (req as any)?.rawBody || (typeof payload === 'string' ? payload : JSON.stringify(payload));

    return this.webhooksService.processWebhook(provider, event, payload, signature.trim(), rawBody, timestamp);
  }
}
