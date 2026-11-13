import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { contributionService } from '@/lib/contributions/contribution-service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const [submission, reviewHistory] = await Promise.all([
      contributionService.getContributionById(params.id),
      contributionService.getReviewHistory(params.id),
    ]);

    if (!submission) {
      return NextResponse.json(
        { success: false, message: 'Contribution submission not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      submission,
      reviewHistory,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch contribution details.' },
      { status: 500 }
    );
  }
}

