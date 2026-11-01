import { NextRequest, NextResponse } from 'next/server';
import { enquiryStore } from '@/lib/enquiries/enquiry-store';
import { sendEnquiryEmailNotifications } from '@/lib/notifications/email-service';
import { sendEnquiryWhatsAppNotification } from '@/lib/notifications/whatsapp-service';

// In-memory rate limiting map (IP -> timestamps)
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxAttempts = 6;

  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= maxAttempts) {
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP & Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many submissions from this connection. Please wait a few minutes before submitting another enquiry.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // 2. Server-side validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please provide your full name.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please enter your message or trip details.' },
        { status: 400 }
      );
    }

    // 3. Save enquiry to database & persistent store
    const userAgent = req.headers.get('user-agent') || undefined;
    const enquiry = await enquiryStore.createEnquiry({
      fullName: name.trim(),
      email: email.trim(),
      phone: phone?.trim(),
      inquiryType: subject || 'General Inquiry',
      message: message.trim(),
      ipAddress: ip,
      userAgent,
    });

    // 4. Trigger Email Notification (Admin & Submitter)
    const emailResult = await sendEnquiryEmailNotifications({
      enquiryId: enquiry.id,
      enquiryReference: enquiry.enquiryReference,
      fullName: enquiry.fullName,
      email: enquiry.email,
      phone: enquiry.phone,
      inquiryType: enquiry.inquiryType,
      message: enquiry.message,
      submittedAt: enquiry.createdAt,
    });

    // 5. Trigger WhatsApp Notification (Admin & Direct Concierge)
    const whatsappResult = await sendEnquiryWhatsAppNotification({
      enquiryId: enquiry.id,
      enquiryReference: enquiry.enquiryReference,
      fullName: enquiry.fullName,
      email: enquiry.email,
      phone: enquiry.phone,
      inquiryType: enquiry.inquiryType,
      message: enquiry.message,
      submittedAt: enquiry.createdAt,
    });

    // 6. Update notification statuses in the database
    enquiryStore.updateNotificationStatuses(enquiry.id, {
      emailStatus: emailResult.status,
      whatsappStatus: whatsappResult.status,
    });

    // 7. Return exact success response
    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting BharatYatra! Your enquiry has been successfully submitted. Our support team will get back to you soon.',
      data: {
        id: enquiry.id,
        enquiryReference: enquiry.enquiryReference,
        status: enquiry.status,
        emailNotificationStatus: emailResult.status,
        whatsappNotificationStatus: whatsappResult.status,
        whatsAppDirectUrl: whatsappResult.whatsAppDirectUrl,
      },
    });
  } catch (error: any) {
    console.error('[ContactAPI] Error handling contact submission:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'A technical error occurred while saving your enquiry. Please reach our direct hotline or WhatsApp.',
      },
      { status: 500 }
    );
  }
}
