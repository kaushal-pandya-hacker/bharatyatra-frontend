import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/v1/admin/login
 * Authoritative authentication endpoint for BharatYatra Admin Operations Portal.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Admin email and password are required.',
          code: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    const validAdminEmails = [
      (process.env.ADMIN_EMAIL || 'admin@bharatyatra.com').toLowerCase(),
      'admin@bharatyatra.in',
      'operations@bharatyatra.com',
    ];

    const validAdminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

    const isEmailValid = validAdminEmails.includes(email);
    const isPasswordValid = password === validAdminPassword;

    if (!isEmailValid || !isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid administrative credentials.',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }

    const adminId = 'admin-super-001';
    const timestamp = Date.now();
    const token = `admin-token-${adminId}-${timestamp}`;

    const adminUser = {
      id: adminId,
      email: email,
      fullName: 'BharatYatra Platform Operations Admin',
      role: 'ADMIN',
    };

    const res = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully.',
      data: {
        token,
        user: adminUser,
      },
    });

    // Set authoritative cookie
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = `Path=/; SameSite=Lax; Max-Age=86400${isProd ? '; Secure' : ''}`;
    res.headers.set('Set-Cookie', `admin_token=${token}; ${cookieOptions}`);

    return res;
  } catch (err: any) {
    console.error('[admin/login] Error during admin login:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during authentication.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
