import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { contributionService } from '@/lib/contributions/contribution-service';
import { AdminReviewAction } from '@/lib/contributions/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;
    const admin = auth.user;

    const body = await req.json();
    const action = body.action as AdminReviewAction;
    const notes = (body.notes || body.feedback) as string | undefined;
    const modifications = (body.modifications || body.editedFields) as any | undefined;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action field is required.', message: 'Action field is required.' },
        { status: 400 }
      );
    }

    const result = await contributionService.executeAdminAction(
      params.id,
      action,
      {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
      },
      notes,
      modifications
    );

    return NextResponse.json({
      success: true,
      message: `Admin action "${action}" executed successfully.`,
      ...result,
    });
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to execute admin action.';
    return NextResponse.json(
      { success: false, error: errorMsg, message: errorMsg },
      { status: 400 }
    );
  }
}

