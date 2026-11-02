import { NextRequest, NextResponse } from 'next/server';
import { adminDataStore } from '@/lib/admin/admin-store';
import { enquiryStore } from '@/lib/enquiries/enquiry-store';
import { notificationStore } from '@/lib/notifications/notification-store';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { message, senderName } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message content is required.' },
        { status: 400 }
      );
    }

    let updated = adminDataStore.addCustomerReply(params.id, message, senderName);

    // Fallback: check if identifier matches an enquiry reference
    if (!updated) {
      const enquiry = await enquiryStore.getEnquiryByRef(params.id);
      if (enquiry) {
        const tkt = adminDataStore.findOrCreateTicketForEnquiry(enquiry);
        updated = adminDataStore.addCustomerReply(tkt.id, message, senderName);
      }
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Support ticket not found.' },
        { status: 404 }
      );
    }

    // Immediately alert the Admin Panel
    try {
      await notificationStore.createNotification({
        recipientEmail: 'admin@bharatyatra.com',
        title: `Customer Reply on Ticket #${updated.ticketNumber}`,
        message: `${senderName || updated.customerName}: "${message.trim()}"`,
        category: 'support',
        type: 'action',
        deepLink: '/admin/support',
        metadata: {
          ticketId: updated.id,
          ticketNumber: updated.ticketNumber,
          customerName: updated.customerName,
          customerEmail: updated.customerEmail,
          replyMessage: message.trim(),
        },
      });
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      message: 'Your reply has been delivered to BharatYatra Support operations.',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error submitting support reply.' },
      { status: 500 }
    );
  }
}

