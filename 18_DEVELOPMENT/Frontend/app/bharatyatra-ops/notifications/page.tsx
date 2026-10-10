'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAdminNotificationHistory, sendAdminNotificationBroadcast } from '@/lib/admin-api';
import { 
  Bell, Send, RefreshCw, ChevronLeft, ChevronRight, ShieldAlert, CheckCircle2, User, Radio
} from 'lucide-react';

interface NotificationLog {
  id: string;
  userId: string;
  userEmail?: string;
  type: string;
  title: string;
  body: string;
  url?: string;
  status: string;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Broadcast modal / form
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTargetUserId, setBroadcastTargetUserId] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastUrl, setBroadcastUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const loadNotifications = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminNotificationHistory(page, pagination.limit);
      if (res.success) {
        setLogs(res.data);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notification history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(1);
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendSuccess(null);
    setSendError(null);

    try {
      const res = await sendAdminNotificationBroadcast({
        targetUserId: broadcastTargetUserId.trim() || undefined,
        title: broadcastTitle.trim(),
        body: broadcastBody.trim(),
        url: broadcastUrl.trim() || undefined,
      });

      if (res.success) {
        setSendSuccess(res.message || 'Notification broadcast dispatched successfully!');
        setBroadcastTitle('');
        setBroadcastBody('');
        setBroadcastUrl('');
        setBroadcastTargetUserId('');
        setTimeout(() => setShowBroadcastModal(false), 2000);
        loadNotifications(1);
      }
    } catch (err: any) {
      setSendError(err.message || 'Failed to dispatch notification broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Link href="/bharatyatra-ops/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-200">Notifications</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-indigo-400" /> Notifications & Push History
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Audit push notifications and trigger targeted operational system notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-lg transition-colors shadow-lg"
          >
            <Send className="w-4 h-4" /> Send Controlled Notification
          </button>
          <button
            onClick={() => loadNotifications(pagination.page)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* History Table */}
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
                <th className="px-5 py-3.5">Notification Title & Body</th>
                <th className="px-5 py-3.5">Recipient</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Delivery Status</th>
                <th className="px-5 py-3.5">Sent Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-48"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-28"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    No notification history logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="px-5 py-4 max-w-md">
                      <div className="font-semibold text-white">{log.title}</div>
                      <div className="text-xs text-slate-300 truncate mt-0.5">{log.body}</div>
                      {log.url && <div className="text-[10px] text-amber-400 font-mono mt-1">{log.url}</div>}
                    </td>
                    <td className="px-5 py-4">
                      {log.userId === 'ALL' || log.userId === 'BROADCAST' ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-xs bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                          <Radio className="w-3 h-3" /> All Active Push Devices
                        </span>
                      ) : (
                        <Link href={`/bharatyatra-ops/users/${log.userId}`} className="hover:text-amber-400 transition-colors">
                          <div className="font-medium text-slate-200">{log.userEmail || 'Target User'}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{log.userId}</div>
                        </Link>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-300">
                        {log.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.status === 'SENT' || log.status === 'DELIVERED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" /> {log.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
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
            Showing <span className="font-semibold text-slate-200">{logs.length}</span> of <span className="font-semibold text-slate-200">{pagination.total}</span> notification dispatches
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadNotifications(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-300">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => loadNotifications(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-500" /> Send System Notification
              </h3>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {sendError && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" /> {sendError}
              </div>
            )}

            {sendSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {sendSuccess}
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recipient User ID (Leave blank to broadcast to ALL active devices)
                </label>
                <input
                  type="text"
                  placeholder="Optional User ID..."
                  value={broadcastTargetUserId}
                  onChange={(e) => setBroadcastTargetUserId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notification Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flight Status Update"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notification Body Message *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter clear operational push message body..."
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Destination Deep Link URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. /my-trips"
                  value={broadcastUrl}
                  onChange={(e) => setBroadcastUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> {sending ? 'Dispatching...' : 'Dispatch Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
