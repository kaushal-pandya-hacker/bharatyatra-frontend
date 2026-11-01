import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const { action, notes } = body;

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action. Must be APPROVE or REJECT.' }, { status: 400 });
    }

    const updated = adminDataStore.processRefund(params.id, action, notes, auth.user.email);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Refund item not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Refund ${action === 'APPROVE' ? 'approved & dispatched via BharatGateway™' : 'rejected'}.`,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error processing refund.' },
      { status: 500 }
    );
  }
}

