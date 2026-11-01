import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { enquiryStore } from '@/lib/enquiries/enquiry-store';
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

    return NextResponse.json({ success: true, data: enquiry });
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

    if (!message) {
      return NextResponse.json({ success: false, message: 'Message content is required.' }, { status: 400 });
    }

    const enquiry = await enquiryStore.getEnquiryById(params.id);
    if (!enquiry) {
      return NextResponse.json({ success: false, message: 'Enquiry not found.' }, { status: 404 });
    }

    // 1. Send Email to customer
    await sendSupportReplyEmail({
      ticketNumber: enquiry.enquiryReference,
      customerName: enquiry.fullName,
      customerEmail: enquiry.email,
      subject: `Enquiry #${enquiry.enquiryReference} - ${enquiry.inquiryType}`,
      replyMessage: message,
      senderName: senderName || auth.user.fullName || 'Operations Specialist',
    });

    // 2. Create in-app customer notification
    const notif = await notificationStore.createNotification({
      recipientEmail: enquiry.email,
      recipientPhone: enquiry.phone,
      title: `Response to Inquiry #${enquiry.enquiryReference}`,
      message: `${senderName || 'Operations Specialist'}: "${message}"`,
      category: 'support',
      type: 'action',
      deepLink: '/notifications',
      metadata: {
        enquiryId: enquiry.id,
        enquiryReference: enquiry.enquiryReference,
        replyMessage: message,
      },
    });

    // 3. Update enquiry notes & status
    await enquiryStore.updateEnquiry(params.id, {
      status: 'IN_PROGRESS',
      adminNotes: `${enquiry.adminNotes ? enquiry.adminNotes + '\n' : ''}[${new Date().toISOString()}] Reply sent: "${message}"`,
      adminEmail: auth.user.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Reply sent and customer notified via email and in-app notification.',
      notificationId: notif.id,
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

