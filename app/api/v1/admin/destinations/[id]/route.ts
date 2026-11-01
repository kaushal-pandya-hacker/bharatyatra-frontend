import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const updated = adminDataStore.updateDestination(params.id, body, auth.user.email);

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Destination not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Destination updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to update destination.' },
      { status: 500 }
    );
  }
}

