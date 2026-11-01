'use client';

import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [selectedStatus]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      let url = '/api/v1/admin/support?';
      if (selectedStatus !== 'ALL') url += `status=${selectedStatus}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) setTickets(json.data);
      }
    } catch (e) {
      console.error('Failed to load support tickets:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicket) return;
    setSending(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/v1/admin/support/${activeTicket.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: replyMessage,
          senderName: 'Operations Support Lead',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveTicket(data.data);
        setReplyMessage('');
        fetchTickets();
      }
    } catch (e: any) {
      alert(e.message || 'Error sending reply');
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async (ticketId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/v1/admin/support/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'RESOLVED',
          resolutionNotes: 'Issue investigated and resolved by customer operations desk.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveTicket(data.data);
        fetchTickets();
      }
    } catch (e: any) {
      alert(e.message || 'Error resolving ticket');
    }
  };

  const filtered = tickets.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.ticketNumber.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Customer Delight</span>
            <span>•</span>
            <span>Help Desk &amp; Escalations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
            Customer Support Tickets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Resolve traveler booking inquiries, payment reconciliations, cancellations, and special requests.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                selectedStatus === st
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search ticket #, customer, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none w-64"
          />
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500">Loading support queue...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-400">No support tickets found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Ticket Number</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Category &amp; Subject</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Assigned Staff</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-slate-900 text-sm">{t.ticketNumber}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{t.customerName}</div>
                      <div className="text-[11px] text-slate-500">{t.customerEmail}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{t.subject}</div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {t.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === 'HIGH' || t.priority === 'URGENT'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {t.assignedStaff}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          t.status === 'RESOLVED' || t.status === 'CLOSED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setActiveTicket(t)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> View Thread
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Conversation Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-600">{activeTicket.ticketNumber}</span>
                  <h3 className="text-lg font-bold text-slate-900">{activeTicket.subject}</h3>
                  <div className="text-xs text-slate-500">
                    From: {activeTicket.customerName} ({activeTicket.customerEmail})
                  </div>
                </div>
                <button onClick={() => setActiveTicket(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Message Thread */}
              <div className="space-y-3 my-4 max-h-64 overflow-y-auto p-2">
                {(activeTicket.messages || []).map((m: any) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                      m.sender === 'STAFF'
                        ? 'bg-amber-50/70 border border-amber-200 ml-8'
                        : 'bg-slate-100 border border-slate-200 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                      <span>{m.senderName} ({m.sender})</span>
                      <span className="text-slate-400 font-normal">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{m.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-2 pt-2 border-t border-slate-100">
                <textarea
                  rows={2}
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type official customer support reply..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
                <div className="flex items-center justify-between">
                  {activeTicket.status !== 'RESOLVED' && (
                    <button
                      type="button"
                      onClick={() => handleResolve(activeTicket.id)}
                      className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-xs"
                    >
                      ✓ Mark Ticket Resolved
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 ml-auto shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? 'Sending...' : 'Send Reply'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

