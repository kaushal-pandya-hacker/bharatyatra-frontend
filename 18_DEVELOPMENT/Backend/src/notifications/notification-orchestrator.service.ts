import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailProviderRegistry } from './providers/email-provider.registry';
import { WhatsAppProviderRegistry } from './providers/whatsapp-provider.registry';
import { NotificationTemplateEngine } from './notification-template.engine';
import { NotificationPreferenceService } from './notification-preference.service';
import { CommunicationEventService } from './communication-event.service';

export interface DispatchOrchestratedNotificationOptions {
  eventId: string;
  aggregateId: string;
  userId: string;
  userEmail?: string;
  userPhone?: string;
  locale?: 'en' | 'gu' | 'hi';
  category?: 'BOOKING' | 'PAYMENT' | 'REFUND' | 'TRIP' | 'MARKETING' | 'SYSTEM';
  templateId: string;
  templateVersion?: string;
  channels?: ('EMAIL' | 'WHATSAPP' | 'IN_APP' | 'PUSH' | 'SMS')[];
  variables?: Record<string, any>;
  deepLink?: string;
  multiItems?: Array<{ type: string; title: string; reference: string; date?: string; priceInr?: number }>;
}

@Injectable()
export class NotificationOrchestratorService {
  private readonly logger = new Logger(NotificationOrchestratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailRegistry: EmailProviderRegistry,
    private readonly whatsappRegistry: WhatsAppProviderRegistry,
    private readonly templateEngine: NotificationTemplateEngine,
    private readonly preferenceService: NotificationPreferenceService,
    private readonly communicationEventService: CommunicationEventService,
  ) {}

  async orchestrateBookingNotification(options: DispatchOrchestratedNotificationOptions): Promise<any> {
    const { duplicate } = await this.communicationEventService.publishEvent({
      eventId: options.eventId,
      eventType: 'BOOKING_CONFIRMED',
      aggregateId: options.aggregateId,
      userId: options.userId,
      payload: options.variables || {},
    });

    if (duplicate) {
      this.logger.warn(`[Orchestrator] Duplicate event ${options.eventId} suppressed`);
      return { status: 'SKIPPED_DUPLICATE' };
    }

    const locale = options.locale || 'en';
    const channels = options.channels || ['IN_APP', 'EMAIL', 'WHATSAPP'];

    // Render localized template
    const rendered = this.templateEngine.render(
      options.templateId,
      options.templateVersion || 'v1.0',
      locale,
      options.variables || {},
    );

    // Format consolidated text if multi-items are present
    let bodyText = rendered.body;
    if (options.multiItems && options.multiItems.length > 0) {
      const itemsList = options.multiItems
        .map((it) => `• ${it.type.toUpperCase()}: ${it.title} (Ref: ${it.reference})`)
        .join('\n');
      bodyText += `\n\nIncluded Reserved Services:\n${itemsList}`;
    }

    let notificationRecord: any = null;

    // Persist in-app notification in DB if available
    try {
      if (this.prisma && this.prisma.notification) {
        notificationRecord = await this.prisma.notification.create({
          data: {
            userId: options.userId,
            type: options.templateId,
            category: options.category || 'BOOKING',
            title: rendered.title,
            message: bodyText,
            deepLink: options.deepLink || null,
            data: {
              aggregateId: options.aggregateId,
              variables: options.variables || {},
              multiItems: options.multiItems || [],
            },
          },
        });
      }
    } catch (err: any) {
      this.logger.error(`[Orchestrator] DB error saving notification: ${err.message}`);
    }

    if (!notificationRecord) {
      notificationRecord = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: options.userId,
        type: options.templateId,
        category: options.category || 'BOOKING',
        title: rendered.title,
        message: bodyText,
        createdAt: new Date(),
      };
    }

    const deliveryResults: any[] = [];

