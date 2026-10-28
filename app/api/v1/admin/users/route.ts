import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';

/**
 * GET /api/v1/admin/users
 * Directory of platform users. Accessible ONLY to authenticated administrators.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdminUser(req);
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await UserDataStore.getAdminUsers({ search, role, status, limit, offset });

    return NextResponse.json({
      success: true,
      total: result.total,
      data: result.users,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list platform users' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/admin/users
 * Updates account status or role for a target user.
 * Restricted to administrators with audit log recording.
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireAdminUser(req);
  if (auth.response) return auth.response;

  try {
    const body = await req.json();
    const { targetUserId, role, status } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'targetUserId is required' },
        { status: 400 }
      );
    }

    if (role && !['CUSTOMER', 'ADMIN', 'SUPPLIER', 'AGENCY'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user role' },
        { status: 400 }
      );
    }

    if (status && !['ACTIVE', 'SUSPENDED', 'DEACTIVATED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user status' },
        { status: 400 }
      );
    }

    const updated = await UserDataStore.updateUserStatusOrRole(
      auth.user.id,
      auth.user.email,
      targetUserId,
      { role, status }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Target user not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User account updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update user' },
      { status: 400 }
    );
  }
}

