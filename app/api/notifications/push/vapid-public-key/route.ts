import { NextResponse } from 'next/server';
import { webPushEngine } from '@/lib/notifications/web-push-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    publicKey: webPushEngine.getVapidPublicKey(),
  });
}