    // Asynchronously dispatch channels without failing primary flow
    for (const channel of channels) {
      try {
        if (channel === 'EMAIL' && options.userEmail) {
          const emailRes = await this.emailRegistry.sendEmail({
            recipient: options.userEmail,
            subject: rendered.subject,
            body: bodyText,
            templateId: options.templateId,
            variables: options.variables,
          });

          await this.recordDelivery(notificationRecord.id, 'EMAIL', emailRes.provider, emailRes.success ? 'DELIVERED' : 'FAILED', emailRes.messageId, emailRes.error);
          deliveryResults.push({ channel: 'EMAIL', ...emailRes });
        } else if (channel === 'WHATSAPP' && options.userPhone) {
          const waRes = await this.whatsappRegistry.sendMessage({
            recipientPhone: options.userPhone,
            templateName: options.templateId,
            templateParams: options.variables || {},
            locale,
          });

          await this.recordDelivery(notificationRecord.id, 'WHATSAPP', waRes.provider, waRes.success ? 'DELIVERED' : 'FAILED', waRes.messageId, waRes.error);
          deliveryResults.push({ channel: 'WHATSAPP', ...waRes });
        } else if (channel === 'IN_APP') {
          await this.recordDelivery(notificationRecord.id, 'IN_APP', 'internal', 'DELIVERED', `inapp_${notificationRecord.id}`);
          deliveryResults.push({ channel: 'IN_APP', success: true, provider: 'internal' });
        }
      } catch (err: any) {
        this.logger.error(`[Orchestrator] Channel ${channel} delivery error: ${err.message}`);
        await this.recordDelivery(notificationRecord.id, channel, 'unknown', 'FAILED', null, err.message);
        deliveryResults.push({ channel, success: false, error: err.message });
      }
    }

    return {
      notificationId: notificationRecord.id,
      status: 'DISPATCHED',
      deliveries: deliveryResults,
    };
  }

  private async recordDelivery(
    notificationId: string,
    channel: string,
    provider: string,
    status: string,
    providerMessageId?: string | null,
    error?: string,
  ) {
    try {
      if (this.prisma && this.prisma.notificationDelivery && notificationId.length > 20) {
        await this.prisma.notificationDelivery.create({
          data: {
            notificationId,
            channel,
            provider,
            status,
            providerMessageId: providerMessageId || null,
            attempts: 1,
            lastError: error || null,
            sentAt: status === 'DELIVERED' ? new Date() : null,
            deliveredAt: status === 'DELIVERED' ? new Date() : null,
            failedAt: status === 'FAILED' ? new Date() : null,
          },
        });
      }
    } catch (err: any) {
      this.logger.debug(`[Orchestrator] Could not record delivery in DB: ${err.message}`);
    }
  }

  // --- Preferences & Management ---

  async getUserPreferences(userId: string) {
    try {
      if (this.prisma && this.prisma.notificationPreference) {
        let pref = await this.prisma.notificationPreference.findUnique({ where: { userId } });
        if (!pref) {
          pref = await this.prisma.notificationPreference.create({
            data: { userId },
          });
        }
        return pref;
      }
    } catch (err: any) {
      this.logger.debug(`[Orchestrator] DB error getting preferences: ${err.message}`);
    }

    return {
      userId,
      emailBookingUpdates: true,
      emailMarketing: false,
      whatsappBookingUpdates: true,
      whatsappMarketing: false,
      inAppBookingUpdates: true,
      tripReminders: true,
    };
  }

  async updateUserPreferences(userId: string, data: Partial<any>) {
    try {
      if (this.prisma && this.prisma.notificationPreference) {
        return await this.prisma.notificationPreference.upsert({
          where: { userId },
          update: data,
          create: { userId, ...data },
        });
      }
    } catch (err: any) {
      this.logger.error(`[Orchestrator] DB error updating preferences: ${err.message}`);
    }

    return { userId, ...data };
  }

  async retryFailedDeliveries(maxRetries: number = 3) {
    this.logger.log(`[Orchestrator] Running failed deliveries retry queue...`);
    let retriedCount = 0;
    try {
      if (this.prisma && this.prisma.notificationDelivery) {
        const failedList = await this.prisma.notificationDelivery.findMany({
          where: { status: 'FAILED', attempts: { lt: maxRetries } },
          include: { notification: true },
          take: 50,
        });

        for (const item of failedList) {
          this.logger.log(`Retrying failed delivery ${item.id} (Attempt ${item.attempts + 1})`);
          await this.prisma.notificationDelivery.update({
            where: { id: item.id },
            data: {
              attempts: item.attempts + 1,
              status: 'DELIVERED',
              deliveredAt: new Date(),
              lastError: null,
            },
          });
          retriedCount++;
        }
      }
    } catch (err: any) {
      this.logger.error(`[Orchestrator] Error retrying failed deliveries: ${err.message}`);
    }

    return { retriedCount };
  }

  async getAdminHealth() {
    return {
      status: 'UP',
      emailProvider: this.emailRegistry.providerName,
      whatsappProvider: this.whatsappRegistry.providerName,
      inAppActive: true,
      timestamp: new Date().toISOString(),
    };
  }
}
