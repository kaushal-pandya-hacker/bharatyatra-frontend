import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { WebPushService } from '../web-push.service';

export interface PushDispatchPayload {
  userId?: string;
  pushToken?: string;
  title: string;
  body: string;
  deepLink?: string;
  payloadData?: Record<string, any>;
  type?: any;
}

@Injectable()
export class PushProviderAdapter {
  private readonly logger = new Logger(PushProviderAdapter.name);

  constructor(
    @Inject(forwardRef(() => WebPushService))
    private readonly webPushService: WebPushService,
  ) {}

  async sendPushNotification(payload: PushDispatchPayload): Promise<{ success: boolean; messageId: string }> {
    this.logger.log(`[PUSH DISPATCH] Target: ${payload.userId || payload.pushToken || 'All'} | Title: "${payload.title}"`);

    if (payload.userId) {
      await this.webPushService.sendToUser(payload.userId, {
        type: payload.type || 'SYSTEM',
        title: payload.title,
        body: payload.body,
        url: payload.deepLink,
        data: payload.payloadData,
      });
    }

    const messageId = `msg_push_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return { success: true, messageId };
  }
}
