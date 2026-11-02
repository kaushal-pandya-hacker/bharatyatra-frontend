import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { enquiryStore } from '@/lib/enquiries/enquiry-store';
import { adminDataStore } from '@/lib/admin/admin-store';
import { sendSupportReplyEmail } from '@/lib/notifications/email-service';
import { notificationStore } from '@/lib/notifications/notification-store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const enquiry = await enquiryStore.getEnquiryById(params.id);
    if (!enquiry) {
      return NextResponse.json({ success: false, message: 'Enquiry not found.' }, { status: 404 });
    }

    const ticket = adminDataStore.findOrCreateTicketForEnquiry(enquiry);

    return NextResponse.json({
      success: true,
      data: {
        ...enquiry,
        ticket,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error loading enquiry details.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const { status, priority, adminNotes } = body;

    const updated = await enquiryStore.updateEnquiry(params.id, {
      status,
      priority,
      adminNotes,
      adminEmail: auth.user.email,
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Enquiry not found.' }, { status: 404 });
    }

    // Also sync status with support ticket if present
    try {
      const ticket = adminDataStore.getTicketByIdOrNumber(updated.enquiryReference);
      if (ticket) {
        adminDataStore.updateTicketStatus(ticket.id, status, adminNotes, auth.user.email);
      }
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error updating enquiry.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const { message, senderName } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, message: 'Message content is required.' }, { status: 400 });
    }

    const enquiry = await enquiryStore.getEnquiryById(params.id);
    if (!enquiry) {
      return NextResponse.json({ success: false, message: 'Enquiry not found.' }, { status: 404 });
    }

    // 1. Sync conversation thread in adminDataStore
    const ticket = adminDataStore.findOrCreateTicketForEnquiry(enquiry);
    const updatedTicket = adminDataStore.addSupportReply(
      ticket.id,
      message.trim(),
      senderName || auth.user.fullName || 'Operations Support Lead',
      auth.user.email
    );

    const ticketRef = updatedTicket?.ticketNumber || enquiry.enquiryReference;

    // 2. Dispatch Email to customer (if email service configured)
    await sendSupportReplyEmail({
      ticketNumber: ticketRef,
      customerName: enquiry.fullName,
      customerEmail: enquiry.email,
      subject: `Enquiry #${enquiry.enquiryReference} - ${enquiry.inquiryType}`,
      replyMessage: message.trim(),
      senderName: senderName || auth.user.fullName || 'Operations Support Lead',
    });

    // 3. Create in-app customer notification for the client website
    const notif = await notificationStore.createNotification({
      recipientEmail: enquiry.email,
      recipientPhone: enquiry.phone,
      title: `Reply from BharatYatra Support (#${ticketRef})`,
      message: `${senderName || 'Operations Support Lead'}: "${message.trim()}"`,
      category: 'support',
      type: 'action',
      deepLink: `/notifications?ticket=${ticketRef}`,
      metadata: {
        enquiryId: enquiry.id,
        enquiryReference: enquiry.enquiryReference,
        ticketId: updatedTicket?.id,
        ticketNumber: ticketRef,
        subject: updatedTicket?.subject || enquiry.inquiryType,
        replyMessage: message.trim(),
        senderName: senderName || 'Operations Support Lead',
      },
    });

    // 4. Update enquiry status to IN_PROGRESS
    const updatedEnquiry = await enquiryStore.updateEnquiry(params.id, {
      status: 'IN_PROGRESS',
      adminNotes: `${enquiry.adminNotes ? enquiry.adminNotes + '\n' : ''}[${new Date().toISOString()}] Reply sent: "${message.trim()}"`,
      adminEmail: auth.user.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Reply sent and customer notified via in-app alert and email.',
      data: {
        enquiry: updatedEnquiry,
        ticket: updatedTicket,
        notificationId: notif.id,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error sending reply.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const deleted = await enquiryStore.deleteEnquiry(params.id, auth.user.email);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Enquiry not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry permanently deleted.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error deleting enquiry.' },
      { status: 500 }
    );
  }
}

