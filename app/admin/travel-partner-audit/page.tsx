'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, Clock, RefreshCw } from 'lucide-react';
import { TravelPartnerAuditLog } from '@/types/travel-partner';

export default function AdminTravelPartnerAuditPage() {
  const [logs, setLogs] = useState<TravelPartnerAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/travel-partner-audit');
      const json = await res.json();
      if (json.success) {
        setLogs(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const filtered = logs.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.entityType.toLowerCase().includes(q) ||
      l.entityId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Partner Ecosystem Audit Log
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable chronicle of partner submissions, admin approvals, package lifecycle changes, and financial events.
          </p>
        </div>

        <button
          onClick={fetchAudit}
          className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Audit Trail
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action or entity ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
          />
        </div>

        <span className="text-xs text-slate-400 font-medium">{filtered.length} Recorded Events</span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-500">Loading audit history...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-500">No audit events match your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">Metadata Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-slate-500 font-sans">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.actorRole === 'ADMIN'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : log.actorRole === 'PARTNER'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="p-4 text-slate-800 font-bold">{log.entityType}</td>
                    <td className="p-4 text-slate-900 font-black">{log.action}</td>
                    <td className="p-4 text-slate-600 truncate max-w-sm">
                      {JSON.stringify(log.metadata || {})}
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
