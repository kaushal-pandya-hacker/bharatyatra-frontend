'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Mail,
  Phone,
  MessageSquare,
  Trash2,
  Edit3,
  Calendar,
  Send,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Volume2,
  User,
  Headphones,
} from 'lucide-react';
import {
  initAudioUnlocker,
  testNotificationSound,
  playNotificationSound,
} from '@/lib/utils/sound';

interface ContactEnquiry {
  id: string;
  enquiryReference: string;
  fullName: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  source: string;
  createdAt: string;
  updatedAt: string;
  emailNotificationStatus: 'PENDING' | 'SENT' | 'FAILED' | 'NOT_CONFIGURED';
  whatsappNotificationStatus: 'PENDING' | 'SENT' | 'FAILED' | 'NOT_CONFIGURED';
  adminNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

interface Stats {
  total: number;
  newCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  todayCount: number;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    newCount: 0,
    inProgressCount: 0,
    resolvedCount: 0,
    closedCount: 0,
    todayCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEnquiry, setActiveEnquiry] = useState<ContactEnquiry | null>(null);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const previousNewCountRef = useRef<number | null>(null);

  useEffect(() => {
    initAudioUnlocker();
    fetchEnquiries();
    const interval = setInterval(() => {
      fetchEnquiries(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [selectedStatus, selectedType]);

  const fetchEnquiries = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('admin_token');
      let url = '/api/v1/admin/enquiries?';
      if (selectedStatus !== 'ALL') url += `status=${selectedStatus}&`;
      if (selectedType !== 'ALL') url += `inquiryType=${encodeURIComponent(selectedType)}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) setEnquiries(json.data);
        if (json.stats) {
          if (
            previousNewCountRef.current !== null &&
            json.stats.new > previousNewCountRef.current
          ) {
            playNotificationSound('notification');
          }
          previousNewCountRef.current = json.stats.new;
          setStats(json.stats);
        }
      } else {
        if (!isBackground) setErrorMessage('Failed to fetch enquiries from server.');
      }
    } catch (e: any) {
      if (!isBackground) setErrorMessage(e?.message || 'Error connecting to database.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleUpdateStatus = async (enquiryId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/v1/admin/enquiries/${enquiryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotes || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActiveEnquiry(json.data);
        fetchEnquiries();
      } else {
        alert(json.message || 'Error updating enquiry');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update enquiry status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!activeEnquiry) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/v1/admin/enquiries/${activeEnquiry.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminNotes }),
      });

      const json = await res.json();
      if (json.success) {
        setActiveEnquiry(json.data);
        fetchEnquiries();
        alert('Notes saved successfully.');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to save notes.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteEnquiry = async (id: string, ref: string) => {
    if (!confirm(`Are you sure you want to permanently delete enquiry #${ref}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/v1/admin/enquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (json.success) {
        setActiveEnquiry(null);
        fetchEnquiries();
      } else {
        alert(json.message || 'Failed to delete enquiry.');
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting enquiry.');
    }
  };

  const openDetail = async (enq: ContactEnquiry) => {
    setActiveEnquiry(enq);
    setAdminNotes(enq.adminNotes || '');
    setReplyMessage('');
    setReplyFeedback(null);
    setActiveTicket(null);
    setLoadingTicket(true);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/v1/admin/enquiries/${enq.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.ticket) {
          setActiveTicket(json.data.ticket);
        }
      }
    } catch {
      // Non-fatal
    } finally {
      setLoadingTicket(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeEnquiry) return;
    setSendingReply(true);
    setReplyFeedback(null);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/v1/admin/enquiries/${activeEnquiry.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: replyMessage.trim(),
          senderName: 'Operations Support Lead',
        }),
      });

      const json = await res.json();
      if (json.success) {
        playNotificationSound('message_sent');
        if (json.data?.ticket) {
          setActiveTicket(json.data.ticket);
        }
        if (json.data?.enquiry) {
          setActiveEnquiry(json.data.enquiry);
        }
        setReplyMessage('');
        setReplyFeedback('Reply successfully sent to traveler. Client website notified in real time.');
        fetchEnquiries();
      } else {
        alert(json.message || 'Error delivering reply to client.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to deliver reply to customer.');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl font-sans text-slate-800">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Customer Concierge</span>
            <span>•</span>
            <span>Real-time Inbound Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Website Enquiry Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real production customer inquiries submitted through the BharatYatra contact portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => testNotificationSound('notification')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold text-amber-900 shadow-2xs transition-colors cursor-pointer"
            title="Click to test audible sound chime"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Test Sound</span>
          </button>
          <button
            onClick={() => fetchEnquiries()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Records</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Enquiries</span>
          <span className="text-2xl font-black text-[#102B4E] block mt-1">{stats.total}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">New / Unread</span>
          <span className="text-2xl font-black text-amber-600 block mt-1">{stats.newCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">In Progress</span>
          <span className="text-2xl font-black text-blue-600 block mt-1">{stats.inProgressCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">Resolved</span>
          <span className="text-2xl font-black text-emerald-600 block mt-1">{stats.resolvedCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block">Today&apos;s Inbound</span>
          <span className="text-2xl font-black text-purple-600 block mt-1">{stats.todayCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                selectedStatus === st
                  ? 'bg-[#102B4E] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchEnquiries()}
              placeholder="Search name, email, phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
            />
          </div>
          <button
            onClick={() => fetchEnquiries()}
            className="px-3.5 py-2 rounded-xl bg-[#102B4E] text-white font-bold text-xs hover:bg-blue-950 transition-colors cursor-pointer"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs font-semibold text-slate-400 animate-pulse">
            Loading production enquiries from database...
          </div>
        ) : enquiries.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No Enquiries Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || selectedStatus !== 'ALL'
                ? 'No inquiries match your current search or status filter.'
                : 'Zero website inquiries currently logged in the database.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Ref &amp; Timestamp</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Inquiry Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notifications</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {enquiries.map((enq) => (
                  <tr
                    key={enq.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => openDetail(enq)}
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">
                        #{enq.enquiryReference}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {new Date(enq.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{enq.fullName}</span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[200px]">
                        {enq.email}
                      </span>
                      {enq.phone && (
                        <span className="text-[11px] text-slate-500 block font-mono">
                          {enq.phone}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {enq.inquiryType}
                      </span>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 max-w-[260px]">
                        {enq.message}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          enq.status === 'NEW'
                            ? 'bg-amber-100 text-amber-800'
                            : enq.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : enq.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {enq.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400 font-semibold">Email:</span>
                        <span
                          className={`font-mono text-[10px] font-bold ${
                            enq.emailNotificationStatus === 'SENT'
                              ? 'text-emerald-600'
                              : enq.emailNotificationStatus === 'FAILED'
                              ? 'text-red-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {enq.emailNotificationStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400 font-semibold">WhatsApp:</span>
                        <span
                          className={`font-mono text-[10px] font-bold ${
                            enq.whatsappNotificationStatus === 'SENT'
                              ? 'text-emerald-600'
                              : enq.whatsappNotificationStatus === 'FAILED'
                              ? 'text-red-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {enq.whatsappNotificationStatus}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(enq);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#102B4E] hover:text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Slide-over / Modal */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider block">
                  Enquiry Details • #{activeEnquiry.enquiryReference}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {activeEnquiry.fullName}
                </h3>
              </div>
              <button
                onClick={() => setActiveEnquiry(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              
              {/* Customer Contact Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
                  <a href={`mailto:${activeEnquiry.email}`} className="font-semibold text-blue-700 hover:underline text-xs">
                    {activeEnquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone Number</span>
                  <span className="font-semibold text-slate-800 text-xs font-mono">
                    {activeEnquiry.phone || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Topic / Category</span>
                  <span className="font-semibold text-slate-800 text-xs">
                    {activeEnquiry.inquiryType}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Submission Date</span>
                  <span className="font-semibold text-slate-800 text-xs">
                    {new Date(activeEnquiry.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Conversation History / Customer Message */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Customer Message &amp; Conversation Thread:
                  </span>
                  {activeTicket && (
                    <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      #{activeTicket.ticketNumber}
                    </span>
                  )}
                </div>

                {loadingTicket ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-400 animate-pulse">
                    Syncing conversation thread...
                  </div>
                ) : activeTicket?.messages && activeTicket.messages.length > 0 ? (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto p-3 bg-slate-50/70 rounded-2xl border border-slate-200">
                    {activeTicket.messages.map((m: any) => {
                      const isStaff = m.sender === 'STAFF';
                      return (
                        <div
                          key={m.id}
                          className={`flex items-start gap-2.5 ${isStaff ? 'justify-start' : 'justify-end'}`}
                        >
                          {isStaff && (
                            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                              <Headphones className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div
                            className={`max-w-[85%] p-3 rounded-xl text-xs space-y-1 shadow-2xs ${
                              isStaff
                                ? 'bg-amber-50 border border-amber-200 text-slate-800'
                                : 'bg-[#102B4E] text-white border border-[#102B4E]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 text-[10px] font-bold">
                              <span className={isStaff ? 'text-amber-900' : 'text-amber-400'}>
                                {m.senderName} {isStaff ? '(Staff)' : '(Customer)'}
                              </span>
                              <span className={isStaff ? 'text-slate-400' : 'text-slate-300'}>
                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                          </div>
                          {!isStaff && (
                            <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                              <User className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 leading-relaxed text-slate-800 whitespace-pre-wrap font-medium">
                    {activeEnquiry.message}
                  </div>
                )}
              </div>

              {/* Direct Reply to Traveler Form */}
              <div className="space-y-2 p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-amber-700" />
                    <span>Reply to Traveler (Delivers to Client Portal)</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">
                    {activeEnquiry.email}
                  </span>
                </div>

                {replyFeedback && (
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{replyFeedback}</span>
                  </div>
                )}

                <form onSubmit={handleSendReply} className="space-y-2">
                  <textarea
                    rows={3}
                    required
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={`Write official reply to ${activeEnquiry.fullName}. The traveler will see this on the website notifications and can reply back...`}
                    className="w-full p-3 rounded-xl border border-amber-300/80 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500">
                      Traveler receives real-time in-app notification &amp; email
                    </span>
                    <button
                      type="submit"
                      disabled={sendingReply || !replyMessage.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#102B4E] hover:bg-blue-950 disabled:bg-slate-300 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sendingReply ? 'Sending Reply...' : 'Send Reply to Client'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Status Update Control */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Workflow Status:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={updating}
                      onClick={() => handleUpdateStatus(activeEnquiry.id, st)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                        activeEnquiry.status === st
                          ? 'bg-[#102B4E] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Internal Operations Notes:
                </span>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal resolution notes, agent contact summary, or follow-up status..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#102B4E]"
                />
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleSaveNotes}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Save Internal Notes
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${activeEnquiry.email}?subject=RE:%20BharatYatra%20Enquiry%20%23${activeEnquiry.enquiryReference}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold text-xs transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Customer</span>
                  </a>

                  {activeEnquiry.phone && (
                    <a
                      href={`https://wa.me/${activeEnquiry.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Customer</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteEnquiry(activeEnquiry.id, activeEnquiry.enquiryReference)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Enquiry</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

