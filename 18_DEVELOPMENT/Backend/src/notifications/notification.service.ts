import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationTemplateEngine } from './notification-template.engine';
import { DeviceTokenService } from './device-token.service';
import { EmailProviderAdapter } from './providers/email-provider.adapter';
import { SMSProviderAdapter } from './providers/sms-provider.adapter';
import { PushProviderAdapter } from './providers/push-provider.adapter';
import { WhatsAppProviderAdapter } from './providers/whatsapp-provider.adapter';

export interface DispatchNotificationRequest {
  eventId: string;
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  category: 'BOOKING' | 'PAYMENT' | 'REFUND' | 'TRIP' | 'ADAPTIVE_AI' | 'MARKETING' | 'SYSTEM';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  templateId: string;
  templateVersion: string;
  locale?: 'en' | 'gu' | 'hi';
  channels: ('PUSH' | 'EMAIL' | 'SMS' | 'WHATSAPP')[];
  variables?: Record<string, any>;
  deepLink?: string;
  supplierId?: string; // Optional isolation tag for supplier portal
  internalOnly?: boolean; // Tag for internal admin support notes
}

export interface NotificationRecord {
  notificationId: string;
  eventId: string;
  recipientId: string;
  category: 'BOOKING' | 'PAYMENT' | 'REFUND' | 'TRIP' | 'ADAPTIVE_AI' | 'MARKETING' | 'SYSTEM';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  templateId: string;
  templateVersion: string;
  channel: 'PUSH' | 'EMAIL' | 'SMS' | 'WHATSAPP';
  title: string;
  body: string;
  deepLink?: string;
  status: 'QUEUED' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'RETRYING' | 'EXPIRED';
  attempts: number;
  readStatus: 'UNREAD' | 'READ';
  readAt?: Date;
  supplierId?: string;
  internalOnly?: boolean;
  createdAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  // In-memory store for notification records & deduplication index
  private readonly notifications: Map<string, NotificationRecord> = new Map();
  private readonly deduplicationSet: Set<string> = new Set();

  constructor(
    private readonly preferenceService: NotificationPreferenceService,
    private readonly templateEngine: NotificationTemplateEngine,
    private readonly deviceTokenService: DeviceTokenService,
    private readonly emailAdapter: EmailProviderAdapter,
    private readonly smsAdapter: SMSProviderAdapter,
    private readonly pushAdapter: PushProviderAdapter,
    private readonly whatsappAdapter: WhatsAppProviderAdapter,
  ) {
    this.logger.log('Centralized Notification Service Initialized');
  }

  async dispatch(req: DispatchNotificationRequest): Promise<NotificationRecord[]> {
    const results: NotificationRecord[] = [];

    try {
      for (const channel of req.channels) {
        const dedupKey = `${req.eventId}_${req.recipientId}_${channel}`;
        if (this.deduplicationSet.has(dedupKey)) {
          this.logger.warn(`Duplicate notification event suppressed: ${dedupKey}`);
          continue;
        }
        this.deduplicationSet.add(dedupKey);

        // Check User Notification Preferences & Quiet Hours (Transactional alerts are bypass-protected)
        const isAllowed = this.preferenceService.isChannelEnabled(
          req.recipientId,
          req.category,
          channel,
          req.priority,
        );

        if (!isAllowed && req.category !== 'BOOKING' && req.category !== 'PAYMENT' && req.category !== 'REFUND') {
          this.logger.log(`Channel ${channel} disabled or quiet hours active for recipient ${req.recipientId}`);
          continue;
        }

        // Render versioned, localized template
        const rendered = this.templateEngine.render(
          req.templateId,
          req.templateVersion,
          req.locale || 'en',
          req.variables || {},
        );

        const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const record: NotificationRecord = {
          notificationId,
          eventId: req.eventId,
          recipientId: req.recipientId,
          category: req.category,
          priority: req.priority,
          templateId: req.templateId,
          templateVersion: req.templateVersion,
          channel,
          title: rendered.title,
          body: rendered.body,
          deepLink: req.deepLink,
          status: 'PROCESSING',
          attempts: 1,
          readStatus: 'UNREAD',
          supplierId: req.supplierId,
          internalOnly: req.internalOnly || false,
          createdAt: new Date(),
        };

        this.notifications.set(notificationId, record);

        // Deliver via channel provider adapter
        try {
          await this.deliverToChannel(channel, req, rendered, record);
          record.status = 'DELIVERED';
          record.sentAt = new Date();
          record.deliveredAt = new Date();
        } catch (err: any) {
          this.logger.error(`Failed to deliver notification ${notificationId} via ${channel}: ${err.message}`);
          record.status = 'FAILED';
          record.failedAt = new Date();
        }

        results.push(record);
      }
    } catch (err: any) {
      this.logger.error(`[NotificationService] Unexpected error during dispatch: ${err.message}`);
    }

    return results;
  }

