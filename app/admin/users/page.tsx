'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Compass,
  Car,
  Hotel,
  Wallet,
  Eye,
  X,
  CheckCircle,
  BarChart3,
  Luggage,
} from 'lucide-react';

interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPPLIER' | 'AGENCY';
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  phoneNumber?: string;
  createdAt?: string;
}

interface OnboardingAnalytics {
  totalRegisteredCustomers: number;
  completedProfilesCount: number;
  skippedProfilesCount: number;
  incompleteProfilesCount: number;
  completionRatePercentage: number;
  groupDistribution: Record<string, number>;
  transportDistribution: Record<string, number>;
  bookingDistribution: Record<string, number>;
  accommodationDistribution: Record<string, number>;
  budgetDistribution: Record<string, number>;
  popularInterests: Array<{ name: string; count: number }>;
  recentCustomerProfiles: Array<{
    userId: string;
    fullName: string;
    email: string;
    onboardingStatus: string;
    groupType: string;
    typicalTravelers: number;
    travelPace: string;
    budgetTier: string;
    updatedAt?: string;
  }>;
}

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<'directory' | 'onboarding'>('directory');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Onboarding Analytics & Profile Inspection
  const [analytics, setAnalytics] = useState<OnboardingAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [loadingProfileDetail, setLoadingProfileDetail] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('admin_token') || localStorage.getItem('auth_token')
          : null;

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/v1/admin/users?${params.toString()}`, { headers });
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || []);
      } else {
        const err = await res.json().catch(() => ({}));
        setFeedback({
          type: 'error',
          message: err.error || 'Failed to retrieve users. Please ensure you are logged in as an administrator.',
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error connecting to user service.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('admin_token') || localStorage.getItem('auth_token')
          : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/onboarding-analytics', { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setAnalytics(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load onboarding analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const inspectUserProfile = async (userId: string) => {
    setLoadingProfileDetail(true);
    setSelectedProfile(null);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('admin_token') || localStorage.getItem('auth_token')
          : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/user/travel-profile?userId=${encodeURIComponent(userId)}`, { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSelectedProfile(json.data);
        }
      }
    } catch (err) {
      console.error('Error fetching travel profile:', err);
    } finally {
      setLoadingProfileDetail(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleUpdateUser = async (targetUserId: string, updates: { role?: string; status?: string }) => {
    setUpdatingId(targetUserId);
    setFeedback(null);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('admin_token') || localStorage.getItem('auth_token')
          : null;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/v1/admin/users', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          targetUserId,
          ...updates,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: json.message || 'User updated successfully.' });
        fetchUsers();
      } else {
        setFeedback({ type: 'error', message: json.error || 'Failed to update user.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error updating user.' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <Users className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
              Customer Directory & Onboarding Intelligence
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Monitor platform user accounts, review post-login onboarding completion, and inspect personalized travel preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchUsers();
              fetchAnalytics();
            }}
            disabled={loading || loadingAnalytics}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading || loadingAnalytics ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center border-b border-slate-200 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('directory')}
          className={`pb-3 px-1 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'directory'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory & Roles</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold ml-1">
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('onboarding');
            fetchAnalytics();
          }}
          className={`pb-3 px-1 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'onboarding'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Onboarding & Travel Preferences</span>
          {analytics && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold ml-1">
              {analytics.completionRatePercentage}% Complete
            </span>
          )}
        </button>
      </div>

      {/* Notifications */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* TAB 1: USER DIRECTORY & ROLES */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or account ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
              />
            </form>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Role:</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none font-semibold"
                >
                  <option value="ALL">All Roles</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPPLIER">Supplier</option>
                  <option value="AGENCY">Agency</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none font-semibold"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="DEACTIVATED">Deactivated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                        Loading platform user records...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No users matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{u.fullName || 'Anonymous Traveler'}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{u.email}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {u.id.substring(0, 13)}...</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'SUPPLIER'
                                ? 'bg-blue-100 text-blue-800'
                                : u.role === 'AGENCY'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.status === 'SUSPENDED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? (
                              <UserCheck className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <UserX className="w-3 h-3 text-rose-600" />
                            )}
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {u.phoneNumber || <span className="text-slate-400 italic">Not set</span>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Inspect Travel Profile Button */}
                            <button
                              type="button"
                              onClick={() => inspectUserProfile(u.id)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
                              title="Inspect Customer Travel Profile"
                            >
                              <Eye className="w-3 h-3 text-amber-600" />
                              <span>Profile</span>
                            </button>

                            {/* Role selector */}
                            <select
                              disabled={updatingId === u.id}
                              value={u.role}
                              onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                              className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none disabled:opacity-50 font-semibold"
                            >
                              <option value="CUSTOMER">Customer</option>
                              <option value="ADMIN">Admin</option>
                              <option value="SUPPLIER">Supplier</option>
                              <option value="AGENCY">Agency</option>
                            </select>

                            {/* Status toggle */}
                            {u.status === 'ACTIVE' ? (
                              <button
                                disabled={updatingId === u.id}
                                onClick={() => handleUpdateUser(u.id, { status: 'SUSPENDED' })}
                                className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[11px] font-semibold rounded-lg transition disabled:opacity-50"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                disabled={updatingId === u.id}
                                onClick={() => handleUpdateUser(u.id, { status: 'ACTIVE' })}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-semibold rounded-lg transition disabled:opacity-50"
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ONBOARDING INTELLIGENCE & PREFERENCES */}
      {activeTab === 'onboarding' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Registered Customers</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {analytics?.totalRegisteredCustomers || users.length || 0}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Active platform accounts</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Onboarding Completed</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-emerald-700">
                {analytics?.completedProfilesCount || 0}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold">
                {analytics?.completionRatePercentage || 0}% completion rate
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Skipped For Now</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-amber-600">
                {analytics?.skippedProfilesCount || 0}
              </div>
              <div className="text-[11px] text-amber-700 font-medium">Using default Indian travel context</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Incomplete / Pending</span>
                <Compass className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-3xl font-black text-slate-700">
                {analytics?.incompleteProfilesCount || 0}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Will prompt on next visit</div>
            </div>
          </div>

          {/* Breakdown Grids */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Group Distribution */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Traveler Group Types</span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(analytics.groupDistribution).map(([grp, count]) => {
                    const total = Object.values(analytics.groupDistribution).reduce((a, b) => a + b, 0) || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={grp} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{grp}</span>
                          <span className="text-slate-500 font-mono">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transportation Mode Preference */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Car className="w-4 h-4 text-emerald-600" />
                    <span>Preferred Travel Mode</span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(analytics.transportDistribution).map(([mode, count]) => {
                    const total = Object.values(analytics.transportDistribution).reduce((a, b) => a + b, 0) || 1;
                    const pct = Math.round((count / total) * 100);
                    const label =
                      mode === 'road_trip'
                        ? 'Own Vehicle / Road Trip'
                        : mode === 'book_transport'
                        ? 'Book Transportation'
                        : mode === 'mixed'
                        ? 'Mixed Travel Modes'
                        : 'Not Decided / AI Advise';
                    return (
                      <div key={mode} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{label}</span>
                          <span className="text-slate-500 font-mono">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Booking Needs */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Luggage className="w-4 h-4 text-purple-600" />
                    <span>Booking Assistance Needs</span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(analytics.bookingDistribution).map(([type, count]) => {
                    const total = Object.values(analytics.bookingDistribution).reduce((a, b) => a + b, 0) || 1;
                    const pct = Math.round((count / total) * 100);
                    const label =
                      type === 'hotels'
                        ? 'Hotels & Stays'
                        : type === 'transportation'
                        ? 'Transport & Tickets'
                        : type === 'experiences'
                        ? 'Local Sightseeing & Passes'
                        : type === 'complete_package'
                        ? 'Complete Tour Package'
                        : 'Arrange Myself';
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{label}</span>
                          <span className="text-slate-500 font-mono">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Accommodation Preferences */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Hotel className="w-4 h-4 text-amber-600" />
                    <span>Accommodation Tiers</span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(analytics.accommodationDistribution).map(([tier, count]) => {
                    const total = Object.values(analytics.accommodationDistribution).reduce((a, b) => a + b, 0) || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={tier} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700 capitalize">
                          <span>{tier}</span>
                          <span className="text-slate-500 font-mono">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Budget Distribution */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-700" />
                    <span>Budget Distribution</span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(analytics.budgetDistribution).map(([range, count]) => {
                    const total = Object.values(analytics.budgetDistribution).reduce((a, b) => a + b, 0) || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={range} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{range}</span>
                          <span className="text-slate-500 font-mono">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Popular Travel Interests */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-600" />
                    <span>Top Travel Interests</span>
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {analytics.popularInterests.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No interest data recorded yet.</div>
                  ) : (
                    analytics.popularInterests.map((interest) => (
                      <span
                        key={interest.name}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800"
                      >
                        <span className="capitalize">{interest.name}</span>
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono">
                          {interest.count}
                        </span>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Recent Customer Profiles Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Registered Customers — Travel Profiles</h3>
              <span className="text-xs text-slate-500 font-medium">Click Inspect to view complete onboarding preferences</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Onboarding Status</th>
                    <th className="py-3 px-4">Group Type</th>
                    <th className="py-3 px-4">Pace & Budget</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No customer accounts found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const analyticMatch = analytics?.recentCustomerProfiles?.find((r) => r.userId === u.id);
                      const status = analyticMatch?.onboardingStatus || 'NOT_STARTED';
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{u.fullName || 'Anonymous Traveler'}</div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : status === 'SKIPPED'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {status === 'COMPLETED' ? (
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Compass className="w-3 h-3 text-amber-600" />
                              )}
                              {status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700">
                            {analyticMatch?.groupType || 'Family'} ({analyticMatch?.typicalTravelers || 2} Pax)
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium capitalize">
                            {analyticMatch?.travelPace || 'Balanced'} • {analyticMatch?.budgetTier || 'Moderate'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => inspectUserProfile(u.id)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-[11px] font-bold rounded-lg transition inline-flex items-center gap-1 shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span>Inspect Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER PROFILE INSPECTION MODAL */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Luggage className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-black tracking-tight">{selectedProfile.fullName}&apos;s Travel Profile</h2>
                </div>
                <div className="text-xs text-slate-300 font-mono mt-0.5">
                  User ID: {selectedProfile.userId || selectedProfile.id}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
                    Onboarding Status
                  </span>
                  <span
                    className={`inline-block font-extrabold text-sm uppercase mt-0.5 ${
                      selectedProfile.onboardingStatus === 'COMPLETED'
                        ? 'text-emerald-700'
                        : selectedProfile.onboardingStatus === 'SKIPPED'
                        ? 'text-amber-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {selectedProfile.onboardingStatus || 'NOT_STARTED'}
                  </span>
                </div>
                {selectedProfile.onboardingCompletedAt && (
                  <div className="text-right">
                    <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
                      Completed On
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {new Date(selectedProfile.onboardingCompletedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Group & Traveler Info */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  1. Traveler Group & Composition
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Group Type</span>
                    <span className="text-sm font-black text-slate-900">{selectedProfile.groupType || 'Family'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Adults (12+)</span>
                    <span className="text-sm font-black text-slate-900">
                      {selectedProfile.travelerComposition?.adults ?? selectedProfile.typicalTravelers ?? 2}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Children (2-11)</span>
                    <span className="text-sm font-black text-slate-900">
                      {selectedProfile.travelerComposition?.children ?? 0}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Seniors (60+)</span>
                    <span className="text-sm font-black text-slate-900">
                      {selectedProfile.travelerComposition?.seniors ?? 0}
                    </span>
                  </div>
                </div>
                {selectedProfile.accessibilityRequirements && selectedProfile.accessibilityRequirements.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                    <strong>Special Requirements:</strong> {selectedProfile.accessibilityRequirements.join(', ')}
                  </div>
                )}
              </div>

              {/* Travel Mode & Vehicle Details */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  2. Travel Mode & Vehicle Details
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                    <span>Preference:</span>
                    <span className="capitalize text-blue-700">
                      {selectedProfile.travelModePreference?.replace('_', ' ') || 'Road Trip / Own Vehicle'}
                    </span>
                  </div>
                  {selectedProfile.ownVehicleDetails && (
                    <div className="text-xs text-slate-600 pt-2 border-t border-slate-200 space-y-1">
                      <div>
                        Vehicle Type:{' '}
                        <strong className="text-slate-800">{selectedProfile.ownVehicleDetails.vehicleType}</strong>
                      </div>
                      <div>
                        Ownership:{' '}
                        <strong className="text-slate-800">
                          {selectedProfile.ownVehicleDetails.isOwned ? 'Personally Owned' : 'Rented / Borrowed'}
                        </strong>
                      </div>
                      <div>
                        Long Distance Ready:{' '}
                        <strong className="text-slate-800">
                          {selectedProfile.ownVehicleDetails.longDistanceReady ? 'Yes (Highway Verified)' : 'Local Only'}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Needs & Accommodation */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  3. Booking Assistance & Accommodations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">
                      Services To Arrange
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedProfile.bookingPreferences?.map((b: string) => (
                        <span
                          key={b}
                          className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold capitalize"
                        >
                          {b.replace('_', ' ')}
                        </span>
                      )) || <span className="text-xs text-slate-400">None specified</span>}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">
                      Accommodation Tiers
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedProfile.accommodationTypes?.map((a: string) => (
                        <span
                          key={a}
                          className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold capitalize"
                        >
                          {a}
                        </span>
                      )) || <span className="text-xs text-slate-400">Standard</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget, Style & Interests */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  4. Budget, Pace & Exploration Style
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Budget Scope</span>
                    <span className="text-sm font-black text-slate-900 capitalize">
                      {selectedProfile.budgetScope?.replace('_', ' ') || 'Total Group'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Budget Bracket</span>
                    <span className="text-sm font-black text-slate-900">
                      {selectedProfile.customBudgetAmount
                        ? `₹${selectedProfile.customBudgetAmount.toLocaleString('en-IN')}`
                        : selectedProfile.budgetRange || selectedProfile.budget || 'Moderate'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Travel Pace</span>
                    <span className="text-sm font-black text-slate-900 capitalize">
                      {selectedProfile.pace || 'Balanced'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5">
                    Saved Interests
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProfile.interests?.map((item: string) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold capitalize"
                      >
                        {item}
                      </span>
                    )) || <span className="text-xs text-slate-400">General exploration</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
