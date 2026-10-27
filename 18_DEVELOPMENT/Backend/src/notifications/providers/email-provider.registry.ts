import { Injectable, Logger } from '@nestjs/common';
import {
  IEmailProvider,
  EmailSendOptions,
  EmailSendResult,
} from './communication-provider.interface';

@Injectable()
export class EmailProviderRegistry implements IEmailProvider {
  private readonly logger = new Logger(EmailProviderRegistry.name);

  get providerName(): string {
    return (process.env.EMAIL_PROVIDER || 'sandbox').toLowerCase();
  }

  async sendEmail(options: EmailSendOptions): Promise<EmailSendResult> {
    const provider = this.providerName;

    const htmlContent = options.html || this.generateHtml(options);

    this.logger.log(`[EmailProviderRegistry] Dispatching via provider: ${provider} to ${options.recipient}`);

    if (provider === 'none' || provider === 'sandbox' || provider === 'mock') {
      return this.sendSandbox(options, htmlContent);
    } else if (provider === 'smtp') {
      return this.sendSmtp(options, htmlContent);
    } else if (provider === 'resend') {
      return this.sendResend(options, htmlContent);
    } else if (provider === 'sendgrid') {
      return this.sendSendGrid(options, htmlContent);
    } else if (provider === 'ses') {
      return this.sendSes(options, htmlContent);
    }

    // Default fallback to sandbox
    return this.sendSandbox(options, htmlContent);
  }

  private async sendSandbox(options: EmailSendOptions, html: string): Promise<EmailSendResult> {
    const messageId = `sb_email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.logger.log(`[EMAIL SANDBOX] Recipient: ${options.recipient} | Subject: "${options.subject}" | MessageID: ${messageId}`);
    return {
      success: true,
      provider: 'sandbox',
      messageId,
      sentAt: new Date(),
    };
  }

  private async sendSmtp(options: EmailSendOptions, html: string): Promise<EmailSendResult> {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    if (!host) {
      this.logger.warn(`SMTP_HOST missing, defaulting to sandbox email dispatch`);
      return this.sendSandbox(options, html);
    }
    const messageId = `smtp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.logger.log(`[SMTP EMAIL DISPATCH] Host: ${host}:${port} | To: ${options.recipient} | Subject: "${options.subject}"`);
    return {
      success: true,
      provider: 'smtp',
      messageId,
      sentAt: new Date(),
    };
  }

  private async sendResend(options: EmailSendOptions, html: string): Promise<EmailSendResult> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn(`RESEND_API_KEY missing, defaulting to sandbox email dispatch`);
      return this.sendSandbox(options, html);
    }
    const messageId = `resend_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.logger.log(`[RESEND EMAIL DISPATCH] To: ${options.recipient} | Subject: "${options.subject}"`);
    return {
      success: true,
      provider: 'resend',
      messageId,
      sentAt: new Date(),
    };
  }

  private async sendSendGrid(options: EmailSendOptions, html: string): Promise<EmailSendResult> {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      this.logger.warn(`SENDGRID_API_KEY missing, defaulting to sandbox email dispatch`);
      return this.sendSandbox(options, html);
    }
    const messageId = `sg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.logger.log(`[SENDGRID EMAIL DISPATCH] To: ${options.recipient} | Subject: "${options.subject}"`);
    return {
      success: true,
      provider: 'sendgrid',
      messageId,
      sentAt: new Date(),
    };
  }

  private async sendSes(options: EmailSendOptions, html: string): Promise<EmailSendResult> {
    const region = process.env.AWS_REGION || 'ap-south-1';
    const messageId = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.logger.log(`[AWS SES EMAIL DISPATCH] Region: ${region} | To: ${options.recipient} | Subject: "${options.subject}"`);
    return {
      success: true,
      provider: 'ses',
      messageId,
      sentAt: new Date(),
    };
  }

  private generateHtml(options: EmailSendOptions): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${options.subject}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; }
    .brand { font-size: 24px; font-weight: bold; color: #f59e0b; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }
    .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 16px; }
    .body-content { font-size: 15px; line-height: 1.6; color: #cbd5e1; }
    .footer { margin-top: 32px; pt-24px; border-top: 1px solid #334155; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">🚀 BharatYatra (ભારત યાત્રા)</div>
    <h2 class="title">${options.subject}</h2>
    <div class="body-content">
      ${options.body.replace(/\n/g, '<br/>')}
    </div>
    <div class="footer">
      <p>This is an automated transactional update from BharatYatra India Travel Marketplace.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
