import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;

    const items = adminDataStore.getSettlements(status);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total: items.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch settlements.' },
      { status: 500 }
    );
  }
}

