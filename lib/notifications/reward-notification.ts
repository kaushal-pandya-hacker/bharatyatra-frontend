import { notificationStore } from './notification-store';

export interface RewardNotificationPayload {
  contributorId: string;
  contributorName: string;
  contributorEmail: string;
  contributorPhone?: string;
  placeName: string;
  couponCode: string;
  discountPercent: number;
  validUntil: string;
  destinationSlug?: string;
}

export interface RewardDispatchResult {
  inAppStatus: 'SENT' | 'FAILED';
  whatsApp: {
    status: 'SENT' | 'FAILED' | 'NOT_CONFIGURED';
    recipientPhone: string;
    whatsAppDirectUrl: string;
    messageText: string;
    error?: string;
  };
  email: {
    status: 'SENT' | 'FAILED' | 'NOT_CONFIGURED';
    recipientEmail: string;
    error?: string;
  };
}

export function formatRewardWhatsAppText(payload: RewardNotificationPayload): string {
  const expiryDateFormatted = new Date(payload.validUntil).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return [
    `Congratulations! Your place contribution has been approved and is now LIVE on BharatYatra.`,
    ``,
    `As a thank-you for contributing to our travel community, you have received an exclusive 7% discount on one eligible booking.`,
    ``,
    `Your reward coupon: ${payload.couponCode}`,
    ``,
    `Your reward is valid until: ${expiryDateFormatted}`,
    ``,
    `Visit BharatYatra to use your reward.`,
    ``,
    `Thank you for helping travellers discover India!`,
  ].join('\n');
}

export async function dispatchApprovalRewardNotifications(
  payload: RewardNotificationPayload
): Promise<RewardDispatchResult> {
  const cleanPhone = (payload.contributorPhone || '+91 96242 82521').replace(/[^\d+]/g, '');
  const digitsOnly = cleanPhone.replace(/^\+/, '');
  const waText = formatRewardWhatsAppText(payload);
  const waDirectUrl = `https://wa.me/${digitsOnly}?text=${encodeURIComponent(waText)}`;

  // 1. In-App Notification (Always stored)
  let inAppStatus: 'SENT' | 'FAILED' = 'SENT';
  try {
    await notificationStore.createNotification({
      userId: payload.contributorId,
      recipientEmail: payload.contributorEmail,
      type: 'COMMUNITY_REWARD_ISSUED',
      category: 'COMMUNITY',
      title: `🎉 7% Reward Coupon: ${payload.couponCode}`,
      message: `Your place "${payload.placeName}" was approved! Use coupon code ${payload.couponCode} at checkout for an instant 7% discount.`,
      deepLink: `/dashboard/my-contributions`,
      metadata: {
        couponCode: payload.couponCode,
        discountPercent: payload.discountPercent,
        validUntil: payload.validUntil,
        placeName: payload.placeName,
      },
    });
  } catch (err) {
    console.warn('[RewardNotification] In-app notification error:', err);
    inAppStatus = 'FAILED';
  }

  // 2. WhatsApp Notification
  let whatsAppStatus: 'SENT' | 'FAILED' | 'NOT_CONFIGURED' = 'NOT_CONFIGURED';
  let waError: string | undefined;

  const apiToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (apiToken && phoneNumberId) {
    try {
      const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: digitsOnly,
          type: 'text',
          text: {
            preview_url: true,
            body: waText,
          },
        }),
      });
      if (res.ok) {
        whatsAppStatus = 'SENT';
      } else {
        const json = await res.json().catch(() => ({}));
        whatsAppStatus = 'FAILED';
        waError = json?.error?.message || 'Meta WhatsApp API rejection';
      }
    } catch (err: any) {
      whatsAppStatus = 'FAILED';
      waError = err?.message || 'Network error reaching WhatsApp API';
    }
  } else {
    // Truthful reporting: credentials not present in environment
    whatsAppStatus = 'NOT_CONFIGURED';
  }

  // 3. Email Notification
  let emailStatus: 'SENT' | 'FAILED' | 'NOT_CONFIGURED' = 'NOT_CONFIGURED';
  let emailError: string | undefined;

  const resendKey = process.env.RESEND_API_KEY;
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const emailSubject = `🎉 Place Approved! Your 7% BharatYatra Reward Coupon [${payload.couponCode}]`;

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="border-bottom: 2px solid #d97706; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="font-size: 11px; font-weight: bold; letter-spacing: 1.5px; color: #d97706; text-transform: uppercase;">BharatYatra Community Contributor Program</span>
        <h2 style="color: #0f172a; margin: 4px 0 0 0; font-size: 22px;">Congratulations, ${payload.contributorName}!</h2>
        <p style="font-size: 13px; color: #64748b; margin: 4px 0 0 0;">Your submission <strong>"${payload.placeName}"</strong> has been approved and published.</p>
      </div>
      <div style="background-color: #f8fafc; border: 1px dashed #d97706; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 6px;">Your 7% Contributor Discount Code:</span>
        <div style="font-size: 28px; font-weight: 900; letter-spacing: 2px; color: #b45309; font-family: monospace;">${payload.couponCode}</div>
        <p style="font-size: 12px; color: #64748b; margin: 8px 0 0 0;">Valid until ${new Date(payload.validUntil).toLocaleDateString('en-IN')}</p>
      </div>
      <p style="font-size: 14px; color: #334155; line-height: 1.6;">
        Apply this code at checkout on BharatYatra to receive an instant <strong>7% discount</strong> (up to ₹2,000) on your next booking of ₹2,500 or more.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="https://www.bharatyatra.in/dashboard/my-contributions" style="display: inline-block; padding: 12px 28px; background-color: #0f172a; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 10px;">
          View My Contributions
        </a>
      </div>
    </div>
  `;

  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'BharatYatra Community <care@bharatyatra.in>',
          to: [payload.contributorEmail],
          subject: emailSubject,
          html: emailHtml,
        }),
      });
      if (res.ok) emailStatus = 'SENT';
      else emailStatus = 'FAILED';
    } catch (e: any) {
      emailStatus = 'FAILED';
      emailError = e?.message;
    }
  } else if (sendgridKey) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sendgridKey}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: payload.contributorEmail }] }],
          from: { email: process.env.EMAIL_FROM || 'care@bharatyatra.in', name: 'BharatYatra Community' },
          subject: emailSubject,
          content: [{ type: 'text/html', value: emailHtml }],
        }),
      });
      if (res.ok) emailStatus = 'SENT';
      else emailStatus = 'FAILED';
    } catch (e: any) {
      emailStatus = 'FAILED';
      emailError = e?.message;
    }
  } else {
    emailStatus = 'NOT_CONFIGURED';
  }

  return {
    inAppStatus,
    whatsApp: {
      status: whatsAppStatus,
      recipientPhone: cleanPhone,
      whatsAppDirectUrl: waDirectUrl,
      messageText: waText,
      error: waError,
    },
    email: {
      status: emailStatus,
      recipientEmail: payload.contributorEmail,
      error: emailError,
    },
  };
}
