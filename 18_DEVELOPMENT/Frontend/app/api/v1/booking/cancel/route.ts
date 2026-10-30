/**
 * BharatYatra AI 2.0 — Cancellation & Automated Refund API (v1)
 * Evaluates category cancellation policies, triggers gateway refunds, and updates booking records.
 */

import { NextRequest, NextResponse } from 'next/server';
import { UnifiedBookingOrchestrator } from '@/lib/booking/unified-booking-orchestrator';
import { requireServerUser } from '@/lib/auth/server-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tripBookingId, componentId, reason } = body;

    if (!tripBookingId) {
      return NextResponse.json(
        { success: false, error: 'tripBookingId is required.' },
        { status: 400 }
      );
    }

    const auth = await requireServerUser(req);
    const userId = !auth.response && auth.user ? auth.user.id : (body?.userId || 'usr_guest_demo_01');

    const result = await UnifiedBookingOrchestrator.cancelBooking({
      tripBookingId,
      userId,
      componentId,
      reason: reason || 'Customer requested cancellation via portal',
    });

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        data: {
          tripBooking: result.tripBooking,
          refundItem: result.refundItem,
          totalPenaltyInr: result.totalPenaltyInr,
          totalRefundInr: result.totalRefundInr,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Cancellation processing failed.' },
      { status: 500 }
    );
  }
}
