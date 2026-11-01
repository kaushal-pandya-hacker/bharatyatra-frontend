'use client';

import React, { useState, useEffect } from 'react';
import {
  Hotel,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  Building2,
  MapPin,
  Star,
  ExternalLink,
} from 'lucide-react';

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [supplierStatus, setSupplierStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/hotels', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) setHotels(json.data);
        if (json.supplierStatus) setSupplierStatus(json.supplierStatus);
      }
    } catch (e) {
      console.error('Failed to load hotels:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = hotels.filter((h) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.supplierName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Hospitality Operations</span>
            <span>•</span>
            <span>Hotelbeds &amp; Direct Properties</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
            Hotel Inventory &amp; Supplier Health
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor real-time room availability, dynamic rate parity, and Hotelbeds APItude synchronization.
          </p>
        </div>

        <button
          onClick={fetchHotels}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Inventory
        </button>
      </div>

      {/* Supplier Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hotelbeds APItude */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GDS Provider</span>
            <h3 className="font-bold text-slate-900 text-sm">Hotelbeds APItude Booking Suite</h3>
            <div className="text-xs text-slate-500">Live multi-property inventory &amp; rate parity adapter</div>
            <div className="text-[11px] text-slate-400 pt-2">
              Status: Sandbox Mode (Configuration Required for Live GDS Production Keys)
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold">
            {supplierStatus?.hotelbeds?.status || 'SANDBOX'}
          </span>
        </div>

        {/* Self Contracted */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Contracts</span>
            <h3 className="font-bold text-slate-900 text-sm">Direct Heritage &amp; Eco-Resorts Network</h3>
            <div className="text-xs text-slate-500">{filtered.length} properties connected</div>
            <div className="text-[11px] text-slate-400 pt-2">Live Availability Lock Enforced</div>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
            {filtered.length > 0 ? 'LIVE_VERIFIED' : '0 CONNECTED'}
          </span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search hotel name, city, supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Hotels Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500">Loading hotel properties...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-400">No hotels found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Hotel Property</th>
                  <th className="p-4">Supplier &amp; Location</th>
                  <th className="p-4">Star Rating</th>
                  <th className="p-4">Base Rate / Night</th>
                  <th className="p-4">Allotted Rooms</th>
                  <th className="p-4">Integration State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{h.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{h.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{h.supplierName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        <span>{h.city}, {h.state}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-slate-800">{h.starRating} Stars</span>
                      </div>
                    </td>
                    <td className="p-4 font-black text-slate-900 text-sm">
                      ₹{h.basePrice?.toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-emerald-600">
                      {h.roomsAvailable} Rooms Available
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {h.syncStatus} • {h.integration}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

