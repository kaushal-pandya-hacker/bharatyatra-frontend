import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const state = searchParams.get('state') || undefined;
    const search = searchParams.get('search') || undefined;

    const data = adminDataStore.getDestinations({ category, state, search });

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch destinations.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const created = adminDataStore.createDestination(body, auth.user.email);

    return NextResponse.json({
      success: true,
      message: 'Destination created successfully.',
      data: created,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to create destination.' },
      { status: 500 }
    );
  }
}

