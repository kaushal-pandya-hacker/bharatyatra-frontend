import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsController } from './notifications.controller';
import { AdminNotificationsController } from './admin-notifications.controller';
import { SupplierNotificationsController } from './supplier-notifications.controller';
import { NotificationService } from './notification.service';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationTemplateEngine } from './notification-template.engine';
import { DeviceTokenService } from './device-token.service';
import { WebPushService } from './web-push.service';
import { EmailProviderAdapter } from './providers/email-provider.adapter';
import { SMSProviderAdapter } from './providers/sms-provider.adapter';
import { PushProviderAdapter } from './providers/push-provider.adapter';
import { WhatsAppProviderAdapter } from './providers/whatsapp-provider.adapter';
import { EmailProviderRegistry } from './providers/email-provider.registry';
import { WhatsAppProviderRegistry } from './providers/whatsapp-provider.registry';
import { CommunicationEventService } from './communication-event.service';
import { NotificationOrchestratorService } from './notification-orchestrator.service';
import { MockNotificationProvider } from '../providers/mocks/mock-weather-notification.provider';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [
    NotificationsController,
    AdminNotificationsController,
    SupplierNotificationsController,
  ],
  providers: [
    NotificationService,
    NotificationPreferenceService,
    NotificationTemplateEngine,
    DeviceTokenService,
    WebPushService,
    EmailProviderAdapter,
    SMSProviderAdapter,
    PushProviderAdapter,
    WhatsAppProviderAdapter,
    EmailProviderRegistry,
    WhatsAppProviderRegistry,
    CommunicationEventService,
    NotificationOrchestratorService,
    MockNotificationProvider,
  ],
  exports: [
    NotificationService,
    NotificationPreferenceService,
    NotificationTemplateEngine,
    DeviceTokenService,
    WebPushService,
    EmailProviderRegistry,
    WhatsAppProviderRegistry,
    CommunicationEventService,
    NotificationOrchestratorService,
  ],
})
export class NotificationsModule {}
