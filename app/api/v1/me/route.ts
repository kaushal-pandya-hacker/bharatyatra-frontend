import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';

/**
 * GET /api/v1/me
 * Returns profile data for the authenticated user.
 */
export async function GET(req: NextRequest) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    let profile = await UserDataStore.getProfile(auth.user.id);
    if (!profile) {
      profile = {
        id: auth.user.id,
        email: auth.user.email,
        fullName: auth.user.fullName || 'BharatYatra Traveler',
        role: auth.user.role,
        status: 'ACTIVE',
        phoneNumber: auth.user.phoneNumber || '',
        createdAt: new Date().toISOString(),
      };
      await UserDataStore.updateProfile(auth.user.id, profile);
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/me
 * Updates authenticated user's profile.
 * Only permits updating non-security fields (fullName, phoneNumber, avatarUrl).
 * Role and status changes via /me are strictly ignored to prevent privilege escalation.
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const body = await req.json();

    // Prevent privilege escalation: strip role and status
    const { role: _r, status: _s, id: _id, ...safeProfileData } = body;

    const updated = await UserDataStore.updateProfile(auth.user.id, safeProfileData);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update profile' },
      { status: 400 }
    );
  }
}

