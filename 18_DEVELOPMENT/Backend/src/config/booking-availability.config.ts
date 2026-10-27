import { HttpException, HttpStatus } from '@nestjs/common';

export const BOOKING_SERVICE_STATUS = {
  get hotels(): boolean {
    return process.env.HOTELS_BOOKING_ENABLED === 'true';
  },
  get flights(): boolean {
    return process.env.FLIGHTS_BOOKING_ENABLED === 'true';
  },
  get trains(): boolean {
    return process.env.TRAINS_BOOKING_ENABLED === 'true';
  },
  get buses(): boolean {
    return process.env.BUSES_BOOKING_ENABLED === 'true';
  },
  get cabs(): boolean {
    return process.env.CABS_BOOKING_ENABLED === 'true';
  },
  get activities(): boolean {
    return process.env.ACTIVITIES_BOOKING_ENABLED === 'true';
  },
  get transfers(): boolean {
    return process.env.TRANSFERS_BOOKING_ENABLED === 'true';
  },
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

export function normalizeServiceCategory(serviceType: string): string {
  const normalized = (serviceType || '').toLowerCase().trim();
  if (['hotel', 'hotels', 'stay', 'stays'].includes(normalized)) return 'hotels';
  if (['flight', 'flights'].includes(normalized)) return 'flights';
  if (['train', 'trains', 'railway', 'railways'].includes(normalized)) return 'trains';
  if (['bus', 'buses'].includes(normalized)) return 'buses';
  if (['cab', 'cabs', 'taxi', 'taxis', 'car', 'car_rental', 'rentals'].includes(normalized)) return 'cabs';
  if (['activity', 'activities', 'experience', 'experiences'].includes(normalized)) return 'activities';
  if (['transfer', 'transfers'].includes(normalized)) return 'transfers';
  return normalized;
}

export function isBookingServiceAvailable(serviceType: string): BookingAvailabilityResult {
  const key = normalizeServiceCategory(serviceType);
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

export class ServiceUnavailableException extends HttpException {
  constructor(serviceType: string, customMessage?: string) {
    const formattedName = serviceType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
    
    const message = customMessage || `${formattedName} booking is currently unavailable on BharatYatra. Please continue with MakeMyTrip to complete your booking.`;

    super(
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'Service Unavailable',
        message: 'Sorry, we currently do not have this service available.',
        serviceDescription: message,
        redirectProvider: EXTERNAL_BOOKING_PROVIDERS.makeMyTrip.name,
        redirectUrl: EXTERNAL_BOOKING_PROVIDERS.makeMyTrip.url,
        service: serviceType,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
