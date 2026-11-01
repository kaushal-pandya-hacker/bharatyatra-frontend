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

    let ledger: any[] = [];
    let totalGross = 0;
    let totalCommissions = 0;
    let pendingPayouts = 0;
    let settledPayouts = 0;

    try {
      ledger = await partnerService.getLedger(agencyId);
      ledger.forEach((l) => {
        totalGross += l.bookingAmount;
        totalCommissions += l.commissionAmount;
        if (l.status === 'PENDING_SETTLEMENT') {
          pendingPayouts += l.netPayoutAmount;
        } else if (l.status === 'SETTLED') {
          settledPayouts += l.netPayoutAmount;
        }
      });
    } catch (dbErr: any) {
      console.warn('[travel-commissions] Database notice, returning empty ledger:', dbErr?.message);
    }

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
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
