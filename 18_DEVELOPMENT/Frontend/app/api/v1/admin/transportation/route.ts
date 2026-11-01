import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const busRoutes = adminDataStore.getBuses();
    const integrations = adminDataStore.getTransportIntegrations();

    return NextResponse.json({
      success: true,
      busRoutes,
      integrations,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch transportation data.' },
      { status: 500 }
    );
  }
}

