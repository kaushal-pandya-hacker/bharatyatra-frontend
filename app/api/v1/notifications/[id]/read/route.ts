import { NextRequest, NextResponse } from 'next/server';
import { notificationStore } from '@/lib/notifications/notification-store';

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = notificationStore.markAsRead(params.id);
    if (!success) {
      return NextResponse.json({ success: false, message: 'Notification not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error updating notification' },
      { status: 500 }
    );
  }
}

