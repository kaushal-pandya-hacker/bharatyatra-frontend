'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { apiFetch } from '@/lib/api/client';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phoneNumber?: string;
  avatarUrl?: string;
  createdAt?: string;
  isPhoneVerified?: boolean;
}

export type AuthState = 'INITIALIZING' | 'AUTHENTICATED' | 'UNAUTHENTICATED' | 'RECOVERABLE_ERROR';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  authState: AuthState;
  loginWithGoogle: (redirectTo?: string) => Promise<void>;
  completeProfile: (fullName: string, email?: string) => Promise<UserProfile>;
  login: (email: string, passwordHash: string) => Promise<void>;
  register: (fullName: string, email: string, passwordHash: string, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  authState: 'INITIALIZING',
  loginWithGoogle: async () => {},
  completeProfile: async () => (null as any),
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function normalizeIndianPhoneNumber(phone: string): { isValid: boolean; normalized: string; digits: string } {
  let cleaned = phone.trim();
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91') && cleaned.length > 10) {
    cleaned = cleaned.substring(2);
  }
  const digits = cleaned.replace(/\D/g, '');
  const isValid = digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
  return {
    isValid,
    normalized: isValid ? `+91${digits}` : '',
    digits,
  };
}

export function getSiteUrl(): string {
  let url = process.env.NEXT_PUBLIC_SITE_URL;

  // In browser, dynamically resolve from current origin if NEXT_PUBLIC_SITE_URL is not set
  if (!url || url.trim() === '') {
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      url = window.location.origin;
    }
  }

  // Node/SSR fallback logic strictly based on environment
  if (!url || url.trim() === '') {
    if (process.env.NODE_ENV === 'development') {
      url = 'http://localhost:3000';
    } else {
      throw new Error(
        'CRITICAL CONFIGURATION ERROR: NEXT_PUBLIC_SITE_URL environment variable is missing in production environment. ' +
        'Please set NEXT_PUBLIC_SITE_URL=https://bharatyatra-frontend-llsu.vercel.app in Vercel Settings.'
      );
    }
  }

  return url.replace(/\/+$/, '');
}

export function setAuthSessionCookie(token: string, refreshToken?: string) {
  if (typeof document === 'undefined') return;
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const maxAge = 2592000; // 30 days persistent session

  // Scoped to .bharatyatra.in on production domain without duplicate host-only cookies
  const domainPart = hostname.endsWith('bharatyatra.in') ? '; Domain=.bharatyatra.in' : '';
  const cookieOptions = `Path=/; SameSite=Lax; Max-Age=${maxAge}${domainPart}${isSecure ? '; Secure' : ''}`;

  document.cookie = `sb_auth_token=${encodeURIComponent(token)}; ${cookieOptions}`;
  document.cookie = `sb-access-token=${encodeURIComponent(token)}; ${cookieOptions}`;
  document.cookie = `auth_token=${encodeURIComponent(token)}; ${cookieOptions}`;

  if (refreshToken) {
    document.cookie = `sb_refresh_token=${encodeURIComponent(refreshToken)}; ${cookieOptions}`;
    document.cookie = `sb-refresh-token=${encodeURIComponent(refreshToken)}; ${cookieOptions}`;
    document.cookie = `auth_refresh_token=${encodeURIComponent(refreshToken)}; ${cookieOptions}`;
  }
}

export function recoverPersistedRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  // 1. Check dedicated localStorage key
  try {
    const directToken = localStorage.getItem('auth_refresh_token');
    if (directToken && directToken.trim()) return directToken.trim();
  } catch {}

  // 2. Check Supabase internal project storage key (e.g. sb-*-auth-token)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const val = localStorage.getItem(key);
        if (val) {
          const parsed = JSON.parse(val);
          const rt = parsed?.refresh_token || (Array.isArray(parsed) ? parsed[1] : null);
          if (rt) return rt;
        }
      }
    }
  } catch {}

  // 3. Check cookies
  if (typeof document !== 'undefined') {
    try {
      const match = document.cookie.match(/(?:sb_refresh_token|sb-refresh-token|auth_refresh_token)=([^;]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1].trim());
      }
    } catch {}
  }

  return null;
}

