'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { TravelAgency, AgencyVerificationStatus } from '@/types/travel-partner';

export default function AdminTravelPartnersPage() {
  const [agencies, setAgencies] = useState<TravelAgency[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/v1/admin/travel-partners?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setAgencies(json.data || []);
        if (json.overview) setOverview(json.overview);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPartners();
  };

  const getStatusBadge = (status: AgencyVerificationStatus) => {
    switch (status) {
      case 'APPROVED':
        return {
          label: 'APPROVED',
          color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
        };
      case 'NEEDS_INFORMATION':
        return {
          label: 'NEEDS INFO',
          color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
        };
      case 'REJECTED':
        return {
          label: 'REJECTED',
          color: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
        };
      case 'SUSPENDED':
        return {
          label: 'SUSPENDED',
          color: 'bg-slate-700 text-slate-300 border-slate-600',
        };
      case 'SUBMITTED':
      case 'PENDING_VERIFICATION':
      default:
        return {
          label: 'PENDING REVIEW',
          color: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
        };
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Travel Partner Registrations & Agencies
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review B2B travel agency onboarding applications, verify documentation, and manage partnerships.
          </p>
        </div>

        <button
          onClick={fetchPartners}
          className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Agencies</span>
            <div className="text-2xl font-black text-slate-900">{overview.totalAgencies}</div>
            <div className="text-[11px] text-slate-400">In platform registry</div>
          </div>

          <div className="p-5 bg-white border border-blue-200 rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Pending Verification
            </span>
            <div className="text-2xl font-black text-blue-600">{overview.pendingApplications}</div>
            <div className="text-[11px] text-slate-400">Applications awaiting review</div>
          </div>

          <div className="p-5 bg-white border border-emerald-200 rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved Partners
            </span>
            <div className="text-2xl font-black text-emerald-600">{overview.approvedAgencies}</div>
            <div className="text-[11px] text-slate-400">Active package suppliers</div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Suspended
            </span>
            <div className="text-2xl font-black text-slate-700">{overview.suspendedAgencies}</div>
            <div className="text-[11px] text-slate-400">Packages suppressed</div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business name, ref, or city..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
          />
        </form>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {['ALL', 'SUBMITTED', 'APPROVED', 'NEEDS_INFORMATION', 'REJECTED', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Agencies Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-500">Loading agency records...</div>
        ) : agencies.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-500">No partner agencies found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Agency / Business Name</th>
                  <th className="p-4">Representative</th>
                  <th className="p-4">Operating Hub</th>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agencies.map((agency) => {
                  const badge = getStatusBadge(agency.verificationStatus);
                  return (
                    <tr key={agency.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-800">{agency.referenceNumber}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{agency.businessName}</div>
                        <div className="text-[11px] text-slate-400">{agency.businessEmail}</div>
                      </td>
                      <td className="p-4 text-slate-700 font-medium">
                        <div>{agency.representativeName}</div>
                        <div className="text-[11px] text-slate-400">{agency.contactPhone}</div>
                      </td>
                      <td className="p-4 text-slate-700">
                        {agency.city}, {agency.stateCode}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-500">{agency.businessType}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/travel-partners/${agency.id}`}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                        >
                          Review Dossier <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
