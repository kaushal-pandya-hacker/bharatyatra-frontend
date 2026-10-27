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
    const agency = await partnerService.getAgencyById(agencyId);

    if (!agency) {
      return NextResponse.json({ success: false, message: 'Agency not found.' }, { status: 404 });
    }

    const metrics = await partnerService.getAgencyDashboardMetrics(agencyId);

    return NextResponse.json({
      success: true,
      agency,
      metrics,
    });
  } catch (err: any) {
    if (err instanceof DatabaseTableMissingError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 503 });
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
