import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { AdminNotificationsController } from './admin-notifications.controller';
import { SupplierNotificationsController } from './supplier-notifications.controller';
import { NotificationService } from './notification.service';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationTemplateEngine } from './notification-template.engine';
import { DeviceTokenService } from './device-token.service';
import { EmailProviderAdapter } from './providers/email-provider.adapter';
import { SMSProviderAdapter } from './providers/sms-provider.adapter';
import { PushProviderAdapter } from './providers/push-provider.adapter';
import { WhatsAppProviderAdapter } from './providers/whatsapp-provider.adapter';
import { MockNotificationProvider } from '../providers/mocks/mock-weather-notification.provider';

@Module({
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
    EmailProviderAdapter,
    SMSProviderAdapter,
    PushProviderAdapter,
    WhatsAppProviderAdapter,
    MockNotificationProvider,
  ],
  exports: [
    NotificationService,
    NotificationPreferenceService,
    NotificationTemplateEngine,
    DeviceTokenService,
  ],
})
export class NotificationsModule {}
