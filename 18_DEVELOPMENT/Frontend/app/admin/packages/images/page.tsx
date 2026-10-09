'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ALL_INDIA_PACKAGES } from '@/data/india-packages.data';
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
    <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/packages"
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1.5 bg-slate-800 px-3.5 py-2 rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Packages Admin</span>
            </Link>
            <div className="h-4 w-px bg-slate-700"></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-amber-400" />
                <span>Package Images Management Dashboard</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit image assets, track completion status &amp; view drag-and-drop file paths for production replacement.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
            Audit Date: {new Date(imageReportData.auditedAt || Date.now()).toLocaleDateString('en-IN')}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Packages</span>
          <div className="text-3xl font-extrabold text-white">{totalPackages}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Covering all states &amp; regions</span>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">Complete Images</span>
          <div className="text-3xl font-extrabold text-emerald-400">{completePackages}</div>
          <span className="text-[11px] text-emerald-300/80 mt-1 block">Hero &amp; all gallery images present</span>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">Partial / Pending</span>
          <div className="text-3xl font-extrabold text-amber-400">{partialPackages + missingPackages}</div>
          <span className="text-[11px] text-amber-300/80 mt-1 block">Needs WebP images added</span>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">Overall Image Coverage</span>
          <div className="text-3xl font-extrabold text-cyan-400">{overallPct}%</div>
          <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full transition-all duration-500" style={{ width: `${overallPct}%` }}></div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="max-w-7xl mx-auto bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search package or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All States ({statesList.length})</option>
            {statesList.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Image Statuses</option>
            <option value="COMPLETE">Complete (100%)</option>
            <option value="PARTIAL">Partial (1-80%)</option>
            <option value="MISSING">Missing (0%)</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/30">
          Showing {filteredItems.length} Packages
        </div>
      </div>

      {/* Package Image Table */}
      <div className="max-w-7xl mx-auto bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <th className="p-4 font-bold">Package Name &amp; ID</th>
                <th className="p-4 font-bold">State</th>
                <th className="p-4 font-bold">Hero Image</th>
                <th className="p-4 font-bold">Gallery Images</th>
                <th className="p-4 font-bold">Completion</th>
                <th className="p-4 font-bold">Expected Folder Path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No packages match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const stateSlug = item.state.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                  const expectedFolder = `public/images/packages/${stateSlug}/${item.slug}/`;
                  return (
                    <tr key={item.packageId} className="hover:bg-slate-700/40 transition">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{item.title}</div>
                        <div className="text-[11px] font-mono text-amber-400">{item.packageId} • {item.slug}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-300 font-medium">
                          {item.state}
                        </span>
                      </td>
                      <td className="p-4">
                        {item.heroAvailable ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Available</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/30 px-2.5 py-1 rounded font-bold text-[10px]">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Missing hero.webp</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-medium">
                        <span className={item.galleryAvailableCount === 4 ? 'text-emerald-400' : 'text-amber-400'}>
                          {item.galleryAvailableCount} / 4 Images
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
                            <div
                              className={`h-full rounded-full transition-all ${
                                item.completionPercentage === 100
                                  ? 'bg-emerald-400'
                                  : item.completionPercentage > 0
                                  ? 'bg-amber-400'
                                  : 'bg-red-400'
                              }`}
                              style={{ width: `${item.completionPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-300">{item.completionPercentage}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="text-[11px] font-mono text-cyan-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 block truncate max-w-xs">
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
