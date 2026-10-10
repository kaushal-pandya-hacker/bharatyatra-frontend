'use client';

import React from 'react';
import { BookingSmartFlow } from '@/components/booking/BookingSmartFlow';

export default function StaysPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <BookingSmartFlow
        category="HOTEL"
        categoryTitle="Hotel & Stay Booking"
        destination="Dhordo, Kutch & Heritage Gujarat"
        totalPersons={4}
        durationDays={4}
        travelDates="24 Dec – 28 Dec 2026"
      />
    </div>
  );
}
