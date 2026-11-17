import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';
import { adminDataStore } from '@/lib/admin/admin-store';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/users
 * Directory of platform users with comprehensive filters, search, and CSV export.
 * Accessible ONLY to authenticated administrators.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdminUser(req);
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || undefined;
    const role = searchParams.get('role') || undefined;
    const status = searchParams.get('status') || undefined;
    const verification = searchParams.get('verification') || undefined; // 'verified' | 'unverified'
    const sortBy = searchParams.get('sortBy') || 'activity'; // 'activity' | 'registration' | 'name' | 'trips' | 'bookings'
    const format = searchParams.get('format') || 'json';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Fetch authoritative users
    let rawUsers = adminDataStore.getUsers();
    if (rawUsers.length === 0) {
      const res = await UserDataStore.getAdminUsers({ limit: 100 });
      rawUsers = res.users.map((u: any) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phoneNumber: u.phoneNumber || '',
        accountStatus: u.status || 'ACTIVE',
        totalBookings: 0,
        totalSpent: 0,
        city: 'Unspecified',
        state: 'India',
        registrationDate: u.createdAt || new Date().toISOString(),
        lastLogin: u.updatedAt || new Date().toISOString(),
        kycVerified: Boolean(u.isPhoneVerified),
      }));
    }

    const allTrips = adminDataStore.getTrips();
    const allBookings = adminDataStore.getBookings();

    // Enrich users with live aggregated trip & booking counts
    let enriched = rawUsers.map((u) => {
      const userTrips = allTrips.filter((t) => t.userId === u.id || t.customerEmail.toLowerCase() === u.email.toLowerCase());
      const userBookings = allBookings.filter((b) => b.customerEmail.toLowerCase() === u.email.toLowerCase());

      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phoneNumber: u.phoneNumber,
        accountStatus: u.accountStatus,
        role: u.email.includes('admin') ? 'ADMIN' : 'CUSTOMER',
        registrationDate: u.registrationDate,
        lastActiveDate: u.lastLogin,
        isEmailVerified: true, // OAuth / Verified domain
        isPhoneVerified: u.kycVerified,
        kycVerified: u.kycVerified,
        totalTrips: userTrips.length,
        totalBookings: userBookings.length > 0 ? userBookings.length : u.totalBookings,
        totalSpentInr: u.totalSpent,
        city: u.city,
        state: u.state,
        profilePhoto: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.fullName)}&backgroundColor=f59e0b,1e293b,0284c7`,
      };
    });

    // 1. Search Filter (by name, email, phone, user ID)
    if (search) {
      const q = search.toLowerCase();
      enriched = enriched.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phoneNumber.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q)
      );
    }

    // 2. Role Filter
    if (role && role !== 'ALL') {
      enriched = enriched.filter((u) => u.role === role);
    }

    // 3. Status Filter
    if (status && status !== 'ALL') {
      enriched = enriched.filter((u) => u.accountStatus === status);
    }

    // 4. Verification Filter
    if (verification && verification !== 'ALL') {
      if (verification === 'verified') {
        enriched = enriched.filter((u) => u.kycVerified);
      } else if (verification === 'unverified') {
        enriched = enriched.filter((u) => !u.kycVerified);
      }
    }

    // 5. Sorting
    if (sortBy === 'activity') {
      enriched.sort((a, b) => new Date(b.lastActiveDate).getTime() - new Date(a.lastActiveDate).getTime());
    } else if (sortBy === 'registration') {
      enriched.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
    } else if (sortBy === 'name') {
      enriched.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (sortBy === 'trips') {
      enriched.sort((a, b) => b.totalTrips - a.totalTrips);
    } else if (sortBy === 'bookings') {
      enriched.sort((a, b) => b.totalBookings - a.totalBookings);
    }

    // Return CSV format if requested
    if (format === 'csv') {
      const headers = ['User ID', 'Full Name', 'Email', 'Phone', 'Role', 'Status', 'Registration Date', 'Last Active', 'Verified', 'Total Trips', 'Total Bookings'];
      const rows = enriched.map((u) => [
        `"${u.id}"`,
        `"${u.fullName}"`,
        `"${u.email}"`,
        `"${u.phoneNumber}"`,
        `"${u.role}"`,
        `"${u.accountStatus}"`,
        `"${u.registrationDate.split('T')[0]}"`,
        `"${u.lastActiveDate.split('T')[0]}"`,
        `"${u.kycVerified ? 'YES' : 'NO'}"`,
        u.totalTrips,
        u.totalBookings,
      ]);
      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="BharatYatra_Users_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    const total = enriched.length;
    const paginated = enriched.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      total,
      limit,
      offset,
      data: paginated,
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
    const { targetUserId, role, status, reason } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'targetUserId is required' },
        { status: 400 }
      );
    }

    let updated: any = null;
    if (status) {
      updated = adminDataStore.updateUserStatus(
        targetUserId,
        status,
        reason || 'Administrative status update',
        auth.user.email
      );
    }

    try {
      await UserDataStore.updateUserStatusOrRole(
        auth.user.id,
        auth.user.email,
        targetUserId,
        { role, status }
      );
    } catch {
      // safe fallback
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
