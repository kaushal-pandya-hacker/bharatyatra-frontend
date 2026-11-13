import { NextResponse } from 'next/server';
import { destinationPublishingEngine } from '@/lib/contributions/publishing-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const published = destinationPublishingEngine.getAllPublishedDestinations();
    return NextResponse.json({
      success: true,
      destinations: published,
      count: published.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch published destinations';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
