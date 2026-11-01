/**
 * BharatYatra Server-Side WhatsApp Business Cloud API Service
 */

export interface WhatsAppNotificationPayload {
  enquiryId: string;
  enquiryReference: string;
  fullName: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message: string;
  submittedAt: string;
}

export type WhatsAppDeliveryResult = {
  status: 'SENT' | 'FAILED' | 'NOT_CONFIGURED';
  recipientPhone: string;
  whatsAppDirectUrl: string;
  providerResponse?: any;
  error?: string;
};

const BHARATYATRA_WHATSAPP_NUMBER = '919624282521'; // +91 96242 82521 (Kaushal Pandya)
const ADMIN_DASHBOARD_URL = 'https://bharatyatra.in/admin/enquiries/';

export function formatWhatsAppMessage(payload: WhatsAppNotificationPayload): string {
  return [
    `NEW BHARATYATRA WEBSITE ENQUIRY`,
    ``,
    `Enquiry ID: #${payload.enquiryReference}`,
    ``,
    `Name: ${payload.fullName}`,
    ``,
    `Email: ${payload.email}`,
    ``,
    `Phone: ${payload.phone || 'Not provided'}`,
    ``,
    `Category: ${payload.inquiryType}`,
    ``,
    `Message:`,
    `${payload.message}`,
    ``,
    `Submitted: ${payload.submittedAt}`,
    ``,
    `View in Admin Panel:`,
    `${ADMIN_DASHBOARD_URL}`,
  ].join('\n');
}

export async function sendEnquiryWhatsAppNotification(
  payload: WhatsAppNotificationPayload
): Promise<WhatsAppDeliveryResult> {
  const formattedText = formatWhatsAppMessage(payload);
  const whatsAppDirectUrl = `https://wa.me/${BHARATYATRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(formattedText)}`;

  // 1. Meta WhatsApp Business Cloud API Integration
  // Requires: WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID
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
          to: BHARATYATRA_WHATSAPP_NUMBER,
          type: 'text',
          text: {
            preview_url: true,
            body: formattedText,
          },
        }),
      });

      const json = await res.json();
      if (res.ok) {
        return {
          status: 'SENT',
          recipientPhone: '+91 96242 82521',
          whatsAppDirectUrl,
          providerResponse: json,
        };
      } else {
        return {
          status: 'FAILED',
          recipientPhone: '+91 96242 82521',
          whatsAppDirectUrl,
          error: json?.error?.message || 'WhatsApp Cloud API rejection',
          providerResponse: json,
        };
      }
    } catch (err: any) {
      return {
        status: 'FAILED',
        recipientPhone: '+91 96242 82521',
        whatsAppDirectUrl,
        error: err?.message || 'Network error connecting to WhatsApp API',
      };
    }
  }

  // 2. Twilio WhatsApp API Integration
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g. 'whatsapp:+14155238886'

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('From', twilioFrom);
      params.append('To', `whatsapp:+${BHARATYATRA_WHATSAPP_NUMBER}`);
      params.append('Body', formattedText);

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const json = await res.json();
      if (res.ok) {
        return {
          status: 'SENT',
          recipientPhone: '+91 96242 82521',
          whatsAppDirectUrl,
          providerResponse: json,
        };
      } else {
        return {
          status: 'FAILED',
          recipientPhone: '+91 96242 82521',
          whatsAppDirectUrl,
          error: json?.message || 'Twilio rejection',
        };
      }
    } catch (err: any) {
      return {
        status: 'FAILED',
        recipientPhone: '+91 96242 82521',
        whatsAppDirectUrl,
        error: err?.message,
      };
    }
  }

  // 3. Not configured in server environment — return accurate NOT_CONFIGURED status (NO simulation)
  console.log(`[WhatsAppService] Neither WHATSAPP_API_TOKEN nor TWILIO configured. Marked NOT_CONFIGURED.`);
  return {
    status: 'NOT_CONFIGURED',
    recipientPhone: '+91 96242 82521',
    whatsAppDirectUrl,
  };
}

