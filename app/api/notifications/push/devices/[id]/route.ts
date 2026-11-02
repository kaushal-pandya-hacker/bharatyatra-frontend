import { NextRequest, NextResponse } from 'next/server';
import { webPushEngine } from '@/lib/notifications/web-push-engine';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = req.nextUrl.searchParams.get('userId') || undefined;
  const removed = webPushEngine.removeDeviceById(params.id, userId);

  return NextResponse.json({
    success: removed,
    message: removed ? 'Device removed.' : 'Device not found.',
  });
}
