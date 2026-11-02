import { NextResponse } from 'next/server';
import { diwaliCampaignStore } from '@/lib/campaigns/diwali-campaign-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isActive = diwaliCampaignStore.isCampaignActive();
  const config = diwaliCampaignStore.getConfig();

  return NextResponse.json({
    success: true,
    isActive,
    config,
  });
}

