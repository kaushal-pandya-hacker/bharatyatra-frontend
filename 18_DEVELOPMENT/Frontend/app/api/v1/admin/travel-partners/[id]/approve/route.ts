import { NextRequest, NextResponse } from 'next/server';
import { partnerService, DatabaseTableMissingError } from '@/lib/partners/partner-service';
import { verifyAdminRequest } from '@/lib/partners/partner-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json({ success: false, message: authResult.error }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const adminId = authResult.adminId || 'admin-operations';
    const notes = body.notes || 'Verified and approved by BharatYatra Operations Admin';
    const commissionRate = body.commissionRate !== undefined ? Number(body.commissionRate) : 10.0;

    const result = await partnerService.updateAgencyStatus(params.id, 'APPROVED', adminId, notes, commissionRate);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Agency ${result.agency?.businessName} approved successfully. Partner dashboard access activated.`,
      data: result.agency,
    });
  } catch (err: any) {
    if (err instanceof DatabaseTableMissingError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 503 });
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
