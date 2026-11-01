import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const booking = adminDataStore.getBookingById(params.id);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Error fetching booking.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const { action, status, reason } = body;
    const adminEmail = auth.user.email;

    if (action === 'CANCEL_AND_REFUND') {
      const result = adminDataStore.cancelBookingAndInitiateRefund(params.id, reason || 'Admin cancelled booking', adminEmail);
      if (!result) {
        return NextResponse.json({ success: false, message: 'Booking not found.' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: 'Booking cancelled and refund initiated successfully.',
        data: result,
      });
    }

    if (status) {
      const updated = adminDataStore.updateBookingStatus(params.id, status, reason, adminEmail);
      if (!updated) {
        return NextResponse.json({ success: false, message: 'Booking not found.' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Booking status updated to ${status}.`,
        data: updated,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action or missing status.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Error updating booking.' }, { status: 500 });
  }
}

