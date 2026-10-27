import { NextRequest, NextResponse } from 'next/server';
import { partnerService, DatabaseTableMissingError } from '@/lib/partners/partner-service';
import { verifyAdminRequest } from '@/lib/partners/partner-auth';
import { PackagePublicationStatus } from '@/types/travel-partner';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, message: authResult.error || 'Unauthorized admin access.' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get('status') as PackagePublicationStatus) || undefined;
    const agencyId = searchParams.get('agencyId') || undefined;
    const search = searchParams.get('search')?.toLowerCase() || '';

    let packages = await partnerService.getPackages({
      publicationStatus: status,
      agencyId,
      onlyPublic: false,
    });

    if (search) {
      packages = packages.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.destinationSummary.toLowerCase().includes(search) ||
          (p.agencyName && p.agencyName.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (err: any) {
    if (err instanceof DatabaseTableMissingError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 503 });
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
