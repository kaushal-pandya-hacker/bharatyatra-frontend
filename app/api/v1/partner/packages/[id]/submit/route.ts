import { NextRequest, NextResponse } from 'next/server';
import { partnerService, DatabaseTableMissingError } from '@/lib/partners/partner-service';
import { getAuthenticatedAgencyId } from '@/lib/partners/partner-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agencyId = await getAuthenticatedAgencyId(req);
    if (!agencyId) {
      return NextResponse.json({ success: false, message: 'Authentication required. No active travel partner session found.' }, { status: 401 });
    }
    const result = await partnerService.submitPackageForReview(params.id, agencyId);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Package submitted for administrative review.',
      data: result.package,
    });
  } catch (err: any) {
    if (err instanceof DatabaseTableMissingError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 503 });
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
