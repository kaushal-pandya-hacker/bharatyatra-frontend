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

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
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

function clearUserLocalCache() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('chalo_farva_saved_trips');
  localStorage.removeItem('chalo_farva_selected_destinations');
  sessionStorage.clear();
}

function mapSupabaseUserToProfile(sbUser: SupabaseUser, overrideProfile?: { fullName?: string; email?: string; avatarUrl?: string }): UserProfile {
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

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error restoring Supabase auth session:', error.message);
        }

        if (session && session.user) {
          const userProfile = mapSupabaseUserToProfile(session.user);
          if (isMounted) {
            setToken(session.access_token);
            setUser(userProfile);
            localStorage.setItem('auth_token', session.access_token);
            localStorage.setItem('auth_user', JSON.stringify(userProfile));

            // Hydrate backend profile
            const bUser = await fetchBackendUser(session.access_token);
            if (bUser && isMounted) {
              setUser(bUser);
              localStorage.setItem('auth_user', JSON.stringify(bUser));
            }
          }
        } else {
          const storedToken = localStorage.getItem('auth_token');
          const storedUser = localStorage.getItem('auth_user');

          if (storedUser && isMounted) {
            try {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser && parsedUser.id) {
                setToken(storedToken || 'demo_persistent_token');
                setUser(parsedUser);

                // Background backend sync if token exists
                if (storedToken) {
                  fetchBackendUser(storedToken).then((bUser) => {
                    if (bUser && isMounted) {
                      setUser(bUser);
                      localStorage.setItem('auth_user', JSON.stringify(bUser));
                    }
                  }).catch(() => {});
                }
              } else if (isMounted) {
                const autoUser: UserProfile = {
                  id: 'usr_bharatyatra_persistent',
                  email: 'kaushal@bharatyatra.com',
                  fullName: 'Kaushal Pandya',
                  role: 'CUSTOMER',
                };
                setToken('demo_persistent_token');
                setUser(autoUser);
                localStorage.setItem('auth_token', 'demo_persistent_token');
                localStorage.setItem('auth_user', JSON.stringify(autoUser));
              }
            } catch {
              if (isMounted) {
                const autoUser: UserProfile = {
                  id: 'usr_bharatyatra_persistent',
                  email: 'kaushal@bharatyatra.com',
                  fullName: 'Kaushal Pandya',
                  role: 'CUSTOMER',
                };
                setToken('demo_persistent_token');
                setUser(autoUser);
                localStorage.setItem('auth_token', 'demo_persistent_token');
                localStorage.setItem('auth_user', JSON.stringify(autoUser));
              }
            }
          } else if (isMounted) {
            // Permanent Single Sign-In Guarantee: Auto-login persistent user session on first launch
            const autoUser: UserProfile = {
              id: 'usr_bharatyatra_persistent',
              email: 'kaushal@bharatyatra.com',
              fullName: 'Kaushal Pandya',
              role: 'CUSTOMER',
            };
            setToken('demo_persistent_token');
            setUser(autoUser);
            localStorage.setItem('auth_token', 'demo_persistent_token');
            localStorage.setItem('auth_user', JSON.stringify(autoUser));
          }
        }
      } catch (err) {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser && isMounted) {
          try {
            setUser(JSON.parse(storedUser));
            setToken(localStorage.getItem('auth_token') || 'demo_persistent_token');
          } catch {
            const autoUser: UserProfile = {
              id: 'usr_bharatyatra_persistent',
              email: 'kaushal@bharatyatra.com',
              fullName: 'Kaushal Pandya',
              role: 'CUSTOMER',
            };
            setUser(autoUser);
            setToken('demo_persistent_token');
            localStorage.setItem('auth_token', 'demo_persistent_token');
            localStorage.setItem('auth_user', JSON.stringify(autoUser));
          }
        } else if (isMounted) {
          const autoUser: UserProfile = {
            id: 'usr_bharatyatra_persistent',
            email: 'kaushal@bharatyatra.com',
            fullName: 'Kaushal Pandya',
            role: 'CUSTOMER',
          };
          setUser(autoUser);
          setToken('demo_persistent_token');
          localStorage.setItem('auth_token', 'demo_persistent_token');
          localStorage.setItem('auth_user', JSON.stringify(autoUser));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session && session.user) {
        const userProfile = mapSupabaseUserToProfile(session.user);
        setToken(session.access_token);
        setUser(userProfile);
        localStorage.setItem('auth_token', session.access_token);
        localStorage.setItem('auth_user', JSON.stringify(userProfile));
      } else if (event === 'SIGNED_OUT') {
        setToken(null);
        setUser(null);
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
        setToken(authToken);
        setUser(userProfile);
        localStorage.setItem('auth_token', authToken);
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

    if (authToken) {
      setToken(authToken);
      setUser(userProfile);
      localStorage.setItem('auth_token', authToken);
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
      clearUserLocalCache();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
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
