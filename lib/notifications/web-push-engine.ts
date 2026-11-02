/**
 * BharatYatra — Production Web Push & VAPID Delivery Engine
 * Sends encrypted push notifications to background service workers across
 * Chrome, Firefox, Edge, and iOS Safari.
 */

import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushDeviceMeta {
  userAgent?: string;
  deviceType?: string; // Mobile, Tablet, Desktop
  browser?: string; // Chrome, Safari, Firefox, Edge
}

export interface PushSubscriptionRecord {
  id: string;
  userId: string;
  endpoint: string;
  keys: PushSubscriptionKeys;
  device: PushDeviceMeta;
  createdAt: string;
  lastUsedAt: string;
  revokedAt?: string | null;
}

export interface CustomerNotificationPreferences {
  userId: string;
  pushEnabled: boolean;
  tripNotifications: boolean;
  bookingNotifications: boolean;
  tripCompletion: boolean;
  reviewResponses: boolean;
  marketingNotifications: boolean;
  updatedAt: string;
}

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'data', 'push_subscriptions.json');
const PREFERENCES_FILE = path.join(process.cwd(), 'data', 'notification_preferences.json');

// VAPID Credentials
const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BF9-PbGBPHCddILdUA8S5kcw_AR8yhBhXxgIqsf7ud2vvgk79FlN7LF30rJZbppx5gwawHU04U9Fg8CJhkHRwq4';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || 'UJvp9H0BIH_NOt1DkAIG768C9SrMAEgwmUjKgqk7bfA';
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || 'mailto:notifications@bharatyatra.in';

let vapidConfigured = false;
function ensureVapidConfigured() {
  if (vapidConfigured) return;
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    vapidConfigured = true;
  } catch (err) {
    console.warn('[WebPushEngine] VAPID configuration notice:', err);
  }
}

class WebPushEngine {
  private subscriptions: Map<string, PushSubscriptionRecord> = new Map();
  private preferences: Map<string, CustomerNotificationPreferences> = new Map();
  private isLoaded = false;

  private ensureLoaded(): void {
    if (this.isLoaded) return;
    try {
      // Subscriptions
      const subDir = path.dirname(SUBSCRIPTIONS_FILE);
      if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });

