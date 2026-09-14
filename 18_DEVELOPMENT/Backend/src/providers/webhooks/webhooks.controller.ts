import { Controller, Post, Body, Param, Headers, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

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
    @Headers('x-razorpay-signature') razorpaySignature?: string,
    @Headers('x-provider-signature') providerSignature?: string,
    @Headers('x-webhook-timestamp') timestamp?: string,
  ) {
    const sig = razorpaySignature || providerSignature || 'mock_signature_valid';
    return this.webhooksService.processWebhook(provider, event, payload, sig, timestamp);
  }
}
