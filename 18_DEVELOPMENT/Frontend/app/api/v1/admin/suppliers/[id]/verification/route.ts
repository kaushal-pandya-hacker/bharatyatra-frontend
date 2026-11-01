import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json().catch(() => ({}));
    const status = body.status as 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
    const reason = body.reason || '';

    if (!status || !['VERIFIED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification status.' },
        { status: 400 }
      );
    }

    const updated = adminDataStore.updateSupplierVerification(
      params.id,
      status,
      reason,
      auth.user.email
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Supplier not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Supplier marked as ${status}.`,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to update supplier verification.' },
      { status: 500 }
    );
  }
}
