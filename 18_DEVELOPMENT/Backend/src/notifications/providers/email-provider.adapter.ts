import { Injectable, Logger } from '@nestjs/common';

export interface EmailDispatchPayload {
  recipient: string; // Email address
  subject: string;
  body: string;
  templateId?: string;
  secureLinks?: Record<string, string>;
}

@Injectable()
export class EmailProviderAdapter {
  private readonly logger = new Logger(EmailProviderAdapter.name);

  async sendEmail(payload: EmailDispatchPayload): Promise<{ success: boolean; messageId: string; html: string }> {
    const provider = process.env.EMAIL_PROVIDER || 'sandbox';

    // Generate responsive, branded HTML body for Chalo Farva
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${payload.subject}</title>
  <style>
    body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0F172A; color: #F8FAFC; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #1E293B; border-radius: 12px; overflow: hidden; border: 1px solid #334155; }
    .header { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 24px; text-align: center; border-bottom: 2px solid #0284C7; }
    .logo { font-size: 24px; font-weight: bold; color: #F59E0B; text-decoration: none; }
    .content { padding: 32px 24px; }
    .title { font-size: 20px; font-weight: 700; color: #FFFFFF; margin-bottom: 16px; }
    .body-text { font-size: 15px; line-height: 1.6; color: #CBD5E1; margin-bottom: 24px; }
    .badge { display: inline-block; background-color: #0284C7; color: #FFFFFF; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
    .footer { background-color: #0F172A; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🚀 CHALO FARVA</div>
      <div style="font-size: 12px; color: #94A3B8; margin-top: 4px;">Gujarat Travel & Marketplace Platform</div>
    </div>
    <div class="content">
      <div class="badge">Transactional Update</div>
      <h2 class="title">${payload.subject}</h2>
      <p class="body-text">${payload.body.replace(/\n/g, '<br/>')}</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Chalo Farva. All rights reserved. This is an automated transactional notification.</p>
    </div>
  </div>
</body>
</html>
    `;

    this.logger.log(`[EMAIL DISPATCH - Provider: ${provider}] To: ${payload.recipient} | Subject: "${payload.subject}"`);
    const messageId = `msg_email_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return { success: true, messageId, html };
  }
}
