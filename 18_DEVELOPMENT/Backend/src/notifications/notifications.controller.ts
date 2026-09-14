import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationService, DispatchNotificationRequest } from './notification.service';
import { NotificationPreferenceService, UserNotificationPreference } from './notification-preference.service';
import { DeviceTokenService } from './device-token.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly preferenceService: NotificationPreferenceService,
    private readonly deviceTokenService: DeviceTokenService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get Customer Notifications Inbox with Pagination' })
  getUserNotifications(
    @Query('userId') userId: string = 'usr_customer_demo',
    @Query('category') category?: string,
    @Query('unreadOnly') unreadOnly?: boolean,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    return this.notificationService.getUserNotifications(userId, category, unreadOnly, pageNum, limitNum);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get Customer Unread Notification Count' })
  getUnreadCount(@Query('userId') userId: string = 'usr_customer_demo') {
    return this.notificationService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark Single Notification as Read' })
  markAsRead(
    @Param('id') notificationId: string,
    @Query('userId') userId: string = 'usr_customer_demo',
  ) {
    return this.notificationService.markAsRead(notificationId, userId);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark All Customer Notifications as Read' })
  markAllAsRead(@Query('userId') userId: string = 'usr_customer_demo') {
    return this.notificationService.markAllAsRead(userId);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get User Notification Preferences & Quiet Hours' })
  getPreferences(@Query('userId') userId: string = 'usr_customer_demo') {
    return this.preferenceService.getPreferences(userId);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update User Notification Preferences' })
  updatePreferences(
    @Query('userId') userId: string = 'usr_customer_demo',
    @Body() updates: Partial<UserNotificationPreference>[],
  ) {
    return this.preferenceService.updatePreferences(userId, updates);
  }

  @Post('dispatch-event')
  @ApiOperation({ summary: 'Publish Domain Event to Centralized Notification System' })
  dispatchEvent(@Body() body: DispatchNotificationRequest) {
    return this.notificationService.dispatch(body);
  }

  @Post('devices')
  @ApiOperation({ summary: 'Register Web/Mobile Push Device Token' })
  registerDevice(
    @Body() body: { userId: string; platform: 'WEB' | 'ANDROID' | 'IOS'; pushToken: string },
  ) {
    return this.deviceTokenService.registerDevice(body.userId, body.platform, body.pushToken);
  }

  @Get('devices')
  @ApiOperation({ summary: 'List Registered User Devices' })
  getUserDevices(@Query('userId') userId: string = 'usr_customer_demo') {
    return this.deviceTokenService.getUserDevices(userId);
  }

  @Delete('devices/:deviceId')
  @ApiOperation({ summary: 'Deactivate Push Device Token' })
  deactivateDevice(
    @Param('deviceId') deviceId: string,
    @Query('userId') userId: string = 'usr_customer_demo',
  ) {
    return { success: this.deviceTokenService.deactivateDevice(deviceId, userId) };
  }
}
