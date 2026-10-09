'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface NotificationItemData {
  id: string;
  category: string; // space separated categories e.g. 'transit trips'
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'action' | 'ai' | 'booking' | 'payment' | 'experience' | 'transit' | 'trip';
  group: 'today' | 'yesterday' | 'earlier';
}

const INITIAL_NOTIFICATIONS: NotificationItemData[] = [
  {
    id: 'n1',
    category: 'transit trips',
    title: 'Verify passenger identity for Somnath Express Coach B2',
    description: 'IRCTC charter protocol requires DigiLocker Aadhaar verification for traveler Kaushal Patel before 18:00 IST to lock Lower Berth privilege and complimentary vegetarian meal cart sync.',
    time: 'Today · 28 mins ago',
    read: false,
    type: 'action',
    group: 'today',
  },
  {
    id: 'n2',
    category: 'ai trips',
    title: 'Itinerary auto-optimized for Dhordo heat index',
    description: 'Farva AI shifted your Nirona Rogan Art Guild masterclass to 16:30 IST to avoid peak afternoon White Rann glare. Havelis and artisan ateliers notified with zero rebooking tariff.',
    time: 'Today · 2 hours ago',
    read: false,
    type: 'ai',
    group: 'today',
  },
  {
    id: 'n3',
    category: 'bookings',
    title: 'Nawab Darbargadh Haveli booking confirmed',
    description: '2 Nights in Royal Darbar Suite (Junagadh) verified with authentic welcome royal sherbet protocol. Government vault voucher #HAV-JUN-44109 archived.',
    time: 'Today · 5 hours ago',
    read: false,
    type: 'booking',
    group: 'today',
  },
  {
    id: 'n4',
    category: 'payments',
    title: 'Payment of ₹38,650 reconciled via HDFC UPI',
    description: 'Transaction TXN-FARVA-99482103 confirmed. Official Gujarat GST Tax Invoice (24AAACC1206K1ZV) signed by sovereign comptroller.',
    time: 'Yesterday · 16:42 IST',
    read: true,
    type: 'payment',
    group: 'yesterday',
  },
  {
    id: 'n5',
    category: 'bookings',
    title: 'Master Rogan Art Fabric Guild pass issued',
    description: 'Nirona Village private atelier session with Khatri master family locked for 3 travelers. Castor seed oil natural pigments kit included.',
    time: 'Yesterday · 11:20 IST',
    read: true,
    type: 'experience',
    group: 'yesterday',
  },
  {
    id: 'n6',
    category: 'ai',
    title: 'Authentic Kathiyawadi Baithak table suggestion',
    description: 'Rajwadi Royal Thali in Gondal fits naturally along your transit corridor between Junagadh haveli check-out and Sasan Gir arrival.',
    time: 'Yesterday · 09:15 IST',
    read: true,
    type: 'ai',
    group: 'yesterday',
  },
  {
    id: 'n7',
    category: 'transit',
    title: 'Alliance Subcontinental AI-894 departure shifted by 15 mins',
    description: 'Ahmedabad (AMD) → Bhuj (BHJ) now departs at 08:00 IST (Terminal 2). Chauffeur airport drop schedule has been automatically recalibrated.',
    time: '14 Sep · 14:10 IST',
    read: true,
    type: 'transit',
    group: 'earlier',
  },
  {
    id: 'n8',
    category: 'trips',
    title: 'Kutch & Saurashtra 6-Day Vector vaulted',
    description: 'Autonomous engine verified Somnath temple evening aarti windows, Gir lion sanctuary core safari slots, and road elevation data.',
    time: '13 Sep · 18:30 IST',
    read: true,
    type: 'trip',
    group: 'earlier',
  },
];

