/**
 * BharatYatra — Trip Completion Notification Automation
 * Dispatches celebratory welcome back messages, triggers Web Push,
 * and handles duplicate and already-reviewed suppression.
 */

import { notificationStore } from '@/lib/notifications/notification-store';
import { reviewStore } from '@/lib/reviews/review-store';
import { TripItem } from '@/lib/trips/trip-storage';

export class TripCompletionNotifier {
  /**
   * Dispatches trip completion notification to the customer.
   * Ensures idempotency: will not dispatch if already reviewed or already notified.
   */
  public static async dispatchTripCompletionNotification(
    trip: TripItem,
    userId: string,
    customerEmail?: string
  ): Promise<{ notified: boolean; reason?: string }> {
    const tripId = trip.tripId || trip.id || '';
    if (!tripId) return { notified: false, reason: 'Invalid trip ID' };

    // 1. Check if customer already submitted feedback for this trip
    const existingReview = reviewStore.getTripReview(tripId, userId);
    if (existingReview) {
      return { notified: false, reason: 'Customer already submitted feedback for this trip' };
    }

    // 2. Prevent duplicate notifications for the same trip completion event
    const existingNotifs = notificationStore.getNotifications({ userId, email: customerEmail });
    const duplicate = existingNotifs.find(
      (n) => n.type === 'TRIP_COMPLETION' && n.metadata?.tripId === tripId
    );
    if (duplicate) {
      return { notified: false, reason: 'Completion notification already dispatched for this trip' };
    }

    const destination = trip.destinationCity || trip.destination || 'India';
    const deepLink = `/trips/${tripId}/review`;

    // 3. Create persistent in-app & web push notification
    await notificationStore.createNotification({
      userId,
      recipientEmail: customerEmail,
      title: 'Welcome Back, Traveller! ❤️',
      message: `We hope you had an amazing journey to ${destination} with BharatYatra. Share your experience and let us know how we did!`,
      category: 'trips',
      type: 'TRIP_COMPLETION',
      deepLink,
      metadata: {
        tripId,
        destination,
        actionUrl: deepLink,
        actionText: 'Rate Your Trip',
        startDate: trip.startDate,
        durationDays: trip.durationDays,
      },
    });

    return { notified: true };
  }
}
