import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionDto {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

export interface DeviceInfoDto {
  userAgent?: string;
  deviceType?: string;
  browser?: string;
}

export interface CanonicalNotificationPayload {
  id?: string;
  type: 'TRIP_REMINDER' | 'TRIP_UPDATE' | 'BOOKING_UPDATE' | 'ITINERARY_READY' | 'TRIP_STARTED' | 'TRIP_COMPLETED' | 'SYSTEM' | 'MARKETING';
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

const DEMO_UUID = '00000000-0000-0000-0000-000000000001';

function isUuid(id: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
}

@Injectable()
export class WebPushService implements OnModuleInit {
  private readonly logger = new Logger(WebPushService.name);
  private vapidPublicKey: string;
  private vapidPrivateKey: string;
  private vapidSubject: string;

  // In-memory fallback stores for offline/mock database environments
  private readonly memorySubscriptions = new Map<string, any>();
  private readonly memoryPreferences = new Map<string, any>();
  private readonly memoryNotifications = new Map<string, any>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.vapidPublicKey =
      this.configService.get<string>('NEXT_PUBLIC_VAPID_PUBLIC_KEY') ||
      this.configService.get<string>('VAPID_PUBLIC_KEY') ||
      'BApbADPRNeXRqYEZg6FqX9vEQQsj6xNGjbvnQvW8RGkNroxdrZLqa1zE_viOflnvTiaCMdh_qUrXEnRyPgksglA';

    this.vapidPrivateKey =
      this.configService.get<string>('VAPID_PRIVATE_KEY') ||
      'ODiCaslx-dv9LcJeTRDnY6IizoiOeKFXk10mlMEtpxA';

    this.vapidSubject =
      this.configService.get<string>('VAPID_SUBJECT') || 'mailto:notifications@bharatyatra.in';

    if (this.vapidPublicKey && this.vapidPrivateKey) {
      try {
        webpush.setVapidDetails(this.vapidSubject, this.vapidPublicKey, this.vapidPrivateKey);
        this.logger.log('Web Push VAPID credentials successfully configured');
      } catch (error) {
        this.logger.error(`Failed to configure VAPID credentials: ${error.message}`);
      }
    } else {
      this.logger.warn('VAPID keys not configured! Web Push notifications will be simulated.');
    }
  }

  getVapidPublicKey(): { publicKey: string } {
    return { publicKey: this.vapidPublicKey };
  }

  private normalizeUserId(userId: string): string {
    if (!userId || userId === 'usr_customer_demo') return DEMO_UUID;
    return isUuid(userId) ? userId : DEMO_UUID;
  }

  async subscribe(
    userId: string,
    subscription: PushSubscriptionDto,
    device?: DeviceInfoDto,
  ) {
    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      throw new BadRequestException('Invalid push subscription payload');
    }

    const { endpoint, keys } = subscription;
    const userAgent = device?.userAgent || '';
    const deviceType = device?.deviceType || this.detectDeviceType(userAgent);
    const browser = device?.browser || this.detectBrowser(userAgent);
    const targetUserId = this.normalizeUserId(userId);

    let pushSub: any = null;
    let isNew = false;

    // Try Prisma DB with in-memory fallback
    try {
      const existing = await this.prisma.pushSubscription.findUnique({
        where: { endpoint },
      });
      isNew = !existing;

      pushSub = await this.prisma.pushSubscription.upsert({
        where: { endpoint },
        update: {
          userId: targetUserId,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent,
          deviceType,
          browser,
          isActive: true,
          lastUsedAt: new Date(),
        },
        create: {
          userId: targetUserId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent,
          deviceType,
          browser,
          isActive: true,
          lastUsedAt: new Date(),
        },
      });
      this.logger.log(`Prisma: Push subscription registered for user ${targetUserId} (${browser} on ${deviceType})`);
    } catch (e: any) {
      this.logger.warn(`Prisma offline or error (${e.message}). Falling back to memory store.`);
      const existing = this.memorySubscriptions.get(endpoint);
      isNew = !existing;

      pushSub = {
        id: existing?.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: targetUserId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
        deviceType,
        browser,
        isActive: true,
        lastUsedAt: new Date(),
        createdAt: existing?.createdAt || new Date(),
      };
      this.memorySubscriptions.set(endpoint, pushSub);
    }

    // Ensure preferences are set
    await this.ensureUserPreferences(targetUserId);

    // Send single welcome test notification on new subscription
    if (isNew) {
      await this.sendWelcomeNotification(targetUserId, pushSub);
    }

    return {
      success: true,
      subscriptionId: pushSub.id,
      device: {
        id: pushSub.id,
        deviceType: pushSub.deviceType,
        browser: pushSub.browser,
        isActive: pushSub.isActive,
        createdAt: pushSub.createdAt,
      },
    };
  }

  async unsubscribe(userId: string, endpoint: string) {
    if (!endpoint) {
      throw new BadRequestException('Endpoint required for unsubscription');
    }

    const targetUserId = this.normalizeUserId(userId);

    try {
      const existing = await this.prisma.pushSubscription.findFirst({
        where: { endpoint, userId: targetUserId },
      });

      if (existing) {
        await this.prisma.pushSubscription.update({
          where: { id: existing.id },
          data: { isActive: false },
        });
      }
    } catch (e) {
      const memSub = this.memorySubscriptions.get(endpoint);
      if (memSub) {
        memSub.isActive = false;
      }
    }

    return { success: true, message: 'Push subscription deactivated' };
  }

  async getUserDevices(userId: string) {
    const targetUserId = this.normalizeUserId(userId);

    try {
      const subs = await this.prisma.pushSubscription.findMany({
        where: { userId: targetUserId, isActive: true },
        orderBy: { updatedAt: 'desc' },
      });

      return subs.map((sub) => ({
        id: sub.id,
        deviceType: sub.deviceType || 'Desktop',
        browser: sub.browser || 'Chrome',
        endpoint: sub.endpoint,
        isActive: sub.isActive,
        lastUsedAt: sub.lastUsedAt || sub.createdAt,
        createdAt: sub.createdAt,
      }));
    } catch (e) {
      const memSubs = Array.from(this.memorySubscriptions.values()).filter(
        (s) => (s.userId === targetUserId || s.userId === userId) && s.isActive,
      );

      return memSubs.map((sub) => ({
        id: sub.id,
        deviceType: sub.deviceType || 'Desktop',
        browser: sub.browser || 'Chrome',
        endpoint: sub.endpoint,
        isActive: sub.isActive,
        lastUsedAt: sub.lastUsedAt || sub.createdAt,
        createdAt: sub.createdAt,
      }));
    }
  }

  async removeDevice(userId: string, subscriptionId: string) {
    const targetUserId = this.normalizeUserId(userId);

    try {
      const existing = await this.prisma.pushSubscription.findFirst({
        where: { id: subscriptionId, userId: targetUserId },
      });

      if (existing) {
        await this.prisma.pushSubscription.update({
          where: { id: subscriptionId },
          data: { isActive: false },
        });
      }
    } catch (e) {
      for (const [ep, sub] of this.memorySubscriptions.entries()) {
        if (sub.id === subscriptionId) {
          sub.isActive = false;
        }
      }
    }

    return { success: true, message: 'Device subscription removed' };
  }

  async sendToUser(userId: string, payload: CanonicalNotificationPayload) {
    const targetUserId = this.normalizeUserId(userId);

    // 1. Check user notification preferences
    const preferences = await this.getPreferences(targetUserId);
    if (!this.isCategoryEnabled(preferences, payload.type)) {
      this.logger.log(`Push notification skipped for user ${userId}: preference disabled for ${payload.type}`);
      return { success: false, reason: 'PREFERENCE_DISABLED', sentCount: 0 };
    }

    // 2. Fetch all active subscriptions for user
    let subscriptions: any[] = [];
    try {
      subscriptions = await this.prisma.pushSubscription.findMany({
        where: { userId: targetUserId, isActive: true },
      });
    } catch (e) {
      subscriptions = Array.from(this.memorySubscriptions.values()).filter(
        (s) => (s.userId === targetUserId || s.userId === userId) && s.isActive,
      );
    }

    const notification = await this.createInAppNotification(targetUserId, payload);

    if (subscriptions.length === 0) {
      this.logger.log(`No active push subscriptions for user ${userId}`);
      return { success: true, sentCount: 0, note: 'Saved in-app only', notificationId: notification.id };
    }

    // 3. Send web push to active user devices
    const pushPayload = JSON.stringify({
      id: notification.id,
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/logo.png',
      badge: payload.badge || '/logo.png',
      url: payload.url || '/notifications',
      type: payload.type,
      data: {
        ...payload.data,
        url: payload.url || '/notifications',
        notificationId: notification.id,
      },
    });

    let successCount = 0;
    let failureCount = 0;

    for (const sub of subscriptions) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, pushPayload);
        successCount++;

        // Update DB or memory lastUsedAt
        try {
          await this.prisma.pushSubscription.update({
            where: { id: sub.id },
            data: { lastUsedAt: new Date() },
          });
        } catch (e) {
          sub.lastUsedAt = new Date();
        }
      } catch (err: any) {
        failureCount++;
        this.logger.warn(`Push dispatch failed for endpoint ${sub.endpoint.substring(0, 30)}...: ${err.message}`);

        // Deactivate dead subscription (404/410)
        if (err.statusCode === 404 || err.statusCode === 410) {
          try {
            await this.prisma.pushSubscription.update({
              where: { id: sub.id },
              data: { isActive: false },
            });
          } catch (e) {
            sub.isActive = false;
          }
        }
      }
    }

    this.logger.log(
      `Sent push notification "${payload.title}" to user ${userId} across ${successCount}/${subscriptions.length} devices`,
    );

    return {
      success: successCount > 0,
      sentCount: successCount,
      failedCount: failureCount,
      notificationId: notification.id,
    };
  }

  async sendTestNotification(userId: string) {
    return this.sendToUser(userId, {
      type: 'SYSTEM',
      title: 'BharatYatra notifications enabled ✓',
      body: "You're all set. We'll keep you updated about your journeys.",
      url: '/profile',
      data: { test: true },
    });
  }

  private async createInAppNotification(userId: string, payload: CanonicalNotificationPayload) {
    const targetUserId = this.normalizeUserId(userId);
    try {
      return await this.prisma.notification.create({
        data: {
          userId: targetUserId,
          type: payload.type,
          category: this.mapTypeToCategory(payload.type),
          title: payload.title,
          message: payload.body,
          deepLink: payload.url || '/notifications',
          data: payload.data ? (payload.data as any) : undefined,
        },
      });
    } catch (e) {
      const mockNotif = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: targetUserId,
        type: payload.type,
        category: this.mapTypeToCategory(payload.type),
        title: payload.title,
        message: payload.body,
        deepLink: payload.url || '/notifications',
        data: payload.data || null,
        readAt: null,
        createdAt: new Date(),
      };
      this.memoryNotifications.set(mockNotif.id, mockNotif);
      return mockNotif;
    }
  }

  private async ensureUserPreferences(userId: string) {
    const targetUserId = this.normalizeUserId(userId);
    try {
      const existing = await this.prisma.notificationPreference.findUnique({
        where: { userId: targetUserId },
      });

      if (!existing) {
        await this.prisma.notificationPreference.create({
          data: {
            userId: targetUserId,
            tripReminders: true,
            bookingUpdates: true,
            tripUpdates: true,
            aiUpdates: true,
            marketing: false,
          },
        });
      }
    } catch (e) {
      if (!this.memoryPreferences.has(targetUserId)) {
        this.memoryPreferences.set(targetUserId, {
          userId: targetUserId,
          tripReminders: true,
          bookingUpdates: true,
          tripUpdates: true,
          aiUpdates: true,
          marketing: false,
        });
      }
    }
  }

  async getPreferences(userId: string) {
    const targetUserId = this.normalizeUserId(userId);
    try {
      let pref = await this.prisma.notificationPreference.findUnique({
        where: { userId: targetUserId },
      });

      if (!pref) {
        pref = await this.prisma.notificationPreference.create({
          data: {
            userId: targetUserId,
            tripReminders: true,
            bookingUpdates: true,
            tripUpdates: true,
            aiUpdates: true,
            marketing: false,
          },
        });
      }

      return pref;
    } catch (e) {
      if (!this.memoryPreferences.has(targetUserId)) {
        this.memoryPreferences.set(targetUserId, {
          userId: targetUserId,
          tripReminders: true,
          bookingUpdates: true,
          tripUpdates: true,
          aiUpdates: true,
          marketing: false,
        });
      }
      return this.memoryPreferences.get(targetUserId);
    }
  }

  async updatePreferences(userId: string, dto: {
    tripReminders?: boolean;
    bookingUpdates?: boolean;
    tripUpdates?: boolean;
    aiUpdates?: boolean;
    marketing?: boolean;
  }) {
    const targetUserId = this.normalizeUserId(userId);
    try {
      await this.ensureUserPreferences(targetUserId);

      return await this.prisma.notificationPreference.update({
        where: { userId: targetUserId },
        data: {
          ...(dto.tripReminders !== undefined && { tripReminders: dto.tripReminders }),
          ...(dto.bookingUpdates !== undefined && { bookingUpdates: dto.bookingUpdates }),
          ...(dto.tripUpdates !== undefined && { tripUpdates: dto.tripUpdates }),
          ...(dto.aiUpdates !== undefined && { aiUpdates: dto.aiUpdates }),
          ...(dto.marketing !== undefined && { marketing: dto.marketing }),
        },
      });
    } catch (e) {
      const current = (await this.getPreferences(targetUserId)) || {};
      const updated = {
        ...current,
        ...(dto.tripReminders !== undefined && { tripReminders: dto.tripReminders }),
        ...(dto.bookingUpdates !== undefined && { bookingUpdates: dto.bookingUpdates }),
        ...(dto.tripUpdates !== undefined && { tripUpdates: dto.tripUpdates }),
        ...(dto.aiUpdates !== undefined && { aiUpdates: dto.aiUpdates }),
        ...(dto.marketing !== undefined && { marketing: dto.marketing }),
      };
      this.memoryPreferences.set(targetUserId, updated);
      return updated;
    }
  }

  private isCategoryEnabled(pref: any, type: string): boolean {
    if (!pref) return true;
    switch (type) {
      case 'TRIP_REMINDER':
      case 'TRIP_STARTED':
      case 'TRIP_COMPLETED':
        return pref.tripReminders ?? true;
      case 'BOOKING_UPDATE':
        return pref.bookingUpdates ?? true;
      case 'TRIP_UPDATE':
        return pref.tripUpdates ?? true;
      case 'ITINERARY_READY':
        return pref.aiUpdates ?? true;
      case 'MARKETING':
        return pref.marketing ?? false;
      default:
        return true;
    }
  }

  private mapTypeToCategory(type: string): string {
    switch (type) {
      case 'BOOKING_UPDATE':
        return 'BOOKING';
      case 'TRIP_REMINDER':
      case 'TRIP_UPDATE':
      case 'TRIP_STARTED':
      case 'TRIP_COMPLETED':
        return 'TRIP';
      case 'ITINERARY_READY':
        return 'AI';
      case 'MARKETING':
        return 'MARKETING';
      default:
        return 'SYSTEM';
    }
  }

  private async sendWelcomeNotification(userId: string, pushSub: any) {
    try {
      const payload = JSON.stringify({
        title: 'BharatYatra notifications enabled ✓',
        body: "You're all set. We'll keep you updated about your journeys.",
        icon: '/logo.png',
        badge: '/logo.png',
        url: '/profile',
        type: 'SYSTEM',
        data: { welcome: true, url: '/profile' },
      });

      await webpush.sendNotification(
        {
          endpoint: pushSub.endpoint,
          keys: { p256dh: pushSub.p256dh, auth: pushSub.auth },
        },
        payload,
      );
      this.logger.log(`Sent initial welcome push to user ${userId}`);
    } catch (e: any) {
      this.logger.warn(`Could not send initial welcome push: ${e.message}`);
    }
  }

  private detectDeviceType(userAgent: string): string {
    if (!userAgent) return 'desktop';
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  private detectBrowser(userAgent: string): string {
    if (!userAgent) return 'Chrome';
    if (/edg/i.test(userAgent)) return 'Edge';
    if (/chrome|crios/i.test(userAgent)) return 'Chrome';
    if (/firefox|fxios/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    return 'Browser';
  }
}
