'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAdminUsers, updateAdminUserStatus } from '@/lib/admin-api';
import { 
  Users, Search, Filter, ChevronLeft, ChevronRight, Eye, ShieldAlert, CheckCircle2, UserX, UserCheck, RefreshCw
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  profileCompletion: number;
  homeCity: string;
  tripsCount: number;
  bookingsCount: number;
  pushSubscriptionsCount: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadUsers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminUsers(page, pagination.limit, search, statusFilter);
      if (res.success) {
        setUsers(res.data);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(1);
  };

  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    if (!confirm(`Are you sure you want to change user "${user.name}" status to ${newStatus}?`)) return;

    setActionLoadingId(user.id);
    try {
      await updateAdminUserStatus(user.id, newStatus);
      await loadUsers(pagination.page);
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Link href="/bharatyatra-ops/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-200">Users</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-amber-500" /> User Directory
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage BharatYatra customer accounts, profiles, trip records, and permissions.
          </p>
        </div>
        <button
          onClick={() => loadUsers(pagination.page)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search name, email, home city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-sm rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {error && (
          <div className="p-4 bg-red-950/50 border-b border-red-800 text-red-300 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Home City</th>
                <th className="px-5 py-3.5 text-center">Profile %</th>
                <th className="px-5 py-3.5 text-center">Trips</th>
                <th className="px-5 py-3.5 text-center">Bookings</th>
                <th className="px-5 py-3.5 text-center">Push</th>
                <th className="px-5 py-3.5">Joined</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-32"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                    <td className="px-5 py-4 text-center"><div className="h-4 bg-slate-800 rounded w-8 mx-auto"></div></td>
                    <td className="px-5 py-4 text-center"><div className="h-4 bg-slate-800 rounded w-8 mx-auto"></div></td>
                    <td className="px-5 py-4 text-center"><div className="h-4 bg-slate-800 rounded w-8 mx-auto"></div></td>
                    <td className="px-5 py-4 text-center"><div className="h-4 bg-slate-800 rounded w-8 mx-auto"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                    <td className="px-5 py-4 text-right"><div className="h-4 bg-slate-800 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-slate-500">
                    No users found matching query filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <div className="font-medium text-white">{u.name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.status === 'ACTIVE' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50' : 'bg-red-950/80 text-red-400 border border-red-800/50'
                      }`}>
                        {u.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{u.homeCity || '—'}</td>
                    <td className="px-5 py-4 text-center font-medium text-amber-400">
                      {u.profileCompletion}%
                    </td>
                    <td className="px-5 py-4 text-center font-mono text-slate-200">{u.tripsCount}</td>
                    <td className="px-5 py-4 text-center font-mono text-slate-200">{u.bookingsCount}</td>
                    <td className="px-5 py-4 text-center font-mono text-slate-200">{u.pushSubscriptionsCount}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/bharatyatra-ops/users/${u.id}`}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" /> View
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={actionLoadingId === u.id}
                          className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                            u.status === 'SUSPENDED'
                              ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                              : 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-800'
                          }`}
                        >
                          {u.status === 'SUSPENDED' ? (
                            <> <UserCheck className="w-3.5 h-3.5" /> Activate </>
                          ) : (
                            <> <UserX className="w-3.5 h-3.5" /> Deactivate </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{users.length}</span> of <span className="font-semibold text-slate-200">{pagination.total}</span> users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadUsers(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-300">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => loadUsers(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
