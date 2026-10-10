import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  TravelProfile,
  TravelContext,
  TripContext,
  buildTravelContext,
  buildTripContext,
  DEFAULT_TRAVEL_PROFILE,
  calculateProfileCompletionPercentage,
} from '../lib/profile/travel-profile';
import { generateItineraryBlueprint } from '../lib/trips/itinerary-generator';
import { buildBookingContextFromTrip } from '../lib/booking/booking-context';

describe('Travel Context Engine & End-to-End Personalization Acceptance Test Suite', () => {
  it('1. Canonical TravelContext Builder maps profile fields correctly', () => {
    const sampleProfile: TravelProfile = {
      fullName: 'Kaushal Pandya',
      origin: {
        city: 'Ahmedabad',
        state: 'Gujarat',
        country: 'India',
        latitude: 23.0225,
        longitude: 72.5714,
      },
      travelStyle: 'adventure',
      budget: 'budget',
      pace: 'packed',
      transport: ['train', 'bus'],
      interests: ['nature', 'wildlife'],
      typicalTravelers: 3,
      preferredLanguage: 'gu',
      completed: true,
    };

    const ctx: TravelContext = buildTravelContext(sampleProfile);

    assert.strictEqual(ctx.user.name, 'Kaushal');
    assert.strictEqual(ctx.origin.city, 'Ahmedabad');
    assert.strictEqual(ctx.origin.state, 'Gujarat');
    assert.strictEqual(ctx.preferences.travelStyle, 'adventure');
    assert.strictEqual(ctx.preferences.budget, 'budget');
    assert.strictEqual(ctx.preferences.pace, 'packed');
    assert.deepStrictEqual(ctx.preferences.interests, ['nature', 'wildlife']);
    assert.strictEqual(ctx.typicalTravelers, 3);
  });

  it('2. TripContext layers trip-specific origin & travelers without mutating permanent profile origin', () => {
    const baseProfile: TravelProfile = {
      fullName: 'Kaushal Pandya',
      origin: { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
      travelStyle: 'balanced',
      typicalTravelers: 2,
      completed: true,
    };

    const travelCtx = buildTravelContext(baseProfile);

    // User plans a trip starting temporarily from Mumbai for 4 travelers
    const tripCtx: TripContext = buildTripContext(travelCtx, {
      origin: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      destination: { city: 'Dwarka', state: 'Gujarat', country: 'India' },
      travelers: 4,
      durationDays: 4,
    });

    // Verify trip origin is Mumbai
    assert.strictEqual(tripCtx.trip.origin.city, 'Mumbai');
    assert.strictEqual(tripCtx.trip.origin.state, 'Maharashtra');
    assert.strictEqual(tripCtx.trip.travelers, 4);

    // Verify PERMANENT profile origin remains UNCHANGED (Ahmedabad)
    assert.strictEqual(travelCtx.origin.city, 'Ahmedabad');
    assert.strictEqual(baseProfile.origin.city, 'Ahmedabad');
  });

  it('3. AI Personalization Validation: Profile A vs Profile B produce different itineraries & costs for same destination', () => {
    // Profile A: Ahmedabad, Adventure, Nature, Budget (3 travelers)
    const profileA: TravelProfile = {
      fullName: 'Rahul Patel',
      origin: { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
      travelStyle: 'adventure',
      budget: 'budget',
      pace: 'packed',
      transport: ['bus'],
      interests: ['nature', 'wildlife'],
      typicalTravelers: 3,
      completed: true,
    };

    // Profile B: Mumbai, Relaxed, Culture, Premium/Luxury (2 travelers)
    const profileB: TravelProfile = {
      fullName: 'Priya Sharma',
      origin: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      travelStyle: 'luxury',
      budget: 'premium',
      pace: 'slow',
      transport: ['flight', 'car'],
      interests: ['heritage', 'food'],
      typicalTravelers: 2,
      completed: true,
    };

    const ctxA = buildTravelContext(profileA);
    const ctxB = buildTravelContext(profileB);

    const tripCtxA = buildTripContext(ctxA, {
      destination: { city: 'Dwarka' },
      durationDays: 4,
    });

    const tripCtxB = buildTripContext(ctxB, {
      destination: { city: 'Dwarka' },
      durationDays: 4,
    });

    const resultA = generateItineraryBlueprint({ tripContext: tripCtxA, selectedPlaceIds: [31, 35] });
    const resultB = generateItineraryBlueprint({ tripContext: tripCtxB, selectedPlaceIds: [31, 35] });

    // 1. Origin check
    assert.strictEqual(resultA.originCity, 'Ahmedabad');
    assert.strictEqual(resultB.originCity, 'Mumbai');

    // 2. Departure badges
    assert.ok(resultA.itineraryDays[0].badge.includes('AHMEDABAD'));
    assert.ok(resultB.itineraryDays[0].badge.includes('MUMBAI'));

    // 3. Cost check (Budget vs Luxury)
    assert.ok(resultB.pricePerPaxPerDay > resultA.pricePerPaxPerDay);
    assert.notStrictEqual(resultA.totalPackageCost, resultB.totalPackageCost);
  });

  it('4. Booking Context inherits TripContext (origin, destination, dates, travelers) with explicit user confirmation flag', () => {
    const travelCtx = buildTravelContext(DEFAULT_TRAVEL_PROFILE);
    const tripCtx = buildTripContext(travelCtx, {
      origin: { city: 'Surat' },
      destination: { city: 'Gir Somnath' },
      travelers: 3,
      startDate: '2026-11-15',
    });

    const bookingCtx = buildBookingContextFromTrip(tripCtx);

    assert.strictEqual(bookingCtx.originCity, 'Surat');
    assert.strictEqual(bookingCtx.destinationCity, 'Gir Somnath');
    assert.strictEqual(bookingCtx.travelers, 3);
    assert.strictEqual(bookingCtx.startDate, '2026-11-15');
    assert.strictEqual(bookingCtx.requiresUserConfirmation, true);
  });

  it('5. Profile Edit update affects future trips while leaving saved historical trips intact', () => {
    const initialProfile: TravelProfile = {
      fullName: 'Kaushal',
      origin: { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
      completed: true,
    };

    const initialTravelCtx = buildTravelContext(initialProfile);
    const historicalTripCtx = buildTripContext(initialTravelCtx, {
      destination: { city: 'Kutch' },
    });

    // Saved trip preserves historical origin (Ahmedabad)
    assert.strictEqual(historicalTripCtx.trip.origin.city, 'Ahmedabad');

    // User updates profile origin to Delhi
    const updatedProfile: TravelProfile = {
      ...initialProfile,
      origin: { city: 'Delhi', state: 'Delhi', country: 'India' },
    };

    const updatedTravelCtx = buildTravelContext(updatedProfile);
    const newTripCtx = buildTripContext(updatedTravelCtx, {
      destination: { city: 'Kutch' },
    });

    // Future trip uses NEW profile origin (Delhi)
    assert.strictEqual(newTripCtx.trip.origin.city, 'Delhi');

    // Historical saved trip REMAINS UNCHANGED (Ahmedabad)
    assert.strictEqual(historicalTripCtx.trip.origin.city, 'Ahmedabad');
  });
});
