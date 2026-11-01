import { NextRequest, NextResponse } from 'next/server';
import { notificationStore } from '@/lib/notifications/notification-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    const email = searchParams.get('email') || undefined;
    const phone = searchParams.get('phone') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const items = notificationStore.getNotifications({
      userId,
      email,
      phone,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: items,
      notifications: items,
      count: items.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Error fetching notifications',
        data: [],
        notifications: [],
      },
      { status: 500 }
    );
  }
}

