// BHARAT YATRA — ADMIN PORTAL CLIENT API SDK

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bharatyatra_admin_token');
}

export function setAdminToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('bharatyatra_admin_token', token);
  document.cookie = `admin_session=${token}; path=/; max-age=86400; SameSite=Strict; Secure`;
}

export function removeAdminToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('bharatyatra_admin_token');
  document.cookie = 'admin_session=; path=/; max-age=0; SameSite=Strict';
}

async function adminFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    throw new Error('Unable to connect to NestJS backend server. Please verify backend service status on http://localhost:4000/api/v1.');
  }

  if (res.status === 401) {
    removeAdminToken();
    if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
      window.location.href = '/bharatyatra-ops/login';
    }
    throw new Error('Admin authentication required.');
  }

  if (res.status === 403) {
    throw new Error('Higher admin role permission required.');
  }

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || 'Admin API request failed.');
  }

  return res.json();
}

export async function adminLogin(username: string, password: string) {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  } catch (netErr: any) {
    // If main API_BASE fetch fails, try fallback port 5000 if different
    const fallbackBase = API_BASE.includes('4000') ? 'http://localhost:5000/api/v1' : 'http://localhost:4000/api/v1';
    try {
      res = await fetch(`${fallbackBase}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
    } catch (e2: any) {
      throw new Error('Backend network error. Ensure NestJS backend is running on http://localhost:4000/api/v1.');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Invalid admin credentials.');
  }

  const data = await res.json();
  if (data.token) {
    setAdminToken(data.token);
  }
  return data;
}

export async function adminLogout() {
  try {
    await adminFetch('/admin/auth/logout', { method: 'POST' });
  } catch (e) {
  } finally {
    removeAdminToken();
  }
}

export async function fetchAdminMe() {
  return adminFetch<{ success: boolean; admin: any }>('/admin/auth/me');
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  return adminFetch<{ success: boolean; message: string }>('/admin/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function fetchAdminDashboard() {
  return adminFetch<any>('/admin/dashboard');
}

export async function fetchAdminUsers(page = 1, limit = 20, search = '', status = '') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  return adminFetch<any>(`/admin/users?${params.toString()}`);
}

export async function fetchAdminUserDetail(userId: string) {
  return adminFetch<any>(`/admin/users/${userId}`);
}

export async function updateAdminUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'DELETED') {
  return adminFetch<any>(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function fetchAdminTrips(page = 1, limit = 20, search = '', status = '') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  return adminFetch<any>(`/admin/trips?${params.toString()}`);
}

export async function fetchAdminTripDetail(tripId: string) {
  return adminFetch<any>(`/admin/trips/${tripId}`);
}

export async function fetchAdminBookings(page = 1, limit = 20, search = '', type = '', status = '') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  if (type) params.append('type', type);
  if (status) params.append('status', status);
  return adminFetch<any>(`/admin/bookings?${params.toString()}`);
}

export async function fetchAdminNotificationHistory(page = 1, limit = 20) {
  return adminFetch<any>(`/admin/notifications?page=${page}&limit=${limit}`);
}

export async function sendAdminNotificationBroadcast(payload: { targetUserId?: string; title: string; body: string; url?: string }) {
  return adminFetch<any>('/admin/notifications/broadcast', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminAuditLogs(page = 1, limit = 20, search = '', action = '') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  if (action) params.append('action', action);
  return adminFetch<any>(`/admin/audit-logs?${params.toString()}`);
}
