import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { enquiryStore } from '@/lib/enquiries/enquiry-store';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const inquiryType = searchParams.get('inquiryType') || undefined;
    const priority = searchParams.get('priority') || undefined;

    const enquiries = await enquiryStore.getEnquiries({
      status,
      search,
      inquiryType,
      priority,
    });

    const stats = await enquiryStore.getStats();

    return NextResponse.json({
      success: true,
      count: enquiries.length,
      data: enquiries,
      stats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch enquiries.' },
      { status: 500 }
    );
  }
}

