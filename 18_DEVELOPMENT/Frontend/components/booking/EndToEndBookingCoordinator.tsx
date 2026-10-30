'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  CreditCard,
  Building,
  Plane,
  Train,
  Bus,
  Ticket,
  Car,
  Package,
  RefreshCw,
  QrCode,
  Download,
  Printer,
  ChevronRight,
  Info,
  X,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  TripBookingRecord,
  ComponentBookingRecord,
  PriceRevalidationResult,
  ProductCategory,
  BookingLifecycleState,
} from '@/lib/booking/unified-booking-orchestrator';

interface EndToEndBookingCoordinatorProps {
  initialTripBooking?: TripBookingRecord;
  className?: string;
}

export function EndToEndBookingCoordinator({
  initialTripBooking,
  className = '',
}: EndToEndBookingCoordinatorProps) {
  // State variables
  const [booking, setBooking] = useState<TripBookingRecord | null>(
    initialTripBooking || null
  );
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>(
    []
  );
  const [isVerifyingPrices, setIsVerifyingPrices] = useState(false);
  const [revalidationData, setRevalidationData] =
    useState<PriceRevalidationResult | null>(null);
  const [showPriceDriftModal, setShowPriceDriftModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelComponentId, setCancelComponentId] = useState<
    string | undefined
  >(undefined);
  const [cancelReason, setCancelReason] = useState(
    'Schedule conflict / Change of plans'
  );

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<
    'UPI' | 'CARD' | 'NETBANKING'
  >('UPI');
  const [upiId, setUpiId] = useState('traveler@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8819');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [fulfillmentStep, setFulfillmentStep] = useState<string>('');
  const [operationMessage, setOperationMessage] = useState<string | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(600); // 10m price lock

  // Initialize selected components on load
  useEffect(() => {
    if (booking?.components) {
      setSelectedComponentIds(
        booking.components
          .filter((c) => c.status !== 'CANCELLED')
          .map((c) => c.id)
      );
    }
  }, [booking?.components]);

  // Load demo booking if none provided
  useEffect(() => {
    if (!booking) {
      fetch('/api/v1/booking/orchestrate?id=BY-TRIP-DEMO-2026-001')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setBooking(json.data);
          }
        })
        .catch(() => {});
    }
  }, [booking]);

  // Price lock timer countdown
  useEffect(() => {
    if (booking?.priceLockedUntil) {
      const interval = setInterval(() => {
        const remaining = Math.max(
          0,
          Math.floor(
            (new Date(booking.priceLockedUntil!).getTime() - Date.now()) / 1000
          )
        );
        setCountdownSeconds(remaining);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [booking?.priceLockedUntil]);

  // Component icon helper
  const getCategoryIcon = (category: ProductCategory) => {
    switch (category) {
      case 'HOTEL':
        return <Building className="w-5 h-5 text-indigo-600" />;
      case 'FLIGHT':
        return <Plane className="w-5 h-5 text-blue-600" />;
      case 'TRAIN':
        return <Train className="w-5 h-5 text-emerald-600" />;
      case 'BUS':
        return <Bus className="w-5 h-5 text-amber-600" />;
      case 'ACTIVITY':
        return <Ticket className="w-5 h-5 text-purple-600" />;
      case 'CAB':
        return <Car className="w-5 h-5 text-rose-600" />;
      case 'PACKAGE':
        return <Package className="w-5 h-5 text-teal-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-slate-600" />;
    }
  };

  // Status badge helper
  const getStatusBadge = (status: BookingLifecycleState) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'PARTIALLY_CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Partially Confirmed
          </span>
        );
      case 'PRICE_CHANGED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" /> Price Changed
          </span>
        );
      case 'PAYMENT_PENDING':
      case 'PAYMENT_CONFIRMED':
      case 'BOOKING_PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
      case 'CANCELLED':
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // Toggle selection
  const toggleComponent = (id: string) => {
    if (selectedComponentIds.includes(id)) {
      setSelectedComponentIds(selectedComponentIds.filter((cid) => cid !== id));
    } else {
      setSelectedComponentIds([...selectedComponentIds, id]);
    }
  };

  // Active subtotal calculation
  const selectedComponents =
    booking?.components.filter((c) => selectedComponentIds.includes(c.id)) || [];
  const currentTotal = selectedComponents.reduce(
    (sum, c) => sum + (c.verifiedPrice || c.quotedPrice),
    0
  );

  // 1. Verify availability and revalidate prices
  const handleVerifyPrices = async () => {
    if (!booking) return;
    setIsVerifyingPrices(true);
    setOperationMessage(null);

    try {
      const res = await fetch('/api/v1/booking/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REVALIDATE_PRICES',
          tripBookingId: booking.tripBookingId,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setBooking(json.data.tripBooking);
        setRevalidationData(json.data.revalidation);

        if (json.data.revalidation.requiresUserAuthorization) {
          setShowPriceDriftModal(true);
        } else {
          setOperationMessage(
            json.data.revalidation.isPriceDrop
              ? `Great news! Prices dropped by ₹${json.data.revalidation.savingsInr}. 10-minute lock active.`
              : 'All prices verified against live suppliers. 10-minute price lock activated.'
          );
        }
      } else {
        setOperationMessage(json.error || 'Failed to revalidate prices.');
      }
    } catch {
      setOperationMessage('Network error during price revalidation.');
    } finally {
      setIsVerifyingPrices(false);
    }
  };

  // 2. Authorize price update (User explicitly agrees to new price)
  const handleAuthorizePrice = async () => {
    if (!booking) return;
    try {
      const res = await fetch('/api/v1/booking/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'AUTHORIZE_PRICE',
          tripBookingId: booking.tripBookingId,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setBooking(json.data);
        setShowPriceDriftModal(false);
        setOperationMessage('Price change authorized. Proceed to checkout.');
      }
    } catch {
      setOperationMessage('Failed to authorize price change.');
    }
  };

  // 3. Initiate payment & supplier orchestration
  const handleExecutePayment = async () => {
    if (!booking) return;
    setIsProcessingPayment(true);
    setFulfillmentStep('1/4 Creating BharatGateway Secure Payment Order...');

    try {
      // Step A: Create Gateway Order
      const orderRes = await fetch('/api/v1/booking/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_ORDER',
          tripBookingId: booking.tripBookingId,
          customerEmail: 'kaushal@bharatyatra.in',
          customerPhone: '+919876543210',
        }),
      });

      const orderJson = await orderRes.json();
      if (!orderJson.success) {
        setOperationMessage(orderJson.error || 'Failed to create payment order.');
        setIsProcessingPayment(false);
        return;
      }

      const orderId = orderJson.data.order.orderId;

      // Step B: Decoupled Payment Confirmation & Sequential Supplier Execution
      setFulfillmentStep('2/4 Authenticating payment via BharatGateway...');
      await new Promise((resolve) => setTimeout(resolve, 800));

      setFulfillmentStep('3/4 Payment Captured! Reserving with supplier APIs...');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFulfillmentStep('4/4 Fulfilling live tickets, hotel vouchers & passes...');
      const confirmRes = await fetch('/api/v1/booking/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CONFIRM_BOOKING',
          tripBookingId: booking.tripBookingId,
          paymentOrderId: orderId,
          paymentMethod,
        }),
      });

      const confirmJson = await confirmRes.json();
      if (confirmJson.data && confirmJson.data.tripBooking) {
        setBooking(confirmJson.data.tripBooking);
        setShowCheckoutModal(false);
        setOperationMessage(
          confirmJson.data.success
            ? 'Booking confirmed! Master travel voucher issued.'
            : 'Booking completed with partial supplier compensation.'
        );
      }
    } catch {
      setOperationMessage('Payment execution failed.');
    } finally {
      setIsProcessingPayment(false);
      setFulfillmentStep('');
    }
  };

  // 4. Cancel booking / component
  const handleCancel = async () => {
    if (!booking) return;
    try {
      const res = await fetch('/api/v1/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripBookingId: booking.tripBookingId,
          componentId: cancelComponentId,
          reason: cancelReason,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setBooking(json.data.tripBooking);
        setShowCancelModal(false);
        setOperationMessage(json.message);
      } else {
        setOperationMessage(json.error || 'Cancellation request failed.');
      }
    } catch {
      setOperationMessage('Network error during cancellation.');
    }
  };

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-2xl border border-slate-200">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mb-3" />
        <p className="font-medium text-slate-700">Loading booking coordination engine...</p>
      </div>
    );
  }

  const isConfirmed = booking.status === 'CONFIRMED';
  const isPartiallyConfirmed = booking.status === 'PARTIALLY_CONFIRMED';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner / Trip Summary Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                {booking.tripBookingId}
              </span>
              {getStatusBadge(booking.status)}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">
              {booking.title}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {booking.originCity} → {booking.destinationCity} • {booking.startDate} to{' '}
              {booking.endDate} • {booking.travelersCount} Traveler(s)
            </p>
          </div>

          <div className="flex flex-col md:items-end">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Trip Amount
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl md:text-3xl font-extrabold text-slate-900">
                ₹{currentTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-500">
                ({selectedComponents.length} items)
              </span>
            </div>
            {booking.priceLockedUntil && countdownSeconds > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 mt-1">
                <Clock className="w-3.5 h-3.5" /> Price Locked:{' '}
                {Math.floor(countdownSeconds / 60)}:
                {(countdownSeconds % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>
        </div>

        {/* Operational Message / Alert Banner */}
        {operationMessage && (
          <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>{operationMessage}</span>
            </div>
            <button
              onClick={() => setOperationMessage(null)}
              className="text-blue-500 hover:text-blue-700 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Warning if price drifted and renewed authorization required */}
        {booking.requiresRenewedAuthorization && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-rose-900">
                Live Supplier Price Drift Detected
              </h4>
              <p className="text-xs text-rose-700 mt-1">
                One or more components have updated rates from live suppliers. Under BharatYatra fair-pricing policies, payments cannot proceed without your explicit renewed authorization.
              </p>
              <button
                onClick={() => setShowPriceDriftModal(true)}
                className="mt-2.5 px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition"
              >
                Review Price Changes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Component Itinerary Items List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Trip Components & Inventory</h3>
            <p className="text-xs text-slate-500">
              Select or deselect items to customize your coordinated booking.
            </p>
          </div>

          {!isConfirmed && (
            <button
              onClick={handleVerifyPrices}
              disabled={isVerifyingPrices}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingPrices ? 'animate-spin' : ''}`} />
              {isVerifyingPrices ? 'Revalidating...' : 'Verify Availability'}
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {booking.components.map((comp) => {
            const isSelected = selectedComponentIds.includes(comp.id);
            const isCompConfirmed = comp.status === 'CONFIRMED';
            const isCompCancelled = comp.status === 'CANCELLED';

            return (
              <div
                key={comp.id}
                className={`py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                  isCompCancelled ? 'opacity-50 bg-slate-50 p-3 rounded-xl' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {!isConfirmed && !isCompCancelled && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleComponent(comp.id)}
                      className="mt-1.5 w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                    />
                  )}

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    {getCategoryIcon(comp.componentType)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {comp.componentType}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{comp.title}</h4>
                      {getStatusBadge(comp.status)}
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {comp.description} • Provider: {comp.providerName}
                    </p>

                    {/* Confirmed Supplier PNR / Ticket Info */}
                    {isCompConfirmed && comp.supplierConfirmationReference && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-mono font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Supplier Ref: {comp.supplierConfirmationReference}
                      </div>
                    )}

                    {/* Cancellation policy summary */}
                    <div className="mt-1 text-[11px] text-slate-400">
                      Policy: {comp.cancellationPolicy?.policyDescription || 'Standard policy applies'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 pl-10 md:pl-0">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{comp.verifiedPrice.toLocaleString('en-IN')}
                    </span>
                    {comp.verifiedPrice !== comp.quotedPrice && (
                      <div className="text-[11px] text-slate-400 line-through">
                        Quoted: ₹{comp.quotedPrice.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>

                  {/* Component specific actions */}
                  {isConfirmed && !isCompCancelled && (
                    <button
                      onClick={() => {
                        setCancelComponentId(comp.id);
                        setShowCancelModal(true);
                      }}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 border border-rose-200 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition"
                    >
                      Cancel Item
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Checkout or Confirmation Actions Footer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold text-slate-900">
              BharatYatra Guaranteed Booking Coordination
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Decoupled escrow payment with BharatGateway. Direct supplier vouchers issued instantly.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {!isConfirmed ? (
            <button
              onClick={() => setShowCheckoutModal(true)}
              disabled={
                selectedComponents.length === 0 ||
                booking.requiresRenewedAuthorization
              }
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-700 transition disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              Proceed to BharatGateway Checkout (₹{currentTotal.toLocaleString('en-IN')})
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => window.print()}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition"
              >
                <Printer className="w-4 h-4" /> Print Vouchers
              </button>
              <button
                onClick={() => {
                  setCancelComponentId(undefined);
                  setShowCancelModal(true);
                }}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition"
              >
                Cancel Entire Trip
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Master Voucher Card (When Confirmed) */}
      {(isConfirmed || isPartiallyConfirmed) && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-700">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wider uppercase">
                <CheckCircle2 className="w-4 h-4" /> Master Trip Voucher Active
              </div>
              <h3 className="text-2xl font-bold mt-1">{booking.title}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Booking ID: {booking.tripBookingId} • Payment Ref: {booking.paymentOrderId}
              </p>
            </div>

            <div className="p-3 bg-white text-slate-900 rounded-xl flex items-center gap-3 w-fit">
              <QrCode className="w-12 h-12 text-slate-900" />
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Instant Boarding Pass
                </div>
                <div className="text-xs font-mono font-extrabold">{booking.tripBookingId}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {booking.components
              .filter((c) => c.status === 'CONFIRMED')
              .map((c) => (
                <div key={c.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {c.componentType} VOUCHER
                  </span>
                  <div className="text-sm font-bold mt-1 text-white truncate">{c.title}</div>
                  <div className="text-xs text-slate-300 mt-0.5">Supplier: {c.providerName}</div>
                  <div className="mt-3 pt-3 border-t border-slate-700/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400">PNR / Ref</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {c.supplierConfirmationReference}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Price Drift Alert Dialog (Renewed Authorization) */}
      {showPriceDriftModal && revalidationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-lg">
                <AlertCircle className="w-6 h-6" />
                <span>Supplier Rate Change Alert</span>
              </div>
              <button
                onClick={() => setShowPriceDriftModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3">
              Supplier rates have updated since your initial search. In accordance with transparency standards, please review the exact cost adjustment before authorizing payment.
            </p>

            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Previously Quoted:</span>
                <span className="font-semibold text-slate-700">
                  ₹{revalidationData.totalQuoted.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Verified Supplier Total:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  ₹{revalidationData.totalVerified.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Net Difference:</span>
                <span
                  className={`font-bold ${
                    revalidationData.totalDelta > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {revalidationData.totalDelta > 0 ? '+' : ''}₹{revalidationData.totalDelta} (
                  {revalidationData.percentChange}%)
                </span>
              </div>
            </div>

            {/* Drift per component */}
            <div className="mt-3 max-h-40 overflow-y-auto space-y-1.5 text-xs text-slate-600">
              {revalidationData.componentsWithDrift.map((c) => (
                <div key={c.id} className="flex justify-between py-1 border-b border-slate-100">
                  <span className="truncate pr-2">{c.title}</span>
                  <span
                    className={
                      c.delta > 0 ? 'text-rose-600 font-bold' : 'text-slate-500 font-medium'
                    }
                  >
                    {c.delta > 0 ? `+₹${c.delta}` : '₹0'}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPriceDriftModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Keep Looking
              </button>
              <button
                onClick={handleAuthorizePrice}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-rose-600/20"
              >
                Accept Updated Price & Lock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BharatGateway Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-sm">
                  BY
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">BharatGateway™ Checkout</h3>
                  <span className="text-[10px] text-slate-400">RBI & PCI-DSS 256-Bit Encrypted</span>
                </div>
              </div>
              {!isProcessingPayment && (
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-600">Payable Amount:</span>
              <span className="text-base font-extrabold text-slate-900">
                ₹{currentTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Payment Method Selector */}
            {!isProcessingPayment ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'CARD', 'NETBANKING'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                        paymentMethod === m
                          ? 'border-orange-500 bg-orange-50/50 text-orange-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m === 'UPI' && <Sparkles className="w-4 h-4 text-orange-600" />}
                      {m === 'CARD' && <CreditCard className="w-4 h-4 text-blue-600" />}
                      {m === 'NETBANKING' && <Building className="w-4 h-4 text-emerald-600" />}
                      <span>{m}</span>
                    </button>
                  ))}
                </div>

                {/* Method Input Details */}
                {paymentMethod === 'UPI' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Enter UPI ID (VPA)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-400">
                      Supports GPay, PhonePe, Paytm, BHIM UPI
                    </span>
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        defaultValue="12/28"
                        placeholder="MM/YY"
                        className="px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                      />
                      <input
                        type="password"
                        defaultValue="•••"
                        placeholder="CVV"
                        className="px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'NETBANKING' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Select Bank</label>
                    <select className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300">
                      <option>HDFC Bank</option>
                      <option>State Bank of India (SBI)</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                    </select>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleExecutePayment}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-700 transition"
                  >
                    Authorize & Pay ₹{currentTotal.toLocaleString('en-IN')}
                  </button>
                </div>
              </div>
            ) : (
              /* Decoupled Fulfillment Progress Indicator */
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <RefreshCw className="w-10 h-10 animate-spin text-orange-600 mb-4" />
                <h4 className="text-sm font-bold text-slate-900">Coordinating Trip Fulfillment</h4>
                <p className="text-xs text-slate-600 mt-2 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  {fulfillmentStep}
                </p>
                <span className="text-[11px] text-slate-400 mt-3">
                  Please do not refresh or close this window.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Cancellation & Refund Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Confirm Cancellation</span>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3">
              {cancelComponentId
                ? 'Are you sure you want to cancel this specific item? Refund will be calculated based on supplier cancellation policy.'
                : 'Are you sure you want to cancel the entire trip booking? All supplier reservations will be released and calculated refunds initiated back to your source account.'}
            </p>

            <div className="mt-4 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Reason for cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
              >
                <option>Schedule conflict / Change of plans</option>
                <option>Medical or family emergency</option>
                <option>Found alternative travel arrangements</option>
                <option>Travel dates postponed</option>
              </select>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-rose-600/20"
              >
                Confirm Cancellation & Process Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