  private async deliverToChannel(
    channel: 'PUSH' | 'EMAIL' | 'SMS' | 'WHATSAPP',
    req: DispatchNotificationRequest,
    rendered: { subject: string; title: string; body: string },
    record: NotificationRecord,
  ) {
    if (channel === 'EMAIL' && req.recipientEmail) {
      await this.emailAdapter.sendEmail({
        recipient: req.recipientEmail,
        subject: rendered.subject,
        body: rendered.body,
        templateId: `${req.templateId}_${req.templateVersion}`,
      });
    } else if (channel === 'SMS' && req.recipientPhone) {
      await this.smsAdapter.sendSMS({
        recipient: req.recipientPhone,
        message: `${rendered.title}: ${rendered.body}`,
      });
    } else if (channel === 'PUSH') {
      const devices = this.deviceTokenService.getUserDevices(req.recipientId);
      for (const dev of devices) {
        await this.pushAdapter.sendPushNotification({
          pushToken: dev.pushToken,
          title: rendered.title,
          body: rendered.body,
          deepLink: req.deepLink,
        });
      }
    } else if (channel === 'WHATSAPP' && req.recipientPhone) {
      await this.whatsappAdapter.sendWhatsAppMessage({
        recipientPhone: req.recipientPhone,
        templateName: req.templateId,
        templateParams: req.variables || {},
      });
    }
  }

  // --- Domain Event Helpers ---

  async notifyBookingCreated(booking: any) {
    // Notify Customer
    if (booking.userId) {
      await this.dispatch({
        eventId: `evt_bk_create_${booking.id}`,
        recipientId: booking.userId,
        recipientEmail: booking.user?.email,
        recipientPhone: booking.user?.phoneNumber,
        category: 'BOOKING',
        priority: 'HIGH',
        templateId: 'booking_confirmed',
        templateVersion: 'v1.0',
        channels: ['EMAIL', 'PUSH'],
        variables: {
          user_name: booking.user?.fullName || 'Traveler',
          booking_reference: booking.bookingReference,
          service_name: booking.inventoryTitle || booking.bookingType,
          date: booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'Upcoming',
        },
        deepLink: `/bookings/${booking.id}`,
      });
    }

    // Notify Supplier if present
    if (booking.supplierId && booking.supplier?.userId) {
      await this.dispatch({
        eventId: `evt_bk_create_sup_${booking.id}`,
        recipientId: booking.supplier.userId,
        recipientEmail: booking.supplier?.email,
        category: 'BOOKING',
        priority: 'HIGH',
        templateId: 'booking_confirmed',
        templateVersion: 'v1.0',
        channels: ['EMAIL', 'PUSH'],
        supplierId: booking.supplierId,
        variables: {
          user_name: booking.supplier?.businessName || 'Partner',
          booking_reference: booking.bookingReference,
          service_name: booking.inventoryTitle || booking.bookingType,
          date: booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'Upcoming',
        },
        deepLink: `/supplier/bookings/${booking.id}`,
      });
    }
  }

  async notifyBookingConfirmed(booking: any) {
    if (booking.userId) {
      await this.dispatch({
        eventId: `evt_bk_confirm_${booking.id}`,
        recipientId: booking.userId,
        recipientEmail: booking.user?.email,
        category: 'BOOKING',
        priority: 'HIGH',
        templateId: 'booking_confirmed',
        templateVersion: 'v1.0',
        channels: ['EMAIL', 'PUSH'],
        variables: {
          user_name: booking.user?.fullName || 'Traveler',
          booking_reference: booking.bookingReference,
          service_name: booking.inventoryTitle || booking.bookingType,
          date: booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'Upcoming',
        },
        deepLink: `/bookings/${booking.id}`,
      });
    }
  }

  async notifyBookingRejected(booking: any) {
    if (booking.userId) {
      await this.dispatch({
        eventId: `evt_bk_reject_${booking.id}`,
        recipientId: booking.userId,
        recipientEmail: booking.user?.email,
        category: 'BOOKING',
        priority: 'URGENT',
        templateId: 'booking_confirmed',
        templateVersion: 'v1.0',
        channels: ['EMAIL', 'PUSH'],
        variables: {
          user_name: booking.user?.fullName || 'Traveler',
          booking_reference: booking.bookingReference,
          service_name: booking.inventoryTitle || booking.bookingType,
          date: 'N/A',
        },
        deepLink: `/bookings/${booking.id}`,
      });
    }
  }

  async notifyBookingCancelled(booking: any, cancelledByRole: string) {
    const recipientId = cancelledByRole === 'CUSTOMER' && booking.supplier?.userId
      ? booking.supplier.userId
      : booking.userId;

    if (recipientId) {
      await this.dispatch({
        eventId: `evt_bk_cancel_${booking.id}_${cancelledByRole}`,
        recipientId,
        recipientEmail: booking.user?.email || booking.supplier?.email,
        category: 'BOOKING',
        priority: 'HIGH',
        templateId: 'booking_confirmed',
        templateVersion: 'v1.0',
        channels: ['EMAIL', 'PUSH'],
        variables: {
          user_name: 'User',
          booking_reference: booking.bookingReference,
          service_name: booking.inventoryTitle || booking.bookingType,
          date: 'Cancelled',
        },
        deepLink: `/bookings/${booking.id}`,
      });
    }
  }

