/**
 * BharatYatra Booking Service Availability Configuration & Guard
 * Central control for enabling/disabling external booking integrations.
 */

export const BOOKING_SERVICE_STATUS = {
  hotels: process.env.NEXT_PUBLIC_HOTELS_BOOKING_ENABLED === 'true' || false,
  flights: process.env.NEXT_PUBLIC_FLIGHTS_BOOKING_ENABLED === 'true' || false,
  trains: process.env.NEXT_PUBLIC_TRAINS_BOOKING_ENABLED === 'true' || false,
  buses: process.env.NEXT_PUBLIC_BUSES_BOOKING_ENABLED === 'true' || false,
  cabs: process.env.NEXT_PUBLIC_CABS_BOOKING_ENABLED === 'true' || false,
  activities: process.env.NEXT_PUBLIC_ACTIVITIES_BOOKING_ENABLED === 'true' || false,
  transfers: process.env.NEXT_PUBLIC_TRANSFERS_BOOKING_ENABLED === 'true' || false,
};

export const EXTERNAL_BOOKING_PROVIDERS = {
  makeMyTrip: {
    name: 'MakeMyTrip',
    url: 'https://www.makemytrip.com/',
  },
};

export interface BookingAvailabilityResult {
  available: boolean;
  service: string;
  message: string;
  redirectProvider: string;
}

export function isBookingServiceAvailable(serviceType: string): BookingAvailabilityResult {
  const normalized = (serviceType || '').toLowerCase().trim();
  let key = normalized;

  if (['hotel', 'hotels', 'stay', 'stays'].includes(normalized)) key = 'hotels';
  else if (['flight', 'flights'].includes(normalized)) key = 'flights';
  else if (['train', 'trains', 'railway', 'railways'].includes(normalized)) key = 'trains';
  else if (['bus', 'buses'].includes(normalized)) key = 'buses';
  else if (['cab', 'cabs', 'taxi', 'taxis', 'car', 'car_rental', 'rentals'].includes(normalized)) key = 'cabs';
  else if (['activity', 'activities', 'experience', 'experiences'].includes(normalized)) key = 'activities';
  else if (['transfer', 'transfers'].includes(normalized)) key = 'transfers';

  const isAvailable = Boolean(BOOKING_SERVICE_STATUS[key as keyof typeof BOOKING_SERVICE_STATUS] ?? false);

  return {
    available: isAvailable,
    service: key,
    message: isAvailable
      ? 'Service is available'
      : 'Sorry, we currently do not have this service available.',
    redirectProvider: EXTERNAL_BOOKING_PROVIDERS.makeMyTrip.name,
  };
}
