'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PauseCircle,
  Eye,
  Search,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { TravelPackage, PackagePublicationStatus } from '@/types/travel-partner';

export default function AdminTravelPackagesPage() {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'ALL') params.append('status', filterStatus);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/v1/admin/travel-packages?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPackages(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [filterStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPackages();
  };

  const getStatusBadge = (status: PackagePublicationStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return {
          label: 'PUBLISHED (LIVE)',
          color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
        };
      case 'PENDING_REVIEW':
        return {
          label: 'AWAITING REVIEW',
          color: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
        };
      case 'CHANGES_REQUESTED':
        return {
          label: 'CHANGES REQUESTED',
          color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
        };
      case 'PAUSED':
        return {
          label: 'PAUSED',
          color: 'bg-slate-700 text-slate-300 border-slate-600',
        };
      case 'DRAFT':
      default:
        return {
          label: 'DRAFT',
          color: 'bg-slate-100 text-slate-600 border-slate-200',
        };
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Travel Package Moderation & Publication
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review partner-submitted tour packages, verify itinerary authenticity, and approve for automatic publishing.
          </p>
        </div>

        <button
          onClick={fetchPackages}
          className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search package title, agency, or region..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
          />
        </form>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {['ALL', 'PENDING_REVIEW', 'PUBLISHED', 'CHANGES_REQUESTED', 'PAUSED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                filterStatus === st
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Packages Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-500">Loading tour packages...</div>
        ) : packages.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-500">No tour packages found matching filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Package Title</th>
                  <th className="p-4">Supplying Agency</th>
                  <th className="p-4">Destination & State</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4 text-right">Customer Price</th>
                  <th className="p-4">Publication Status</th>
                  <th className="p-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packages.map((pkg) => {
                  const badge = getStatusBadge(pkg.publicationStatus);
                  return (
                    <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{pkg.title}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{pkg.shortDescription}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">{pkg.agencyName || 'Verified Partner'}</td>
                      <td className="p-4 text-slate-600">
                        {pkg.destinationSummary} ({pkg.stateOrRegion})
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {pkg.durationDays}D / {pkg.durationNights}N
                      </td>
                      <td className="p-4 text-right font-black text-slate-900">
                        ₹{(pkg.discountedPrice || pkg.basePrice).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/travel-packages/${pkg.id}/review`}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                        >
                          Review & Publish <ArrowRight className="w-3 h-3" />
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
