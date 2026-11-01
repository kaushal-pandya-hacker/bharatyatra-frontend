import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const hotels = adminDataStore.getHotels();

    return NextResponse.json({
      success: true,
      supplierStatus: {
        hotelbeds: {
          status: 'SANDBOX',
          lastSync: '2026-03-04T07:30:00Z',
          pricingHealth: 'OPTIMAL',
          syncCadence: 'Hourly Delta Polling',
        },
        selfContracted: {
          status: 'LIVE_VERIFIED',
          lastSync: '2026-03-04T07:00:00Z',
          propertiesManaged: 18,
        },
      },
      data: hotels,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch hotel operations data.' },
      { status: 500 }
    );
  }
}

