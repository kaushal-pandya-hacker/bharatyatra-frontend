import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService, DispatchNotificationRequest } from './notification.service';
import { NotificationPreferenceService, UserNotificationPreference } from './notification-preference.service';
import { DeviceTokenService } from './device-token.service';
import { NotificationOrchestratorService, DispatchOrchestratedNotificationOptions } from './notification-orchestrator.service';
import { WebPushService, PushSubscriptionDto, DeviceInfoDto, CanonicalNotificationPayload } from './web-push.service';

@ApiTags('Notifications & Real-Time Web Push')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly preferenceService: NotificationPreferenceService,
    private readonly deviceTokenService: DeviceTokenService,
    private readonly orchestratorService: NotificationOrchestratorService,
    private readonly webPushService: WebPushService,
  ) {}

  // ==================================================
  // WEB PUSH SUBSCRIPTION & DEVICE MANAGEMENT ENDPOINTS
  // ==================================================

  @Get('push/vapid-public-key')
  @ApiOperation({ summary: 'Get VAPID Public Key for Web Push Subscriptions' })
  getVapidPublicKey() {
    return this.webPushService.getVapidPublicKey();
  }

  @Post('push/subscribe')
  @ApiOperation({ summary: 'Subscribe Authenticated User Device for Real-Time Web Push' })
  async subscribePush(
    @Req() req: any,
    @Body()
    body: {
      subscription: PushSubscriptionDto;
      device?: DeviceInfoDto;
      userId?: string;
    },
  ) {
    // Identity strictly from authenticated session/JWT, fallback to query/demo if in dev mode
    const userId = req.user?.id || req.user?.userId || body.userId || 'usr_customer_demo';
    return this.webPushService.subscribe(userId, body.subscription, body.device);
  }

  @Delete('push/subscribe')
  @ApiOperation({ summary: 'Unsubscribe/Deactivate Current Web Push Subscription' })
  async unsubscribePush(
    @Req() req: any,
    @Body() body: { endpoint: string; userId?: string },
  ) {
    const userId = req.user?.id || req.user?.userId || body.userId || 'usr_customer_demo';
    return this.webPushService.unsubscribe(userId, body.endpoint);
  }

  @Get('push/devices')
  @ApiOperation({ summary: 'Get List of Connected Push Notification Devices for User' })
  async getPushDevices(@Req() req: any, @Query('userId') queryUserId?: string) {
    const userId = req.user?.id || req.user?.userId || queryUserId || 'usr_customer_demo';
    return this.webPushService.getUserDevices(userId);
  }

  @Delete('push/devices/:id')
  @ApiOperation({ summary: 'Remove/Deactivate Specific Connected Push Device' })
  async removePushDevice(
    @Req() req: any,
    @Param('id') deviceId: string,
    @Query('userId') queryUserId?: string,
  ) {
    const userId = req.user?.id || req.user?.userId || queryUserId || 'usr_customer_demo';
    return this.webPushService.removeDevice(userId, deviceId);
  }

  @Post('push/test')
  @ApiOperation({ summary: 'Send Test Web Push Notification to Authenticated User' })
  async sendTestPush(@Req() req: any, @Body() body: { userId?: string }) {
    const userId = req.user?.id || req.user?.userId || body.userId || 'usr_customer_demo';
    return this.webPushService.sendTestNotification(userId);
  }

  @Post('push/send-user')
  @ApiOperation({ summary: 'Internal/Service Endpoint: Dispatch Web Push Notification to User' })
  async sendPushToUser(
    @Body() body: { userId: string; notification: CanonicalNotificationPayload },
  ) {
    return this.webPushService.sendToUser(body.userId, body.notification);
  }

  // ==================================================
  // IN-APP NOTIFICATION INBOX & PREFERENCES
  // ==================================================

  @Get()
  @ApiOperation({ summary: 'Get Customer Notifications Inbox with Pagination' })
  getUserNotifications(
    @Req() req: any,
    @Query('userId') queryUserId?: string,
    @Query('category') category?: string,
    @Query('unreadOnly') unreadOnly?: boolean,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const userId = req.user?.id || req.user?.userId || queryUserId || 'usr_customer_demo';
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    return this.notificationService.getUserNotifications(userId, category, unreadOnly, pageNum, limitNum);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get Customer Unread Notification Count' })
  getUnreadCount(@Req() req: any, @Query('userId') queryUserId?: string) {
    const userId = req.user?.id || req.user?.userId || queryUserId || 'usr_customer_demo';
    return this.notificationService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark Single Notification as Read' })
  markAsRead(
    @Req() req: any,
    @Param('id') notificationId: string,
    @Query('userId') queryUserId?: string,
  ) {
    const userId = req.user?.id || req.user?.userId || queryUserId || 'usr_customer_demo';
    return this.notificationService.markAsRead(notificationId, userId);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark All Customer Notifications as Read' })
  markAllAsRead(@Req() req: any, @Query('userId') queryUserId?: string) {
    const userId = req.user?.id || req.user?.userId || queryUserId || 'usr_customer_demo';
    return this.notificationService.markAllAsRead(userId);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get User Notification Preferences (Travel & Marketing Toggles)' })
  async getPreferences(@Req() req: any, @Query('userId') queryUserId?: string) {
    const userId = req.user?.id || req.user?.userId || queryUserId || 'usr_customer_demo';
    return this.webPushService.getPreferences(userId);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update User Notification Preferences' })
  async updatePreferences(
    @Req() req: any,
    @Body()
    dto: {
      tripReminders?: boolean;
      bookingUpdates?: boolean;
      tripUpdates?: boolean;
      aiUpdates?: boolean;
      marketing?: boolean;
      userId?: string;
    },
  ) {
    const userId = req.user?.id || req.user?.userId || dto.userId || 'usr_customer_demo';
    return this.webPushService.updatePreferences(userId, dto);
  }

  @Post('dispatch-event')
  @ApiOperation({ summary: 'Publish Domain Event to Centralized Notification System' })
  dispatchEvent(@Body() body: DispatchNotificationRequest) {
    return this.notificationService.dispatch(body);
  }

  @Post('orchestrated/dispatch')
  @ApiOperation({ summary: 'Orchestrate Multi-channel Localized Booking Notification' })
  dispatchOrchestrated(@Body() body: DispatchOrchestratedNotificationOptions) {
    return this.orchestratorService.orchestrateBookingNotification(body);
  }
}
