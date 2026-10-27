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

    return NextResponse.json({ success: true, data: agency });
  } catch (err: any) {
    if (err instanceof DatabaseTableMissingError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 503 });
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const agencyId = await getAuthenticatedAgencyId(req);
    if (!agencyId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. No active travel partner session found.' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Prevent partner from changing own verification status or agreement
    const safeUpdates = {
      ...(body.representativeName && { representativeName: body.representativeName }),
      ...(body.contactPhone && { contactPhone: body.contactPhone }),
      ...(body.address && { address: body.address }),
      ...(body.city && { city: body.city }),
      ...(body.postalCode && { postalCode: body.postalCode }),
      ...(body.websiteUrl !== undefined && { websiteUrl: body.websiteUrl }),
      ...(body.businessDescription && { businessDescription: body.businessDescription }),
      ...(body.serviceCoverage && { serviceCoverage: body.serviceCoverage }),
      ...(body.commercialPreferences && { commercialPreferences: body.commercialPreferences }),
    };

    const result = await partnerService.updateAgencyProfile(agencyId, safeUpdates);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Partner profile updated successfully.',
      data: result.agency,
    });
  } catch (err: any) {
    if (err instanceof DatabaseTableMissingError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 503 });
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
