/**
 * BharatYatra Server-Side Email Notification Service
 * Dispatches:
 * 1. Admin Alert to pandyakaushal294@gmail.com & engineering@bharatyatra.in
 * 2. Customer Receipt Acknowledgement to the submitter
 */

export interface EmailDispatchPayload {
  enquiryId: string;
  enquiryReference: string;
  fullName: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message: string;
  submittedAt: string;
}

export type EmailDeliveryResult = {
  status: 'SENT' | 'FAILED' | 'NOT_CONFIGURED';
  recipients: string[];
  error?: string;
};

const OFFICIAL_ADMIN_EMAILS = [
  'pandyakaushal294@gmail.com',
  'engineering@bharatyatra.in',
];

export async function sendEnquiryEmailNotifications(
  payload: EmailDispatchPayload
): Promise<EmailDeliveryResult> {
  const adminSubject = `New Website Enquiry – BharatYatra #${payload.enquiryReference}`;
  const adminUrl = 'https://bharatyatra.in/admin/enquiries/';

  const adminHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="border-bottom: 2px solid #102B4E; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="font-size: 11px; font-weight: bold; letter-spacing: 1.5px; color: #d97706; text-transform: uppercase;">BharatYatra Operations Desk</span>
        <h2 style="color: #102B4E; margin: 4px 0 0 0; font-size: 22px;">New Website Customer Enquiry</h2>
        <p style="font-size: 13px; color: #64748b; margin: 4px 0 0 0;">Reference: <strong>#${payload.enquiryReference}</strong></p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <tr><td style="padding: 6px 0; color: #64748b; width: 140px;"><strong>Customer Name:</strong></td><td style="color: #0f172a; font-weight: 600;">${payload.fullName}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;"><strong>Email Address:</strong></td><td style="color: #0f172a;"><a href="mailto:${payload.email}" style="color: #2563eb;">${payload.email}</a></td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;"><strong>Phone Number:</strong></td><td style="color: #0f172a;">${payload.phone || 'Not provided'}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;"><strong>Inquiry Category:</strong></td><td style="color: #0f172a; font-weight: 600;">${payload.inquiryType}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;"><strong>Submission Time:</strong></td><td style="color: #64748b;">${payload.submittedAt}</td></tr>
      </table>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #102B4E; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <span style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 6px;">Enquiry Message:</span>
        <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0; white-space: pre-wrap;">${payload.message}</p>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${adminUrl}" style="display: inline-block; padding: 12px 28px; background-color: #102B4E; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 10px;">
          Open Enquiry in Admin Control Center
        </a>
      </div>
    </div>
  `;

  // 1. Try Resend API if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'BharatYatra <alerts@bharatyatra.in>',
          to: OFFICIAL_ADMIN_EMAILS,
          subject: adminSubject,
          html: adminHtml,
        }),
      });

      if (res.ok) {
        // Send customer receipt acknowledgment
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || 'BharatYatra Concierge <care@bharatyatra.in>',
              to: [payload.email],
              subject: `We have received your enquiry – BharatYatra #${payload.enquiryReference}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
                  <h3 style="color: #102B4E;">Thank You for Contacting BharatYatra</h3>
                  <p>Dear <strong>${payload.fullName}</strong>,</p>
                  <p>Your enquiry (Reference: <strong>#${payload.enquiryReference}</strong>) has been successfully received by our customer operations concierge desk.</p>
                  <p>Our travel specialist is reviewing your request and will get back to you shortly.</p>
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                  <p style="font-size: 12px; color: #64748b;">Need urgent help? Reach our WhatsApp concierge directly at <a href="https://wa.me/919624282521">+91 96242 82521</a>.</p>
                </div>
              `,
            }),
          });
        } catch {
          // Non-fatal if customer confirmation fails
        }

        return { status: 'SENT', recipients: OFFICIAL_ADMIN_EMAILS };
      }
      return { status: 'FAILED', recipients: OFFICIAL_ADMIN_EMAILS, error: await res.text() };
    } catch (err: any) {
      return { status: 'FAILED', recipients: OFFICIAL_ADMIN_EMAILS, error: err?.message };
    }
  }

  // 2. Try SendGrid API if configured
  if (process.env.SENDGRID_API_KEY) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: OFFICIAL_ADMIN_EMAILS.map((email) => ({ email })) }],
          from: { email: process.env.EMAIL_FROM || 'alerts@bharatyatra.in', name: 'BharatYatra Operations' },
          subject: adminSubject,
          content: [{ type: 'text/html', value: adminHtml }],
        }),
      });

      if (res.ok) {
        return { status: 'SENT', recipients: OFFICIAL_ADMIN_EMAILS };
      }
      return { status: 'FAILED', recipients: OFFICIAL_ADMIN_EMAILS, error: await res.text() };
    } catch (err: any) {
      return { status: 'FAILED', recipients: OFFICIAL_ADMIN_EMAILS, error: err?.message };
    }
  }

  // 3. Neither provider configured in environment
  console.log(`[EmailService] Neither RESEND_API_KEY nor SENDGRID_API_KEY configured. Email marked NOT_CONFIGURED.`);
  return {
    status: 'NOT_CONFIGURED',
    recipients: OFFICIAL_ADMIN_EMAILS,
  };
}

export interface SupportReplyEmailPayload {
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  replyMessage: string;
  senderName: string;
}

export async function sendSupportReplyEmail(
  payload: SupportReplyEmailPayload
): Promise<EmailDeliveryResult> {
  const emailSubject = `Reply from BharatYatra Support: Ticket #${payload.ticketNumber}`;
  const recipients = [payload.customerEmail];

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="border-bottom: 2px solid #102B4E; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="font-size: 11px; font-weight: bold; letter-spacing: 1.5px; color: #d97706; text-transform: uppercase;">BharatYatra Customer Support</span>
        <h2 style="color: #102B4E; margin: 4px 0 0 0; font-size: 20px;">Support Desk Response</h2>
        <p style="font-size: 13px; color: #64748b; margin: 4px 0 0 0;">Ticket: <strong>#${payload.ticketNumber}</strong> • ${payload.subject}</p>
      </div>

      <p style="font-size: 14px; color: #334155; margin-bottom: 12px;">
        Dear <strong>${payload.customerName}</strong>,
      </p>

      <p style="font-size: 14px; color: #334155; margin-bottom: 16px;">
        Our operations support team has responded to your inquiry:
      </p>

      <div style="background-color: #fefce8; border: 1px solid #fef08a; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <span style="font-size: 11px; font-weight: bold; color: #92400e; text-transform: uppercase; display: block; margin-bottom: 6px;">
          ${payload.senderName} wrote:
        </span>
        <p style="font-size: 14px; color: #1e293b; line-height: 1.6; margin: 0; white-space: pre-wrap;">${payload.replyMessage}</p>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="https://bharatyatra.in/notifications" style="display: inline-block; padding: 12px 28px; background-color: #102B4E; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 10px;">
          View Notifications on BharatYatra
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
        Need instant help? Reach our WhatsApp Concierge at <a href="https://wa.me/919624282521" style="color: #2563eb;">+91 96242 82521</a> or reply to this email.
      </p>
    </div>
  `;

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'BharatYatra Support <care@bharatyatra.in>',
          to: recipients,
          subject: emailSubject,
          html,
        }),
      });
      if (res.ok) return { status: 'SENT', recipients };
      return { status: 'FAILED', recipients, error: await res.text() };
    } catch (err: any) {
      return { status: 'FAILED', recipients, error: err?.message };
    }
  }

  if (process.env.SENDGRID_API_KEY) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: recipients.map((email) => ({ email })) }],
          from: { email: process.env.EMAIL_FROM || 'care@bharatyatra.in', name: 'BharatYatra Support' },
          subject: emailSubject,
          content: [{ type: 'text/html', value: html }],
        }),
      });
      if (res.ok) return { status: 'SENT', recipients };
      return { status: 'FAILED', recipients, error: await res.text() };
    } catch (err: any) {
      return { status: 'FAILED', recipients, error: err?.message };
    }
  }

  console.log(`[EmailService] Neither RESEND_API_KEY nor SENDGRID_API_KEY configured. Staff reply marked NOT_CONFIGURED.`);
  return { status: 'NOT_CONFIGURED', recipients };
}

