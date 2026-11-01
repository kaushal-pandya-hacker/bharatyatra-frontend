'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Inbox, Headphones, X, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import {
  initAudioUnlocker,
  playNotificationSound,
  testNotificationSound,
  isSoundAlertsEnabled,
  setSoundAlertsEnabled,
} from '@/lib/utils/sound';

interface AdminAlertItem {
  id: string;
  type: string;
  title: string;
  reference: string;
  category: string;
  message: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
  href: string;
}

interface AdminNotificationProps {
  onCountsUpdate?: (counts: { newEnquiries: number; openTickets: number }) => void;
}

export function AdminNotificationDropdown({ onCountsUpdate }: AdminNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<AdminAlertItem[]>([]);
  const [newEnquiriesCount, setNewEnquiriesCount] = useState(0);
  const [openTicketsCount, setOpenTicketsCount] = useState(0);
  const [toastAlert, setToastAlert] = useState<AdminAlertItem | null>(null);
  const [soundActive, setSoundActive] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(-1);

  useEffect(() => {
    initAudioUnlocker();
    setSoundActive(isSoundAlertsEnabled());
  }, []);

  const toggleSound = () => {
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

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        const newCount = json.newEnquiriesCount || 0;
        const openCount = json.openTicketsCount || 0;
        const total = newCount + openCount;

        setNewEnquiriesCount(newCount);
        setOpenTicketsCount(openCount);
        setAlerts(json.alerts || []);

        if (onCountsUpdate) {
          onCountsUpdate({ newEnquiries: newCount, openTickets: openCount });
        }

        // Live notification detection when admin has page open
        if (prevCountRef.current !== -1 && total > prevCountRef.current && json.alerts?.[0]) {
          playNotificationSound('notification');
          setToastAlert(json.alerts[0]);
        }
        prevCountRef.current = total;
      }
    } catch {
      // Fail gracefully
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000); // 15s polling for incoming enquiries
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalAlerts = newEnquiriesCount + openTicketsCount;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toast Popup on incoming enquiry */}
      {toastAlert && (
        <div className="fixed top-20 right-6 z-50 bg-[#102B4E] text-white p-4 rounded-2xl shadow-2xl border border-amber-400/40 max-w-sm animate-in slide-in-from-top-3 duration-200 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>New Customer Enquiry</span>
            </div>
            <button
              onClick={() => setToastAlert(null)}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <p className="text-xs font-bold text-white">{toastAlert.title}</p>
            <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{toastAlert.message}</p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/admin/enquiries"
              onClick={() => setToastAlert(null)}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
            >
              <span>Open Enquiries Desk</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <button
              onClick={() => setToastAlert(null)}
              className="px-2.5 py-1 text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchAlerts();
        }}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center"
        aria-label="Admin Alerts & Enquiries"
      >
        <Bell className="w-5 h-5" />
        {totalAlerts > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950 shadow-xs animate-pulse">
            {totalAlerts > 9 ? '9+' : totalAlerts}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Incoming Client Inquiries</h3>
              {newEnquiriesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  {newEnquiriesCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTestSound}
                className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                title="Click to test audible sound chime"
              >
                <Volume2 className="w-3 h-3 text-amber-700" />
                <span>Test Chime</span>
              </button>
              <button
                type="button"
                onClick={toggleSound}
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition cursor-pointer"
                title={soundActive ? 'Mute sound alerts' : 'Enable sound alerts'}
              >
                {soundActive ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                )}
              </button>
              <Link
                href="/admin/enquiries"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-bold text-blue-700 hover:underline ml-1"
              >
                Open Desk
              </Link>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <Inbox className="w-7 h-7 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">No pending customer enquiries</p>
                <p className="text-[11px] text-slate-400">New submissions will appear here instantly.</p>
              </div>
            ) : (
              alerts.map((a) => (
                <Link
                  key={a.id}
                  href="/admin/enquiries"
                  onClick={() => setIsOpen(false)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors block ${
                    a.status === 'NEW' ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 truncate">{a.title}</span>
                    {a.status === 'NEW' && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase">
                        New
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    #{a.reference} • {a.category}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-snug font-normal">
                    {a.message}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="p-2.5 text-center bg-slate-50 border-t border-slate-100 flex items-center justify-around text-xs font-bold">
            <Link
              href="/admin/enquiries"
              onClick={() => setIsOpen(false)}
              className="text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Enquiries ({newEnquiriesCount})</span>
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              href="/admin/support"
              onClick={() => setIsOpen(false)}
              className="text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Support Desk ({openTicketsCount})</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

