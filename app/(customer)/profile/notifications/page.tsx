'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState({
    emailBookingUpdates: true,
    emailMarketing: false,
    whatsappBookingUpdates: true,
    whatsappMarketing: false,
    inAppBookingUpdates: true,
    tripReminders: true,
    preferredLanguage: 'en',
  });

  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-widest mb-1">
              <span>Account Settings</span>
              <span>•</span>
              <span>Communication & Alerts</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Notification Preferences</h1>
            <p className="text-slate-400 text-sm mt-1">
              Control how BharatYatra delivers booking confirmations, WhatsApp updates, and trip alerts.
            </p>
          </div>
          <Link
            href="/notifications"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition border border-slate-700"
          >
            ← Back to Inbox
          </Link>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-sm flex items-center justify-between">
            <span>✓ Notification preferences updated successfully.</span>
            <span className="text-xs text-emerald-400">Synchronized across channels</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {/* Email Preferences */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <h3 className="text-lg font-bold text-white">Email Communications</h3>
                <p className="text-xs text-slate-400">SMTP, Resend, SendGrid & AWS SES transactional engines</p>
              </div>
            </div>

            <div className="divide-y divide-slate-800/60 pt-2">
              <div className="py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Transactional Booking & Ticket Emails</div>
                  <div className="text-xs text-slate-400">Order confirmations, e-tickets, tax invoices, and vouchers.</div>
                </div>
                <button
                  type="button"
                  onClick={() => toggle('emailBookingUpdates')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.emailBookingUpdates ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.emailBookingUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Marketing & Gujarat Travel Curations</div>
                  <div className="text-xs text-slate-400">Seasonal Rann Utsav packages, festival discounts, and heritage guides.</div>
                </div>
                <button
                  type="button"
                  onClick={() => toggle('emailMarketing')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.emailMarketing ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.emailMarketing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* WhatsApp Preferences */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <h3 className="text-lg font-bold text-white">WhatsApp Direct Business Alerts</h3>
                <p className="text-xs text-slate-400">Meta WhatsApp Cloud API & Twilio with Deep-Link fallback</p>
              </div>
            </div>

            <div className="divide-y divide-slate-800/60 pt-2">
              <div className="py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Instant WhatsApp Pass & Voucher Messages</div>
                  <div className="text-xs text-slate-400">Boarding passes, live bus tracking, and hotel check-in PINs.</div>
                </div>
                <button
                  type="button"
                  onClick={() => toggle('whatsappBookingUpdates')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.whatsappBookingUpdates ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.whatsappBookingUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">WhatsApp Trip Concierge Offers</div>
                  <div className="text-xs text-slate-400">Exclusive artisan masterclass invites and regional dining perks.</div>
                </div>
                <button
                  type="button"
                  onClick={() => toggle('whatsappMarketing')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.whatsappMarketing ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.whatsappMarketing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* In-App & AI Trip Reminders */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <h3 className="text-lg font-bold text-white">In-App & Adaptive AI Trip Reminders</h3>
                <p className="text-xs text-slate-400">Real-time alerts, gate changes, and weather shift notifications</p>
              </div>
            </div>

            <div className="divide-y divide-slate-800/60 pt-2">
              <div className="py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">In-App Notification Center Sync</div>
                  <div className="text-xs text-slate-400">Badge counts, status updates, and interactive action items.</div>
                </div>
                <button
                  type="button"
                  onClick={() => toggle('inAppBookingUpdates')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.inAppBookingUpdates ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.inAppBookingUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Adaptive AI Trip Itinerary Reminders</div>
                  <div className="text-xs text-slate-400">Proactive alerts for heat index shifts, temple aarti times, and safari gates.</div>
                </div>
                <button
                  type="button"
                  onClick={() => toggle('tripReminders')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.tripReminders ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.tripReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
          <Link
            href="/profile"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
