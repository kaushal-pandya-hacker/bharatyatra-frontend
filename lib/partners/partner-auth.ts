import { NextRequest } from 'next/server';
import { partnerService } from '@/lib/partners/partner-service';
import { TravelAgency } from '@/types/travel-partner';
import { getSupabaseClient } from '@/lib/supabase/client';

/**
 * Validates partner identity through trusted server-side authentication.
 * 
 * Strict Security Rules:
 * 1. Cryptographically verified Supabase Auth JWT token (Authorization: Bearer <token>)
 * 2. Unsigned/client-controlled cookies (such as `by_agency_id`) are STRICTLY PROHIBITED.
 * 3. Client-supplied agency IDs or user IDs are NEVER trusted as proof of ownership.
 * 4. Agency identity is derived exclusively by resolving the verified user.id against trusted server data.
 */
export async function getAuthenticatedAgencyId(req: NextRequest): Promise<string | null> {
  const supabase = getSupabaseClient();

  // 1. Primary: Verify Cryptographic Supabase Auth JWT Bearer Token
  const authHeader = req.headers.get('authorization');
  let token: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  // Fallback to secure Supabase session cookie (if set by official Supabase SSR auth)
  if (!token) {
    const sbCookie = req.cookies.get('sb-access-token')?.value;
    if (sbCookie) {
      token = sbCookie.trim();
    }
  }

  if (token) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user?.id) {
        // Derive agency strictly from trusted server database mapping
        const linkedAgency = await partnerService.getAgencyByUserId(user.id);
        if (linkedAgency) {
          return linkedAgency.id;
        }
      }
    } catch (err) {
      console.warn('[PartnerAuth] Failed to verify Supabase JWT token:', err);
    }
  }

  // 2. Prohibit unauthenticated and client-controlled agency IDs.
  // Unsigned 'by_agency_id' cookie and client-injected 'x-agency-id' headers
  // have been completely removed to eliminate Account Takeover & IDOR vulnerabilities.

  // No verified partner identity found
  return null;
}

export async function getAuthenticatedAgency(req: NextRequest): Promise<TravelAgency | null> {
  const agencyId = await getAuthenticatedAgencyId(req);
  if (!agencyId) return null;
  return partnerService.getAgencyById(agencyId);
}

/**
 * Validates administrative requests using trusted server secrets or verified admin claims.
 * 
 * Security Controls:
 * - Server secret match (ADMIN_SECRET_KEY)
 * - Server-controlled Supabase claims (app_metadata.role === 'admin' | 'superadmin')
 * - NEVER trusts user_metadata or email domain suffix (e.g. '@bharatyatra.in')
 */
export async function verifyAdminRequest(req: NextRequest): Promise<{ authorized: boolean; adminId?: string; error?: string }> {
  const adminSecret = process.env.ADMIN_SECRET_KEY;
  const adminKeyHeader = req.headers.get('x-admin-key') || req.headers.get('x-admin-token');

  // Check 1: Server-side secret key match (Header must match server secret exactly)
  if (adminSecret && adminSecret.trim().length > 0 && adminKeyHeader === adminSecret) {
    return { authorized: true, adminId: 'admin-operations-secret' };
  }

  // Check 2: Supabase Auth Admin Role Verification
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      try {
        const supabase = getSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          // Strictly verify app_metadata.role assigned by server/admin.
          // NEVER trust user_metadata (client-writable) or email domain suffix.
          const role = (user.app_metadata as any)?.role;
          if (role === 'admin' || role === 'superadmin') {
            return { authorized: true, adminId: user.id };
          }
        }
      } catch {
        // Ignore token verification errors
      }
    }
  }

  // Check 3: Isolated test environment fallback ONLY
  if (process.env.NODE_ENV === 'test' && process.env.USE_TEST_ADAPTER === 'true') {
    return { authorized: true, adminId: 'admin-operations-test' };
  }

  return { authorized: false, error: 'Unauthorized: Administrative credentials or valid admin session required.' };
}

