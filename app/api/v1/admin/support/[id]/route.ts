import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';
import { sendSupportReplyEmail } from '@/lib/notifications/email-service';
import { notificationStore } from '@/lib/notifications/notification-store';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const { message, senderName } = body;

    if (!message) {
      return NextResponse.json({ success: false, message: 'Message content is required.' }, { status: 400 });
    }

    const updated = adminDataStore.addSupportReply(
      params.id,
      message,
      senderName || auth.user.fullName || 'Operations Support Lead',
      auth.user.email
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Ticket not found.' }, { status: 404 });
    }

    // 1. Dispatch Email to customer
    const emailResult = await sendSupportReplyEmail({
      ticketNumber: updated.ticketNumber,
      customerName: updated.customerName,
      customerEmail: updated.customerEmail,
      subject: updated.subject,
      replyMessage: message,
      senderName: senderName || auth.user.fullName || 'Operations Support Lead',
    });

    // 2. Create in-app customer notification for the client website
    const notif = await notificationStore.createNotification({
      recipientEmail: updated.customerEmail,
      recipientPhone: updated.phone,
      title: `Reply from BharatYatra Support (#${updated.ticketNumber})`,
      message: `${senderName || 'Operations Support Lead'}: "${message}"`,
      category: 'support',
      type: 'action',
      deepLink: '/notifications',
      metadata: {
        ticketId: updated.id,
        ticketNumber: updated.ticketNumber,
        subject: updated.subject,
        replyMessage: message,
        senderName: senderName || 'Operations Support Lead',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Support reply added. Customer notified via email and in-app alert.',
      data: updated,
      notification: {
        emailStatus: emailResult.status,
        inAppNotificationId: notif.id,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error updating support ticket.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const { status, resolutionNotes } = body;

    if (!status) {
      return NextResponse.json({ success: false, message: 'Status is required.' }, { status: 400 });
    }

    const updated = adminDataStore.updateTicketStatus(params.id, status, resolutionNotes, auth.user.email);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Ticket not found.' }, { status: 404 });
    }

    // Notify customer of ticket status update
    await notificationStore.createNotification({
      recipientEmail: updated.customerEmail,
      recipientPhone: updated.phone,
      title: `Support Ticket #${updated.ticketNumber}: ${status}`,
      message: resolutionNotes
        ? `Status updated to ${status}. Notes: ${resolutionNotes}`
        : `Your support ticket #${updated.ticketNumber} has been updated to ${status}.`,
      category: 'support',
      type: 'action',
      deepLink: '/notifications',
      metadata: {
        ticketId: updated.id,
        ticketNumber: updated.ticketNumber,
        status,
        resolutionNotes,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Ticket status updated to ${status}.`,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error updating ticket status.' },
      { status: 500 }
    );
  }
}
