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

    let auditLogs: any[] = [];
    try {
      auditLogs = await partnerService.getAuditLogs(agencyId);
    } catch (dbErr: any) {
      console.warn('[travel-partner-audit] Database notice, returning empty audit list:', dbErr?.message);
    }

    return NextResponse.json({
      success: true,
      count: auditLogs.length,
      data: auditLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
