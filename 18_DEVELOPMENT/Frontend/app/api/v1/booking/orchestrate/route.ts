/**
 * BharatYatra AI 2.0 — End-to-End Booking Orchestration API (v1)
 *
 * Coordinates multi-supplier trip lifecycle:
 * - CREATE_TRIP: Initializes trip booking record
 * - REVALIDATE_PRICES: Real-time price revalidation & rate drift analysis
 * - AUTHORIZE_PRICE: User renewed authorization with 10-minute price lock
 * - CREATE_ORDER: Creates BharatGateway payment order
 * - CONFIRM_BOOKING: Sequential supplier fulfillment and voucher issuance
 */

import { NextRequest, NextResponse } from 'next/server';
import { UnifiedBookingOrchestrator } from '@/lib/booking/unified-booking-orchestrator';
import { requireServerUser } from '@/lib/auth/server-auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tripBookingId = searchParams.get('tripBookingId') || searchParams.get('id');

    if (!tripBookingId) {
      return NextResponse.json(
        { success: false, error: 'tripBookingId query parameter is required.' },
        { status: 400 }
      );
    }

    const booking = UnifiedBookingOrchestrator.getTripBooking(tripBookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: `Trip booking '${tripBookingId}' not found.` },
        { status: 404 }
      );
    }

    // IDOR protection check if user is authenticated
    const auth = await requireServerUser(req);
    if (!auth.response && auth.user) {
      if (booking.userId !== auth.user.id && auth.user.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Access denied: You do not own this booking.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: booking,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch trip booking.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body?.action || 'CREATE_TRIP';

    // Extract auth user if available, otherwise support demo session
    const auth = await requireServerUser(req);
    const userId = !auth.response && auth.user ? auth.user.id : (body?.userId || 'usr_guest_demo_01');

    // 1. Action: CREATE_TRIP
    if (action === 'CREATE_TRIP') {
      const { title, originCity, destinationCity, startDate, endDate, travelersCount, components } = body;
      if (!title || !originCity || !destinationCity || !Array.isArray(components) || components.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Missing required trip fields (title, originCity, destinationCity, components).' },
          { status: 400 }
        );
      }

      const created = await UnifiedBookingOrchestrator.createTripBooking({
        userId,
        title,
        originCity,
        destinationCity,
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
        travelersCount: travelersCount || 1,
        components,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Trip booking record initialized.',
          data: created,
        },
        { status: 201 }
      );
    }

    // 2. Action: REVALIDATE_PRICES
    if (action === 'REVALIDATE_PRICES') {
      const { tripBookingId } = body;
      const booking = UnifiedBookingOrchestrator.getTripBooking(tripBookingId);
      if (!booking) {
        return NextResponse.json(
          { success: false, error: `Trip booking '${tripBookingId}' not found.` },
          { status: 404 }
        );
      }

      const reval = await UnifiedBookingOrchestrator.revalidateTripPrices(booking.components);

      booking.totalVerifiedPrice = reval.totalVerified;
      booking.priceDifference = reval.totalDelta;
      booking.requiresRenewedAuthorization = reval.requiresUserAuthorization;
      booking.priceLockedUntil = reval.priceLockedUntil;
      booking.status = reval.requiresUserAuthorization ? 'PRICE_CHANGED' : 'PRICE_VERIFIED';

      booking.auditTrail.push({
        timestamp: new Date().toISOString(),
        action: 'PRICE_REVALIDATED',
        details: `Prices revalidated: Quoted ₹${reval.totalQuoted}, Verified ₹${reval.totalVerified} (Delta: ₹${reval.totalDelta}, Auth Req: ${reval.requiresUserAuthorization})`,
      });

      return NextResponse.json(
        {
          success: true,
          message: reval.requiresUserAuthorization
            ? 'Price changed. Renewed user authorization required.'
            : reval.isPriceDrop
            ? 'Great news! Price decreased. Lower rate locked.'
            : 'Prices verified against live suppliers.',
          data: {
            revalidation: reval,
            tripBooking: booking,
          },
        },
        { status: 200 }
      );
    }

    // 3. Action: AUTHORIZE_PRICE
    if (action === 'AUTHORIZE_PRICE') {
      const { tripBookingId } = body;
      if (!tripBookingId) {
        return NextResponse.json({ success: false, error: 'tripBookingId is required.' }, { status: 400 });
      }

      const authorized = UnifiedBookingOrchestrator.authorizeTripPrice(tripBookingId, userId);
      return NextResponse.json(
        {
          success: true,
          message: 'Prices successfully authorized. 10-minute price lock activated.',
          data: authorized,
        },
        { status: 200 }
      );
    }

    // 4. Action: CREATE_ORDER
    if (action === 'CREATE_ORDER') {
      const { tripBookingId, customerEmail, customerPhone } = body;
      if (!tripBookingId) {
        return NextResponse.json({ success: false, error: 'tripBookingId is required.' }, { status: 400 });
      }

      const { order, tripBooking } = await UnifiedBookingOrchestrator.createBharatGatewayOrder(
        tripBookingId,
        userId,
        customerEmail,
        customerPhone
      );

      return NextResponse.json(
        {
          success: true,
          message: 'BharatGateway payment order generated.',
          data: {
            order,
            tripBooking,
          },
        },
        { status: 200 }
      );
    }

    // 5. Action: CONFIRM_BOOKING (Post-Payment Sequential Supplier Orchestration)
    if (action === 'CONFIRM_BOOKING') {
      const { tripBookingId, paymentOrderId, paymentMethod, simulateSupplierFailureComponentId } = body;
      if (!tripBookingId || !paymentOrderId) {
        return NextResponse.json(
          { success: false, error: 'tripBookingId and paymentOrderId are required.' },
          { status: 400 }
        );
      }

      const result = await UnifiedBookingOrchestrator.processPaymentAndConfirmSuppliers({
        tripBookingId,
        userId,
        paymentOrderId,
        paymentMethod: paymentMethod || 'UPI',
        simulateSupplierFailureComponentId,
      });

      return NextResponse.json(
        {
          success: result.success,
          message: result.success
            ? 'Trip booking confirmed! All supplier vouchers issued.'
            : result.confirmedComponentsCount > 0
            ? 'Trip partially confirmed. Refund issued for unavailable component.'
            : 'Booking fulfillment failed. Full refund processed.',
          data: result,
        },
        { status: result.success ? 200 : 207 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Unsupported orchestration action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Booking orchestration failed.' },
      { status: 500 }
    );
  }
}
