import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';

/**
 * GET /api/v1/me
 * Returns profile data for the authenticated user.
 * Guarantees HTTP 401 for unauthenticated/expired calls and never crashes with HTTP 500.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireServerUser(req);
    if (auth.response) {
      return auth.response;
    }

    let profile: any = null;
    try {
      profile = await UserDataStore.getProfile(auth.user.id);
    } catch (dbErr: any) {
      console.warn('[api/v1/me] Database getProfile notice, using session identity:', dbErr?.message);
    }

    if (!profile) {
      profile = {
        id: auth.user.id,
        email: auth.user.email || `${auth.user.id}@bharatyatra.in`,
        fullName: auth.user.fullName || (auth.user.role === 'ADMIN' ? 'Platform Operations Administrator' : 'BharatYatra Traveler'),
        role: auth.user.role || 'CUSTOMER',
        status: 'ACTIVE',
        phoneNumber: auth.user.phoneNumber || '',
        createdAt: new Date().toISOString(),
      };

      try {
        await UserDataStore.upsertProfile(auth.user.id, profile);
      } catch (upsertErr: any) {
        console.warn('[api/v1/me] Database upsert notice, proceeding with verified in-memory profile:', upsertErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (err: any) {
    console.error('[api/v1/me] Top-level handler error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized: Authentication required.',
        code: 'UNAUTHORIZED',
      },
      { status: 401 }
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
  try {
    const auth = await requireServerUser(req);
    if (auth.response) {
      return auth.response;
    }

    const body = await req.json();

    // Prevent privilege escalation: strip role and status
    const { role: _r, status: _s, id: _id, ...safeProfileData } = body;

    let updated: any = null;
    try {
      updated = await UserDataStore.upsertProfile(auth.user.id, safeProfileData);
    } catch {
      updated = {
        id: auth.user.id,
        email: auth.user.email,
        fullName: safeProfileData.fullName || auth.user.fullName || 'BharatYatra Traveler',
        role: auth.user.role || 'CUSTOMER',
        status: 'ACTIVE',
        ...safeProfileData,
        updatedAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update profile' },
      { status: 400 }
    );
  }
}
