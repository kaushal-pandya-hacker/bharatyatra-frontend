'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Power,
  Eye,
  Sliders,
  Send,
  Bell,
  Globe,
  Tag,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { DiwaliCampaignConfig } from '@/lib/campaigns/diwali-campaign-store';

export default function AdminDiwaliCampaignPage() {
  const [config, setConfig] = useState<DiwaliCampaignConfig | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toggling, setToggling] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [dispatchingNotif, setDispatchingNotif] = useState<boolean>(false);

  const fetchCampaign = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/campaigns/diwali', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setConfig(json.data);
          setIsActive(Boolean(json.data.isActive));
        }
      }
    } catch (e) {
      console.error('Failed to load Diwali campaign:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, []);

  const handleToggle = async () => {
    if (!config) return;
    setToggling(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem('admin_token');
      const targetState = !config.isEnabled;
      const res = await fetch('/api/v1/admin/campaigns/diwali/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isEnabled: targetState }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setConfig((prev) => (prev ? { ...prev, isEnabled: targetState } : null));
        setIsActive(Boolean(json.data.isActive));
        setFeedback(
          targetState
            ? 'Diwali campaign successfully activated on the website.'
            : 'Diwali campaign disabled. Normal BharatYatra theme restored.'
        );
      } else {
        alert(json.message || 'Error updating campaign state.');
      }
    } catch {
      alert('Unable to connect to server.');
    } finally {
      setToggling(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setFeedback(null);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/campaigns/diwali', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setConfig(json.data);
        setIsActive(Boolean(json.data.isActive));
        setFeedback('All Diwali campaign settings saved successfully.');
      } else {
        alert(json.message || 'Error saving changes.');
      }
    } catch {
      alert('Failed to connect to server.');
    } finally {
      setSaving(false);
    }
  };

  const handleDispatchAnnouncement = async () => {
    if (
      !confirm(
        'Dispatch Diwali festive travel announcement to all travelers in the Notification Center?'
      )
    ) {
      return;
    }

    setDispatchingNotif(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: '✨ Celebrate Diwali With BharatYatra!',
          message:
            'Discover incredible India with verified stays, festive travel offers, and personalized AI itineraries.',
          category: 'trips',
          deepLink: '/#diwali-offers',
        }),
      });

      if (res.ok) {
        alert('Diwali campaign broadcast dispatched to traveler notification centers.');
      } else {
        alert('Broadcast failed. Please check network logs.');
      }
    } catch {
      alert('Error triggering broadcast.');
    } finally {
      setDispatchingNotif(false);
    }
  };

  const handleResetPopupPreview = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('by_diwali_greeted_2026');
      alert('Greeting popup status reset for this browser! Visit the homepage to see the popup again.');
    }
  };

  if (loading || !config) {
    return (
      <div className="p-12 text-center text-xs font-semibold text-slate-500 max-w-7xl">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mx-auto mb-2" />
        <span>Loading Diwali Campaign Management Engine...</span>
      </div>
    );
  }

  const startDateObj = new Date(config.startDate);
  const endDateObj = new Date(config.endDate);
  const now = new Date();
  const isDateExpired = now > endDateObj;
  const isFuture = now < startDateObj;

  return (
    <div className="space-y-6 max-w-7xl font-sans text-slate-800 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Festival Campaign Desk</span>
            <span>•</span>
            <span>Diwali Special 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Diwali Campaign Management</span>
            <span className="text-xl">🪔</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Control the Diwali festive theme, hero copy, promotional offer categories, and visitor greetings.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Preview Website</span>
          </Link>

          <button
            onClick={fetchCampaign}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
            title="Refresh Config"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Master Toggle Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          isActive
            ? 'bg-gradient-to-r from-[#102A56] via-[#1769AA] to-[#102A56] text-white border-[#F5BD4F]/40'
            : 'bg-white text-slate-800 border-slate-200'
        }`}
      >
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isActive ? 'bg-[#F5BD4F] animate-pulse' : 'bg-slate-300'
              }`}
            />
            <span
              className={`text-[11px] font-black uppercase tracking-wider ${
                isActive ? 'text-[#F5BD4F]' : 'text-slate-500'
              }`}
            >
              {isActive
                ? 'DIWALI FESTIVE CAMPAIGN IS CURRENTLY ACTIVE ON PRODUCTION'
                : 'NORMAL BHARATYATRA THEME IS ACTIVE'}
            </span>
          </div>

          <h2 className={`text-xl sm:text-2xl font-black font-serif ${isActive ? 'text-white' : 'text-slate-900'}`}>
            {isActive
              ? 'Diwali Experience Live on https://bharatyatra.in'
              : 'Diwali Festive Experience is Paused'}
          </h2>

          <p className={`text-xs ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
            {isDateExpired
              ? 'Campaign schedule has ended. The normal BharatYatra theme is automatically preserved.'
              : isFuture
              ? `Campaign is scheduled to automatically go live on ${startDateObj.toLocaleDateString()}.`
              : `Active window: ${startDateObj.toLocaleDateString()} to ${endDateObj.toLocaleDateString()}.`}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling}
            className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-md cursor-pointer ${
              config.isEnabled
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-[#F5BD4F] hover:bg-[#ffc857] text-[#102A56]'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>
              {toggling
                ? 'Updating...'
                : config.isEnabled
                ? 'Disable Festive Theme'
                : 'Enable Festive Theme'}
            </span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* SECTION 1: CAMPAIGN DATES & SCHEDULING */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-extrabold text-slate-900">Campaign Schedule &amp; Expiration</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Campaign Name
              </label>
              <input
                type="text"
                value={config.campaignName}
                onChange={(e) => setConfig({ ...config, campaignName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#102A56]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Start Date (ISO / YYYY-MM-DD)
              </label>
              <input
                type="text"
                value={config.startDate.substring(0, 10)}
                onChange={(e) =>
                  setConfig({ ...config, startDate: `${e.target.value}T00:00:00.000Z` })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#102A56]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                End Date (Auto-Restores Normal Theme After)
              </label>
              <input
                type="text"
                value={config.endDate.substring(0, 10)}
                onChange={(e) =>
                  setConfig({ ...config, endDate: `${e.target.value}T23:59:59.000Z` })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#102A56]"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            * Once the end date passes, BharatYatra will automatically restore the standard website theme without requiring manual developer deployment.
          </p>
        </div>

        {/* SECTION 2: HOMEPAGE HERO DECK COPY */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-extrabold text-slate-900">Homepage Hero Deck Content</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Hero Campaign Badge
              </label>
              <input
                type="text"
                value={config.hero.badge}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, badge: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#102A56]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Offer Headline Ribbon
              </label>
              <input
                type="text"
                value={config.hero.offerHeadline}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, offerHeadline: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#102A56]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Main Hero Heading
            </label>
            <input
              type="text"
              value={config.hero.heading}
              onChange={(e) =>
                setConfig({
                  ...config,
                  hero: { ...config.hero, heading: e.target.value },
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#102A56]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Festive Tagline / Sub-Headline
            </label>
            <input
              type="text"
              value={config.hero.tagline}
              onChange={(e) =>
                setConfig({
                  ...config,
                  hero: { ...config.hero, tagline: e.target.value },
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#102A56]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Supporting Editorial Description
            </label>
            <textarea
              rows={2}
              value={config.hero.description}
              onChange={(e) =>
                setConfig({
                  ...config,
                  hero: { ...config.hero, description: e.target.value },
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#102A56]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Primary CTA Button Label
              </label>
              <input
                type="text"
                value={config.hero.primaryCta}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, primaryCta: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#102A56]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Secondary CTA Button Label
              </label>
              <input
                type="text"
                value={config.hero.secondaryCta}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, secondaryCta: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#102A56]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: TOP BANNER & POPUP GREETING */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Announcement Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Header Announcement Banner</h3>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={config.banner.isEnabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      banner: { ...config.banner, isEnabled: e.target.checked },
                    })
                  }
                  className="rounded text-[#102A56]"
                />
                <span>Enable Banner</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Banner Message Text
              </label>
              <input
                type="text"
                value={config.banner.text}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    banner: { ...config.banner, text: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#102A56]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={config.banner.actionText}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      banner: { ...config.banner, actionText: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  CTA Link
                </label>
                <input
                  type="text"
                  value={config.banner.actionHref}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      banner: { ...config.banner, actionHref: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Visitor Greeting Popup */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Once-Per-Visitor Greeting Popup</h3>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                <input
                  type="checkbox"
                  checked={config.popup.isEnabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      popup: { ...config.popup, isEnabled: e.target.checked },
                    })
                  }
                  className="rounded text-[#102A56]"
                />
                <span>Enable Popup</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Popup Title
              </label>
              <input
                type="text"
                value={config.popup.title}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    popup: { ...config.popup, title: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Popup Message
              </label>
              <textarea
                rows={2}
                value={config.popup.message}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    popup: { ...config.popup, message: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetPopupPreview}
                className="text-xs text-amber-700 hover:text-amber-900 font-bold underline"
              >
                Reset Visitor View in this Browser
              </button>
              <span className="text-[11px] text-slate-400">
                Shown only once per device.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: NOTIFICATION BROADCAST DISPATCH TOOL */}
        <div className="bg-[#FFF9EF] p-6 sm:p-8 rounded-3xl border border-[#F5BD4F]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-700" />
              <h3 className="text-base font-extrabold text-slate-900">
                Broadcast Diwali Notification to Travelers
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Dispatches the Diwali travel promotion announcement to active traveler notification inboxes and Web Push subscriptions.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDispatchAnnouncement}
            disabled={dispatchingNotif}
            className="px-5 py-3 rounded-xl bg-[#102A56] hover:bg-[#1769AA] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#F5BD4F]" />
            <span>{dispatchingNotif ? 'Broadcasting...' : 'Broadcast Notification'}</span>
          </button>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-xs text-slate-500">
            Last Updated: {new Date(config.updatedAt).toLocaleString()}
          </span>

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-[#102A56] hover:bg-blue-950 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#F5BD4F]" />
            <span>{saving ? 'Saving Changes...' : 'Save Campaign Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}

