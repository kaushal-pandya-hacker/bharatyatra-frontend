'use client';

import React, { useState, useEffect } from 'react';
import {
  Bus,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Users,
} from 'lucide-react';

export default function AdminBusesPage() {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/transportation', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.busRoutes) setBuses(json.busRoutes);
      }
    } catch (e) {
      console.error('Failed to load buses:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = buses.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.operatorName.toLowerCase().includes(q) ||
      b.sourceCity.toLowerCase().includes(q) ||
      b.destinationCity.toLowerCase().includes(q) ||
      b.busType.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Ground Transportation</span>
            <span>•</span>
            <span>eTravelSmart Bus Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
            Bus Fleet Operations &amp; Route GDS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Inter-city coach schedules, dynamic seat allocations, operator rate cards, and ticketing status.
          </p>
        </div>

        <button
          onClick={fetchBuses}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Sync Fleet Routes
        </button>
      </div>

      {/* Provider Status Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">eTravelSmart B2B Bus Distribution Engine</h3>
            <div className="text-xs text-slate-500 mt-0.5">
              Live seat layouts, boarding points, and GSRTC &amp; private operator connectivity.
            </div>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
          LIVE CONNECTED
        </span>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search operator, origin, destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Bus Routes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500">Loading bus fleet schedules...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-400">No bus routes found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Bus Operator</th>
                  <th className="p-4">Origin → Destination</th>
                  <th className="p-4">Bus Type</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4">Seat Fare</th>
                  <th className="p-4">Available Seats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{b.operatorName}</div>
                      <div className="text-[11px] text-slate-400">Provider: {b.provider}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>{b.sourceCity} → {b.destinationCity}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {b.busType}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-800 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.departureTime} – {b.arrivalTime}</span>
                      </div>
                    </td>
                    <td className="p-4 font-black text-slate-900 text-sm">
                      ₹{b.fare?.toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-emerald-600">
                      {b.seatsAvailable} Seats Open
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

