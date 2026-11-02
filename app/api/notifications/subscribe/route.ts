import { NextRequest, NextResponse } from 'next/server';
import { webPushEngine } from '@/lib/notifications/web-push-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription, device, userId } = body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { success: false, message: 'Valid push subscription endpoint and keys are required.' },
        { status: 400 }
      );
    }

    const targetUser = userId || 'usr_customer_demo';
    const record = webPushEngine.saveSubscription({
      userId: targetUser,
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      device: device || {
        deviceType: 'Desktop',
        browser: 'Browser',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Push subscription successfully registered.',
      data: record,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error saving push subscription.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

