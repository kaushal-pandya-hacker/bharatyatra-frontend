'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  Download,
  Eye,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';

interface EnrichedUserRecord {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  role: 'CUSTOMER' | 'ADMIN' | 'SUPPLIER' | 'AGENCY';
  registrationDate: string;
  lastActiveDate: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  kycVerified: boolean;
  totalTrips: number;
  totalBookings: number;
  totalSpentInr: number;
  city?: string;
  state?: string;
  profilePhoto?: string;
}

export default function AdminUsersDirectoryPage() {
  const [users, setUsers] = useState<EnrichedUserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('activity');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (verificationFilter !== 'ALL') params.set('verification', verificationFilter);
      if (sortBy) params.set('sortBy', sortBy);
      params.set('limit', String(pageSize));
      params.set('offset', String((page - 1) * pageSize));

      const res = await fetch(`/api/v1/admin/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch platform users from authoritative engine.');
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUsers(json.data);
        setTotal(json.total || json.data.length);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error communicating with User Management API.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, verificationFilter, sortBy, page]);

  const handleExportCsv = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const url = `/api/v1/admin/users?format=csv&search=${encodeURIComponent(search)}&role=${roleFilter}&status=${statusFilter}`;
    window.open(url, '_blank');
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Identity &amp; Access Governance</span>
            <span>•</span>
            <span>Enterprise Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <span>Platform User Directory</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800">
              {total} Total Registered
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time traveler verification, booking history, security sanctions, and User 360 dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV Report</span>
          </button>
          <button
            onClick={fetchUsers}
            title="Refresh Directory"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, email, phone or User ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Account Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="ACTIVE">ACTIVE Only</option>
              <option value="SUSPENDED">SUSPENDED Only</option>
            </select>
          </div>

          {/* KYC / Verification Filter */}
          <div>
            <select
              value={verificationFilter}
              onChange={(e) => {
                setVerificationFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="verified">Verified Identity (KYC)</option>
              <option value="unverified">Unverified Accounts</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
            >
              <option value="activity">Sort by Recent Activity</option>
              <option value="registration">Sort by Registration Date</option>
              <option value="name">Sort by Full Name</option>
              <option value="trips">Sort by Total Trips</option>
              <option value="bookings">Sort by Total Bookings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-extrabold">
              <tr>
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Trips</th>
                <th className="py-3.5 px-4 text-center">Bookings</th>
                <th className="py-3.5 px-4">Registration</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                    <span>Querying authoritative user directory...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>No platform users match the specified search or filter parameters.</span>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* User Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.fullName)}`}
                          alt={u.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="font-bold text-slate-900 hover:text-blue-600 transition block truncate"
                          >
                            {u.fullName}
                          </Link>
                          <span className="text-[10px] font-mono text-slate-400 block truncate">
                            ID: {u.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="text-slate-800 font-medium block truncate">{u.email}</span>
                        <span className="text-[10px] text-slate-500 block">{u.phoneNumber || 'No phone recorded'}</span>
                      </div>
                    </td>

                    {/* Verification */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Email Verified</span>
                        </span>
                        {u.kycVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md w-fit">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            <span>KYC Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                            <span>Unverified</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {u.accountStatus === 'ACTIVE' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 uppercase tracking-wider inline-flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          <span>Suspended</span>
                        </span>
                      )}
                    </td>

                    {/* Total Trips */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                        {u.totalTrips}
                      </span>
                    </td>

                    {/* Total Bookings */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg text-xs">
                        {u.totalBookings}
                      </span>
                    </td>

                    {/* Registration */}
                    <td className="py-3.5 px-4">
                      <span className="text-slate-600 block">{u.registrationDate.split('T')[0]}</span>
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 px-4">
                      <span className="text-slate-600 block">{u.lastActiveDate.split('T')[0]}</span>
                    </td>

                    {/* Action: Open User 360 */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition inline-flex items-center gap-1 shadow-xs"
                      >
                        <span>User 360</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-900">{users.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-bold text-slate-900">{Math.min(page * pageSize, total)}</span> of{' '}
            <span className="font-bold text-slate-900">{total}</span> total travelers
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 flex items-center gap-1 shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="font-bold text-slate-900 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 flex items-center gap-1 shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
