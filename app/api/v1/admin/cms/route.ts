import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const cms = adminDataStore.getCmsState();

    return NextResponse.json({
      success: true,
      data: cms,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch CMS content.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const { noticeBar } = body;

    if (noticeBar) {
      const updated = adminDataStore.updateCmsNotice(noticeBar, auth.user.email);
      return NextResponse.json({
        success: true,
        message: 'Public website notice bar updated successfully.',
        data: updated,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid payload.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to update CMS.' },
      { status: 500 }
    );
  }
}

