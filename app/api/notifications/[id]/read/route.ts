/**
 * BharatYatra — Mark Notification Read API
 * PATCH /api/notifications/[id]/read
 */

import { NextRequest, NextResponse } from 'next/server';
import { notificationStore } from '@/lib/notifications/notification-store';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = notificationStore.markAsRead(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read.',
      id: params.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update notification.' },
      { status: 500 }
    );
  }
}

