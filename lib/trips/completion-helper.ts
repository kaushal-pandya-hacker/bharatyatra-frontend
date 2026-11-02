/**
 * BharatYatra — Trip Completion Detection & Confirmation Engine
 * Accurately determines if a trip is eligible for completion review without
 * automatically forcing completion solely based on elapsed dates.
 * Client and Server safe (no Node.js fs dependencies).
 */

import { TripItem } from '@/lib/trips/trip-storage';

export interface TripCompletionStatusResult {
  tripId: string;
  isEligibleForReview: boolean;
  isAwaitingCustomerConfirmation: boolean;
  isConfirmedCompleted: boolean;
  isOngoing: boolean;
  hasSubmittedReview: boolean;
  tripSummary: {
    title: string;
    destination: string;
    startDate: string;
    endDate?: string;
    durationDays: number;
    travelers: number;
    stopsCount: number;
  };
}

export class TripCompletionHelper {
  /**
   * Evaluates a trip's completion status relative to current wall-clock time
   * and customer explicit confirmation.
   */
  public static evaluateTrip(
    trip: TripItem,
    userId?: string,
    hasSubmittedReview: boolean = false
  ): TripCompletionStatusResult {
    const tripId = trip.tripId || trip.id || '';
    const now = new Date();
    const nowMs = now.getTime();

    const start = trip.startDate ? new Date(trip.startDate) : null;
    const end = trip.endDate
      ? new Date(trip.endDate)
      : start
      ? new Date(start.getTime() + (trip.durationDays || 3) * 86400000)
      : null;

    const rawStatus = (trip.rawStatus || trip.status || '').toUpperCase();
    const isExplicitlyCompleted = rawStatus === 'COMPLETED';
    const isExplicitlyOngoing = rawStatus === 'ONGOING' || (trip as any).isTripOngoing === true;
    const isCancelled = rawStatus === 'CANCELLED';

    const endHasPassed = end ? end.getTime() <= nowMs : false;

    // A trip is awaiting confirmation if the planned end date has passed, it isn't cancelled,
    // and the customer hasn't yet confirmed completion or ongoing.
    const isAwaitingCustomerConfirmation =
      !isCancelled &&
      !isExplicitlyCompleted &&
      !isExplicitlyOngoing &&
      endHasPassed &&
      !hasSubmittedReview;

    // A trip is eligible for review if the user explicitly confirmed completion or has already reviewed it
    const isEligibleForReview = !isCancelled && (isExplicitlyCompleted || isAwaitingCustomerConfirmation);

    const stopsCount = trip.nodes?.length || (trip.itineraryJson?.days ? trip.itineraryJson.days.length : 3);

    return {
      tripId,
      isEligibleForReview,
      isAwaitingCustomerConfirmation,
      isConfirmedCompleted: isExplicitlyCompleted,
      isOngoing: isExplicitlyOngoing,
      hasSubmittedReview,
      tripSummary: {
        title: trip.title || `Voyage to ${trip.destination}`,
        destination: trip.destinationCity || trip.destination || 'India',
        startDate: trip.startDate,
        endDate: trip.endDate || (end ? end.toISOString().split('T')[0] : undefined),
        durationDays: trip.durationDays || 3,
        travelers: trip.travelers || trip.travellerCount || 2,
        stopsCount,
      },
    };
  }
}
