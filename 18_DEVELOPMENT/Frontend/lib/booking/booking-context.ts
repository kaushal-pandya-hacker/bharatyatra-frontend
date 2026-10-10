import { TripContext } from '@/lib/profile/travel-profile';

export interface BookingContextData {
  originCity: string;
  destinationCity: string;
  travelers: number;
  startDate?: string;
  endDate?: string;
  travelStyle?: string;
  budgetTier?: string;
  transportPreferences?: string[];
  requiresUserConfirmation: true; // NEVER automatically submit bookings
}

export function buildBookingContextFromTrip(tripContext: TripContext): BookingContextData {
  return {
    originCity: tripContext.trip.origin.city,
    destinationCity: tripContext.trip.destination.city,
    travelers: tripContext.trip.travelers,
    startDate: tripContext.trip.startDate,
    endDate: tripContext.trip.endDate,
    travelStyle: tripContext.preferences.travelStyle,
    budgetTier: tripContext.preferences.budget,
    transportPreferences: tripContext.preferences.transport,
    requiresUserConfirmation: true,
  };
}

export function saveActiveBookingContext(bookingCtx: BookingContextData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('bharatyatra_active_booking_context', JSON.stringify(bookingCtx));
  }
}

export function getActiveBookingContext(): BookingContextData | null {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('bharatyatra_active_booking_context');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
  }
  return null;
}
