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
  CreditCard,
  Sparkles,
  ArrowRight,
  Inbox,
  RefreshCw,
  X,
  Send,
  User,
  Headphones,
  CheckCircle2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  initAudioUnlocker,
  playNotificationSound,
  testNotificationSound,
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
  metadata?: Record<string, any>;
}

interface SupportTicketMessage {
  id: string;
  sender: 'CUSTOMER' | 'STAFF';
  senderName: string;
  message: string;
  timestamp: string;
}

interface SupportTicketData {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  status: string;
  priority: string;
  messages: SupportTicketMessage[];
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Support Conversation Modal State
  const [activeTicket, setActiveTicket] = useState<SupportTicketData | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState<boolean>(false);
  const [loadingTicket, setLoadingTicket] = useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [sendingReply, setSendingReply] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
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

  const openSupportThread = async (notif: InAppNotification) => {
    if (notif.id && notif.id !== 'url-param') {
      markAsRead(notif.id);
    }

    const ticketIdOrNumber =
      notif.metadata?.ticketId ||
      notif.metadata?.ticketNumber ||
      notif.title.match(/BY-TKT-\d+/)?.[0] ||
      'BY-TKT-0001';

    setLoadingTicket(true);
    setTicketModalOpen(true);

    try {
      const res = await fetch(`/api/v1/support/tickets/${encodeURIComponent(ticketIdOrNumber)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setActiveTicket(json.data);
          return;
        }
      }

      // Graceful fallback with available notification content
      setActiveTicket({
        id: ticketIdOrNumber,
        ticketNumber: notif.metadata?.ticketNumber || notif.title.match(/BY-TKT-\d+/)?.[0] || 'BY-TKT-0001',
        customerName: user?.fullName || 'Traveler',
        customerEmail: user?.email || '',
        subject: notif.metadata?.subject || notif.title,
        status: notif.metadata?.status || 'OPEN',
        priority: 'NORMAL',
        messages: [
          {
            id: 'staff-msg-fallback',
            sender: 'STAFF',
            senderName: notif.metadata?.senderName || 'Operations Support Lead',
            message: notif.message,
            timestamp: notif.createdAt,
          },
        ],
      });
    } catch {
      // Offline fallback
    } finally {
      setLoadingTicket(false);
    }
  };

  const handleSendCustomerReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicket) return;

    setSendingReply(true);
    try {
      const ticketRef = activeTicket.id || activeTicket.ticketNumber;
      const res = await fetch(`/api/v1/support/tickets/${encodeURIComponent(ticketRef)}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyMessage.trim(),
          senderName: user?.fullName || activeTicket.customerName || 'Traveler',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setActiveTicket(json.data);
        } else {
          setActiveTicket((prev) =>
            prev
              ? {
                  ...prev,
                  messages: [
                    ...prev.messages,
                    {
                      id: `msg-${Date.now()}`,
                      sender: 'CUSTOMER',
                      senderName: user?.fullName || prev.customerName || 'You',
                      message: replyMessage.trim(),
                      timestamp: new Date().toISOString(),
                    },
                  ],
                }
              : null
          );
        }
        setReplyMessage('');
        playNotificationSound('message_sent');
        showToast('Reply delivered to BharatYatra Support operations');
      } else {
        showToast('Error sending message. Please reach WhatsApp concierge.');
      }
    } catch {
      showToast('Connection error. Please try again or chat on WhatsApp.');
    } finally {
      setSendingReply(false);
    }
  };

  // Auto-open ticket if specified in URL query
  useEffect(() => {
    initAudioUnlocker();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ticketParam = params.get('ticket');
      if (ticketParam) {
        openSupportThread({
          id: 'url-param',
          type: 'support',
          category: 'support',
          title: `Support Ticket #${ticketParam}`,
          message: '',
          createdAt: new Date().toISOString(),
          metadata: { ticketNumber: ticketParam, ticketId: ticketParam },
        });
      }
    }
  }, []);

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

      {/* Interactive Support Conversation Modal */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#102B4E]">
                      Support Conversation
                    </h3>
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                      #{activeTicket?.ticketNumber || 'TICKET'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase">
                      {activeTicket?.status || 'OPEN'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-sm mt-0.5">
                    {activeTicket?.subject || 'BharatYatra Operations Support Request'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => testNotificationSound('notification')}
                  className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  title="Click to test notification chime"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Test Sound</span>
                </button>
                <button
                  onClick={() => setTicketModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
              {loadingTicket ? (
                <div className="py-16 text-center text-xs font-semibold text-slate-400 animate-pulse">
                  Loading conversation history...
                </div>
              ) : (activeTicket?.messages || []).length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  No previous messages in this conversation.
                </div>
              ) : (
                activeTicket?.messages.map((m) => {
                  const isStaff = m.sender === 'STAFF';
                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-3 ${isStaff ? 'justify-start' : 'justify-end'}`}
                    >
                      {isStaff && (
                        <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300/60 flex items-center justify-center text-amber-800 shrink-0 mt-0.5 shadow-2xs">
                          <Headphones className="w-4 h-4" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] sm:max-w-md p-4 rounded-2xl text-xs space-y-1.5 shadow-xs ${
                          isStaff
                            ? 'bg-amber-50/80 border border-amber-200 text-slate-800'
                            : 'bg-[#102B4E] text-white border border-[#102B4E]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[11px] font-bold">
                          <span className={isStaff ? 'text-amber-900' : 'text-amber-400'}>
                            {m.senderName} {isStaff ? '(Staff)' : '(You)'}
                          </span>
                          <span className={`text-[10px] font-normal ${isStaff ? 'text-slate-400' : 'text-slate-300'}`}>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`leading-relaxed whitespace-pre-wrap ${isStaff ? 'text-slate-800' : 'text-slate-100'}`}>
                          {m.message}
                        </p>
                      </div>
                      {!isStaff && (
                        <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5 shadow-2xs">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer: Customer Reply Box */}
            <form onSubmit={handleSendCustomerReply} className="p-4 bg-white border-t border-slate-200 space-y-3">
              <div className="space-y-1">
                <textarea
                  rows={2}
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply to customer support..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <a
                  href="https://wa.me/919624282521"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>Chat on WhatsApp (+91 96242 82521)</span>
                </a>
                <button
                  type="submit"
                  disabled={sendingReply || !replyMessage.trim()}
                  className="px-4 py-2 bg-[#102B4E] hover:bg-blue-950 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingReply ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
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
              const isSupport =
                notif.category?.toLowerCase() === 'support' ||
                notif.type?.toLowerCase() === 'support' ||
                notif.title.includes('BY-TKT') ||
                Boolean(notif.metadata?.ticketNumber || notif.metadata?.ticketId);

              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    isUnread
                      ? 'border-amber-300 bg-amber-50/20 shadow-xs ring-1 ring-amber-300/40'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    onClick={() => isSupport && openSupportThread(notif)}
                    className={`flex items-start gap-3.5 flex-1 min-w-0 ${isSupport ? 'cursor-pointer' : ''}`}
                  >
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

                    {isSupport ? (
                      <button
                        onClick={() => openSupportThread(notif)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#102B4E] hover:bg-blue-950 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        type="button"
                      >
                        <span>View &amp; Reply</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      notif.deepLink && (
                        <Link
                          href={notif.deepLink}
                          className="px-3.5 py-1.5 rounded-lg bg-[#102B4E] hover:bg-blue-950 text-white text-xs font-bold transition flex items-center gap-1"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )
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
