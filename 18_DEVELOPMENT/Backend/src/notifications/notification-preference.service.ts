import { Injectable, Logger } from '@nestjs/common';

export interface UserNotificationPreference {
  userId: string;
  category: 'BOOKING' | 'PAYMENT' | 'REFUND' | 'TRIP' | 'ADAPTIVE_AI' | 'MARKETING' | 'SYSTEM';
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  whatsappEnabled: boolean;
  quietHoursStart?: string; // HH:mm format, e.g. "22:00"
  quietHoursEnd?: string;   // HH:mm format, e.g. "07:00"
}

@Injectable()
export class NotificationPreferenceService {
  private readonly logger = new Logger(NotificationPreferenceService.name);

  // In-memory representation backed by safe default fallback
  private preferences: Map<string, UserNotificationPreference[]> = new Map();

  constructor() {
    this.logger.log('Notification Preference Engine Initialized');
  }

  getPreferences(userId: string): UserNotificationPreference[] {
    if (!this.preferences.has(userId)) {
      return this.getDefaultPreferences(userId);
    }
    return this.preferences.get(userId)!;
  }

  updatePreferences(userId: string, updates: Partial<UserNotificationPreference>[]): UserNotificationPreference[] {
    const current = this.getPreferences(userId);
    const updated = current.map((pref) => {
      const match = updates.find((u) => u.category === pref.category);
      return match ? { ...pref, ...match } : pref;
    });
    this.preferences.set(userId, updated);
    return updated;
  }

  isChannelEnabled(
    userId: string,
    category: UserNotificationPreference['category'],
    channel: 'EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP',
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
  ): boolean {
    // Transactional mandatory notifications (URGENT priority or non-marketing essential alerts) cannot be disabled
    if (priority === 'URGENT' && category !== 'MARKETING') {
      return true;
    }

    const prefs = this.getPreferences(userId);
    const categoryPref = prefs.find((p) => p.category === category);
    if (!categoryPref) return true;

    // Evaluate quiet hours
    if (this.isQuietHoursActive(categoryPref) && priority !== 'URGENT') {
      this.logger.debug(`Notification suppressed for user ${userId} during quiet hours (category: ${category})`);
      return false;
    }

    switch (channel) {
      case 'EMAIL':
        return categoryPref.emailEnabled;
      case 'SMS':
        return categoryPref.smsEnabled;
      case 'PUSH':
        return categoryPref.pushEnabled;
      case 'WHATSAPP':
        return categoryPref.whatsappEnabled;
      default:
        return true;
    }
  }

  private isQuietHoursActive(pref: UserNotificationPreference): boolean {
    if (!pref.quietHoursStart || !pref.quietHoursEnd) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = pref.quietHoursStart.split(':').map(Number);
    const [endH, endM] = pref.quietHoursEnd.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes > endMinutes) {
      // Overnight quiet hours (e.g. 22:00 to 07:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    } else {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
  }

  private getDefaultPreferences(userId: string): UserNotificationPreference[] {
    const categories: UserNotificationPreference['category'][] = [
      'BOOKING',
      'PAYMENT',
      'REFUND',
      'TRIP',
      'ADAPTIVE_AI',
      'MARKETING',
      'SYSTEM',
    ];
    return categories.map((cat) => ({
      userId,
      category: cat,
      emailEnabled: true,
      smsEnabled: cat === 'BOOKING' || cat === 'PAYMENT' || cat === 'REFUND',
      pushEnabled: true,
      whatsappEnabled: cat !== 'MARKETING',
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    }));
  }
}
