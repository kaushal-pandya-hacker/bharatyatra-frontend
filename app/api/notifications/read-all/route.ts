/**
 * BharatYatra — Mark All Notifications Read API
 * PATCH /api/notifications/read-all
 * POST /api/notifications/read-all
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { notificationStore } from '@/lib/notifications/notification-store';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  return handleMarkAll(req);
}

export async function POST(req: NextRequest) {
  return handleMarkAll(req);
}

async function handleMarkAll(req: NextRequest) {
  try {
    const auth = await requireServerUser(req);
    let userId = auth.user ? auth.user.id : undefined;
    let email = auth.user ? auth.user.email : undefined;

    // Check optional JSON body if sent
    try {
      const body = await req.json();
      if (body.userId) userId = body.userId;
      if (body.email) email = body.email;
    } catch {}

    const count = notificationStore.markAllAsRead({ userId, email });

    return NextResponse.json({
      success: true,
      message: `${count} notifications marked as read.`,
      updatedCount: count,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to mark notifications as read.' },
      { status: 500 }
    );
  }
}