export default function NotificationsPage() {
  const [prototypeState, setPrototypeState] = useState<'all' | 'action' | 'delay' | 'empty'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [notifications, setNotifications] = useState<NotificationItemData[]>(INITIAL_NOTIFICATIONS);
  const [preferencesOpen, setPreferencesOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3400);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    showToast('Notification marked as read');
  };

  const dismissItem = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    showToast('Alert dismissed');
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    showToast('All updates acknowledged in state dossier');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((item) => {
    if (prototypeState === 'empty') return false;
    if (prototypeState === 'action' && item.type !== 'action') return false;
    if (categoryFilter !== 'all' && !item.category.includes(categoryFilter)) return false;
    return true;
  });

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-on-secondary-fixed text-surface-container-lowest px-5 py-3.5 rounded-xl shadow-2xl transition-all duration-300">
          <span className="material-symbols-outlined text-primary-container">check_circle</span>
          <span className="font-label-lg text-label-lg">{toastMessage}</span>
        </div>
      )}

      <main className="w-full pt-4 bg-surface">
        <div className="flex flex-col w-full">
          {/* Interactive Prototype State Controller Bar */}
          <aside aria-label="Interactive Prototype Controller" className="w-full bg-on-secondary-fixed text-surface-container-lowest px-gutter py-2.5 shadow-md">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-space-sm text-label-caps">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
                <span className="font-title-md text-primary-container uppercase tracking-wider text-label-caps font-bold">Prototype State Sandbox</span>
                <span className="text-surface-variant/60 hidden md:inline">| Telemetry Synchronizer</span>
              </div>
              <div className="flex items-center flex-wrap gap-1.5">
                <button
                  className={`px-3 py-1 rounded-lg transition-all ${
                    prototypeState === 'all'
                      ? 'bg-primary-container text-on-secondary-fixed font-semibold shadow-sm'
                      : 'bg-surface-variant/20 text-surface-container-lowest hover:bg-surface-variant/40'
                  }`}
                  onClick={() => { setPrototypeState('all'); showToast('Showing all notifications'); }}
                  type="button"
                >
                  All ({notifications.length} Updates)
                </button>
                <button
                  className={`px-3 py-1 rounded-lg transition-all ${
                    prototypeState === 'action'
                      ? 'bg-primary-container text-on-secondary-fixed font-semibold shadow-sm'
                      : 'bg-surface-variant/20 text-surface-container-lowest hover:bg-surface-variant/40'
                  }`}
                  onClick={() => { setPrototypeState('action'); showToast('Filtered to action-required alerts'); }}
                  type="button"
                >
                  Action Required (1)
                </button>
                <button
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    prototypeState === 'delay'
                      ? 'bg-primary-container text-on-secondary-fixed font-semibold shadow-sm'
                      : 'bg-surface-variant/20 text-surface-container-lowest hover:bg-surface-variant/40'
                  }`}
                  onClick={() => { setPrototypeState('delay'); showToast('Real-time GSRTC Volvo delay injected'); }}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px] text-primary-container">sync_problem</span> Simulate GSRTC Delay
                </button>
                <button
                  className={`px-3 py-1 rounded-lg transition-all ${
                    prototypeState === 'empty'
                      ? 'bg-primary-container text-on-secondary-fixed font-semibold shadow-sm'
                      : 'bg-surface-variant/20 text-surface-container-lowest hover:bg-surface-variant/40'
                  }`}
                  onClick={() => { setPrototypeState('empty'); showToast('Empty state telemetry displayed'); }}
                  type="button"
                >
                  Empty State
                </button>
                <button className="px-3 py-1 rounded-lg bg-surface-variant/20 text-surface-container-lowest hover:bg-surface-variant/40 transition-all flex items-center gap-1" onClick={() => setPreferencesOpen(true)} type="button">
                  <span className="material-symbols-outlined text-[14px]">tune</span> Settings Drawer
                </button>
              </div>
            </div>
          </aside>

          {/* Main Container Grid */}
          <div className="max-w-7xl mx-auto px-gutter py-space-lg w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* LEFT COLUMN: MAIN FEED (col-span-8) */}
              <main className="lg:col-span-8 flex flex-col gap-space-md w-full">
                {/* Header Bar with Quick Utilities */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container-lowest p-space-md rounded-2xl shadow-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">Notifications &amp; Travel Alerts</h1>
                      <span className={`px-2 py-0.5 rounded-full font-title-md text-label-md font-bold shadow-sm ${
                        unreadCount > 0 ? 'bg-primary-container text-on-secondary-fixed' : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {unreadCount > 0 ? `${unreadCount} New` : 'All Read'}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Important updates regarding your active circuits, ground permits, and adaptive telemetry.</p>
                  </div>
                  <div className="flex items-center gap-space-xs shrink-0 self-start sm:self-auto">
                    <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-all shadow-sm" onClick={markAllAsRead} type="button">
                      <span className="material-symbols-outlined text-[18px]">done_all</span>
                      <span>Mark all as read</span>
                    </button>
                    <button aria-label="Alert Channel Preferences" className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all shadow-sm" onClick={() => setPreferencesOpen(true)} type="button">
                      <span className="material-symbols-outlined text-[20px]">tune</span>
                    </button>
                  </div>
                </header>

                {/* Category Filters */}
                <nav aria-label="Notification Categories" className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: 'All', count: notifications.length },
                    { id: 'trips', label: 'Trips', count: notifications.filter((n) => n.category.includes('trips')).length },
                    { id: 'bookings', label: 'Bookings', count: notifications.filter((n) => n.category.includes('bookings')).length },
                    { id: 'transit', label: 'Transit & Alerts', count: notifications.filter((n) => n.category.includes('transit')).length },
                    { id: 'payments', label: 'Payments', count: notifications.filter((n) => n.category.includes('payments')).length },
                    { id: 'ai', label: 'Farva AI', count: notifications.filter((n) => n.category.includes('ai')).length },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      className={`px-4 py-2 rounded-full font-label-md text-label-md flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm ${
                        categoryFilter === cat.id
                          ? 'bg-on-secondary-fixed text-primary-container shadow-md'
                          : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
                      }`}
                      onClick={() => setCategoryFilter(cat.id)}
                      type="button"
                    >
                      <span>{cat.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        categoryFilter === cat.id ? 'bg-primary-container text-on-secondary-fixed' : 'bg-surface-container-high text-on-surface'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </nav>

                {/* DYNAMIC GSRTC DELAY ALERT (Triggered by 'delay' state) */}
                {prototypeState === 'delay' && (
                  <section className="relative overflow-hidden rounded-2xl bg-error-container/40 p-space-md shadow-md animate-fade-in">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-error text-on-error flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">departure_board</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-label-caps text-label-caps uppercase tracking-wider text-error font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-error animate-ping"></span> GSRTC REAL-TIME DELAY TELEMETRY
                          </span>
                          <span className="font-label-caps text-label-caps text-error">Updated Just Now</span>
                        </div>
                        <h2 className="font-title-lg text-title-lg text-on-surface mt-1">Volvo Multi-Axle #GJ-18-Z-9022 Delayed by 35 Mins</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Due to heavy freight customs inspection past Sanand Toll Plaza, pickup at Ahmedabad ISKCON Cross Roads is re-scheduled to 22:45 IST. Farva AI has auto-notified your Bhuj royal haveli check-in concierge.</p>
                        <div className="flex flex-wrap items-center gap-space-sm mt-space-sm">
                          <button className="px-3.5 py-1.5 rounded-lg bg-on-secondary-fixed text-primary-container font-label-lg text-label-lg shadow-sm" onClick={() => showToast('Delay buffer acknowledged')} type="button">Acknowledge Buffer</button>
                          <button className="px-3.5 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm" onClick={() => showToast('Opening GPS live tracker...')} type="button">Live GPS Tracker</button>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* HIGH-PRIORITY EXPEDITION BANNER */}
                {prototypeState !== 'empty' && (
                  <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-fixed/50 via-primary-container/20 to-surface-container-lowest p-space-md shadow-md transition-all">
                    <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-primary-container/30 blur-2xl pointer-events-none"></div>
                    <div className="flex items-start gap-space-md relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-on-secondary-fixed text-primary-container flex items-center justify-center shrink-0 shadow-lg">
                        <span className="material-symbols-outlined text-[28px] animate-pulse">compass_calibration</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-label-caps text-label-caps tracking-wider uppercase font-bold text-on-surface-variant flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                            Upcoming Expedition Segment · Kutch Rann &amp; Saurashtra Circuit
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-on-secondary-fixed text-primary-container text-label-caps font-bold">14h Remaining</span>
                        </div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1">GSRTC Multi-Axle Volvo Departure in 14 Hours</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-1.5">
                          Ahmedabad ISKCON Cross Roads → Bhuj Bus Port (Berths L14, L15, L16). Boarding gate protocol opens at 22:10 IST. DigiLocker state boarding passes have been vaulted and pre-cleared.
                        </p>
                        <div className="flex flex-wrap items-center gap-space-sm mt-space-md">
                          <Link className="px-4 py-2 rounded-xl bg-on-secondary-fixed text-primary-container font-label-lg text-label-lg hover:bg-surface-tint hover:text-surface-container-lowest transition-all shadow-md flex items-center gap-1.5" href="/my-trips">
                            <span>View Trip Itinerary</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </Link>
                          <button className="px-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg hover:bg-surface-container transition-all shadow-sm flex items-center gap-1.5" onClick={() => showToast('Boarding gate ISKCON Platform #3 confirmed. Telemetry live.')} type="button">
                            <span className="material-symbols-outlined text-[16px]">sensors</span>
                            <span>Boarding &amp; Gate Telemetry</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* FEED LIST */}
                {filteredNotifications.length > 0 ? (
                  ['today', 'yesterday', 'earlier'].map((groupKey) => {
                    const groupItems = filteredNotifications.filter((n) => n.group === groupKey);
                    if (groupItems.length === 0) return null;
                    return (
                      <section key={groupKey} className="flex flex-col gap-3">
                        <div className="flex items-center justify-between px-1 pt-2">
                          <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant font-bold">
                            {groupKey === 'today' ? 'Today' : groupKey === 'yesterday' ? 'Yesterday' : 'Earlier This Week'}
                          </span>
                          <span className="font-label-caps text-label-caps text-on-surface-variant">{groupItems.length} Updates</span>
                        </div>
                        {groupItems.map((item) => (
                          <article
                            key={item.id}
                            className={`relative bg-surface-container-lowest rounded-2xl p-space-md shadow-sm transition-all hover:shadow-md ${
                              item.type === 'action'
                                ? 'bg-gradient-to-r from-amber-500/10 via-surface-container-lowest to-surface-container-lowest'
                                : ''
                            }`}
                          >
                            <div className="flex items-start gap-3.5">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                item.type === 'action'
                                  ? 'bg-amber-500/20 text-amber-700'
                                  : item.type === 'ai'
                                  ? 'bg-on-secondary-fixed text-primary-container shadow-sm'
                                  : 'bg-surface-container-high text-on-surface'
                              }`}>
                                <span className="material-symbols-outlined text-[22px]">
                                  {item.type === 'action' ? 'assignment_late' : item.type === 'ai' ? 'auto_awesome' : item.type === 'booking' ? 'domain_verification' : item.type === 'payment' ? 'receipt_long' : item.type === 'experience' ? 'confirmation_number' : item.type === 'transit' ? 'flight' : 'map'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full font-label-caps text-label-caps font-bold ${
                                      item.type === 'action'
                                        ? 'bg-amber-500 text-surface-container-lowest'
                                        : item.type === 'ai'
                                        ? 'bg-on-secondary-fixed text-primary-container'
                                        : 'bg-surface-container text-on-surface'
                                    }`}>
                                      {item.type === 'action' ? 'ACTION REQUIRED' : item.type === 'ai' ? 'FARVA AI' : item.type.toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-body-sm text-body-sm text-on-surface-variant">{item.time}</span>
                                    {!item.read && <span className="w-2 h-2 rounded-full bg-primary-container shadow-sm"></span>}
                                  </div>
                                </div>
                                <h3 className="font-title-lg text-title-lg text-on-surface mt-1.5">{item.title}</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{item.description}</p>
                                <div className="flex flex-wrap items-center gap-space-sm mt-space-sm">
                                  {item.type === 'action' && (
                                    <button className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-surface-container-lowest font-label-lg text-label-lg transition-all shadow-sm flex items-center gap-1.5" onClick={() => showToast('Aadhaar DigiLocker Gateway Opened.')} type="button">
                                      <span>Complete Verification</span>
                                      <span className="material-symbols-outlined text-[16px]">verified_user</span>
                                    </button>
                                  )}
                                  {item.type === 'ai' && (
                                    <button className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-all flex items-center gap-1.5 shadow-sm" onClick={() => showToast('Reviewing dynamic itinerary timeline.')} type="button">
                                      <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                                      <span>Review Re-sequenced Schedule</span>
                                    </button>
                                  )}
                                  {item.type === 'payment' && (
                                    <button className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-all flex items-center gap-1.5 shadow-sm" onClick={() => showToast('Downloading Tax Invoice 24AAACC1206K1ZV.pdf')} type="button">
                                      <span className="material-symbols-outlined text-[16px]">download</span>
                                      <span>Download GST Invoice (PDF)</span>
                                    </button>
                                  )}
                                  {!item.read && (
                                    <button className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface ml-1" onClick={() => markAsRead(item.id)} type="button">
                                      Mark Read
                                    </button>
                                  )}
                                  <button className="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all ml-auto" onClick={() => dismissItem(item.id)} type="button">
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                      </section>
                    );
                  })
                ) : (
                  /* EMPTY STATE DISPLAY */
                  <section className="flex flex-col items-center justify-center text-center p-space-xl bg-surface-container-lowest rounded-2xl shadow-sm my-4">
                    <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mb-space-md shadow-inner">
                      <span className="material-symbols-outlined text-[44px] text-primary-container">spa</span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">You&apos;re All Caught Up</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-2">
                      Your travel telemetry is calm and all ground segments are securely synchronized. No pending alerts for your active expeditions.
                    </p>
                    <div className="mt-space-lg flex items-center gap-space-sm">
                      <Link className="px-5 py-2.5 rounded-xl bg-on-secondary-fixed text-primary-container font-label-lg text-label-lg hover:shadow-lg transition-all" href="/circuits">
                        Explore Gujarat Circuits
                      </Link>
                      <button className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg" onClick={() => setPrototypeState('all')} type="button">
                        Reset Feed
                      </button>
                    </div>
                  </section>
                )}
              </main>

              {/* RIGHT COLUMN: SIDEBAR (col-span-4) */}
              <aside aria-label="Expedition &amp; Assistant Details" className="lg:col-span-4 flex flex-col gap-space-md w-full sticky top-24">
                {/* 1. ACTIVE EXPEDITION SUMMARY CARD */}
                <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="relative h-44 w-full">
                    <img alt="Dhordo Royal Luxury Tent City" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VWiNPA-w2t1NQyfCn1h4szzX-NTPhydNqzwjbVXvd0r2cyv9cSBUBmNwfCaP_Q-HsX9T_34zUHzblYAF14ziVyzFO9zI4-laLaYl9lYG80Ibe1P_eci89u7CAYJQVjejr00a7U-pb1owHh3K-Vh5fAva8sW6TdDucgZumBPR6UtdE9JqEZmJAa_PoKS7D0Po3yWBkZwsCvICoe1LJmyyJ5CWh2MXSEJyYMjXmWZRbgL1C_cKkmWqy2csHI" />
                    <div className="absolute inset-0 bg-gradient-to-t from-on-secondary-fixed/90 via-on-secondary-fixed/30 to-transparent"></div>
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-on-secondary-fixed/80 backdrop-blur-md text-primary-container text-label-caps font-bold tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                      ACTIVE ITINERARY
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-surface-container-lowest">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider text-primary-container">Royal Gujarat Corridor</span>
                      <h3 className="font-title-lg text-title-lg text-surface-container-lowest leading-snug">Ahmedabad ➔ Bhuj ➔ Sasan Gir ➔ Somnath</h3>
                    </div>
                  </div>
                  <div className="p-space-md flex flex-col gap-3">
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="font-body-sm text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_today</span>
                        18 - 22 Dec 2026 (5D / 4N)
                      </span>
                      <span className="font-body-sm text-on-surface font-medium">3 Travelers</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                      <span className="font-label-md text-label-md text-on-surface">100% Ground Synced · 0 Transit Conflicts</span>
                    </div>
                    <Link className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-center font-label-lg text-label-lg transition-all flex items-center justify-center gap-1" href="/my-trips">
                      <span>Open Live Itinerary</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>

                {/* 2. FARVA AI COGNITIVE RADAR WIDGET */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-on-secondary-fixed text-primary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">radar</span>
                      </div>
                      <div>
                        <h3 className="font-title-md text-title-md text-on-surface">Adaptive Traveler Radar</h3>
                        <span className="font-label-caps text-label-caps text-primary uppercase font-bold">Ground Telemetry Active</span>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                    <span className="font-title-md text-on-surface block mb-1">Gir Safari Observation Window:</span>
                    Sasan Gir morning safari on 21 Dec has pristine visibility (22°C, dry). Morning Gypsy #04 driver credentials will auto-dispatch 3 hours prior to gate opening.
                  </div>
                  <div className="mt-3 pt-3 flex items-center justify-between">
                    <span className="font-body-sm text-body-sm text-on-surface">SMS &amp; WhatsApp Live Relay</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input defaultChecked className="sr-only peer" onChange={() => showToast('Relay channel toggled.')} type="checkbox" />
                      <div className="w-9 h-5 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-on-secondary-fixed"></div>
                    </label>
                  </div>
                </div>

                {/* 3. NOTIFICATION PREFERENCES QUICK PANEL */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-title-md text-title-md text-on-surface">Notification Channels</h3>
                    <button className="font-label-md text-label-md text-primary hover:underline" onClick={() => setPreferencesOpen(true)} type="button">Config</button>
                  </div>
                  <div className="flex flex-col gap-2.5 text-body-sm">
                    <label className="flex items-center justify-between cursor-pointer py-1">
                      <span className="text-on-surface font-body-sm">Critical Transit &amp; Gate Delays</span>
                      <input defaultChecked className="w-4 h-4 rounded text-on-secondary-fixed accent-on-secondary-fixed cursor-pointer" type="checkbox" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer py-1">
                      <span className="text-on-surface font-body-sm">Booking Confirmations &amp; Vouchers</span>
                      <input defaultChecked className="w-4 h-4 rounded text-on-secondary-fixed accent-on-secondary-fixed cursor-pointer" type="checkbox" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer py-1">
                      <span className="text-on-surface font-body-sm">AI Route &amp; Weather Buffer</span>
                      <input defaultChecked className="w-4 h-4 rounded text-on-secondary-fixed accent-on-secondary-fixed cursor-pointer" type="checkbox" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer py-1">
                      <span className="text-on-surface font-body-sm">Payment &amp; GST Tax Receipts</span>
                      <input defaultChecked className="w-4 h-4 rounded text-on-secondary-fixed accent-on-secondary-fixed cursor-pointer" type="checkbox" />
                    </label>
                  </div>
                  <button className="w-full mt-3 py-2 text-center text-label-md font-label-md text-on-surface-variant hover:text-on-surface bg-surface-container rounded-xl transition-all" onClick={() => setPreferencesOpen(true)} type="button">
                    Manage Advanced Protocol Settings
                  </button>
                </div>

                {/* 4. 24/7 SOVEREIGN TRAVEL CONCIERGE */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm">
                  <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant font-bold">24/7 Royal Protocol Desk</span>
                  <div className="flex items-center gap-3 mt-2.5">
                    <div className="w-10 h-10 rounded-full bg-primary-container/40 flex items-center justify-center font-bold text-on-secondary-fixed">
                      VJ
                    </div>
                    <div>
                      <h4 className="font-title-md text-title-md text-on-surface">Officer Virbhadra Jadeja</h4>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Lead Sovereign Concierge</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-space-sm">
                    <a className="px-3 py-2 rounded-xl bg-on-secondary-fixed text-primary-container font-label-md text-label-md text-center flex items-center justify-center gap-1.5 shadow-sm" href="tel:18002031111">
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      <span>1800 203 1111</span>
                    </a>
                    <button className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md text-center flex items-center justify-center gap-1.5 shadow-sm" onClick={() => showToast('Opening Sovereign WhatsApp Relay desk...')} type="button">
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>

          {/* NOTIFICATION SETTINGS MODAL / SLIDE-IN DRAWER */}
          {preferencesOpen && (
            <div className="fixed inset-0 z-50 bg-on-secondary-fixed/60 backdrop-blur-sm flex justify-end">
              <div className="w-full max-w-md bg-surface-container-lowest h-full shadow-2xl p-space-lg flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between pb-space-md">
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface">Alert Protocols</h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Sovereign dispatch preferences for Devraj V.</p>
                    </div>
                    <button aria-label="Close preferences" className="p-2 rounded-full hover:bg-surface-container text-on-surface transition-all" onClick={() => setPreferencesOpen(false)} type="button">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <div className="flex flex-col gap-space-md mt-space-sm">
                    <div className="flex flex-col gap-2">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant font-bold">Dispatch Media</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                          <span className="font-body-sm text-on-surface font-medium">Push Alerts</span>
                          <input defaultChecked className="w-4 h-4 accent-on-secondary-fixed" type="checkbox" />
                        </div>
                        <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                          <span className="font-body-sm text-on-surface font-medium">SMS Relay</span>
                          <input defaultChecked className="w-4 h-4 accent-on-secondary-fixed" type="checkbox" />
                        </div>
                        <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                          <span className="font-body-sm text-on-surface font-medium">WhatsApp</span>
                          <input defaultChecked className="w-4 h-4 accent-on-secondary-fixed" type="checkbox" />
                        </div>
                        <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                          <span className="font-body-sm text-on-surface font-medium">Digest Email</span>
                          <input className="w-4 h-4 accent-on-secondary-fixed" type="checkbox" />
                        </div>
                      </div>
                    </div>

                    <div className="p-space-sm rounded-xl bg-surface-container-low">
                      <div className="flex items-center justify-between">
                        <span className="font-title-md text-title-md text-on-surface">Night Quiet Window</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input defaultChecked className="sr-only peer" type="checkbox" />
                          <div className="w-9 h-5 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-on-secondary-fixed"></div>
                        </label>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Suppress non-emergency culinary &amp; leisure notifications between 23:00 IST and 06:30 IST.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-space-md flex items-center gap-space-sm">
                  <button className="flex-1 py-2.5 rounded-xl bg-on-secondary-fixed text-primary-container font-label-lg text-label-lg shadow-md hover:bg-surface-tint hover:text-surface-container-lowest transition-all" onClick={() => { setPreferencesOpen(false); showToast('Preferences updated in state ledger.'); }} type="button">
                    Save Changes
                  </button>
                  <button className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg hover:bg-surface-container-high transition-all" onClick={() => setPreferencesOpen(false)} type="button">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low mt-space-xl">
        <div className="max-w-7xl mx-auto px-gutter py-space-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-lg pb-space-lg">
            <div className="flex flex-col gap-space-sm md:col-span-1">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface">BharatYatra</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">State Sovereign Travel &amp; Expedition Intelligence. Engineered under official Gujarat multimodal transit governance framework.</p>
            </div>
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider mb-space-xs">Expedition Routes</span>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/destinations">Kutch White Desert Safari</Link>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/destinations">Dwarka &amp; Somnath</Link>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/destinations">Gir National Park</Link>
            </div>
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider mb-space-xs">Transit Network</span>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/buses">GSRTC Premium Sleeper</Link>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/trains">Vande Bharat Express</Link>
            </div>
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider mb-space-xs">Sovereign Credentials</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Gujarat Tourism Protocol Authorization #GJ-SOV-4491-B.</p>
              <div className="mt-space-sm p-space-sm rounded-xl bg-surface-container-lowest">
                <span className="font-label-caps text-label-caps text-on-surface-variant block">24/7 HELPLINE</span>
                <span className="font-label-lg text-label-lg text-on-surface block mt-0.5">1800 203 1111</span>
              </div>
            </div>
          </div>
          <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-sm text-center sm:text-left">
            <p className="font-body-sm text-body-sm text-on-surface-variant">© 2024 BharatYatra Sovereign Voyager. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
