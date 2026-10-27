export interface EmailSendOptions {
  recipient: string;
  subject: string;
  body: string;
  html?: string;
  templateId?: string;
  variables?: Record<string, any>;
  attachments?: Array<{ filename: string; content: string; contentType?: string }>;
}

export interface EmailSendResult {
  success: boolean;
  provider: string;
  messageId: string;
  sentAt: Date;
  error?: string;
}

export interface IEmailProvider {
  providerName: string;
  sendEmail(options: EmailSendOptions): Promise<EmailSendResult>;
}

export interface WhatsAppSendOptions {
  recipientPhone: string;
  templateName: string;
  templateParams: Record<string, any>;
  locale?: string;
  mediaUrl?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  provider: string;
  messageId: string;
  sentAt: Date;
  deepLink?: string;
  error?: string;
}

export interface IWhatsAppProvider {
  providerName: string;
  sendMessage(options: WhatsAppSendOptions): Promise<WhatsAppSendResult>;
}
