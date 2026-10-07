'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { getBaseUrl } from '@/lib/api/client';

export default function CustomerPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;
  const { token } = useAuth();

  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment state
  const [order, setOrder] = useState<any | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [statusNote, setStatusNote] = useState<string | null>(null);

  useEffect(() => {
    fetchBookingAndInitOrder();
  }, [token, bookingId]);

  const fetchBookingAndInitOrder = async () => {
    if (!token || !bookingId) return;

    setLoading(true);
    setError(null);
    const apiBase = getBaseUrl();

    try {
      // 1. Fetch Booking Record
      const bookingRes = await fetch(`${apiBase}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingJson = await bookingRes.json();
      if (!bookingRes.ok) throw new Error(bookingJson.message || 'Failed to fetch booking.');
      setBooking(bookingJson.data);

      // 2. Initialize Gateway Order (Test Mode)
      const orderRes = await fetch(`${apiBase}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: bookingId,
          amountInr: bookingJson.data.totalAmountInr,
          currency: 'INR',
          description: `Payment for Booking ${bookingJson.data.bookingReference}`,
        }),
      });

      const orderJson = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderJson.message || 'Payment order initialization failed.');

      setOrder(orderJson.data);
    } catch (err: any) {
      setError(err.message || 'Error initializing payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async (shouldSucceed: boolean) => {
    if (!token || !order) return;

    setProcessing(true);
    setStatusNote(null);
    const apiBase = getBaseUrl();

    try {
      if (!shouldSucceed) {
        setPaymentStatus('FAILED');
        setStatusNote('Simulated payment failure. No money was deducted. You can try again.');
        setProcessing(false);
        return;
      }

      // Simulate valid verification signature
      const verifyRes = await fetch(`${apiBase}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gatewayOrderId: order.gatewayOrderId,
          gatewayPaymentId: `sandbox_pay_${Date.now()}`,
          signature: `sb_sig_valid_${Date.now()}`,
        }),
      });

      const verifyJson = await verifyRes.json();
      if (verifyRes.ok && verifyJson.success) {
        setPaymentStatus('SUCCESS');
        setStatusNote('Server-side payment verification completed! Booking status updated to CONFIRMED.');
        setTimeout(() => {
          router.push(`/bookings/${bookingId}`);
        }, 2000);
      } else {
        setPaymentStatus('FAILED');
        setStatusNote(verifyJson.message || 'Payment signature verification failed.');
      }
    } catch (err: any) {
      setPaymentStatus('FAILED');
      setStatusNote(err.message || 'Network error during payment verification.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-600" />
        <p className="text-sm font-medium text-slate-600">Initializing secure sandbox checkout...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold font-heading text-slate-900">Checkout Unavailable</h2>
        <p className="text-sm text-slate-500">{error || 'Could not load payment session.'}</p>
        <Link
          href={`/bookings/${bookingId}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Reservation Detail
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8 font-sans">
      {/* Navigation */}
      <Link
        href={`/bookings/${bookingId}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Return to Booking Details
      </Link>

      {/* Sandbox Test Environment Alert Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-900">
        <ShieldCheck className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-amber-700 uppercase tracking-wide">BharatYatra Sandbox Payment Mode</div>
          <p className="text-amber-800">
            This environment runs strictly in <strong>TEST / SANDBOX MODE</strong>. No real credit card or bank account will be charged.
          </p>
        </div>
      </div>

      {/* Price & Booking Summary Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Booking Reference</div>
            <div className="text-lg font-bold font-mono text-slate-900">{booking.bookingReference}</div>
          </div>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-full">
            {booking.status}
          </span>
        </div>

        {/* Item Breakdown */}
        <div className="space-y-3 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Item / Service</span>
            <span className="font-semibold text-slate-900">{booking.inventoryType || 'Travel Booking'}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Base Unit Price</span>
            <span className="font-medium text-slate-800">₹{Number(booking.unitPrice).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium text-slate-800">₹{Number(booking.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Taxes & Fees (18% GST)</span>
            <span className="font-medium text-slate-800">₹{Number(booking.taxes).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-900 font-bold text-base border-t border-slate-200 pt-3">
            <span>Total Amount Payable</span>
            <span className="text-amber-600 font-mono">₹{Number(booking.totalAmountInr).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Action Simulator */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-5 border border-slate-800">
        <h3 className="text-base font-bold font-heading flex items-center gap-2 text-amber-400">
          <CreditCard className="h-5 w-5" /> Sandbox Payment Simulator
        </h3>

        {statusNote && (
          <div
            className={`p-4 rounded-2xl text-xs font-medium border flex items-start gap-2 ${
              paymentStatus === 'SUCCESS'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
          >
            {paymentStatus === 'SUCCESS' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            )}
            <div>{statusNote}</div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleSimulatePayment(true)}
            disabled={processing || paymentStatus === 'SUCCESS'}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {processing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" /> Simulate Successful Payment (₹{Number(booking.totalAmountInr).toFixed(2)})
              </>
            )}
          </button>

          <button
            onClick={() => handleSimulatePayment(false)}
            disabled={processing || paymentStatus === 'SUCCESS'}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-rose-400 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Simulate Payment Failure
          </button>
        </div>
      </div>
    </div>
  );
}
