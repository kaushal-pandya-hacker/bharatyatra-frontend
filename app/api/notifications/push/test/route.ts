import { NextRequest, NextResponse } from 'next/server';
import { webPushEngine } from '@/lib/notifications/web-push-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId || 'usr_customer_demo';

    const result = await webPushEngine.sendPushNotification(userId, {
      title: 'BharatYatra Push Verified! 🔔',
      body: 'Your device is configured to receive instant real-time travel and booking alerts.',
      url: '/notifications',
      category: 'system',
    });

    return NextResponse.json({
      success: result.sent > 0 || result.totalDevices > 0,
      sent: result.sent,
      failed: result.failed,
      totalDevices: result.totalDevices,
      message:
        result.sent > 0
          ? `Test push dispatched to ${result.sent} device(s).`
          : result.totalDevices === 0
            ? 'No active push subscription found for this browser/device. Please enable notifications first.'
            : 'Push dispatch completed.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error triggering test push notification.' },
      { status: 500 }
    );
  }
}

