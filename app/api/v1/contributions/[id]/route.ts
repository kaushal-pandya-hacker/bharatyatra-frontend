import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { contributionService } from '@/lib/contributions/contribution-service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireServerUser(req);
    if (auth.response) return auth.response;
    const user = auth.user;

    const submission = await contributionService.getContributionById(params.id, {
      id: user.id,
      role: user.role,
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, message: 'Contribution submission not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      submission,
    });
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to retrieve contribution.';
    return NextResponse.json(
      { success: false, error: errorMsg, message: errorMsg },
      { status: err?.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireServerUser(req);
    if (auth.response) return auth.response;
    const user = auth.user;

    const body = await req.json();

    const updated = await contributionService.updateContribution(params.id, body, {
      id: user.id,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Contribution updated successfully.',
      submission: updated,
    });
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to update contribution.';
    return NextResponse.json(
      { success: false, error: errorMsg, message: errorMsg },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireServerUser(req);
    if (auth.response) return auth.response;
    const user = auth.user;

    const withdrawn = await contributionService.withdrawContribution(params.id, {
      id: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Contribution withdrawn successfully.',
      submission: withdrawn,
    });
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to withdraw contribution.';
    return NextResponse.json(
      { success: false, error: errorMsg, message: errorMsg },
      { status: 400 }
    );
  }
}

