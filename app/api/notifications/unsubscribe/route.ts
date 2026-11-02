import { NextRequest, NextResponse } from 'next/server';
import { webPushEngine } from '@/lib/notifications/web-push-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint, userId } = body;

    if (!endpoint) {
      return NextResponse.json(
        { success: false, message: 'Push subscription endpoint is required.' },
        { status: 400 }
      );
    }

    const removed = webPushEngine.removeSubscription(endpoint, userId);
    return NextResponse.json({
      success: true,
      removed,
      message: removed ? 'Push subscription revoked.' : 'Subscription not found.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error revoking push subscription.' },
      { status: 500 }
    );
  }
}
