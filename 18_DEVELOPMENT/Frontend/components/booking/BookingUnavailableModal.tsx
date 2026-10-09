'use client';

import React, { useEffect } from 'react';
import {
  X,
  ExternalLink,
  Building,
  Plane,
  Train,
  Bus,
  Car,
  Ticket,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { EXTERNAL_BOOKING_PROVIDERS } from '@/lib/booking-availability';
import { analytics } from '@/lib/analytics/client';

export interface BookingUnavailableModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName?: string;
  serviceDescription?: string;
  makeMyTripUrl?: string;
}

export function BookingUnavailableModal({
  isOpen,
  onClose,
  serviceName = 'Hotel',
  serviceDescription,
  makeMyTripUrl,
}: BookingUnavailableModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedService = serviceName.toLowerCase();

  // Determine icon based on service category
  let IconComponent = Building;
  if (normalizedService.includes('flight')) IconComponent = Plane;
  else if (normalizedService.includes('train') || normalizedService.includes('rail')) IconComponent = Train;
  else if (normalizedService.includes('bus')) IconComponent = Bus;
  else if (normalizedService.includes('cab') || normalizedService.includes('taxi') || normalizedService.includes('car')) IconComponent = Car;
  else if (normalizedService.includes('activity') || normalizedService.includes('experience')) IconComponent = Ticket;

  const targetUrl = makeMyTripUrl || EXTERNAL_BOOKING_PROVIDERS.makeMyTrip.url;

  const defaultDescription = `${serviceName} booking is currently unavailable on BharatYatra. Please continue with MakeMyTrip to complete your booking.`;
  const displayDescription = serviceDescription || defaultDescription;

  const handleContinueWithMakeMyTrip = () => {
    // Record analytics event
    try {
      analytics.track('booking_redirect_clicked', {
        properties: {
          service: normalizedService,
          provider: 'makemytrip',
        },
      });
    } catch {
      // Non-blocking telemetry
    }

    // Open MakeMyTrip in a new tab
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900 sm:max-w-lg">
        {/* Top Decorative Line */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-amber-500 to-orange-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6 text-center">
          {/* Service Icon Badge */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs">
            <IconComponent className="w-8 h-8" />
          </div>

          {/* Header & Subtitle */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>MakeMyTrip Direct Link</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              Sorry, we currently do not have this service available.
            </h2>
            
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto font-medium">
              Please continue with <strong className="text-blue-700">MakeMyTrip</strong> to complete your {serviceName.toLowerCase()} booking securely.
            </p>
          </div>

          {/* Zero-Stress Direct Handoff Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>Instant Parameter Handoff (No Extra Re-typing)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Your search details are automatically passed to MakeMyTrip so you only need to confirm and make payment on MakeMyTrip without stress.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleContinueWithMakeMyTrip}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base shadow-md transition-all cursor-pointer"
            >
              <span>Continue with MakeMyTrip</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </button>

            <button
              onClick={onClose}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors border border-slate-200 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
