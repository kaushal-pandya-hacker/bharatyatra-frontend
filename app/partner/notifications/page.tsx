'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function PartnerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/partner/notifications')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setNotifications(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Partner Notifications Center
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time updates regarding package reviews, booking confirmations, and settlements.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-2">
          <Bell className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Unread Notifications</h3>
          <p className="text-xs text-slate-400">All alerts and reviews have been caught up with.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start justify-between gap-3 shadow-md"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{n.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
              </div>

              {n.actionUrl && (
                <Link
                  href={n.actionUrl}
                  className="px-3 py-1.5 bg-[#FED65B] text-slate-950 font-bold text-xs rounded-xl shrink-0 hover:bg-amber-400"
                >
                  View Details
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
