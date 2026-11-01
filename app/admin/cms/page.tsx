'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Bell,
  Save,
  Compass,
  Package,
} from 'lucide-react';

export default function AdminCmsPage() {
  const [cms, setCms] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeEnabled, setNoticeEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    fetchCms();
  }, []);

  const fetchCms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/cms', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setCms(json.data);
          if (json.data.noticeBar) {
            setNoticeMessage(json.data.noticeBar.message || '');
            setNoticeEnabled(json.data.noticeBar.isEnabled ?? true);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load CMS content:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/cms', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          noticeBar: {
            message: noticeMessage,
            isEnabled: noticeEnabled,
            type: 'PROMO',
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
      }
    } catch (e: any) {
      alert(e.message || 'Error updating CMS notice.');
    } finally {
      setSaving(false);
    }
  };

  const banners = cms?.banners || [];
  const featuredDest = cms?.featuredDestinations || [];
  const featuredPkg = cms?.featuredPackages || [];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Content Architecture</span>
            <span>•</span>
            <span>Public Website CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
            Website Content &amp; Announcement Banners
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage homepage showcase carousels, festival promotional notice bars, and featured travel destinations.
          </p>
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
          ✓ Public announcement bar updated successfully. Changes are live on customer landing views.
        </div>
      )}

      {/* Notice Bar Editor Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600" />
            <span>Public Site Notice Bar Announcement</span>
          </h2>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Top of Page Banner
          </span>
        </div>

        <form onSubmit={handleSaveNotice} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Notice Message Text</label>
            <input
              type="text"
              required
              value={noticeMessage}
              onChange={(e) => setNoticeMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={noticeEnabled}
                onChange={(e) => setNoticeEnabled(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded"
              />
              <span>Notice Bar Active &amp; Displaying to Travelers</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing...' : 'Publish to Website'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Hero Showcase Banners */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Homepage Hero Banners
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b: any) => (
            <div
              key={b.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div className="h-44 bg-slate-100 relative">
                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-bold shadow-xs">
                  Position #{b.position}
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-slate-900 text-base">{b.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{b.subtitle}</p>
                <div className="pt-2 text-xs font-bold text-amber-600">
                  CTA Action: {b.ctaText} → ({b.ctaLink})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

