import { NextRequest, NextResponse } from 'next/server';
import { partnerService, DatabaseTableMissingError } from '@/lib/partners/partner-service';
import { verifyAdminRequest } from '@/lib/partners/partner-auth';

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, message: authResult.error || 'Unauthorized admin access.' }, { status: 401 });
    }

    const body = await req.json();
    const { ledgerId, settlementRef = `STMT-${Date.now()}` } = body;
    const adminId = authResult.adminId || 'admin-operations';

    if (!ledgerId) {
      return NextResponse.json({ success: false, message: 'ledgerId is required.' }, { status: 400 });
    }

    const result = await partnerService.settleCommission(ledgerId, adminId, settlementRef);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Commission payout settled with reference ${settlementRef}.`,
      data: result.entry,
    });
  } catch (err: any) {
    if (err instanceof DatabaseTableMissingError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 503 });
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
