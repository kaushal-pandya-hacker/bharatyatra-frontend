'use client';
import { useState } from 'react';
import { AdaptiveAlertBanner } from '@/components/ai/adaptive-alert-banner';
import { ProvenanceTag } from '@/components/ai/provenance-tag';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import TripRouteMapSection from '@/components/maps/trip-route-map-section';

const sampleTripDays = [
  {
    day_number: 1,
    title: 'Arrival in Bhuj & Prag Mahal Heritage',
    total_travel_distance_km: 18.5,
    activities: [
      {
        id: 'act-1',
        title: 'Prag Mahal & Aina Mahal Palace',
        type: 'ATTRACTION',
        latitude: 23.2541,
        longitude: 69.6685,
        time_slot: { start_time: '09:00 AM', end_time: '11:30 AM' },
        cost_inr: 40,
        notes: '19th-century Italian Gothic architecture with bell tower views.',
      },
      {
        id: 'act-2',
        title: 'Authentic Kutchi Thali Lunch',
        type: 'RESTAURANT',
        latitude: 23.2480,
        longitude: 69.6620,
        time_slot: { start_time: '01:00 PM', end_time: '02:30 PM' },
        cost_inr: 250,
        notes: 'Local dining spot serving Bajra no Rotlo, Ringan Bharta & Chaas.',
      },
      {
        id: 'act-3',
        title: 'Shree Swaminarayan Mandir Bhuj',
        type: 'ATTRACTION',
        latitude: 23.2410,
        longitude: 69.6730,
        time_slot: { start_time: '04:00 PM', end_time: '06:00 PM' },
        cost_inr: 0,
        notes: 'Intricately carved marble temple complex.',
      },
      {
        id: 'act-4',
        title: 'Regenta Resort Bhuj (Stay Check-in)',
        type: 'HOTEL',
        latitude: 23.2520,
        longitude: 69.6550,
        time_slot: { start_time: '07:00 PM', end_time: '08:00 PM' },
        cost_inr: 4500,
        notes: 'Heritage resort stay.',
      },
    ],
  },
  {
    day_number: 2,
    title: 'Bhuj to White Rann Sunset & Cultural Night',
    total_travel_distance_km: 84.0,
    activities: [
      {
        id: 'act-21',
        title: 'Kalo Dungar (Black Hill Viewpoint)',
        type: 'ATTRACTION',
        latitude: 23.9167,
        longitude: 69.7833,
        time_slot: { start_time: '10:00 AM', end_time: '01:00 PM' },
        cost_inr: 0,
        notes: 'Highest point in Kutch offering panoramic views of Rann.',
      },
      {
        id: 'act-22',
        title: 'Dhordo Tent City Check-in',
        type: 'HOTEL',
        latitude: 23.7788,
        longitude: 69.5134,
        time_slot: { start_time: '03:00 PM', end_time: '04:30 PM' },
        cost_inr: 8500,
        notes: 'Luxury desert tent stay with cultural show.',
      },
      {
        id: 'act-23',
        title: 'Full Moon White Rann Sunset Walk',
        type: 'ACTIVITY',
        latitude: 23.7820,
        longitude: 69.5200,
        time_slot: { start_time: '05:30 PM', end_time: '08:00 PM' },
        cost_inr: 100,
        notes: 'Magical salt desert sunset experience.',
      },
    ],
  },
];

export default function TripDetailPage() {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [activeVersion, setActiveVersion] = useState(1);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
              Active Trip • Version {activeVersion}
            </span>
            <ProvenanceTag type="AI_SUGGESTED" />
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900">
            Kutch Rann Utsav & Heritage Discovery
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-600 mt-2">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Ahmedabad → Bhuj → Dhordo</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Nov 10 - Nov 14, 2026 (5 Days)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">Download Itinerary PDF</Button>
          <Button size="sm" className="gap-1.5"><Sparkles className="h-4 w-4" /> Ask AI to Edit</Button>
        </div>
      </div>

      {/* Adaptive Weather Alert Banner */}
      <AdaptiveAlertBanner
        title="Weather Warning: Heavy Rain Expected in Somnath"
        description="Rain forecast at 03:00 PM tomorrow may affect outdoor beach visit. AI recommends an indoor museum alternative."
        onReviewProposal={() => setShowAlertModal(true)}
      />

      {/* Interactive Daily Route & Trip Map */}
      <TripRouteMapSection days={sampleTripDays} initialDay={1} />

      {/* Itinerary Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-heading text-slate-900">Day 1 — Arrival in Bhuj & Prag Mahal</h2>
            <span className="text-xs text-slate-500">Nov 10, 2026</span>
          </div>

          {/* Timeline Items */}
          <div className="space-y-4 border-l-2 border-brand-primary/30 pl-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-brand-primary flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> 09:00 AM - 11:30 AM
                </span>
                <ProvenanceTag type="VERIFIED" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Prag Mahal & Aina Mahal Palace Visit</h3>
              <p className="text-xs text-slate-600 mt-1">19th-century Italian Gothic architecture with bell tower views of Bhuj city.</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Entry Ticket: ₹40 / person</span>
                <span className="text-green-600 font-semibold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Entry Verified</span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-brand-primary flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> 01:00 PM - 02:30 PM
                </span>
                <ProvenanceTag type="VERIFIED" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Authentic Kutchi Thali Lunch</h3>
              <p className="text-xs text-slate-600 mt-1">Local dining spot serving Bajra no Rotlo, Ringan Bharta, and Fresh Chaas.</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Pure Veg / Jain Available</span>
                <span>Est. Cost: ₹250 / person</span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget & Booking Summary Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-heading text-slate-900">Trip Budget Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Total Budget</span>
                <span className="font-semibold text-slate-900">₹25,000</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Booked & Reserved</span>
                <span className="font-semibold text-brand-primary">₹14,850</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Est. Food & Misc Buffer</span>
                <span className="font-semibold text-slate-900">₹4,500</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Remaining Budget</span>
                <span className="text-emerald-600">₹5,650</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adaptive Proposal Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-heading text-slate-900">Review Adaptive AI Proposal</h3>
            <p className="text-xs text-slate-600">
              Rain forecast in Somnath tomorrow afternoon. AI recommends substituting outdoor beach walk with indoor exhibition.
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
              <div className="text-red-600 font-semibold">Original: Outdoor Beach Visit (03:00 PM)</div>
              <div className="text-emerald-700 font-semibold">Proposed: Somnath Museum & Exhibition (03:00 PM)</div>
              <div className="text-slate-500 pt-2 border-t">Time Delta: +0 mins | Cost Impact: ₹0</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowAlertModal(false)}>Reject Change</Button>
              <Button size="sm" onClick={() => { setActiveVersion(2); setShowAlertModal(false); }}>
                Accept & Update Itinerary
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
