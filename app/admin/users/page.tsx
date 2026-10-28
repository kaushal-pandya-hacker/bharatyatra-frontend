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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchUsers();
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <Users className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold font-heading text-slate-900">User Management & Data Isolation</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Centralized platform administration: Monitor user accounts, assign roles, enforce tenant policies, and track audit records.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Directory
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

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or account ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </form>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Role:</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
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
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
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
                      <div className="font-semibold text-slate-900">{u.fullName || 'Anonymous Traveler'}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
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
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.phoneNumber || <span className="text-slate-400 italic">Not set</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Role selector */}
                        <select
                          disabled={updatingId === u.id}
                          value={u.role}
                          onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                          className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none disabled:opacity-50"
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
  );
}

