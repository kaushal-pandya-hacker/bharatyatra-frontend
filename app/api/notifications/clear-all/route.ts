/**
 * BharatYatra — Clear Notification History API
 * DELETE /api/notifications/clear-all
 * POST /api/notifications/clear-all
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { notificationStore } from '@/lib/notifications/notification-store';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest) {
  return handleClear(req);
}

export async function POST(req: NextRequest) {
  return handleClear(req);
}

async function handleClear(req: NextRequest) {
  try {
    const auth = await requireServerUser(req);
    let userId = auth.user ? auth.user.id : undefined;
    let email = auth.user ? auth.user.email : undefined;

    try {
      const body = await req.json();
      if (body.userId) userId = body.userId;
      if (body.email) email = body.email;
    } catch {}

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: 'User identification required to clear history.' },
        { status: 400 }
      );
    }

    const clearedCount = notificationStore.clearAllNotifications(userId || '', email);

    return NextResponse.json({
      success: true,
      message: `${clearedCount} notifications cleared from history.`,
      clearedCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to clear notification history.' },
      { status: 500 }
    );
  }
}

