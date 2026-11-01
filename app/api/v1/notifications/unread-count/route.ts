import { NextRequest, NextResponse } from 'next/server';
import { notificationStore } from '@/lib/notifications/notification-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    const email = searchParams.get('email') || undefined;

    const count = notificationStore.getUnreadCount({ userId, email });

    return NextResponse.json({
      success: true,
      count,
      unreadCount: count,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        count: 0,
        unreadCount: 0,
      },
      { status: 500 }
    );
  }
}

