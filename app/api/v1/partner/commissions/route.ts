import { NextRequest, NextResponse } from 'next/server';
import { partnerService, DatabaseTableMissingError } from '@/lib/partners/partner-service';
import { getAuthenticatedAgencyId } from '@/lib/partners/partner-auth';

export async function GET(req: NextRequest) {
  try {
    const agencyId = await getAuthenticatedAgencyId(req);
    if (!agencyId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. No active travel partner session found.' },
        { status: 401 }
      );
    }
    const ledger = await partnerService.getLedger(agencyId);

    let totalEarnings = 0;
    let pendingPayout = 0;
    let settledPayout = 0;

    ledger.forEach((entry) => {
      totalEarnings += entry.netPayoutAmount;
      if (entry.status === 'PENDING_SETTLEMENT') {
        pendingPayout += entry.netPayoutAmount;
      } else if (entry.status === 'SETTLED') {
        settledPayout += entry.netPayoutAmount;
      }
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalEarnings,
        pendingPayout,
        settledPayout,
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
