'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Mail,
  MessageCircle,
  Bell,
  CheckCircle2,
  Clock,
  Plus,
  Send,
} from 'lucide-react';

export default function AdminMarketingPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/marketing', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) setCampaigns(json.data);
      }
    } catch (e) {
      console.error('Failed to load marketing campaigns:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Growth &amp; Engagement</span>
            <span>•</span>
            <span>Omnichannel Broadcasts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
            Marketing Campaigns &amp; Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Coordinate Email newsletters, WhatsApp booking updates, and mobile push notifications.
          </p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500">Loading campaign dispatches...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-400">No campaigns found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Campaign Name</th>
                  <th className="p-4">Channel</th>
                  <th className="p-4">Target Audience</th>
                  <th className="p-4">Dispatched Count</th>
                  <th className="p-4">Open Rate</th>
                  <th className="p-4">Conversion</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{c.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Scheduled: {new Date(c.scheduledDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 w-fit">
                        {c.channel === 'EMAIL' && <Mail className="w-3 h-3 text-blue-600" />}
                        {c.channel === 'WHATSAPP' && <MessageCircle className="w-3 h-3 text-emerald-600" />}
                        {c.channel === 'PUSH' && <Bell className="w-3 h-3 text-amber-600" />}
                        {c.channel}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">{c.targetAudience}</td>
                    <td className="p-4 font-bold text-slate-900">
                      {c.sentCount ? c.sentCount.toLocaleString() : '0 (Queued)'}
                    </td>
                    <td className="p-4 font-bold text-emerald-600">{c.openRate}</td>
                    <td className="p-4 font-bold text-amber-600">{c.conversionRate}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {c.status}
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

