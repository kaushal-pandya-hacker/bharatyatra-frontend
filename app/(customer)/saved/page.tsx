'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, MapPin, Package, Hotel, Sparkles } from 'lucide-react';
import { ProtectedRoute } from '@/lib/auth/protected-route';

export default function UnifiedSavedPage() {
  return (
    <ProtectedRoute>
      <UnifiedSavedContent />
    </ProtectedRoute>
  );
}

function UnifiedSavedContent() {
  const [activeTab, setActiveTab] = useState<'packages' | 'destinations' | 'hotels' | 'activities'>('packages');

  return (
    <div className="min-h-screen bg-[#FCF8FB] text-[#141A32] pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Customer Portal</span>
          <h1 className="text-3xl font-extrabold text-[#0A1128] flex items-center gap-2">
            <Bookmark className="w-8 h-8 text-[#0A1128]" /> Saved Travel Wishlist
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your saved holiday packages, dream destinations, resorts, and activity add-ons.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-2 shadow-sm">
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'packages' ? 'bg-[#0A1128] text-[#FED65B] shadow-md' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" /> Saved Packages
        </button>
        <button
          onClick={() => setActiveTab('destinations')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'destinations' ? 'bg-[#0A1128] text-[#FED65B] shadow-md' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" /> Destinations
        </button>
        <button
          onClick={() => setActiveTab('hotels')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'hotels' ? 'bg-[#0A1128] text-[#FED65B] shadow-md' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Hotel className="w-4 h-4" /> Stays & Hotels
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'activities' ? 'bg-[#0A1128] text-[#FED65B] shadow-md' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Activities
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full uppercase">
              🇮🇳 India
            </span>
            <h3 className="font-bold text-lg text-[#0A1128]">Rann of Kutch White Desert & Rann Utsav</h3>
            <p className="text-xs text-slate-500">4 Days / 3 Nights • Dhordo Tent City Stay</p>
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="font-extrabold text-base text-[#0A1128]">₹14,999</span>
              <Link href="/packages/rann-of-kutch-white-desert-tour" className="px-4 py-2 bg-[#0A1128] text-[#FED65B] text-xs font-bold rounded-xl">
                View Details
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-bold text-[10px] rounded-full uppercase">
              ✈️ International
            </span>
            <h3 className="font-bold text-lg text-[#0A1128]">Bali Tropical Island & Ubud Cultural Escape</h3>
            <p className="text-xs text-slate-500">6 Days / 5 Nights • Rice Terrace Swing & Beach Club</p>
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="font-extrabold text-base text-[#0A1128]">₹39,999</span>
              <Link href="/packages/bali-tropical-paradise-holiday" className="px-4 py-2 bg-[#0A1128] text-[#FED65B] text-xs font-bold rounded-xl">
                View Details
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'destinations' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Goa', 'Udaipur', 'Manali'].map(name => (
            <div key={name} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-[#0A1128]">{name}</h3>
                <span className="text-xs text-slate-500">Popular Holiday Destination</span>
              </div>
              <Link href={`/destinations/${name.toLowerCase()}`} className="px-4 py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl">
                Explore Guide
              </Link>
            </div>
          ))}
        </div>
      )}

      {(activeTab === 'hotels' || activeTab === 'activities') && (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 text-xs text-slate-500">
          No saved {activeTab} yet. Browse packages and tap the bookmark heart icon to save items to your wishlist!
        </div>
      )}
    </div>
  );
}
