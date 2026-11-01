/**
 * BharatYatra Customer Inquiry Notification Service
 * Dispatches inquiries to:
 * 1. Admin Support Queue
 * 2. Email alerts (pandyakaushal294@gmail.com & engineering@bharatyatra.in)
 * 3. WhatsApp concierge (+91 96242 82521)
 */

export interface InquiryPayload {
  ticketNumber: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface NotificationResult {
  emailDispatched: boolean;
  emailRecipients: string[];
  whatsAppUrl: string;
  whatsAppPhone: string;
  status: string;
}

const ADMIN_EMAILS = ['pandyakaushal294@gmail.com', 'engineering@bharatyatra.in'];
const WHATSAPP_PHONE = '919624282521'; // +91 96242 82521 (Kaushal Pandya)

export function generateWhatsAppInquiryUrl(inquiry: InquiryPayload): string {
  const lines = [
    `*NEW BHARATYATRA INQUIRY*`,
    `--------------------------`,
    `🎫 *Ticket:* ${inquiry.ticketNumber}`,
    `👤 *Name:* ${inquiry.name}`,
    `📧 *Email:* ${inquiry.email}`,
    `📱 *Phone:* ${inquiry.phone || 'Not provided'}`,
    `📌 *Topic:* ${inquiry.subject}`,
    `💬 *Message:*`,
    inquiry.message,
    `--------------------------`,
    `🔗 View in Admin Portal: https://bharatyatra.in/admin/support/`,
  ];

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${WHATSAPP_PHONE}?text=${text}`;
}

export async function dispatchInquiryNotifications(inquiry: InquiryPayload): Promise<NotificationResult> {
  const whatsAppUrl = generateWhatsAppInquiryUrl(inquiry);
  let emailDispatched = false;

  // 1. Resend API Integration (if RESEND_API_KEY is available)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'BharatYatra Alerts <alerts@bharatyatra.in>',
          to: ADMIN_EMAILS,
          subject: `[BharatYatra Inquiry #${inquiry.ticketNumber}] ${inquiry.subject} from ${inquiry.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #102B4E; margin-top: 0;">New BharatYatra Customer Inquiry</h2>
              <p style="font-size: 14px; color: #64748b;">Ticket: <strong>${inquiry.ticketNumber}</strong> | Received: ${inquiry.createdAt}</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>Full Name:</strong></td><td style="color: #1e293b;">${inquiry.name}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td><td style="color: #1e293b;"><a href="mailto:${inquiry.email}">${inquiry.email}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td><td style="color: #1e293b;">${inquiry.phone || 'Not provided'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;"><strong>Inquiry Topic:</strong></td><td style="color: #1e293b;">${inquiry.subject}</td></tr>
              </table>
              <div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #102B4E;">
                <p style="margin: 0; font-size: 14px; color: #334155; white-space: pre-wrap;">${inquiry.message}</p>
              </div>
              <div style="margin-top: 25px; text-align: center;">
                <a href="https://bharatyatra.in/admin/support/" style="display: inline-block; padding: 12px 24px; background-color: #102B4E; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 8px;">
                  Open Admin Support Desk
                </a>
              </div>
            </div>
          `,
        }),
      });

      if (res.ok) {
        emailDispatched = true;
      }
    } catch (err) {
      console.error('[NotificationService] Resend email dispatch error:', err);
    }
  }

  // 2. SendGrid API Integration (if SENDGRID_API_KEY is available)
  if (!emailDispatched && process.env.SENDGRID_API_KEY) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: ADMIN_EMAILS.map((email) => ({ email })) }],
          from: { email: process.env.EMAIL_FROM || 'alerts@bharatyatra.in', name: 'BharatYatra Concierge' },
          subject: `[BharatYatra Inquiry #${inquiry.ticketNumber}] ${inquiry.subject} from ${inquiry.name}`,
          content: [
            {
              type: 'text/plain',
              value: `New BharatYatra Inquiry\nTicket: ${inquiry.ticketNumber}\nFrom: ${inquiry.name} (${inquiry.email})\nPhone: ${inquiry.phone || 'N/A'}\n\nMessage:\n${inquiry.message}\n\nView: https://bharatyatra.in/admin/support/`,
            },
          ],
        }),
      });

      if (res.ok) {
        emailDispatched = true;
      }
    } catch (err) {
      console.error('[NotificationService] SendGrid email dispatch error:', err);
    }
  }

  // Always log dispatch details for observability and audit trail
  console.log(`[InquiryNotification] Logged ticket ${inquiry.ticketNumber}`);
  console.log(`[InquiryNotification] Dispatched to email: ${ADMIN_EMAILS.join(', ')} (Sent: ${emailDispatched})`);
  console.log(`[InquiryNotification] WhatsApp alert link generated for ${WHATSAPP_PHONE}`);

  return {
    emailDispatched,
    emailRecipients: ADMIN_EMAILS,
    whatsAppUrl,
    whatsAppPhone: '+91 96242 82521',
    status: 'RECORDED_AND_ROUTED',
  };
}
