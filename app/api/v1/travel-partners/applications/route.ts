import { NextRequest, NextResponse } from 'next/server';
import { partnerService, DatabaseTableMissingError } from '@/lib/partners/partner-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Client/server validation
    if (!body.businessName || !body.businessEmail || !body.contactPhone || !body.representativeName) {
      return NextResponse.json(
        { success: false, message: 'Missing required business registration fields.' },
        { status: 400 }
      );
    }

    const result = await partnerService.createAgencyApplication(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Travel agency application submitted successfully for verification.',
      data: result.agency,
    });
  } catch (err: any) {
    if (err instanceof DatabaseTableMissingError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 503 });
    }
    return NextResponse.json(
      { success: false, message: err.message || 'Internal server error processing application.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const ref = searchParams.get('ref');

    if (ref) {
      const agency = await partnerService.getAgencyByReference(ref);
      if (!agency) {
        return NextResponse.json({ success: false, message: 'Application reference not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: agency });
    }

    if (email) {
      const agency = await partnerService.getAgencyByEmail(email);
      if (!agency) {
        return NextResponse.json({ success: false, message: 'Agency not found for provided email.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: agency });
    }

    return NextResponse.json({ success: false, message: 'Query parameter ref or email is required.' }, { status: 400 });
  } catch (err: any) {
    if (err instanceof DatabaseTableMissingError) {
      return NextResponse.json({ success: false, message: err.message }, { status: 503 });
    }
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
