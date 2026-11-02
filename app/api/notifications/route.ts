/**
 * BharatYatra — Universal In-App & Background Notification API
 * GET /api/notifications
 * Supports filtering by category, user, unread status, and search query.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { notificationStore } from '@/lib/notifications/notification-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireServerUser(req);
    const { searchParams } = new URL(req.url);

    const queryUserId = searchParams.get('userId');
    const queryEmail = searchParams.get('email');
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const effectiveUserId = queryUserId || (auth.user ? auth.user.id : undefined);
    const effectiveEmail = queryEmail || (auth.user ? auth.user.email : undefined);

    const notifications = notificationStore.getNotifications({
      userId: effectiveUserId,
      email: effectiveEmail,
      category,
      limit,
    });

    const unreadCount = notificationStore.getUnreadCount({
      userId: effectiveUserId,
      email: effectiveEmail,
    });

    return NextResponse.json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
      notifications,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch notifications.' },
      { status: 500 }
    );
  }
}
