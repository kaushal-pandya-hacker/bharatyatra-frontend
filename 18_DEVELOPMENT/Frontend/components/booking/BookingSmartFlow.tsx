'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  Building, 
  Plane, 
  Bus, 
  Train, 
  User, 
  ExternalLink, 
  Lock, 
  Loader2, 
  ShieldCheck, 
  Users, 
  Clock, 
  MapPin, 
  Calendar 
} from 'lucide-react';
import { 
  getMakeMyTripHotelLink, 
  getMakeMyTripBusLink, 
  getMakeMyTripTrainLink, 
  getMakeMyTripFlightLink 
} from '@/lib/makemytrip';

export type BookingCategory = 'HOTEL' | 'FLIGHT' | 'BUS' | 'TRAIN';

export interface BookingDetailsProps {
  category: BookingCategory;
  categoryTitle: string;
  fromLocation?: string;
  toLocation?: string;
  destination?: string;
  totalPersons?: number;
  durationDays?: number;
  travelDates?: string;
  additionalInfo?: { label: string; value: string }[];
}

export function BookingSmartFlow({
  category,
  categoryTitle,
  fromLocation,
  toLocation,
  destination,
  totalPersons,
  durationDays,
  travelDates,
  additionalInfo,
}: BookingDetailsProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Construct return URL so after sign in user returns to exact booking context
  const fullRedirectPath = React.useMemo(() => {
    const paramsStr = searchParams?.toString();
    return paramsStr ? `${pathname}?${paramsStr}` : pathname;
  }, [pathname, searchParams]);

  const signInUrl = `/login?redirect=${encodeURIComponent(fullRedirectPath || '/')}`;

  // Generate appropriate MakeMyTrip Link
  const makeMyTripUrl = React.useMemo(() => {
    switch (category) {
      case 'HOTEL':
        return getMakeMyTripHotelLink(destination || toLocation || fromLocation);
      case 'FLIGHT':
        return getMakeMyTripFlightLink(fromLocation, toLocation || destination);
      case 'BUS':
        return getMakeMyTripBusLink(fromLocation, toLocation || destination);
      case 'TRAIN':
        return getMakeMyTripTrainLink(fromLocation, toLocation || destination);
      default:
        return 'https://www.makemytrip.com';
    }
  }, [category, destination, fromLocation, toLocation]);

  // Icon selector per service
  const CategoryIcon = React.useMemo(() => {
    switch (category) {
      case 'FLIGHT': return Plane;
      case 'BUS': return Bus;
      case 'TRAIN': return Train;
      default: return Building;
    }
  }, [category]);

  // 1. LOADING STATE — Avoid UI flashing
  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-bold text-slate-600">Verifying session...</p>
      </div>
    );
  }

  // 2. STATE A — USER IS NOT SIGNED IN
  if (!user) {
    return (
      <div className="w-full max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl shadow-lg text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Sign In Required
          </h2>
          <p className="text-sm font-semibold text-slate-600 leading-relaxed">
            Please sign in to continue with your booking.
          </p>
        </div>

        <Link
          href={signInUrl}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-extrabold text-base shadow-md transition-all cursor-pointer"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.36 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
          </svg>
          <span>Continue with Google</span>
        </Link>
      </div>
    );
  }

  // 3. STATE B — USER IS SIGNED IN
  // Determine valid route display
  const routeString = fromLocation && toLocation ? `${fromLocation} → ${toLocation}` : destination || toLocation || fromLocation;

  return (
    <div className="w-full max-w-xl mx-auto my-8 space-y-6">
      {/* SECTION 1: YOUR TRIP SUMMARY */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <CategoryIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              Your Trip
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {categoryTitle}
            </p>
          </div>
        </div>

        {/* Dynamic Trip Information Grid — Safely omit missing fields */}
        <div className="space-y-3 text-sm font-medium">
          {/* Destination / Route */}
          {routeString && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-500 block uppercase">Destination / Route</span>
                <span className="text-slate-900 font-extrabold text-sm">{routeString}</span>
              </div>
            </div>
          )}

          {/* Total Persons */}
          {typeof totalPersons === 'number' && totalPersons > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-500 block uppercase">Total Persons</span>
                <span className="text-slate-900 font-extrabold text-sm">{totalPersons} {totalPersons === 1 ? 'Person' : 'Persons'}</span>
              </div>
            </div>
          )}

          {/* Duration Days */}
          {typeof durationDays === 'number' && durationDays > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-500 block uppercase">Trip Duration</span>
                <span className="text-slate-900 font-extrabold text-sm">{durationDays} Days</span>
              </div>
            </div>
          )}

          {/* Travel Dates */}
          {travelDates && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-500 block uppercase">Travel Dates</span>
                <span className="text-slate-900 font-extrabold text-sm">{travelDates}</span>
              </div>
            </div>
          )}

          {/* User Profile / Passenger Info */}
          {(user.fullName || user.email || user.phoneNumber) && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-500 block uppercase">Lead Traveller</span>
                <span className="text-slate-900 font-extrabold text-sm">
                  {user.fullName || user.email.split('@')[0]}
                  {user.phoneNumber ? ` (${user.phoneNumber})` : ''}
                </span>
              </div>
            </div>
          )}

          {/* Additional Info items */}
          {additionalInfo && additionalInfo.map((info, idx) => (
            info.value ? (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-500 block uppercase">{info.label}</span>
                  <span className="text-slate-900 font-extrabold text-sm">{info.value}</span>
                </div>
              </div>
            ) : null
          ))}
        </div>
      </div>

      {/* SECTION 2: EXTERNAL BOOKING REDIRECT (MAKEMYTRIP) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 text-center">
        <h3 className="text-lg font-black text-slate-900 tracking-tight">
          You have to book with MakeMyTrip
        </h3>

        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
          Your search details will be passed to MakeMyTrip so you can securely complete your {categoryTitle.toLowerCase()} booking.
        </p>

        <a
          href={makeMyTripUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-md transition-all cursor-pointer"
        >
          <span>Book with MakeMyTrip</span>
          <ExternalLink className="w-4.5 h-4.5 shrink-0" />
        </a>
      </div>
    </div>
  );
}
