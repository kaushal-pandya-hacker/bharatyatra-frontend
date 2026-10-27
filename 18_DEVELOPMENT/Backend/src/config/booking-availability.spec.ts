import {
  BOOKING_SERVICE_STATUS,
  isBookingServiceAvailable,
  normalizeServiceCategory,
  ServiceUnavailableException,
  EXTERNAL_BOOKING_PROVIDERS,
} from './booking-availability.config';
import { HttpStatus } from '@nestjs/common';

describe('Booking Availability Config & Guard Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.HOTELS_BOOKING_ENABLED;
    delete process.env.FLIGHTS_BOOKING_ENABLED;
    delete process.env.TRAINS_BOOKING_ENABLED;
    delete process.env.BUSES_BOOKING_ENABLED;
    delete process.env.CABS_BOOKING_ENABLED;
    delete process.env.ACTIVITIES_BOOKING_ENABLED;
    delete process.env.TRANSFERS_BOOKING_ENABLED;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('normalizeServiceCategory', () => {
    it('should correctly normalize singular and plural service terms', () => {
      expect(normalizeServiceCategory('hotel')).toBe('hotels');
      expect(normalizeServiceCategory('Hotels')).toBe('hotels');
      expect(normalizeServiceCategory('flight')).toBe('flights');
      expect(normalizeServiceCategory('train')).toBe('trains');
      expect(normalizeServiceCategory('bus')).toBe('buses');
      expect(normalizeServiceCategory('cab')).toBe('cabs');
      expect(normalizeServiceCategory('activity')).toBe('activities');
      expect(normalizeServiceCategory('transfer')).toBe('transfers');
    });
  });

  describe('isBookingServiceAvailable', () => {
    it('should default to unavailable (false) when env variables are unset', () => {
      const hotelCheck = isBookingServiceAvailable('hotels');
      expect(hotelCheck.available).toBe(false);
      expect(hotelCheck.message).toBe('Sorry, we currently do not have this service available.');
      expect(hotelCheck.redirectProvider).toBe('MakeMyTrip');

      const flightCheck = isBookingServiceAvailable('flights');
      expect(flightCheck.available).toBe(false);

      const trainCheck = isBookingServiceAvailable('trains');
      expect(trainCheck.available).toBe(false);

      const busCheck = isBookingServiceAvailable('buses');
      expect(busCheck.available).toBe(false);
    });

    it('should reflect available status when environmental variable is set to true', () => {
      process.env.HOTELS_BOOKING_ENABLED = 'true';
      const hotelCheck = isBookingServiceAvailable('hotels');
      expect(hotelCheck.available).toBe(true);
      expect(hotelCheck.message).toBe('Service is available');
    });
  });

  describe('ServiceUnavailableException', () => {
    it('should construct 503 response payload with MakeMyTrip handoff information', () => {
      const exception = new ServiceUnavailableException('Hotel');
      expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);

      const responsePayload = exception.getResponse() as any;
      expect(responsePayload.statusCode).toBe(503);
      expect(responsePayload.error).toBe('Service Unavailable');
      expect(responsePayload.message).toBe('Sorry, we currently do not have this service available.');
      expect(responsePayload.redirectProvider).toBe('MakeMyTrip');
      expect(responsePayload.redirectUrl).toBe('https://www.makemytrip.com/');
    });
  });

  describe('EXTERNAL_BOOKING_PROVIDERS', () => {
    it('should contain official MakeMyTrip provider details', () => {
      expect(EXTERNAL_BOOKING_PROVIDERS.makeMyTrip.name).toBe('MakeMyTrip');
      expect(EXTERNAL_BOOKING_PROVIDERS.makeMyTrip.url).toBe('https://www.makemytrip.com/');
    });
  });
});
