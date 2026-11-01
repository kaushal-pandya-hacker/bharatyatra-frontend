import { NextRequest, NextResponse } from 'next/server';
import { adminDataStore } from '@/lib/admin/admin-store';
import { dispatchInquiryNotifications } from '@/lib/notifications/inquiry-notification';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Full name is required.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message content is required.' },
        { status: 400 }
      );
    }

    // Map form subject to ticket category
    let category: 'GENERAL' | 'AI_PLANNER' | 'BOOKING' | 'PAYMENT' | 'CANCELLATION' | 'HOTEL' = 'GENERAL';
    const sub = (subject || '').toUpperCase();
    if (sub.includes('AI_TRIP')) category = 'AI_PLANNER';
    else if (sub.includes('PACKAGE') || sub.includes('TOUR')) category = 'BOOKING';
    else if (sub.includes('HOTEL')) category = 'HOTEL';
    else if (sub.includes('PAYMENT')) category = 'PAYMENT';

    // 1. Create ticket directly in Admin Store (visible in /admin/support/ & /admin/)
    const ticket = adminDataStore.createSupportTicket({
      customerName: name.trim(),
      customerEmail: email.trim(),
      phone: phone?.trim(),
      category,
      subject: subject || 'General Customer Inquiry',
      description: message.trim(),
      priority: 'MEDIUM',
    });

    // 2. Dispatch notifications (Email to admin emails + generate WhatsApp route)
    const notificationResult = await dispatchInquiryNotifications({
      ticketNumber: ticket.ticketNumber,
      name: ticket.customerName,
      email: ticket.customerEmail,
      phone: phone?.trim(),
      subject: ticket.subject,
      message: ticket.description,
      createdAt: ticket.createdAt,
    });

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been received and routed to our Operations Support Desk.',
      data: {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        category: ticket.category,
        whatsAppUrl: notificationResult.whatsAppUrl,
        whatsAppPhone: notificationResult.whatsAppPhone,
        emailRecipients: notificationResult.emailRecipients,
      },
    });
  } catch (error: any) {
    console.error('Contact inquiry submission failed:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to submit inquiry.' },
      { status: 500 }
    );
  }
}

