import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const data = adminDataStore.getStaffMembers();

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch staff members.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const { fullName, email, role, department, permissions } = body;

    if (!fullName || !email || !role) {
      return NextResponse.json({ success: false, message: 'Full name, email, and role are required.' }, { status: 400 });
    }

    const created = adminDataStore.createStaffMember(
      {
        fullName,
        email,
        role,
        department: department || 'General Operations',
        permissions: permissions || ['STANDARD_ACCESS'],
        status: 'ACTIVE',
      },
      auth.user.email
    );

    return NextResponse.json({
      success: true,
      message: 'Staff member account created.',
      data: created,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to create staff member.' },
      { status: 500 }
    );
  }
}

