/**
 * BharatYatra — Skip Onboarding API
 * POST /api/user/onboarding/skip
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireServerUser(req);
    const userId = auth.user ? auth.user.id : null;

    if (userId) {
      await UserDataStore.savePreferences(userId, {
        onboardingStatus: 'SKIPPED',
      } as any);
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding marked as skipped.',
      onboardingStatus: 'SKIPPED',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to skip onboarding' },
      { status: 500 }
    );
  }
}

