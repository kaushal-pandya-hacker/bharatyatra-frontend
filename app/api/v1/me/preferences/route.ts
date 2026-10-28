import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';

/**
 * GET /api/v1/me/preferences
 * Retrieves the authenticated user's travel preferences.
 */
export async function GET(req: NextRequest) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const preferences = await UserDataStore.getPreferences(auth.user.id);
    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/me/preferences
 * Updates authenticated user's travel preferences.
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const body = await req.json();
    const { userId: _d1, ...safePrefs } = body;

    const updated = await UserDataStore.savePreferences(auth.user.id, safePrefs);

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update preferences' },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return PATCH(req);
}

