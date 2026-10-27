import { NextRequest, NextResponse } from 'next/server';
import { partnerService, DatabaseTableMissingError } from '@/lib/partners/partner-service';
import { getAuthenticatedAgencyId } from '@/lib/partners/partner-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agencyId = await getAuthenticatedAgencyId(req);
    if (!agencyId) {
      return NextResponse.json({ success: false, message: 'Authentication required. No active travel partner session found.' }, { status: 401 });
    }
    const pkg = await partnerService.getPackageById(params.id);

    if (!pkg) {
      return NextResponse.json({ success: false, message: 'Package not found.' }, { status: 404 });
    }

    if (pkg.agencyId !== agencyId) {
      return NextResponse.json({ success: false, message: 'Access denied: Not your package.' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: pkg });
  } catch (err: any) {
    if (err instanceof DatabaseTableMissingError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 503 });
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agencyId = await getAuthenticatedAgencyId(req);
    if (!agencyId) {
      return NextResponse.json({ success: false, message: 'Authentication required. No active travel partner session found.' }, { status: 401 });
    }
    const body = await req.json();

    const result = await partnerService.updatePackage(params.id, agencyId, body);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Package updated successfully.',
      data: result.package,
    });
  } catch (err: any) {
    if (err instanceof DatabaseTableMissingError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 503 });
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
