import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { diwaliCampaignStore } from '@/lib/campaigns/diwali-campaign-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json().catch(() => ({}));
    const currentConfig = diwaliCampaignStore.getConfig();
    const targetState = typeof body.isEnabled === 'boolean' ? body.isEnabled : !currentConfig.isEnabled;

    const updated = diwaliCampaignStore.setEnabled(targetState);
    const isActive = diwaliCampaignStore.isCampaignActive();

    return NextResponse.json({
      success: true,
      message: targetState
        ? 'Diwali festive campaign is now ENABLED.'
        : 'Diwali festive campaign has been DISABLED. Normal theme restored.',
      data: {
        isEnabled: updated.isEnabled,
        isActive,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error toggling Diwali campaign.' },
      { status: 500 }
    );
  }
}

