import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export interface InAppNotification {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  deepLink?: string;
  readAt?: string | null;
  createdAt: string;
  recipientEmail?: string;
  recipientPhone?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'user_notifications.json');

class NotificationStore {
  private cache: Map<string, InAppNotification> = new Map();
  private isLoaded = false;

  private ensureLoaded(): void {
    if (this.isLoaded) return;
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const list: InAppNotification[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((n) => {
            if (n.id) this.cache.set(n.id, n);
          });
        }
      }
    } catch (err) {
      console.error('[NotificationStore] Error loading user notifications:', err);
    }
    this.isLoaded = true;
  }

  private persist(): void {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(this.cache.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('[NotificationStore] Error persisting notifications:', err);
    }
  }

  /**
   * Create and record a new in-app notification.
   */
  public async createNotification(input: {
    userId?: string;
    recipientEmail?: string;
    recipientPhone?: string;
    title: string;
    message: string;
    category?: string;
    type?: string;
    deepLink?: string;
    metadata?: Record<string, any>;
  }): Promise<InAppNotification> {
    this.ensureLoaded();

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const notif: InAppNotification = {
      id,
      userId: input.userId,
      recipientEmail: input.recipientEmail ? input.recipientEmail.trim().toLowerCase() : undefined,
      recipientPhone: input.recipientPhone ? input.recipientPhone.trim() : undefined,
      title: input.title,
      message: input.message,
      category: input.category || 'support',
      type: input.type || 'action',
      deepLink: input.deepLink || '/notifications',
      readAt: null,
      createdAt: now,
      metadata: input.metadata,
    };

    this.cache.set(id, notif);
    this.persist();

    // Supabase insert attempt
    try {
      const supabase = getSupabaseServerClient();
      await supabase.from('user_notifications').insert({
        id,
        user_id: notif.userId || null,
        title: notif.title,
        body: notif.message,
        type: notif.type,
        metadata: {
          category: notif.category,
          deepLink: notif.deepLink,
          recipientEmail: notif.recipientEmail,
          recipientPhone: notif.recipientPhone,
          ...notif.metadata,
        },
        is_read: false,
        created_at: now,
      });
    } catch {
      // Local ledger guarantees persistence
    }

    return notif;
  }

  /**
   * Retrieve notifications matching a user ID, email address, or phone.
   */
  public getNotifications(filters?: {
    userId?: string;
    email?: string;
    phone?: string;
    limit?: number;
  }): InAppNotification[] {
    this.ensureLoaded();

    let list = Array.from(this.cache.values());

    const email = filters?.email ? filters.email.trim().toLowerCase() : '';
    const userId = filters?.userId ? filters.userId.trim() : '';

    if (email || userId) {
      list = list.filter((n) => {
        const matchesEmail = Boolean(email && n.recipientEmail && n.recipientEmail.toLowerCase() === email);
        const matchesUser = Boolean(userId && n.userId && n.userId === userId);
        const isBroadcast = !n.recipientEmail && !n.userId;
        return matchesEmail || matchesUser || isBroadcast;
      });
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filters?.limit && filters.limit > 0) {
      list = list.slice(0, filters.limit);
    }

    return list;
  }

  /**
   * Returns count of unread notifications for a user/email.
   */
  public getUnreadCount(filters?: { userId?: string; email?: string }): number {
    const list = this.getNotifications(filters);
    return list.filter((n) => !n.readAt).length;
  }

  /**
   * Mark a specific notification as read.
   */
  public markAsRead(id: string): boolean {
    this.ensureLoaded();
    const item = this.cache.get(id);
    if (!item) return false;
    item.readAt = new Date().toISOString();
    this.cache.set(id, item);
    this.persist();
    return true;
  }

  /**
   * Mark all notifications matching filters as read.
   */
  public markAllAsRead(filters?: { userId?: string; email?: string }): number {
    this.ensureLoaded();
    const list = this.getNotifications(filters);
    let count = 0;
    const now = new Date().toISOString();
    for (const item of list) {
      if (!item.readAt) {
        item.readAt = now;
        this.cache.set(item.id, item);
        count++;
      }
    }
    if (count > 0) {
      this.persist();
    }
    return count;
  }
}

export const notificationStore = new NotificationStore();

