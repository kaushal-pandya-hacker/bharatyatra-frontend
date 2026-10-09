'use client';

import React from 'react';
import { BookingSmartFlow } from '@/components/booking/BookingSmartFlow';

export default function FlightsPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <BookingSmartFlow
        category="FLIGHT"
        categoryTitle="Flight Ticket Booking"
        fromLocation="Ahmedabad (AMD)"
        toLocation="Mumbai (BOM)"
        totalPersons={2}
        durationDays={4}
        travelDates="24 Dec 2026"
      />
    </div>
  );
}
