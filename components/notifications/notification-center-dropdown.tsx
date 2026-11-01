'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck, Clock, Compass, Calendar, Hotel, AlertCircle, ExternalLink, Sparkles, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  initAudioUnlocker,
  playNotificationSound,
  testNotificationSound,
  isSoundAlertsEnabled,
  setSoundAlertsEnabled,
} from '@/lib/utils/sound';

export interface InAppNotification {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  deepLink?: string;
  readAt?: string | null;
  createdAt: string;
}

const API_BASE = '/api/v1';

export function NotificationCenterDropdown() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [soundActive, setSoundActive] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevUnreadCountRef = useRef<number>(-1);

  useEffect(() => {
    initAudioUnlocker();
    setSoundActive(isSoundAlertsEnabled());
  }, []);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundActive;
    setSoundActive(next);
    setSoundAlertsEnabled(next);
    if (next) {
      testNotificationSound('notification');
    }
  };

  const handleTestSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    testNotificationSound('notification');
  };

  const fetchNotifications = async () => {
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
      params.set('limit', '10');

      const [listRes, countRes] = await Promise.all([
        fetch(`${API_BASE}/notifications?${params.toString()}`).catch(() => null),
        fetch(`${API_BASE}/notifications/unread-count?${params.toString()}`).catch(() => null),
      ]);

      if (listRes && listRes.ok) {
        const data = await listRes.json();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data.notifications)
          ? data.notifications
          : Array.isArray(data.data)
          ? data.data
          : [];
        setNotifications(items);
      }
      if (countRes && countRes.ok) {
        const countData = await countRes.json();
        const newUnread = countData.count ?? countData.unreadCount ?? 0;
        setUnreadCount(newUnread);

        // Sound chime on new notifications
        if (prevUnreadCountRef.current !== -1 && newUnread > prevUnreadCountRef.current) {
          playNotificationSound('notification');
        }
        prevUnreadCountRef.current = newUnread;
      }
    } catch {
      // Graceful fallback
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchNotifications();
      }
    }, 20000); // 20s polling for real-time customer updates

    return () => clearInterval(interval);
  }, [user]);

  // Fetch immediately when user explicitly opens dropdown
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string, deepLink?: string, title?: string) => {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        Array.isArray(prev) ? prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)) : [],
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error('[NotificationCenter] Read error:', e);
    }

    setIsOpen(false);
    const ticketMatch = title?.match(/BY-TKT-\d+/)?.[0];
    if (ticketMatch) {
      router.push(`/notifications?ticket=${ticketMatch}`);
    } else if (deepLink) {
      router.push(deepLink);
    } else {
      router.push('/notifications');
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

      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userId: uid }),
      });
      setNotifications((prev) => (Array.isArray(prev) ? prev.map((n) => ({ ...n, readAt: new Date().toISOString() })) : []));
      setUnreadCount(0);
    } catch (e) {
      console.error('[NotificationCenter] Mark all error:', e);
    }
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const filteredNotifications = safeNotifications.filter((n) =>
    activeTab === 'unread' ? !n.readAt : true,
  );

  const getCategoryIcon = (category: string, type: string) => {
    if (category === 'support' || type === 'support' || type === 'action') {
      return <MessageSquare className="w-4 h-4 text-emerald-600" />;
    }
    if (type === 'ITINERARY_READY' || category === 'AI') {
      return <Sparkles className="w-4 h-4 text-purple-600" />;
    }
    if (type === 'BOOKING_UPDATE' || category === 'BOOKING') {
      return <Hotel className="w-4 h-4 text-blue-600" />;
    }
    if (type?.startsWith('TRIP') || category === 'TRIP') {
      return <Calendar className="w-4 h-4 text-amber-600" />;
    }
    return <Bell className="w-4 h-4 text-slate-600" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-hidden cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Dropdown Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTestSound}
                className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition border border-amber-200/60"
                title="Click to test notification chime"
              >
                <Volume2 className="w-3 h-3 text-amber-600" />
                <span>Test Chime</span>
              </button>
              <button
                type="button"
                onClick={toggleSound}
                className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200/50 transition cursor-pointer"
                title={soundActive ? 'Mute sound alerts' : 'Enable sound alerts'}
              >
                {soundActive ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                )}
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors cursor-pointer ml-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark read</span>
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 text-xs font-medium bg-slate-50/30">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2.5 text-center transition-colors border-b-2 cursor-pointer ${
                activeTab === 'all'
                  ? 'border-amber-600 text-amber-600 font-bold bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex-1 py-2.5 text-center transition-colors border-b-2 cursor-pointer ${
                activeTab === 'unread'
                  ? 'border-amber-600 text-amber-600 font-bold bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* List Items */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No notifications in this view.</p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id, item.deepLink, item.title)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 relative ${
                    !item.readAt ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                    {getCategoryIcon(item.category, item.type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.title}
                      </h4>
                      {!item.readAt && (
                        <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1.5 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Dropdown Footer */}
          <div className="p-3 text-center bg-slate-50 border-t border-slate-100">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center justify-center gap-1"
            >
              <span>View Full Notification Center</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
