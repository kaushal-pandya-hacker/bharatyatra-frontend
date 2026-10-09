'use client';

import React from 'react';
import { BookingSmartFlow } from '@/components/booking/BookingSmartFlow';

export default function TrainsPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <BookingSmartFlow
        category="TRAIN"
        categoryTitle="Railway & Train Ticket Booking"
        fromLocation="Ahmedabad Jn (ADI)"
        toLocation="Dwarka (DWK)"
        totalPersons={4}
        durationDays={4}
        travelDates="24 Dec 2026"
      />
    </div>
  );
}
