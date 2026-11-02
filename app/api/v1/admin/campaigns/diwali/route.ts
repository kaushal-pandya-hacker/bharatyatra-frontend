import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { diwaliCampaignStore } from '@/lib/campaigns/diwali-campaign-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const config = diwaliCampaignStore.getConfig();
    const isActive = diwaliCampaignStore.isCampaignActive();

    return NextResponse.json({
      success: true,
      data: {
        isActive,
        ...config,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error loading Diwali campaign configuration.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const updates = await req.json();
    const updated = diwaliCampaignStore.updateConfig(updates);
    const isActive = diwaliCampaignStore.isCampaignActive();

    return NextResponse.json({
      success: true,
      message: 'Diwali festive campaign configuration successfully updated.',
      data: {
        isActive,
        ...updated,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error updating Diwali campaign configuration.' },
      { status: 500 }
    );
  }
}

