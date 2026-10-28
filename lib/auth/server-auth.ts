import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, getSupabaseServerClient } from '@/lib/supabase/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPPLIER' | 'AGENCY';
  fullName?: string;
  phoneNumber?: string;
}

/**
 * Extracts the bearer token from the Authorization header or cookies.
 */
export function extractAuthToken(req: NextRequest | Request): string | null {
  // 1. Authorization header: Bearer <token>
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }

  // 2. Cookie extraction
  if ('cookies' in req && typeof (req as any).cookies?.get === 'function') {
    const cookieToken = (req as any).cookies.get('sb_auth_token')?.value ||
      (req as any).cookies.get('sb-access-token')?.value ||
      (req as any).cookies.get('auth_token')?.value;
    if (cookieToken) return cookieToken;
  }

  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:sb_auth_token|sb-access-token|auth_token)=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1].trim());
    }
  }

  return null;
}

/**
 * Cryptographically validates the caller's identity via Supabase Auth.
 * Returns the immutable authenticated user profile, or null if unauthenticated.
 */
export async function getServerUser(req: NextRequest | Request): Promise<AuthenticatedUser | null> {
  const token = extractAuthToken(req);
  if (!token) return null;

  // Handle synthetic test tokens in test environment
  if (process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true') {
    if (token.startsWith('test-jwt-')) {
      const parts = token.split('-');
      // format: test-jwt-<userId>-<role>
      const userId = parts[2] || 'test-user-id';
      const role = (parts[3] || 'CUSTOMER').toUpperCase() as any;
      return {
        id: userId,
        email: `${userId}@bharatyatra.in`,
        role: role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
        fullName: `Test User ${userId}`,
      };
    }
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // Fallback: Check public supabase client
      const pubSupabase = getSupabaseClient();
      const { data: pubData, error: pubErr } = await pubSupabase.auth.getUser(token);
      if (pubErr || !pubData.user) {
        return null;
      }
      const u = pubData.user;
      const meta = u.user_metadata || {};
      return {
        id: u.id,
        email: u.email || '',
        role: (meta.role || 'CUSTOMER').toUpperCase() as any,
        fullName: meta.full_name || meta.name || '',
        phoneNumber: u.phone || meta.phone || '',
      };
    }

    const meta = user.user_metadata || {};
    return {
      id: user.id,
      email: user.email || '',
      role: (meta.role || 'CUSTOMER').toUpperCase() as any,
      fullName: meta.full_name || meta.name || '',
      phoneNumber: user.phone || meta.phone || '',
    };
  } catch (err) {
    console.error('[server-auth] Exception during token verification:', err);
    return null;
  }
}

/**
 * Guard that enforces authenticated caller identity.
 * Returns { user } if valid, or { response } containing HTTP 401 error.
 */
export async function requireServerUser(
  req: NextRequest | Request
): Promise<{ user: AuthenticatedUser; response?: never } | { user?: never; response: NextResponse }> {
  const user = await getServerUser(req);
  if (!user) {
    return {
      response: NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Authentication is required to access this resource.',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      ),
    };
  }
  return { user };
}

/**
 * Guard that enforces administrator identity.
 * Returns { user } if user has role ADMIN, or { response } containing HTTP 401 / 403 error.
 */
export async function requireAdminUser(
  req: NextRequest | Request
): Promise<{ user: AuthenticatedUser; response?: never } | { user?: never; response: NextResponse }> {
  const user = await getServerUser(req);
  if (!user) {
    return {
      response: NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Authentication required.',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      ),
    };
  }

  if (user.role !== 'ADMIN') {
    return {
      response: NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Administrative privileges required.',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

