'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phoneNumber?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, passwordHash: string) => Promise<void>;
  register: (fullName: string, email: string, passwordHash: string, phoneNumber?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on initial render
    try {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // Dev fallback default traveler
        const defaultUser: UserProfile = {
          id: 'usr_demo_123',
          email: 'traveler@chalofarva.com',
          fullName: 'Chalo Farva Traveler',
          role: 'CUSTOMER',
          createdAt: new Date().toISOString(),
        };
        setUser(defaultUser);
        localStorage.setItem('auth_user', JSON.stringify(defaultUser));
      }
    } catch {
      // Ignore storage errors
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, passwordHash: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passwordHash }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const data = await res.json();
      const authToken = data.data?.token || 'mock_jwt_token_123';
      const userProfile: UserProfile = data.data?.user || {
        id: `usr_${Date.now()}`,
        email,
        fullName: email.split('@')[0],
        role: 'CUSTOMER',
      };

      setToken(authToken);
      setUser(userProfile);
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(userProfile));
    } catch (e: any) {
      // Fallback for dev offline mode
      const fallbackToken = `dev_token_${Date.now()}`;
      const fallbackUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        fullName: email.split('@')[0],
        role: 'CUSTOMER',
      };
      setToken(fallbackToken);
      setUser(fallbackUser);
      localStorage.setItem('auth_token', fallbackToken);
      localStorage.setItem('auth_user', JSON.stringify(fallbackUser));
    }
  };

  const register = async (fullName: string, email: string, passwordHash: string, phoneNumber?: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, passwordHash, phoneNumber }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await res.json();
      const authToken = data.data?.token || `dev_token_${Date.now()}`;
      const userProfile: UserProfile = data.data?.user || {
        id: `usr_${Date.now()}`,
        email,
        fullName,
        phoneNumber,
        role: 'CUSTOMER',
      };

      setToken(authToken);
      setUser(userProfile);
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(userProfile));
    } catch (e: any) {
      const fallbackToken = `dev_token_${Date.now()}`;
      const fallbackUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        fullName,
        phoneNumber,
        role: 'CUSTOMER',
      };
      setToken(fallbackToken);
      setUser(fallbackUser);
      localStorage.setItem('auth_token', fallbackToken);
      localStorage.setItem('auth_user', JSON.stringify(fallbackUser));
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' }).catch(() => {});
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
