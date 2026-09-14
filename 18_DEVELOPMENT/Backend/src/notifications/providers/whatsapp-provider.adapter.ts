import { Injectable, Logger } from '@nestjs/common';

export interface WhatsAppDispatchPayload {
  recipientPhone: string;
  templateName: string;
  templateParams: Record<string, string>;
  locale?: string;
}

@Injectable()
export class WhatsAppProviderAdapter {
  private readonly logger = new Logger(WhatsAppProviderAdapter.name);

  async sendWhatsAppMessage(payload: WhatsAppDispatchPayload): Promise<{ success: boolean; messageId: string }> {
    this.logger.log(`[WHATSAPP DISPATCH] To: ${payload.recipientPhone} | Template: ${payload.templateName}`);
    // Prepared Meta Business API Provider Adapter Structure
    const messageId = `msg_wa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return { success: true, messageId };
  }
}
