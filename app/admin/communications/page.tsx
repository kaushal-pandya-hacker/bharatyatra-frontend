'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail,
  MessageSquare,
  Bell,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Users,
  Smartphone,
  Sparkles,
  Clock,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface CommunicationStats {
  totalSent: number;
  delivered: number;
  failed: number;
  successRatePct: number;
}

interface TemplateItem {
  id: string;
  name: string;
  channel: string;
  defaultSubject: string;
  body: string;
}

interface DispatchHistoryItem {
  id: string;
  channel: 'EMAIL' | 'WHATSAPP' | 'IN_APP' | 'ALL';
  targetType: string;
  recipientIdentifier: string;
  recipientName: string;
  templateId: string;
  subject: string;
  messageBody: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED' | 'RETRYING';
  retryCount: number;
  dispatchedAt: string;
  adminEmail: string;
}

export default function AdminCommunicationsPage() {
  const [stats, setStats] = useState<CommunicationStats>({
    totalSent: 0,
    delivered: 0,
    failed: 0,
    successRatePct: 100,
  });
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [history, setHistory] = useState<DispatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Composer Form State
  const [channel, setChannel] = useState<'EMAIL' | 'WHATSAPP' | 'IN_APP' | 'ALL'>('EMAIL');
  const [targetType, setTargetType] = useState<'INDIVIDUAL' | 'GROUP' | 'BOOKING' | 'TRIP' | 'ALL_USERS'>('INDIVIDUAL');
  const [recipientIdentifier, setRecipientIdentifier] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/communications');
      const json = await res.json();
      if (json.success) {
        setStats(json.stats);
        setTemplates(json.templates || []);
        setHistory(json.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTemplateSelect = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    if (!tmplId) return;
    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl) {
      setSubject(tmpl.defaultSubject);
      setMessageBody(tmpl.body);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientIdentifier.trim() || !messageBody.trim()) {
      setFeedback({ type: 'error', text: 'Please provide both recipient and message text.' });
      return;
    }

    try {
      setSending(true);
      const res = await fetch('/api/v1/admin/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          targetType,
          recipientIdentifier,
          recipientName: recipientName || recipientIdentifier,
          templateId: selectedTemplateId || 'CUSTOM',
          subject: subject || 'BharatYatra Travel Communication',
          messageBody,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({ type: 'success', text: `Message dispatched successfully via ${channel}!` });
        setMessageBody('');
        setSubject('');
        setRecipientIdentifier('');
        setRecipientName('');
        setSelectedTemplateId('');
        await fetchData();
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: 'error', text: json.error || 'Failed to dispatch communication.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Dispatch error occurred.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            Omni-Channel Traveler Outreach
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <MessageSquare className="w-7 h-7 text-amber-500" />
            User Communication Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Dispatch official booking confirmations, trip updates, WhatsApp advisories, and promotional campaigns.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats &amp; Logs
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold shadow-md flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* STATS TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Dispatched</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.totalSent}
          </div>
          <span className="text-[11px] text-slate-400">All channels</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Confirmed Delivered</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {stats.delivered}
          </div>
          <span className="text-[11px] text-slate-400">Zero bounce reported</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Delivery Rate</span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {stats.successRatePct}%
          </div>
          <span className="text-[11px] text-slate-400">SLAs met</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Active Gateways</span>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            SMTP • Meta API • In-App
          </div>
          <span className="text-[11px] text-slate-400">All operational</span>
        </div>
      </div>

      {/* 2-COLUMN GRID: COMPOSER (LEFT) & RECENT HISTORY (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COMPOSER FORM (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2 mb-4">
            <Send className="w-4 h-4 text-amber-500" />
            Dispatch Message Composer
          </h2>

          <form onSubmit={handleSend} className="space-y-4">
            {/* CHANNEL SELECTOR */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase block mb-1.5">
                Channel
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['EMAIL', 'WHATSAPP', 'IN_APP', 'ALL'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      channel === ch
                        ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {ch === 'EMAIL' && <Mail className="w-3.5 h-3.5" />}
                    {ch === 'WHATSAPP' && <Smartphone className="w-3.5 h-3.5" />}
                    {ch === 'IN_APP' && <Bell className="w-3.5 h-3.5" />}
                    {ch === 'ALL' && <Sparkles className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{ch}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TARGET TYPE */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase block mb-1.5">
                Target Audience
              </label>
              <select
                value={targetType}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setTargetType(val);
                  if (val === 'ALL_USERS') {
                    setRecipientIdentifier('broadcast@all_verified_users');
                    setRecipientName('All Verified Travelers');
                  }
                }}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="INDIVIDUAL">Individual Traveler (Email / Phone / UID)</option>
                <option value="TRIP">All Travelers in a Specific Trip Circuit</option>
                <option value="BOOKING">Booking Reference Travelers</option>
                <option value="ALL_USERS">Broadcast: All Active Registered Voyagers</option>
              </select>
            </div>

            {/* TEMPLATE PICKER */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase block mb-1.5">
                Pre-defined Template (Optional)
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">-- Custom Message (Blank) --</option>
                {templates.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    [{tmpl.channel}] {tmpl.name}
                  </option>
                ))}
              </select>
            </div>

            {/* RECIPIENT INPUTS */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase block mb-1">
                  Recipient Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={recipientIdentifier}
                  onChange={(e) => setRecipientIdentifier(e.target.value)}
                  placeholder="e.g. traveler@gmail.com or +91 96242 82521"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase block mb-1">
                  Traveler Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Kaushal Pandya"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* SUBJECT */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase block mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Message Subject..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* BODY */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase block mb-1">
                Message Body *
              </label>
              <textarea
                rows={4}
                required
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Compose your message or use a template above..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? 'Dispatching...' : `Dispatch via ${channel}`}
            </button>
          </form>
        </div>

        {/* LOG HISTORY (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Live Dispatch Log ({history.length})
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Real-time Telemetry</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                        item.channel === 'WHATSAPP'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : item.channel === 'EMAIL'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                      }`}
                    >
                      {item.channel}
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.recipientName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ({item.recipientIdentifier})
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {item.status}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {item.subject}
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  {item.messageBody}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                  <span>Logged: {new Date(item.dispatchedAt).toLocaleString('en-IN')}</span>
                  <span>Dispatched by: {item.adminEmail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
