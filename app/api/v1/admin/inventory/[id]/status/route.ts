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
    const status = body.status as 'ACTIVE' | 'INACTIVE';
    const reason = body.reason || '';

    if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid inventory status.' },
        { status: 400 }
      );
    }

    const updated = adminDataStore.updateInventoryStatus(
      params.id,
      status,
      reason,
      auth.user.email
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Inventory item not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Inventory item marked as ${status}.`,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to update inventory status.' },
      { status: 500 }
    );
  }
}
