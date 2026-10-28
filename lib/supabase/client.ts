import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uedmguvljhsvbndwkruz.supabase.co';

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_s-dMVkeMYG384Cyz9sO0cg_JkrRjbSV';

let supabaseInstance: SupabaseClient | null = null;
let supabaseServerInstance: SupabaseClient | null = null;

/**
 * Public client for browser and standard authenticated requests.
 * Uses publishable / anon key and enforces Row Level Security.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
  }
  return supabaseInstance;
}

export function setSupabaseClientForTesting(client: SupabaseClient | null): void {
  supabaseInstance = client;
}

/**
 * Secure server-only client for backend API routes.
 * Uses SUPABASE_SERVICE_ROLE_KEY if configured in server environment.
 * Never exposes privileged keys to the browser.
 */
export function getSupabaseServerClient(): SupabaseClient {
  // Never use service role key in browser
  if (typeof window !== 'undefined') {
    return getSupabaseClient();
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    if (!supabaseServerInstance) {
      supabaseServerInstance = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
    return supabaseServerInstance;
  }

  // Graceful fallback to publishable client if service role key is unconfigured
  return getSupabaseClient();
}

/**
 * User-scoped client forwarding the caller's JWT to Supabase.
 * Enforces PostgreSQL Row Level Security (RLS) under the caller's identity
 * without requiring elevated service role permissions.
 */
export function getSupabaseUserClient(accessToken: string): SupabaseClient {
  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export const supabase = getSupabaseClient();
