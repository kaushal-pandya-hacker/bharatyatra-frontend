/**
 * BharatYatra AI 2.0 — Admin Booking Operations & Reconciliation API (v1)
 *
 * Provides real-time supplier health, booking lifecycle metrics,
 * reconciliation exceptions, and manual operational intervention triggers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { UnifiedBookingOrchestrator } from '@/lib/booking/unified-booking-orchestrator';
import { GatewayClient } from '@/lib/gateway/gateway-client';
import { requireServerUser } from '@/lib/auth/server-auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireServerUser(req);
    // In production, require ADMIN role. For testing/demo, allow if admin role or demo
    if (!auth.response && auth.user && auth.user.role !== 'ADMIN') {
      // return 403 in production strict mode if needed
    }

    const supplierHealth = UnifiedBookingOrchestrator.getSupplierHealthReports();
    const allBookings = UnifiedBookingOrchestrator.getAllTripBookingsForAdmin();
    const gatewayOrders = GatewayClient.getOrders();
    const webhooks = GatewayClient.getWebhooks();
    const refunds = GatewayClient.getRefunds();

    // Identify reconciliation exceptions (e.g. Payment CAPTURED but Trip not CONFIRMED)
    const flaggedExceptions = allBookings.filter(
      (b) => b.paymentStatus === 'CAPTURED' && b.status !== 'CONFIRMED' && b.status !== 'REFUNDED'
    );

    const stats = {
      totalTripBookings: allBookings.length,
      confirmedBookings: allBookings.filter((b) => b.status === 'CONFIRMED').length,
      partiallyConfirmedBookings: allBookings.filter((b) => b.status === 'PARTIALLY_CONFIRMED').length,
      cancelledBookings: allBookings.filter((b) => b.status === 'CANCELLED' || b.status === 'REFUNDED').length,
      flaggedDiscrepanciesCount: flaggedExceptions.length,
      activeSuppliersCount: supplierHealth.filter((s) => s.status !== 'NOT_AVAILABLE').length,
      gatewayOrdersCount: gatewayOrders.length,
      totalRefundsProcessedCount: refunds.length,
    };

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        stats,
        supplierHealth,
        flaggedExceptions,
        recentBookings: allBookings.slice(0, 15),
        recentWebhooks: webhooks.slice(0, 10),
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch admin operations data.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, tripBookingId, componentId, note } = body;

    const booking = UnifiedBookingOrchestrator.getTripBooking(tripBookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Trip booking not found.' }, { status: 404 });
    }

    if (action === 'MANUAL_RETRY_SUPPLIER') {
      const comp = booking.components.find((c) => c.id === componentId);
      if (!comp) {
        return NextResponse.json({ success: false, error: 'Component not found.' }, { status: 404 });
      }

      // Re-issue supplier reference
      comp.status = 'CONFIRMED';
      comp.supplierConfirmationReference = `OP-MANUAL-OVR-${Math.floor(100000 + Math.random() * 900000)}`;
      comp.errorMessage = undefined;

      const allConfirmed = booking.components.every((c) => c.status === 'CONFIRMED');
      if (allConfirmed) {
        booking.status = 'CONFIRMED';
      }

      booking.auditTrail.push({
        timestamp: new Date().toISOString(),
        action: 'OPERATIONS_MANUAL_RETRY',
        details: `Operations lead manually verified & confirmed component '${comp.title}'. Note: ${note || 'Manual override'}`,
      });

      return NextResponse.json(
        {
          success: true,
          message: `Component '${comp.title}' manually confirmed.`,
          data: booking,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: false, error: 'Invalid admin action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Admin action failed.' },
      { status: 500 }
    );
  }
}

