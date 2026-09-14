'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Calendar, Users, Clock, CheckCircle2, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';

interface BookingCardProps {
  inventoryType: 'HOTEL' | 'RESTAURANT' | 'ACTIVITY';
  inventoryId: string;
  inventoryName: string;
  unitPrice: number;
  supplierId?: string;
}

export default function BookingCard({
  inventoryType,
  inventoryId,
  inventoryName,
  unitPrice,
  supplierId,
}: BookingCardProps) {
  const { token, user } = useAuth();
  
  // Default dates
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(tomorrowStr);
  const [reservationTime, setReservationTime] = useState('19:00');
  const [quantity, setQuantity] = useState(1);
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [guestCount, setGuestCount] = useState(2);
  const [customerNotes, setCustomerNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<any | null>(null);

  // Price calculations for preview UI
  let nights = 1;
  if (inventoryType === 'HOTEL' && startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 3600 * 24));
    nights = diff > 0 ? diff : 1;
  }

  const effectiveQty = inventoryType === 'HOTEL' ? nights * quantity : quantity;
  const subtotalPreview = Math.round(unitPrice * effectiveQty * 100) / 100;
  const taxesPreview = Math.round(subtotalPreview * 0.18 * 100) / 100;
  const totalPreview = subtotalPreview + taxesPreview;

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Please sign in to make a reservation.');
      return;
    }

    setSubmitting(true);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const idempotencyKey = `CF-UI-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      const bodyPayload: any = {
        inventoryType,
        inventoryId,
        idempotencyKey,
        customerNotes,
      };

      if (supplierId) {
        bodyPayload.supplierId = supplierId;
      }

      if (inventoryType === 'HOTEL') {
        bodyPayload.startDate = startDate;
        bodyPayload.endDate = endDate;
        bodyPayload.quantity = Number(quantity);
        bodyPayload.adultCount = Number(adultCount);
        bodyPayload.childCount = Number(childCount);
      } else if (inventoryType === 'RESTAURANT') {
        bodyPayload.reservationTime = `${startDate}T${reservationTime}:00.000Z`;
        bodyPayload.guestCount = Number(guestCount);
      } else if (inventoryType === 'ACTIVITY') {
        bodyPayload.startDate = startDate;
        bodyPayload.quantity = Number(quantity);
        bodyPayload.adultCount = Number(adultCount);
        bodyPayload.childCount = Number(childCount);
      }

      const res = await fetch(`${apiBase}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to place booking.');
      }

      setSuccessBooking(json.data);
    } catch (err: any) {
      setError(err.message || 'Booking submission error.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successBooking) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 space-y-4">
        <div className="flex items-center gap-3 text-emerald-800">
          <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-600" />
          <div>
            <h4 className="text-base font-extrabold font-heading">Reservation Confirmed!</h4>
            <p className="text-xs text-emerald-700">Ref: <span className="font-mono font-bold">{successBooking.bookingReference}</span></p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-emerald-100 text-xs space-y-2">
          <div className="flex justify-between text-slate-700">
            <span className="text-slate-500">Item:</span>
            <span className="font-bold">{inventoryName}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span className="text-slate-500">Total Amount:</span>
            <span className="font-bold text-brand-primary">₹{Number(successBooking.totalAmountInr).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span className="text-slate-500">Status:</span>
            <span className="font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
              {successBooking.status}
            </span>
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Demo Mode: Reservation is held instantly. Live payment gateway integration coming soon!</span>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Link
            href={`/bookings/${successBooking.id}`}
            className="flex-1 text-center rounded-xl bg-brand-primary py-2.5 text-xs font-bold text-white hover:bg-brand-primary-hover transition-colors"
          >
            View Booking Details
          </Link>
          <button
            onClick={() => setSuccessBooking(null)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-extrabold font-heading text-slate-900">
            {inventoryType === 'HOTEL' ? 'Reserve Stay' : inventoryType === 'RESTAURANT' ? 'Reserve Table' : 'Book Experience'}
          </h3>
          <p className="text-xs text-slate-500">Instant confirmation • Zero booking fees</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-extrabold font-heading text-brand-primary">
            ₹{Number(unitPrice).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400">
            {inventoryType === 'HOTEL' ? 'per night' : inventoryType === 'RESTAURANT' ? 'per cover' : 'per person'}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
        {/* Date Controls */}
        {inventoryType === 'HOTEL' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Check-In</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Check-Out</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {inventoryType === 'RESTAURANT' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Time</label>
              <input
                type="time"
                required
                value={reservationTime}
                onChange={(e) => setReservationTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {inventoryType === 'ACTIVITY' && (
          <div>
            <label className="font-bold text-slate-700 mb-1 block">Activity Date</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-brand-primary focus:outline-none"
            />
          </div>
        )}

        {/* Quantities / Guest Counts */}
        {inventoryType === 'HOTEL' && (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Rooms</label>
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-center"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Adults</label>
              <input
                type="number"
                min="1"
                max="20"
                value={adultCount}
                onChange={(e) => setAdultCount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-center"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Children</label>
              <input
                type="number"
                min="0"
                max="10"
                value={childCount}
                onChange={(e) => setChildCount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 text-center"
              />
            </div>
          </div>
        )}

        {inventoryType === 'RESTAURANT' && (
          <div>
            <label className="font-bold text-slate-700 mb-1 block">Total Guests</label>
            <input
              type="number"
              min="1"
              max="20"
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
            />
          </div>
        )}

        {inventoryType === 'ACTIVITY' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Adult Tickets</label>
              <input
                type="number"
                min="1"
                max="20"
                value={adultCount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAdultCount(val);
                  setQuantity(val + childCount);
                }}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Child Tickets</label>
              <input
                type="number"
                min="0"
                max="10"
                value={childCount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setChildCount(val);
                  setQuantity(adultCount + val);
                }}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
              />
            </div>
          </div>
        )}

        {/* Special Requests */}
        <div>
          <label className="font-bold text-slate-700 mb-1 block">Special Requests (Optional)</label>
          <input
            type="text"
            placeholder="e.g., Late check-in, dietary preferences"
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
          />
        </div>

        {/* Price Breakdown Preview */}
        <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal ({effectiveQty} unit{effectiveQty > 1 ? 's' : ''})</span>
            <span>₹{subtotalPreview.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Estimated Taxes & Fees (18% GST)</span>
            <span>₹{taxesPreview.toLocaleString('en-IN')}</span>
          </div>
          <div className="border-t border-slate-200 pt-1.5 flex justify-between font-extrabold text-slate-900 text-sm">
            <span>Total Payable</span>
            <span className="text-brand-primary">₹{totalPreview.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-brand-primary py-3 text-xs font-bold text-white hover:bg-brand-primary-hover shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Processing Reservation...
            </>
          ) : (
            'Confirm & Reserve Now'
          )}
        </button>

        <p className="text-[10px] text-center text-slate-400">
          Demo Mode: No payment card required. Immediate confirmation.
        </p>
      </form>
    </div>
  );
}
