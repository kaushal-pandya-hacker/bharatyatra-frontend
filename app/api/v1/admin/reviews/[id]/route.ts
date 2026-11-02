import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';
import { reviewStore } from '@/lib/reviews/review-store';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const { status, notes } = body;

    if (!status || !['PUBLISHED', 'HIDDEN', 'SPAM'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status for review moderation.' }, { status: 400 });
    }

    // Try reviewStore first
    const fromReviewStore = reviewStore.getReviewById(params.id);
    if (fromReviewStore) {
      const updatedStoreReview = reviewStore.moderateReview(params.id, status as any, notes);
      return NextResponse.json({
        success: true,
        message: `Review status updated to ${status}.`,
        data: updatedStoreReview,
      });
    }

    // Fallback to adminDataStore
    const updated = adminDataStore.moderateReview(params.id, status, notes || '', auth.user.email);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Review not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Review status updated to ${status}.`,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error moderating review.' },
      { status: 500 }
    );
  }
}
