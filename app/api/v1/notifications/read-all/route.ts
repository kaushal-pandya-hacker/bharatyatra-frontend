import { NextRequest, NextResponse } from 'next/server';
import { notificationStore } from '@/lib/notifications/notification-store';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId') || undefined;
    let email = searchParams.get('email') || undefined;

    // Check optional JSON body
    try {
      const body = await req.json();
      if (body?.userId) userId = body.userId;
      if (body?.email) email = body.email;
    } catch {
      // Body is optional
    }

    const count = notificationStore.markAllAsRead({ userId, email });

    return NextResponse.json({
      success: true,
      message: `Marked ${count} notifications as read`,
      count,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error updating notifications' },
      { status: 500 }
    );
  }
}

