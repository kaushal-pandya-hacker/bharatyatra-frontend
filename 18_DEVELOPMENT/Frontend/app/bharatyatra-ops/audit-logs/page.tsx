'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAdminAuditLogs } from '@/lib/admin-api';
import { 
  FileText, Search, Filter, ChevronLeft, ChevronRight, RefreshCw, ShieldAlert, Code
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadataJson?: any;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeta, setSelectedMeta] = useState<any | null>(null);

  const loadAuditLogs = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminAuditLogs(page, pagination.limit, search, actionFilter);
      if (res.success) {
        setLogs(res.data);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs(1);
  }, [actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAuditLogs(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Link href="/bharatyatra-ops/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-200">Audit Logs</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-amber-500" /> Admin Security Audit Trail
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Immutable system logs tracking logins, account edits, trip inspections, and admin operations.
          </p>
        </div>
        <button
          onClick={() => loadAuditLogs(pagination.page)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search action, resource, admin..."
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
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Actions</option>
            <option value="ADMIN_LOGIN_SUCCESS">ADMIN_LOGIN_SUCCESS</option>
            <option value="ADMIN_LOGIN_FAILED">ADMIN_LOGIN_FAILED</option>
            <option value="VIEW_USER">VIEW_USER</option>
            <option value="UPDATE_USER_STATUS">UPDATE_USER_STATUS</option>
            <option value="VIEW_TRIP">VIEW_TRIP</option>
            <option value="SEND_NOTIFICATION_BROADCAST">SEND_NOTIFICATION_BROADCAST</option>
            <option value="CHANGE_ADMIN_PASSWORD">CHANGE_ADMIN_PASSWORD</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
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
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Action Event</th>
                <th className="px-5 py-3.5">Admin User</th>
                <th className="px-5 py-3.5">Target Resource</th>
                <th className="px-5 py-3.5 text-right">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-28"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-40"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                    <td className="px-5 py-4 text-right"><div className="h-4 bg-slate-800 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    No audit records matching query filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-mono font-semibold ${
                        log.action.includes('FAILED') || log.action.includes('DEACTIVATE')
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : log.action.includes('SUCCESS') || log.action.includes('BROADCAST')
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-950 text-amber-400 border border-slate-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-200">{log.adminName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{log.adminId}</div>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-300">
                      <div>{log.resourceType}</div>
                      {log.resourceId && <div className="text-[10px] text-slate-500">{log.resourceId}</div>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {log.metadataJson ? (
                        <button
                          onClick={() => setSelectedMeta(log.metadataJson)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition-colors inline-flex items-center gap-1"
                        >
                          <Code className="w-3 h-3 text-amber-400" /> View JSON
                        </button>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{logs.length}</span> of <span className="font-semibold text-slate-200">{pagination.total}</span> audit entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAuditLogs(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-300">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => loadAuditLogs(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* JSON Metadata Inspector Modal */}
      {selectedMeta && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-amber-500" /> Audit Log Event Metadata
              </h3>
              <button onClick={() => setSelectedMeta(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl text-xs text-amber-300 font-mono overflow-x-auto max-h-96 border border-slate-800">
              {JSON.stringify(selectedMeta, null, 2)}
            </pre>
            <div className="text-right">
              <button
                onClick={() => setSelectedMeta(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
