import { NextRequest, NextResponse } from 'next/server';
import { webPushEngine } from '@/lib/notifications/web-push-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') || 'usr_customer_demo';
  const records = webPushEngine.getUserSubscriptions(userId);

  const devices = records.map((r) => ({
    id: r.id,
    deviceType: r.device.deviceType || 'Desktop',
    browser: r.device.browser || 'Browser',
    isActive: !r.revokedAt,
    lastUsedAt: r.lastUsedAt,
    createdAt: r.createdAt,
  }));

  return NextResponse.json(devices);
}
