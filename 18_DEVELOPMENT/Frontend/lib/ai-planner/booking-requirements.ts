/**
 * BharatYatra Booking Requirements Converter
 * Extracts exact booking specifications (Flights, Trains, Hotels, Cabs, Safaris) for the trip.
 */

import { TripDay, BookingRequirement, ParsedIntent } from './types';

export function generateBookingRequirements(
  days: TripDay[],
  intent: ParsedIntent
): BookingRequirement[] {
  const reqs: BookingRequirement[] = [];

  // 1. Intercity Transport Requirement (Flight or Train)
  if (days.length > 0 && days[0].travelSegments.length > 0) {
    const firstSeg = days[0].travelSegments[0];
    reqs.push({
      type: firstSeg.mode === 'flight' ? 'flight' : firstSeg.mode === 'train' ? 'train' : 'cab',
      title: `${firstSeg.from} → ${firstSeg.to} ${firstSeg.mode.toUpperCase()}`,
      details: `${intent.travelersCount} Pax (${intent.travelStyle} tier preference)`,
      originLocation: firstSeg.from,
      destinationLocation: firstSeg.to,
      quantity: intent.travelersCount,
      estimatedCostInr: firstSeg.estimatedCostInr,
      isConfirmedLive: false,
    });
  }

  // 2. Hotel Nights Requirements
  days.forEach(d => {
    if (d.accommodation) {
      reqs.push({
        type: 'hotel',
        title: `${d.accommodation.hotelName} (${d.accommodation.city})`,
        details: `${d.accommodation.category} • ${d.accommodation.nights} Night(s)`,
        destinationLocation: d.accommodation.city,
        quantity: Math.ceil(intent.travelersCount / 2), // Rooms count
        estimatedCostInr: d.accommodation.totalCostInr,
        isConfirmedLive: false,
      });
    }
  });

  // 3. Special Activity / Safari Booking Requirements
  days.forEach(d => {
    const safariOrTrek = [...d.morning, ...d.afternoon, ...d.evening].find(
      a => a.name.includes('Safari') || a.name.includes('Pass') || a.name.includes('Ropeway') || a.name.includes('Permit')
    );
    if (safariOrTrek) {
      reqs.push({
        type: 'activity',
        title: `${safariOrTrek.name} Entry Pass`,
        details: `${intent.travelersCount} Travelers (${safariOrTrek.location})`,
        destinationLocation: safariOrTrek.location,
        quantity: intent.travelersCount,
        estimatedCostInr: (safariOrTrek.estimatedCostInr || 500) * intent.travelersCount,
        isConfirmedLive: false,
      });
    }
  });

  return reqs;
}
