import { NextRequest, NextResponse } from 'next/server';
import { partnerService, DatabaseTableMissingError } from '@/lib/partners/partner-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('ref');
    const email = searchParams.get('email');

    if (!ref) {
      return NextResponse.json(
        { success: false, message: 'Application reference number is required.' },
        { status: 400 }
      );
    }

    const agency = await partnerService.getAgencyByReference(ref);
    if (!agency) {
      return NextResponse.json(
        { success: false, message: 'No agency application found with this reference number.' },
        { status: 404 }
      );
    }

    // If email is provided, verify match for additional security
    if (email && agency.businessEmail.toLowerCase() !== email.trim().toLowerCase()) {
      return NextResponse.json(
        { success: false, message: 'Provided email does not match application records.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        referenceNumber: agency.referenceNumber,
        businessName: agency.businessName,
        representativeName: agency.representativeName,
        businessEmail: agency.businessEmail,
        city: agency.city,
        stateCode: agency.stateCode,
        verificationStatus: agency.verificationStatus,
        verifiedAt: agency.verifiedAt,
        rejectionReason: agency.rejectionReason,
        informationRequestNotes: agency.informationRequestNotes,
        submittedAt: agency.createdAt,
        updatedAt: agency.updatedAt,
      },
    });
  } catch (err: any) {
    if (err instanceof DatabaseTableMissingError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 503 });
    }
    return NextResponse.json(
      { success: false, message: err.message || 'Error retrieving application status.' },
      { status: 500 }
    );
  }
}
