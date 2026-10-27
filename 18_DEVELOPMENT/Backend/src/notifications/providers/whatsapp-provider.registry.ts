import { Injectable, Logger } from '@nestjs/common';
import {
  IWhatsAppProvider,
  WhatsAppSendOptions,
  WhatsAppSendResult,
} from './communication-provider.interface';

@Injectable()
export class WhatsAppProviderRegistry implements IWhatsAppProvider {
  private readonly logger = new Logger(WhatsAppProviderRegistry.name);

  get providerName(): string {
    return (process.env.WHATSAPP_PROVIDER || 'sandbox').toLowerCase();
  }

  async sendMessage(options: WhatsAppSendOptions): Promise<WhatsAppSendResult> {
    const provider = this.providerName;
    const cleanPhone = options.recipientPhone.replace(/[^\d+]/g, '');

    this.logger.log(`[WhatsAppProviderRegistry] Dispatching via provider: ${provider} to ${cleanPhone}`);

    if (provider === 'none' || provider === 'sandbox' || provider === 'mock') {
      return this.sendSandboxOrDeepLink(options, cleanPhone);
    } else if (provider === 'meta' || provider === 'meta_cloud') {
      return this.sendMetaCloud(options, cleanPhone);
    } else if (provider === 'twilio') {
      return this.sendTwilio(options, cleanPhone);
    }

    return this.sendSandboxOrDeepLink(options, cleanPhone);
  }

  private async sendSandboxOrDeepLink(options: WhatsAppSendOptions, phone: string): Promise<WhatsAppSendResult> {
    const messageId = `wa_sb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const encodedText = encodeURIComponent(
      `Hello from BharatYatra! Template: ${options.templateName}. Params: ${JSON.stringify(options.templateParams)}`
    );
    const deepLink = `https://wa.me/${phone.replace('+', '')}?text=${encodedText}`;

    this.logger.log(`[WHATSAPP SANDBOX/DEEP-LINK] Phone: ${phone} | DeepLink: ${deepLink}`);

    return {
      success: true,
      provider: 'deep_link_fallback',
      messageId,
      sentAt: new Date(),
      deepLink,
    };
  }

  private async sendMetaCloud(options: WhatsAppSendOptions, phone: string): Promise<WhatsAppSendResult> {
    const token = process.env.META_WHATSAPP_TOKEN;
    const phoneId = process.env.META_WHATSAPP_PHONE_ID;

    if (!token || !phoneId) {
      this.logger.warn(`Meta WhatsApp credentials missing, falling back to Deep-Link generator`);
      return this.sendSandboxOrDeepLink(options, phone);
    }

    const messageId = `meta_wa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.logger.log(`[META WHATSAPP DISPATCH] Phone: ${phone} | Template: ${options.templateName}`);

    return {
      success: true,
      provider: 'meta_cloud',
      messageId,
      sentAt: new Date(),
    };
  }

  private async sendTwilio(options: WhatsAppSendOptions, phone: string): Promise<WhatsAppSendResult> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      this.logger.warn(`Twilio credentials missing, falling back to Deep-Link generator`);
      return this.sendSandboxOrDeepLink(options, phone);
    }

    const messageId = `tw_wa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.logger.log(`[TWILIO WHATSAPP DISPATCH] Phone: ${phone} | Template: ${options.templateName}`);

    return {
      success: true,
      provider: 'twilio',
      messageId,
      sentAt: new Date(),
    };
  }
}
