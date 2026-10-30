/**
 * BharatYatra AI 2.0 — Real-Time Availability & Supplier Health API (v1)
 * GET /api/v1/booking/availability -> returns supplier health statuses across all 7 categories
 * POST /api/v1/booking/availability -> checks real-time availability and rate drift for itinerary components
 */

import { NextRequest, NextResponse } from 'next/server';
import { UnifiedBookingOrchestrator } from '@/lib/booking/unified-booking-orchestrator';

export async function GET() {
  try {
    const healthReports = UnifiedBookingOrchestrator.getSupplierHealthReports();
    return NextResponse.json(
      {
        success: true,
        count: healthReports.length,
        timestamp: new Date().toISOString(),
        data: healthReports,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to retrieve supplier health.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const components = Array.isArray(body?.components) ? body.components : [];

    if (components.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No trip components provided for availability verification.',
        },
        { status: 400 }
      );
    }

    const avail = await UnifiedBookingOrchestrator.checkComponentsAvailability(components);

    return NextResponse.json(
      {
        success: true,
        allAvailable: avail.allAvailable,
        totalChecked: avail.results.length,
        timestamp: new Date().toISOString(),
        data: avail.results,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Availability verification failed.' },
      { status: 500 }
    );
  }
}
