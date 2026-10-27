import { NextRequest, NextResponse } from 'next/server';
import { partnerService, DatabaseTableMissingError } from '@/lib/partners/partner-service';
import { verifyAdminRequest } from '@/lib/partners/partner-auth';
import { AgencyVerificationStatus } from '@/types/travel-partner';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, message: authResult.error || 'Unauthorized admin access.' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get('status') as AgencyVerificationStatus) || undefined;
    const search = searchParams.get('search')?.toLowerCase() || '';

    let agencies = await partnerService.getAgencies(status);

    if (search) {
      agencies = agencies.filter(
        (a) =>
          a.businessName.toLowerCase().includes(search) ||
          a.referenceNumber.toLowerCase().includes(search) ||
          a.city.toLowerCase().includes(search) ||
          a.businessEmail.toLowerCase().includes(search)
      );
    }

    const overview = await partnerService.getAdminOverviewMetrics();

    return NextResponse.json({
      success: true,
      count: agencies.length,
      overview,
      data: agencies,
    });
  } catch (err: any) {
    if (err instanceof DatabaseTableMissingError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 503 });
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
