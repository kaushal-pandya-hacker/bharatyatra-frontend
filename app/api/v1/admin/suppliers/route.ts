import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const verificationStatus = searchParams.get('verificationStatus') || undefined;
    const status = searchParams.get('status') || undefined;

    const data = adminDataStore.getSuppliers({ search, verificationStatus, status });

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch suppliers.' },
      { status: 500 }
    );
  }
}
