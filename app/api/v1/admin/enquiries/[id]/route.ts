import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { enquiryStore } from '@/lib/enquiries/enquiry-store';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const enquiry = await enquiryStore.getEnquiryById(params.id);
    if (!enquiry) {
      return NextResponse.json({ success: false, message: 'Enquiry not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: enquiry });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error loading enquiry details.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const { status, priority, adminNotes } = body;

    const updated = await enquiryStore.updateEnquiry(params.id, {
      status,
      priority,
      adminNotes,
      adminEmail: auth.user.email,
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Enquiry not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error updating enquiry.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const deleted = await enquiryStore.deleteEnquiry(params.id, auth.user.email);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Enquiry not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry permanently deleted.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error deleting enquiry.' },
      { status: 500 }
    );
  }
}