      if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
        const raw = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8');
        const list: PushSubscriptionRecord[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((s) => {
            if (s.endpoint) this.subscriptions.set(s.endpoint, s);
          });
        }
      }

      // Preferences
      if (fs.existsSync(PREFERENCES_FILE)) {
        const raw = fs.readFileSync(PREFERENCES_FILE, 'utf8');
        const list: CustomerNotificationPreferences[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((p) => {
            if (p.userId) this.preferences.set(p.userId, p);
          });
        }
      }
    } catch (err) {
      console.error('[WebPushEngine] Error loading records:', err);
    }
    this.isLoaded = true;
  }

  private persistSubscriptions(): void {
    try {
      const list = Array.from(this.subscriptions.values());
      fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('[WebPushEngine] Error persisting subscriptions:', err);
    }
  }

  private persistPreferences(): void {
    try {
      const list = Array.from(this.preferences.values());
      fs.writeFileSync(PREFERENCES_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('[WebPushEngine] Error persisting preferences:', err);
    }
  }

  /**
   * Save or refresh browser push subscription for a user device.
   */
  public saveSubscription(input: {
    userId: string;
    endpoint: string;
    keys: PushSubscriptionKeys;
    device?: PushDeviceMeta;
  }): PushSubscriptionRecord {
    this.ensureLoaded();

    if (!input.endpoint || !input.keys?.p256dh || !input.keys?.auth) {
      throw new Error('Valid push subscription endpoint and encryption keys are required.');
    }

    const now = new Date().toISOString();
    const existing = this.subscriptions.get(input.endpoint);

    if (existing) {
      existing.userId = input.userId;
      existing.keys = input.keys;
      existing.device = input.device || existing.device;
      existing.lastUsedAt = now;
      existing.revokedAt = null;
      this.persistSubscriptions();
      return existing;
    }

    const record: PushSubscriptionRecord = {
      id: `sub_${crypto.randomUUID().substring(0, 12)}`,
      userId: input.userId,
      endpoint: input.endpoint,
      keys: input.keys,
      device: input.device || {
        deviceType: 'Desktop',
        browser: 'Browser',
      },
      createdAt: now,
      lastUsedAt: now,
      revokedAt: null,
    };

    this.subscriptions.set(input.endpoint, record);
    this.persistSubscriptions();
    return record;
  }

  public getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY;
  }

  /**
   * Revoke or remove a push subscription by record ID.
   */
  public removeDeviceById(deviceId: string, userId?: string): boolean {
    this.ensureLoaded();
    for (const [endpoint, record] of Array.from(this.subscriptions.entries())) {
      if (record.id === deviceId) {
        if (userId && record.userId !== userId) return false;
        record.revokedAt = new Date().toISOString();
        this.subscriptions.delete(endpoint);
        this.persistSubscriptions();
        return true;
      }
    }
    return false;
  }

  /**
   * Revoke or remove a push subscription.
   */
  public removeSubscription(endpoint: string, userId?: string): boolean {
    this.ensureLoaded();
    const sub = this.subscriptions.get(endpoint);
    if (!sub) return false;
    if (userId && sub.userId !== userId) return false;

    sub.revokedAt = new Date().toISOString();
    this.subscriptions.delete(endpoint);
    this.persistSubscriptions();
    return true;
  }

  /**
   * Get all active subscriptions for a customer (supports multiple devices).
   */
  public getUserSubscriptions(userId: string): PushSubscriptionRecord[] {
    this.ensureLoaded();
    return Array.from(this.subscriptions.values()).filter(
      (s) => s.userId === userId && !s.revokedAt
    );
  }

  /**
   * Get all subscriptions (administrative overview).
   */
  public getAllSubscriptions(): PushSubscriptionRecord[] {
    this.ensureLoaded();
    return Array.from(this.subscriptions.values());
  }

  /**
   * Get customer notification preferences.
   */
  public getPreferences(userId: string): CustomerNotificationPreferences {
    this.ensureLoaded();
    const existing = this.preferences.get(userId);
    if (existing) return existing;

    const defaultPrefs: CustomerNotificationPreferences = {
      userId,
      pushEnabled: true,
      tripNotifications: true,
      bookingNotifications: true,
      tripCompletion: true,
      reviewResponses: true,
      marketingNotifications: false, // Default opt-in strictly false for promotional alerts
      updatedAt: new Date().toISOString(),
    };
    this.preferences.set(userId, defaultPrefs);
    this.persistPreferences();
    return defaultPrefs;
  }

  /**
   * Update customer notification preferences.
   */
  public updatePreferences(
    userId: string,
    updates: Partial<CustomerNotificationPreferences>
  ): CustomerNotificationPreferences {
    this.ensureLoaded();
    const current = this.getPreferences(userId);
    const updated: CustomerNotificationPreferences = {
      ...current,
      ...updates,
      userId,
      updatedAt: new Date().toISOString(),
    };
    this.preferences.set(userId, updated);
    this.persistPreferences();
    return updated;
  }

  /**
   * Dispatch background Web Push notification to all active devices of a customer.
   */
  public async sendPushNotification(
    userId: string,
    payload: {
      title: string;
      body: string;
      url?: string;
      icon?: string;
      badge?: string;
      category?: 'trip' | 'booking' | 'review' | 'marketing' | 'system';
      data?: Record<string, any>;
    }
  ): Promise<{ sent: number; failed: number; totalDevices: number }> {
    this.ensureLoaded();
    ensureVapidConfigured();

    // Verify preferences
    const prefs = this.getPreferences(userId);
    if (!prefs.pushEnabled) {
      return { sent: 0, failed: 0, totalDevices: 0 };
    }
    if (payload.category === 'trip' && !prefs.tripNotifications) return { sent: 0, failed: 0, totalDevices: 0 };
    if (payload.category === 'booking' && !prefs.bookingNotifications) return { sent: 0, failed: 0, totalDevices: 0 };
    if (payload.category === 'review' && !prefs.reviewResponses) return { sent: 0, failed: 0, totalDevices: 0 };
    if (payload.category === 'marketing' && !prefs.marketingNotifications) return { sent: 0, failed: 0, totalDevices: 0 };

    const userSubs = this.getUserSubscriptions(userId);
    if (userSubs.length === 0) {
      return { sent: 0, failed: 0, totalDevices: 0 };
    }

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/logo.png',
      badge: payload.badge || '/logo.png',
      url: payload.url || '/notifications',
      deepLink: payload.url || '/notifications',
      category: payload.category || 'trip',
      data: payload.data || {},
    });

    let sent = 0;
    let failed = 0;

    for (const sub of userSubs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          pushPayload
        );
        sub.lastUsedAt = new Date().toISOString();
        sent++;
      } catch (err: any) {
        failed++;
        // If subscription is 410 Gone or 404 Not Found, unsubscribe invalid endpoint
        if (err.statusCode === 410 || err.statusCode === 404) {
          this.removeSubscription(sub.endpoint, userId);
        }
      }
    }

    this.persistSubscriptions();
    return { sent, failed, totalDevices: userSubs.length };
  }
}

export const webPushEngine = new WebPushEngine();
