import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';
import { getSupabaseServerClient } from '@/lib/supabase/client';

/**
 * GET /api/v1/admin/finance/summary
 * Returns administrative financial operations summary:
 * - Gross Booking Volume (GBV)
 * - Total successful payments
 * - Total failed payments
 * - Total refunded payments
 * - Platform commission earned (10%)
 * - Supplier payable amount (90%)
 * - Pending settlements
 * - Total refunds
 * - Net platform revenue
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) {
      return auth.response;
    }

    // Default to adminDataStore calculations
    let summary = adminDataStore.getFinanceSummary();

    // If active store has zero payments, attempt to aggregate from underlying database
    if (summary.totalPaidBookings === 0 && summary.grossBookingValueInr === 0) {
      try {
        const supabase = getSupabaseServerClient();

        // 1. Check gateway_orders / payments table
        const { data: dbOrders, error: orderErr } = await supabase
          .from('gateway_orders')
          .select('amount, status, payment_method, created_at');

        if (!orderErr && Array.isArray(dbOrders) && dbOrders.length > 0) {
          const paidOrders = dbOrders.filter((o: any) => o.status === 'PAID' || o.status === 'SUCCESSFUL');
          const failedOrders = dbOrders.filter((o: any) => o.status === 'FAILED');
          const refundedOrders = dbOrders.filter((o: any) => o.status === 'REFUNDED');

          const gbv = paidOrders.reduce((sum: number, o: any) => sum + Number(o.amount || 0), 0);
          const commission = Number((gbv * 0.10).toFixed(2));
          const supplierPayable = Number((gbv * 0.90).toFixed(2));

          // 2. Check refunds table if available
          let totalRefunds = 0;
          const { data: dbRefunds } = await supabase
            .from('refunds')
            .select('amount, status');

          if (Array.isArray(dbRefunds)) {
            totalRefunds = dbRefunds
              .filter((r: any) => r.status === 'COMPLETED')
              .reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);
          }

          // 3. Check settlements table if available
          let pendingSettlements = 0;
          let settlementsCount = 0;
          const { data: dbSettlements } = await supabase
            .from('settlement_records')
            .select('payable_amount_inr, status');

          if (Array.isArray(dbSettlements)) {
            settlementsCount = dbSettlements.length;
            pendingSettlements = dbSettlements
              .filter((s: any) => s.status === 'PENDING')
              .reduce((sum: number, s: any) => sum + Number(s.payable_amount_inr || 0), 0);
          }

          const netRevenue = Number((commission - totalRefunds).toFixed(2));

          summary = {
            totalPaidBookings: paidOrders.length,
            successfulPaymentsCount: paidOrders.length,
            failedPaymentsCount: failedOrders.length,
            refundedPaymentsCount: refundedOrders.length,
            grossBookingValueInr: Number(gbv.toFixed(2)),
            gbvInr: Number(gbv.toFixed(2)),
            platformCommissionInr: commission,
            netSupplierPayableInr: supplierPayable,
            totalRefundsInr: Number(totalRefunds.toFixed(2)),
            pendingSettlementsInr: Number(pendingSettlements.toFixed(2)),
            netPlatformRevenueInr: netRevenue,
            settlementsCount,
          };
        }
      } catch (dbErr: any) {
        // Table not ready or empty -> retain genuine empty summary
        console.warn('[Finance Summary API] DB query fallback error:', dbErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to calculate financial summary.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

