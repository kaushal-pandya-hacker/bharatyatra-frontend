'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import imageReportData from '@/data/tourism/image-validation-report.json';
import { Search, Filter, CheckCircle2, AlertTriangle, Image as ImageIcon, ArrowLeft, RefreshCw, Folder, Layers } from 'lucide-react';

interface PackageStatusItem {
  packageId: string;
  title: string;
  slug: string;
  state: string;
  heroAvailable: boolean;
  galleryAvailableCount: number;
  missingCount: number;
  completionPercentage: number;
  status: 'COMPLETE' | 'PARTIAL' | 'MISSING';
}

export default function AdminPackageImagesPage() {
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const reportItems: PackageStatusItem[] = (imageReportData.packageStatusList || []) as PackageStatusItem[];

  // Extract states list
  const statesList = useMemo(() => {
    const s = new Set<string>();
    reportItems.forEach(item => s.add(item.state));
    return Array.from(s).sort();
  }, [reportItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    return reportItems.filter(item => {
      if (selectedState !== 'ALL' && item.state !== selectedState) return false;
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reportItems, selectedState, selectedStatus, searchQuery]);

  const totalPackages = reportItems.length;
  const completePackages = reportItems.filter(i => i.status === 'COMPLETE').length;
  const partialPackages = reportItems.filter(i => i.status === 'PARTIAL').length;
  const missingPackages = reportItems.filter(i => i.status === 'MISSING').length;
  const overallPct = imageReportData.overallCompletionPct || 0;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/packages"
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Packages Admin</span>
          </Link>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-amber-500" />
              <span>Package Media Asset Manager</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Audit image assets, track completion status &amp; inspect filesystem media paths.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 shadow-xs">
          Audit Date: {new Date(imageReportData.auditedAt || Date.now()).toLocaleDateString('en-IN')}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Packages</span>
          <div className="text-3xl font-black text-slate-900">{totalPackages}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Covering all states &amp; regions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-1">Complete Images</span>
          <div className="text-3xl font-black text-emerald-600">{completePackages}</div>
          <span className="text-[11px] text-emerald-700/80 mt-1 block">Hero &amp; all gallery images present</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block mb-1">Partial / Pending</span>
          <div className="text-3xl font-black text-amber-600">{partialPackages + missingPackages}</div>
          <span className="text-[11px] text-amber-700/80 mt-1 block">Needs WebP images added</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Overall Image Coverage</span>
          <div className="text-3xl font-black text-slate-900">{overallPct}%</div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${overallPct}%` }}></div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search package or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
          >
            <option value="ALL">All States ({statesList.length})</option>
            {statesList.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
          >
            <option value="ALL">All Image Statuses</option>
            <option value="COMPLETE">Complete (100%)</option>
            <option value="PARTIAL">Partial (1-80%)</option>
            <option value="MISSING">Missing (0%)</option>
          </select>
        </div>

        <div className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
          Showing {filteredItems.length} Packages
        </div>
      </div>

      {/* Package Image Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                <th className="p-4">Package Name &amp; ID</th>
                <th className="p-4">State</th>
                <th className="p-4">Hero Image</th>
                <th className="p-4">Gallery Images</th>
                <th className="p-4">Completion</th>
                <th className="p-4">Expected Folder Path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    No packages match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const stateSlug = item.state.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                  const expectedFolder = `public/images/packages/${stateSlug}/${item.slug}/`;
                  return (
                    <tr key={item.packageId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                        <div className="text-[11px] font-mono text-slate-500">{item.packageId} • {item.slug}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 font-semibold text-[11px]">
                          {item.state}
                        </span>
                      </td>
                      <td className="p-4">
                        {item.heroAvailable ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Available</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-md font-bold text-[10px]">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Missing hero.webp</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-semibold">
                        <span className={item.galleryAvailableCount === 4 ? 'text-emerald-700' : 'text-amber-700'}>
                          {item.galleryAvailableCount} / 4 Images
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className={`h-full rounded-full transition-all ${
                                item.completionPercentage === 100
                                  ? 'bg-emerald-500'
                                  : item.completionPercentage > 0
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${item.completionPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-700">{item.completionPercentage}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 block truncate max-w-xs">
                          {expectedFolder}
                        </code>
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
  );
}
