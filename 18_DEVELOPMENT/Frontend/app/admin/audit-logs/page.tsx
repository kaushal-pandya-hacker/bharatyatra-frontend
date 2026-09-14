'use client';

import { useEffect, useState } from 'react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, entityFilter]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams();
      if (actionFilter) params.append('action', actionFilter);
      if (entityFilter) params.append('entityType', entityFilter);

      const res = await fetch(`http://localhost:4000/api/v1/admin/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setLogs(json.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold font-heading text-slate-900">Operational Audit Trail Stream</h1>
        <p className="text-sm text-slate-500">Traceable administrative record of supplier governance and inventory moderation actions</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Entity Type</label>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
          >
            <option value="">All Entity Types</option>
            <option value="SUPPLIER">SUPPLIER</option>
            <option value="HOTEL">HOTEL</option>
            <option value="RESTAURANT">RESTAURANT</option>
            <option value="ACTIVITY">ACTIVITY</option>
          </select>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors self-end"
        >
          Refresh Logs
        </button>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium">
            No administrative audit logs found. Actions perform in the admin portal will stream here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Admin Email</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Entity Type</th>
                  <th className="px-6 py-4">Entity ID</th>
                  <th className="px-6 py-4">Reason / Operational Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{log.adminEmail || log.user?.email || 'admin@chalofarva.com'}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{log.entityType || 'SYSTEM'}</td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">{log.entityId || '—'}</td>
                    <td className="px-6 py-4 text-slate-700 max-w-sm truncate">{log.reason || log.details || '—'}</td>
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