export function clearUserLocalCache() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_refresh_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('chalo_farva_saved_trips');
  localStorage.removeItem('chalo_farva_selected_destinations');
  localStorage.removeItem('bharatyatra_travel_profile');
  localStorage.removeItem('bharatyatra_active_booking_context');

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('chalo_farva_saved_trips') ||
          key.startsWith('bharatyatra_travel_profile') ||
          key.startsWith('cf_'))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}

  if (typeof document !== 'undefined') {
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const expires = 'Expires=Thu, 01 Jan 1970 00:00:01 GMT';

    const baseClear = `Path=/; ${expires}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
    const domainClear = `Path=/; Domain=.bharatyatra.in; ${expires}; SameSite=Lax${isSecure ? '; Secure' : ''}`;

    const cookieNames = [
      'sb_auth_token',
      'sb-access-token',
      'auth_token',
      'sb_refresh_token',
      'sb-refresh-token',
      'auth_refresh_token',
    ];
    for (const name of cookieNames) {
      document.cookie = `${name}=; ${baseClear}`;
      if (hostname.endsWith('bharatyatra.in')) {
        document.cookie = `${name}=; ${domainClear}`;
      }
    }
  }
  sessionStorage.clear();
}

export function mapSupabaseUserToProfile(sbUser: SupabaseUser, overrideProfile?: { fullName?: string; email?: string; avatarUrl?: string }): UserProfile {
  const metadata = sbUser.user_metadata || {};
  const phone = sbUser.phone || metadata.phone || '';
  const email = overrideProfile?.email || sbUser.email || metadata.email || `user_${sbUser.id.substring(0, 8)}@bharatyatra.com`;
  const fullName = overrideProfile?.fullName || metadata.full_name || metadata.name || (email ? email.split('@')[0] : 'BharatYatra Traveller');
  const avatarUrl = overrideProfile?.avatarUrl || metadata.avatar_url || metadata.picture || '';

  return {
    id: sbUser.id,
    email,
    fullName,
    role: metadata.role || 'CUSTOMER',
    phoneNumber: phone,
    avatarUrl,
    isPhoneVerified: Boolean(sbUser.phone_confirmed_at || phone),
    createdAt: sbUser.created_at,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>('INITIALIZING');

  const fetchBackendUser = async (authToken: string) => {
    try {
      const res = await apiFetch<{ success: boolean; data: any }>('/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res && res.success && res.data) {
        const u = res.data;
        return {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          phoneNumber: u.phoneNumber,
          role: u.role || 'CUSTOMER',
          isPhoneVerified: u.isPhoneVerified,
        };
      }
    } catch (e) {
      // Backend lookup failed or unauthenticated
    }
    return null;
  };

  const refreshUser = async () => {
    const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
    if (!currentToken) return;

    const bUser = await fetchBackendUser(currentToken);
    if (bUser) {
      setUser(bUser);
      localStorage.setItem('auth_user', JSON.stringify(bUser));
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Optimistic hydration from localStorage to eliminate any login-page flash
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const storedUserRaw = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
    const storedRefreshToken = typeof window !== 'undefined' ? recoverPersistedRefreshToken() : null;

    if (storedToken && storedUserRaw) {
      try {
        const cachedUser = JSON.parse(storedUserRaw);
        if (cachedUser && cachedUser.id && cachedUser.email) {
          setUser(cachedUser);
          setToken(storedToken);
          setAuthState('AUTHENTICATED');
          setAuthSessionCookie(storedToken, storedRefreshToken || undefined);
        }
      } catch {}
    }

    const initAuth = async () => {
      try {
        // 2. Try Supabase getSession()
        let { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase getSession notification:', error.message);
        }

        // 3. If session is null or expired, attempt session refresh with recovered refresh token
        if (!session) {
          const refreshToken = storedRefreshToken || recoverPersistedRefreshToken();
          if (refreshToken) {
            try {
              const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession({
                refresh_token: refreshToken,
              });
              if (refreshData?.session) {
                session = refreshData.session;
              } else if (refreshErr) {
                console.warn('Supabase refreshSession notice:', refreshErr.message);
              }
            } catch (e) {
              // refresh error ignored
            }
          }
        }

        if (session && session.user) {
          const userProfile = mapSupabaseUserToProfile(session.user);
          if (isMounted) {
            setToken(session.access_token);
            setAuthSessionCookie(session.access_token, session.refresh_token);
            setUser(userProfile);
            setAuthState('AUTHENTICATED');
            localStorage.setItem('auth_token', session.access_token);
            if (session.refresh_token) {
              localStorage.setItem('auth_refresh_token', session.refresh_token);
            }
            localStorage.setItem('auth_user', JSON.stringify(userProfile));

            // Hydrate backend profile asynchronously
            fetchBackendUser(session.access_token).then((bUser) => {
              if (bUser && isMounted) {
                setUser(bUser);
                localStorage.setItem('auth_user', JSON.stringify(bUser));
              }
            }).catch(() => {});
          }
        } else if (storedToken && storedToken !== 'demo_persistent_token') {
          // If Supabase session is not present, check custom/backend auth token
          try {
            const bUser = await fetchBackendUser(storedToken);
            if (bUser && isMounted) {
              setUser(bUser);
              setToken(storedToken);
              setAuthState('AUTHENTICATED');
              setAuthSessionCookie(storedToken, storedRefreshToken || undefined);
              localStorage.setItem('auth_user', JSON.stringify(bUser));
            } else if (bUser === null && isMounted) {
              // Only invalidate state if no active Supabase session
              const currentSession = await supabase.auth.getSession();
              if (!currentSession.data.session && isMounted) {
                setUser(null);
                setToken(null);
                setAuthState('UNAUTHENTICATED');
              }
            }
          } catch {
            // Network error: preserve cached credentials so user stays logged in offline or during temporary blip
            if (isMounted) {
              setAuthState('RECOVERABLE_ERROR');
            }
          }
        } else if (isMounted) {
          // No stored session and no Supabase session: set unauthenticated state without wiping unrelated data
          setUser(null);
          setToken(null);
          setAuthState('UNAUTHENTICATED');
        }
      } catch (err) {
        console.warn('[auth-context] Error during initAuth:', err);
        if (isMounted) {
          setAuthState('RECOVERABLE_ERROR');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // 4. Supabase auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session && session.user) {
        const userProfile = mapSupabaseUserToProfile(session.user);
        setToken(session.access_token);
        setAuthSessionCookie(session.access_token, session.refresh_token);
        setUser(userProfile);
        setAuthState('AUTHENTICATED');
        localStorage.setItem('auth_token', session.access_token);
        if (session.refresh_token) {
          localStorage.setItem('auth_refresh_token', session.refresh_token);
        }
        localStorage.setItem('auth_user', JSON.stringify(userProfile));
      } else if (event === 'SIGNED_OUT') {
        setToken(null);
        setUser(null);
        setAuthState('UNAUTHENTICATED');
        clearUserLocalCache();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async (redirectTo?: string) => {
    const siteUrl = getSiteUrl();
    const callbackUrl = `${siteUrl}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ''}`;

    if (typeof window !== 'undefined') {
      console.log('[OAuth Diagnostic]', {
        windowOrigin: window.location.origin,
        siteUrl: siteUrl,
        redirectTo: callbackUrl,
        hasNextPublicSiteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
        environment: process.env.NODE_ENV,
      });
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to initiate Google Sign In.');
    }
  };

  const completeProfile = async (fullName: string, email?: string) => {
    if (!fullName || fullName.trim().length === 0) {
      throw new Error('Full name is required to complete profile.');
    }

    const cleanName = fullName.trim();
    const cleanEmail = email && email.trim().length > 0 ? email.trim() : undefined;

    try {
      const updatePayload: { data: { full_name: string }; email?: string } = {
        data: { full_name: cleanName },
      };
      if (cleanEmail) {
        updatePayload.email = cleanEmail;
      }

      const { data, error } = await supabase.auth.updateUser(updatePayload);

      if (!error && data.user) {
        const updatedProfile = mapSupabaseUserToProfile(data.user, { fullName: cleanName, email: cleanEmail });
        setUser(updatedProfile);
        localStorage.setItem('auth_user', JSON.stringify(updatedProfile));
        return updatedProfile;
      }
    } catch (err) {
      // Fallback
    }

    const fallbackUser: UserProfile = user
      ? { ...user, fullName: cleanName, email: cleanEmail || user.email }
      : {
          id: `usr_${Date.now()}`,
          email: cleanEmail || `user_${Date.now()}@bharatyatra.com`,
          fullName: cleanName,
          role: 'CUSTOMER',
        };

    setUser(fallbackUser);
    localStorage.setItem('auth_user', JSON.stringify(fallbackUser));
    return fallbackUser;
  };

  const login = async (email: string, passwordHash: string) => {
    // Clean old user cache on new login attempt
    clearUserLocalCache();

    try {
      // First try Supabase login if available
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: passwordHash,
      });

      if (!error && data.user && data.session) {
        const userProfile = mapSupabaseUserToProfile(data.user);
        const authToken = data.session.access_token;
        const refreshToken = data.session.refresh_token;
        setToken(authToken);
        setAuthSessionCookie(authToken, refreshToken);
        setUser(userProfile);
        setAuthState('AUTHENTICATED');
        localStorage.setItem('auth_token', authToken);
        if (refreshToken) {
          localStorage.setItem('auth_refresh_token', refreshToken);
        }
        localStorage.setItem('auth_user', JSON.stringify(userProfile));
        return;
      }
    } catch (e) {}

    // Fallback to NestJS backend /auth/login
    try {
      const res = await apiFetch<{ success: boolean; data: { token: string; user: any } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, passwordHash }),
      });

      if (res && res.success && res.data) {
        const authToken = res.data.token;
        const u = res.data.user;
        const userProfile: UserProfile = {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          phoneNumber: u.phoneNumber,
          role: u.role || 'CUSTOMER',
        };
        setToken(authToken);
        setAuthSessionCookie(authToken);
        setUser(userProfile);
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('auth_user', JSON.stringify(userProfile));
        return;
      }
    } catch (err: any) {
      throw new Error(err.message || 'Invalid email or password.');
    }
  };

  const register = async (fullName: string, email: string, passwordHash: string, phoneNumber?: string) => {
    clearUserLocalCache();

    try {
      const res = await apiFetch<{ success: boolean; data: { token: string; user: any } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, passwordHash, phoneNumber }),
      });

      if (res && res.success && res.data) {
        const authToken = res.data.token;
        const u = res.data.user;
        const userProfile: UserProfile = {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          phoneNumber: u.phoneNumber,
          role: u.role || 'CUSTOMER',
        };
        setToken(authToken);
        setAuthSessionCookie(authToken);
        setUser(userProfile);
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('auth_user', JSON.stringify(userProfile));
        return;
      }
    } catch (e) {}

    const { data, error } = await supabase.auth.signUp({
      email,
      password: passwordHash,
      options: {
        data: {
          full_name: fullName,
          phone: phoneNumber,
        },
      },
    });

    if (error || !data.user) {
      throw new Error(error?.message || 'Registration failed.');
    }

    const userProfile = mapSupabaseUserToProfile(data.user, { fullName, email });
    const authToken = data.session?.access_token || null;
    const refreshToken = data.session?.refresh_token || null;

    if (authToken) {
      setToken(authToken);
      setAuthSessionCookie(authToken, refreshToken || undefined);
      setUser(userProfile);
      setAuthState('AUTHENTICATED');
      localStorage.setItem('auth_token', authToken);
      if (refreshToken) {
        localStorage.setItem('auth_refresh_token', refreshToken);
      }
      localStorage.setItem('auth_user', JSON.stringify(userProfile));
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out of Supabase:', err);
    } finally {
      setToken(null);
      setUser(null);
      setAuthState('UNAUTHENTICATED');
      clearUserLocalCache();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authState,
        loginWithGoogle,
        completeProfile,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
