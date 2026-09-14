import { Injectable, Logger } from '@nestjs/common';

export interface SMSDispatchPayload {
  recipient: string; // Phone number
  message: string;
  isOtp?: boolean;
}

@Injectable()
export class SMSProviderAdapter {
  private readonly logger = new Logger(SMSProviderAdapter.name);

  async sendSMS(payload: SMSDispatchPayload): Promise<{ success: boolean; messageId: string }> {
    this.logger.log(`[SMS DISPATCH] To: ${payload.recipient} | Msg: "${payload.message}"`);
    // Simulated SMS Gateway Dispatch
    const messageId = `msg_sms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return { success: true, messageId };
  }
}
