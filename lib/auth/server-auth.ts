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

  // 2. Cookie extraction via NextRequest cookies API
  if ('cookies' in req && typeof (req as any).cookies?.get === 'function') {
    const cookieToken =
      (req as any).cookies.get('sb_auth_token')?.value ||
      (req as any).cookies.get('sb-access-token')?.value ||
      (req as any).cookies.get('auth_token')?.value;
    if (cookieToken) return cookieToken;

    if (typeof (req as any).cookies?.getAll === 'function') {
      const allCookies = (req as any).cookies.getAll();
      for (const c of allCookies) {
        if (c.name.startsWith('sb-') && c.name.endsWith('-auth-token')) {
          try {
            const parsed = JSON.parse(decodeURIComponent(c.value));
            const tok = parsed.access_token || (Array.isArray(parsed) ? parsed[0] : null);
            if (tok) return tok;
          } catch {
            if (c.value) return c.value;
          }
        }
      }
    }
  }

  // 3. Fallback raw cookie header parsing
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:sb_auth_token|sb-access-token|auth_token)=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1].trim());
    }

    const sbMatch = cookieHeader.match(/sb-[a-z0-9_-]+-auth-token(?:.d+)?=([^;]+)/);
    if (sbMatch && sbMatch[1]) {
      try {
        const parsed = JSON.parse(decodeURIComponent(sbMatch[1].trim()));
        const tok = parsed.access_token || (Array.isArray(parsed) ? parsed[0] : null);
        if (tok) return tok;
      } catch {
        return decodeURIComponent(sbMatch[1].trim());
      }
    }
  }

  return null;
}

/**
 * Extracts the refresh token from cookies or custom headers.
 */
export function extractRefreshToken(req: NextRequest | Request): string | null {
  // 1. NextRequest cookies API
  if ('cookies' in req && typeof (req as any).cookies?.get === 'function') {
    const cookieToken =
      (req as any).cookies.get('sb_refresh_token')?.value ||
      (req as any).cookies.get('sb-refresh-token')?.value ||
      (req as any).cookies.get('auth_refresh_token')?.value;
    if (cookieToken) return cookieToken;

    if (typeof (req as any).cookies?.getAll === 'function') {
      const allCookies = (req as any).cookies.getAll();
      for (const c of allCookies) {
        if (c.name.startsWith('sb-') && c.name.endsWith('-auth-token')) {
          try {
            const parsed = JSON.parse(decodeURIComponent(c.value));
            const rt = parsed.refresh_token || (Array.isArray(parsed) ? parsed[1] : null);
            if (rt) return rt;
          } catch {}
        }
      }
    }
  }

  // 2. Fallback raw cookie header parsing
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:sb_refresh_token|sb-refresh-token|auth_refresh_token)=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1].trim());
    }

    const sbMatch = cookieHeader.match(/sb-[a-z0-9_-]+-auth-token(?:\.d+)?=([^;]+)/);
    if (sbMatch && sbMatch[1]) {
      try {
        const parsed = JSON.parse(decodeURIComponent(sbMatch[1].trim()));
        const rt = parsed.refresh_token || (Array.isArray(parsed) ? parsed[1] : null);
        if (rt) return rt;
      } catch {}
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
  const refreshToken = extractRefreshToken(req);

  if (!token && !refreshToken) return null;

  // Handle synthetic test tokens in test environment
  if (process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true') {
    if (token && token.startsWith('test-jwt-')) {
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
    let activeUser: any = null;

    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        activeUser = user;
      } else {
        const pubSupabase = getSupabaseClient();
        const { data: pubData, error: pubErr } = await pubSupabase.auth.getUser(token);
        if (!pubErr && pubData.user) {
          activeUser = pubData.user;
        }
      }
    }

    // If access token was expired or missing, but refresh token is available, attempt refresh
    if (!activeUser && refreshToken) {
      try {
        const pubSupabase = getSupabaseClient();
        const { data: refreshData, error: refreshErr } = await pubSupabase.auth.refreshSession({
          refresh_token: refreshToken,
        });
        if (!refreshErr && refreshData?.user) {
          activeUser = refreshData.user;
        }
      } catch {}
    }

    if (!activeUser) {
      return null;
    }

    // Authoritative role resolution:
    // 1. app_metadata is signed by Supabase Auth and tamper-proof.
    // 2. user_profiles table is protected by PostgreSQL triggers.
    // 3. user_metadata is UNTRUSTED (client can set arbitrary values during public signup).
    let verifiedRole: 'CUSTOMER' | 'ADMIN' | 'SUPPLIER' | 'AGENCY' = 'CUSTOMER';
    if (
      activeUser.app_metadata?.role &&
      ['ADMIN', 'SUPPLIER', 'AGENCY', 'CUSTOMER'].includes(activeUser.app_metadata.role.toUpperCase())
    ) {
      verifiedRole = activeUser.app_metadata.role.toUpperCase() as any;
    } else {
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', activeUser.id)
          .single();
        if (
          profile?.role &&
          ['ADMIN', 'SUPPLIER', 'AGENCY', 'CUSTOMER'].includes(profile.role.toUpperCase())
        ) {
          verifiedRole = profile.role.toUpperCase() as any;
        }
      } catch {
        // Fall back to CUSTOMER
      }
    }

    const meta = activeUser.user_metadata || {};
    return {
      id: activeUser.id,
      email: activeUser.email || '',
      role: verifiedRole,
      fullName: meta.full_name || meta.name || '',
      phoneNumber: activeUser.phone || meta.phone || '',
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

