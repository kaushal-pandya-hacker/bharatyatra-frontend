/**
 * BharatYatra — Delete Notification API
 * DELETE /api/notifications/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { notificationStore } from '@/lib/notifications/notification-store';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireServerUser(req);
    const userId = auth.user ? auth.user.id : undefined;

    const success = notificationStore.deleteNotification(params.id, userId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Notification not found or access denied.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted.',
      id: params.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete notification.' },
      { status: 500 }
    );
  }
}
