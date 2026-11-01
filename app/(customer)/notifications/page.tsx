'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Clock,
  MessageSquare,
  Hotel,
  Calendar,
  Compass,
  CreditCard,
  Sparkles,
  ArrowRight,
  Inbox,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export interface InAppNotification {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  deepLink?: string;
  readAt?: string | null;
  createdAt: string;
  metadata?: Record<string, any>;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const email =
        user?.email ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('by_user_email') || localStorage.getItem('by_last_enquiry_email') || ''
          : '') ||
        '';
      const uid = user?.id || (email ? `usr_${email}` : 'usr_customer');

      const params = new URLSearchParams();
      if (uid) params.set('userId', uid);
      if (email) params.set('email', email);
      params.set('limit', '50');

      const res = await fetch(`/api/v1/notifications?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.notifications)
          ? json.notifications
          : [];
        setNotifications(items);
      }
    } catch {
      // Ignore network errors
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, readAt: new Date().toISOString() } : item))
      );
      showToast('Notification marked as read');
    } catch {
      // Silent error
    }
  };

  const markAllAsRead = async () => {
    try {
      const email =
        user?.email ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('by_user_email') || localStorage.getItem('by_last_enquiry_email') || ''
          : '') ||
        '';
      const uid = user?.id || (email ? `usr_${email}` : 'usr_customer');

      await fetch('/api/v1/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userId: uid }),
      });
      setNotifications((prev) => prev.map((item) => ({ ...item, readAt: new Date().toISOString() })));
      showToast('All notifications marked as read');
    } catch {
      // Silent error
    }
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const filteredNotifications = notifications.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'support') {
      return item.category?.toLowerCase() === 'support' || item.type?.toLowerCase() === 'support';
    }
    if (selectedCategory === 'bookings') {
      return item.category?.toLowerCase() === 'booking' || item.type?.toLowerCase() === 'booking';
    }
    if (selectedCategory === 'trips') {
      return item.category?.toLowerCase() === 'trip' || item.type?.toLowerCase() === 'trip';
    }
    if (selectedCategory === 'payments') {
      return item.category?.toLowerCase() === 'payment' || item.type?.toLowerCase() === 'payment';
    }
    return true;
  });

  const getCategoryIcon = (category: string, type: string) => {
    if (category === 'support' || type === 'support' || type === 'action') {
      return <MessageSquare className="w-5 h-5 text-emerald-600" />;
    }
    if (type === 'ITINERARY_READY' || category === 'ai') {
      return <Sparkles className="w-5 h-5 text-purple-600" />;
    }
    if (type === 'BOOKING_UPDATE' || category === 'booking') {
      return <Hotel className="w-5 h-5 text-blue-600" />;
    }
    if (type?.startsWith('TRIP') || category === 'trip') {
      return <Calendar className="w-5 h-5 text-amber-600" />;
    }
    if (category === 'payment') {
      return <CreditCard className="w-5 h-5 text-indigo-600" />;
    }
    return <Bell className="w-5 h-5 text-slate-600" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500/20 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Bell className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-black text-[#102B4E] tracking-tight">Notifications &amp; Alerts</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Live updates regarding your customer support inquiries, booking receipts, and travel itinerary alerts.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchNotifications}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Refresh Notifications"
              type="button"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#102B4E] hover:bg-blue-950 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                type="button"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'support', label: 'Support & Inquiries' },
            { id: 'bookings', label: 'Bookings' },
            { id: 'trips', label: 'Trips & Circuits' },
            { id: 'payments', label: 'Payments' },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                type="button"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#102B4E] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-xs font-semibold text-slate-400 animate-pulse">
              Syncing notifications with BharatYatra operations ledger...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 sm:p-16 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                <Inbox className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Notifications in this View</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                When our operations desk replies to your inquiries or sends booking confirmations, updates will appear here in real time.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#102B4E] text-white rounded-xl text-xs font-bold hover:bg-blue-950 transition"
                >
                  <span>Contact Operations Support</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUnread = !notif.readAt;
              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    isUnread
                      ? 'border-amber-300 bg-amber-50/20 shadow-xs ring-1 ring-amber-300/40'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0 mt-0.5">
                      {getCategoryIcon(notif.category, notif.type)}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{notif.title}</span>
                        {isUnread && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
                            New
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
                          {notif.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium pt-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(notif.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {isUnread && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                        type="button"
                      >
                        Mark Read
                      </button>
                    )}
                    {notif.deepLink && (
                      <Link
                        href={notif.deepLink}
                        className="px-3.5 py-1.5 rounded-lg bg-[#102B4E] hover:bg-blue-950 text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
