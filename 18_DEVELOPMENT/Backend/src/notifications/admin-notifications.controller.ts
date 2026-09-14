import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

@ApiTags('Admin Notifications')
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get System-Wide Notification Delivery Overview' })
  getOverview() {
    return this.notificationService.getAdminNotificationsOverview();
  }

  @Get('failures')
  @ApiOperation({ summary: 'Get Delivery Failures & Retrying Notifications' })
  getFailures() {
    return this.notificationService.getFailuresAndRetries();
  }

  @Get('providers')
  @ApiOperation({ summary: 'Get Multi-Channel Provider Adapter Status' })
  getProviderStatus() {
    return [
      { channel: 'EMAIL', adapter: 'EmailProviderAdapter', status: 'HEALTHY', activeQueue: 0 },
      { channel: 'SMS', adapter: 'SMSProviderAdapter', status: 'HEALTHY', activeQueue: 0 },
      { channel: 'PUSH', adapter: 'PushProviderAdapter', status: 'HEALTHY', activeQueue: 0 },
      { channel: 'WHATSAPP', adapter: 'WhatsAppProviderAdapter', status: 'READY', activeQueue: 0 },
    ];
  }
}
