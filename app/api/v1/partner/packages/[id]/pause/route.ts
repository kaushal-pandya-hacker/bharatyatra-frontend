import { NextRequest, NextResponse } from 'next/server';
import { partnerService, DatabaseTableMissingError } from '@/lib/partners/partner-service';
import { getAuthenticatedAgencyId } from '@/lib/partners/partner-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agencyId = await getAuthenticatedAgencyId(req);
    if (!agencyId) return NextResponse.json({ success: false, message: 'Authentication required. No active travel partner session found.' }, { status: 401 });
    const pkg = await partnerService.getPackageById(params.id);

    if (!pkg) return NextResponse.json({ success: false, message: 'Package not found.' }, { status: 404 });
    if (pkg.agencyId !== agencyId) return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 403 });

    const isCurrentlyPaused = pkg.publicationStatus === 'PAUSED';
    const newStatus = isCurrentlyPaused ? 'PUBLISHED' : 'PAUSED';

    const result = await partnerService.updatePackage(params.id, agencyId, {
      publicationStatus: newStatus,
      ...(isCurrentlyPaused ? { publishedAt: new Date().toISOString(), pausedAt: null } : { pausedAt: new Date().toISOString() }),
    });

    return NextResponse.json({
      success: true,
      message: `Package ${newStatus === 'PAUSED' ? 'paused from public view' : 'resumed and published'}.`,
      data: result.package,
    });
  } catch (err: any) {
    if (err instanceof DatabaseTableMissingError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 503 });
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
