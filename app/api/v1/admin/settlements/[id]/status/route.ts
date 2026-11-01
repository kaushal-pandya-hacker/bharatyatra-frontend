import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json().catch(() => ({}));
    const status = body.status as 'SETTLED' | 'FAILED';
    const reference = body.settlementReference || '';
    const failureReason = body.failureReason || '';

    if (!status || !['SETTLED', 'FAILED'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid settlement status.' },
        { status: 400 }
      );
    }

    const updated = adminDataStore.updateSettlementStatus(
      params.id,
      status,
      reference,
      failureReason,
      auth.user.email
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Settlement record not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Settlement record marked as ${status}.`,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to update settlement status.' },
      { status: 500 }
    );
  }
}

