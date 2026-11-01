import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

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
      senderName || auth.user.fullName || 'Support Desk',
      auth.user.email
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Ticket not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Support reply added.',
      data: updated,
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