  async notifyPaymentSuccess(payment: any, booking: any) {
    if (booking && booking.userId) {
      await this.dispatch({
        eventId: `evt_pay_success_${payment.id}`,
        recipientId: booking.userId,
        recipientEmail: booking.user?.email,
        category: 'PAYMENT',
        priority: 'HIGH',
        templateId: 'payment_success',
        templateVersion: 'v1.0',
        channels: ['EMAIL', 'PUSH'],
        variables: {
          amount: payment.amountInr,
          txn_reference: payment.gatewayTransactionId || payment.gatewayOrderId,
        },
        deepLink: `/bookings/${booking.id}`,
      });
    }
  }

  async notifyPaymentFailed(payment: any, booking: any) {
    if (booking && booking.userId) {
      await this.dispatch({
        eventId: `evt_pay_failed_${payment.id}`,
        recipientId: booking.userId,
        recipientEmail: booking.user?.email,
        category: 'PAYMENT',
        priority: 'URGENT',
        templateId: 'payment_success',
        templateVersion: 'v1.0',
        channels: ['EMAIL', 'PUSH'],
        variables: {
          amount: payment.amountInr,
          txn_reference: payment.gatewayOrderId,
        },
        deepLink: `/bookings/${booking.id}/pay`,
      });
    }
  }

  async notifyRefundProcessed(refund: any, booking: any) {
    if (booking && booking.userId) {
      await this.dispatch({
        eventId: `evt_refund_${refund.id}`,
        recipientId: booking.userId,
        recipientEmail: booking.user?.email,
        category: 'REFUND',
        priority: 'HIGH',
        templateId: 'refund_completed',
        templateVersion: 'v1.0',
        channels: ['EMAIL', 'PUSH'],
        variables: {
          amount: refund.amountInr,
          refund_reference: refund.providerRefundId || refund.id,
        },
        deepLink: `/bookings/${booking.id}`,
      });
    }
  }

  // --- Inbox Query APIs ---

  getUserNotifications(
    userId: string,
    category?: string,
    unreadOnly?: boolean,
    page: number = 1,
    limit: number = 20,
  ) {
    let list = Array.from(this.notifications.values()).filter(
      (n) => n.recipientId === userId && !n.internalOnly,
    );

    if (category && category !== 'ALL') {
      list = list.filter((n) => n.category === category);
    }
    if (unreadOnly) {
      list = list.filter((n) => n.readStatus === 'UNREAD');
    }

    const unreadCount = Array.from(this.notifications.values()).filter(
      (n) => n.recipientId === userId && n.readStatus === 'UNREAD' && !n.internalOnly,
    ).length;

    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = list.length;
    const skip = (page - 1) * limit;
    const paginated = list.slice(skip, skip + limit);

    return {
      data: paginated,
      meta: {
        total,
        unreadCount,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  getUnreadCount(userId: string): { unreadCount: number } {
    const unreadCount = Array.from(this.notifications.values()).filter(
      (n) => n.recipientId === userId && n.readStatus === 'UNREAD' && !n.internalOnly,
    ).length;
    return { unreadCount };
  }

  markAsRead(notificationId: string, userId: string): NotificationRecord {
    const notif = this.notifications.get(notificationId);
    if (!notif || notif.recipientId !== userId) {
      throw new NotFoundException(`Notification ${notificationId} not found for user`);
    }
    notif.readStatus = 'READ';
    notif.readAt = new Date();
    return notif;
  }

  markAllAsRead(userId: string): { updatedCount: number } {
    let updatedCount = 0;
    for (const notif of this.notifications.values()) {
      if (notif.recipientId === userId && notif.readStatus === 'UNREAD') {
        notif.readStatus = 'READ';
        notif.readAt = new Date();
        updatedCount++;
      }
    }
    return { updatedCount };
  }

  // Supplier Portal Isolated Notifications Inbox
  getSupplierNotifications(supplierId: string): NotificationRecord[] {
    return Array.from(this.notifications.values())
      .filter((n) => n.supplierId === supplierId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Admin Delivery Metrics
  getAdminNotificationsOverview() {
    const all = Array.from(this.notifications.values());
    const channelBreakdown: Record<string, number> = { PUSH: 0, EMAIL: 0, SMS: 0, WHATSAPP: 0 };
    let deliveredCount = 0;
    let failedCount = 0;
    let retryingCount = 0;

    for (const n of all) {
      channelBreakdown[n.channel] = (channelBreakdown[n.channel] || 0) + 1;
      if (n.status === 'DELIVERED') deliveredCount++;
      if (n.status === 'FAILED') failedCount++;
      if (n.status === 'RETRYING') retryingCount++;
    }

    return {
      totalNotifications: all.length,
      deliveredCount,
      failedCount,
      retryingCount,
      channelBreakdown,
    };
  }

  getFailuresAndRetries(): NotificationRecord[] {
    return Array.from(this.notifications.values()).filter(
      (n) => n.status === 'FAILED' || n.status === 'RETRYING',
    );
  }
}
