import { NextRequest, NextResponse } from 'next/server';
import { partnerService, DatabaseTableMissingError } from '@/lib/partners/partner-service';
import { verifyAdminRequest } from '@/lib/partners/partner-auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, message: authResult.error || 'Unauthorized admin access.' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const agencyId = searchParams.get('agencyId') || undefined;

    const ledger = await partnerService.getLedger(agencyId);

    let totalGross = 0;
    let totalCommissions = 0;
    let pendingPayouts = 0;
    let settledPayouts = 0;

    ledger.forEach((l) => {
      totalGross += l.bookingAmount;
      totalCommissions += l.commissionAmount;
      if (l.status === 'PENDING_SETTLEMENT') {
        pendingPayouts += l.netPayoutAmount;
      } else if (l.status === 'SETTLED') {
        settledPayouts += l.netPayoutAmount;
      }
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalGross,
        totalCommissions,
        pendingPayouts,
        settledPayouts,
        totalEntries: ledger.length,
      },
      data: ledger,
    });
  } catch (err: any) {
    if (err instanceof DatabaseTableMissingError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 503 });
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
