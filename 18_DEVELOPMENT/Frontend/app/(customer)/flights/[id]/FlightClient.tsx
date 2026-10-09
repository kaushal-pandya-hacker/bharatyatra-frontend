'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FareSelector } from '@/components/travel/FareSelector';
import { PriceSummary } from '@/components/travel/PriceSummary';
import { Plane, ArrowLeft } from 'lucide-react';

export default function FlightDetailPage() {
  const router = useRouter();
  const [selectedFare, setSelectedFare] = useState({ name: 'Saver', price: 3850 });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <Link
        href="/flights"
        className="text-xs text-farva-gold-sahara hover:underline flex items-center gap-1 font-semibold"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Flight Search
      </Link>

      <div className="glass-card rounded-3xl p-6 border border-farva-gold-sahara/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-farva-navy-surface border border-farva-gold-sahara/30 flex items-center justify-center text-farva-gold-sahara flex-shrink-0">
            <Plane className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-extrabold text-white">IndiGo Airlines #6E 214</h1>
            <p className="text-xs text-slate-300 mt-1">AMD (Ahmedabad) → BHJ (Bhuj) • Non-stop (1h 10m)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <FareSelector
            tiers={[
              { id: 'saver', name: 'Farva Saver', price: 3850, baggage: '7kg Cabin + 15kg Check-in', flexibility: 'Standard Cancellation', seatSelection: 'Free Auto Seat' },
              { id: 'flexi', name: 'Farva Flexi', price: 4450, baggage: '7kg Cabin + 20kg Check-in', flexibility: 'Free Date Change', seatSelection: 'Choice Seat Included' },
              { id: 'sovereign', name: 'Sovereign Priority', price: 5800, baggage: '10kg Cabin + 25kg Check-in', flexibility: 'Full Refundable', seatSelection: 'Front Row / Extra Legroom' },
            ]}
            onSelect={(t) => setSelectedFare({ name: t.name, price: t.price })}
          />
        </div>

        <div>
          <PriceSummary
            items={[
              { label: `Air Ticket (${selectedFare.name})`, amount: selectedFare.price },
            ]}
            taxes={Math.round(selectedFare.price * 0.12)}
            total={selectedFare.price + Math.round(selectedFare.price * 0.12)}
            onProceed={() => router.push('/checkout')}
            buttonText="Proceed to Checkout"
          />
        </div>
      </div>
    </div>
  );
}
