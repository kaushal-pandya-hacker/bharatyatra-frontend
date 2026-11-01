import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format'); // json or csv

    const payments = adminDataStore.getPayments();
    const refunds = adminDataStore.getRefunds();
    const settlements = adminDataStore.getSettlements();

    const totalCaptured = payments
      .filter((p) => p.status === 'SUCCESSFUL')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRefunded = refunds
      .filter((r) => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalSettled = settlements
      .filter((s) => s.status === 'SETTLED')
      .reduce((sum, s) => sum + s.payableAmountInr, 0);

    const totalCommissionsEarned = settlements.reduce((sum, s) => sum + s.commissionAmountInr, 0);

    if (format === 'csv') {
      let csv = 'Transaction ID,Booking Ref,Customer,Gateway,Method,Amount (INR),Status,Date\n';
      payments.forEach((p) => {
        csv += `"${p.transactionId}","${p.bookingReference}","${p.customerName}","${p.gateway}","${p.method}",${p.amount},"${p.status}","${p.transactionDate}"\n`;
      });

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="BharatYatra_Financial_Report.csv"',
        },
      });
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalCapturedInr: totalCaptured,
        totalRefundedInr: totalRefunded,
        netRevenueInr: totalCaptured - totalRefunded,
        totalSettledInr: totalSettled,
        totalCommissionsEarnedInr: totalCommissionsEarned,
      },
      transactionsCount: payments.length,
      refundsCount: refunds.length,
      settlementsCount: settlements.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to generate financial reports.' },
      { status: 500 }
    );
  }
}

