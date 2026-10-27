import { NextRequest, NextResponse } from 'next/server';
import { partnerService, DatabaseTableMissingError } from '@/lib/partners/partner-service';
import { verifyAdminRequest } from '@/lib/partners/partner-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, message: authResult.error || 'Unauthorized admin access.' }, { status: 401 });
    }
    const agency = await partnerService.getAgencyById(params.id);
    if (!agency) {
      return NextResponse.json({ success: false, message: 'Agency not found.' }, { status: 404 });
    }

    const packages = await partnerService.getPackages({ agencyId: params.id });
    const ledger = await partnerService.getLedger(params.id);
    const auditLogs = await partnerService.getAuditLogs(params.id);

    return NextResponse.json({
      success: true,
      data: {
        agency,
        packages,
        ledger,
        auditLogs,
      },
    });
  } catch (err: any) {
    if (err instanceof DatabaseTableMissingError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 503 });
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
