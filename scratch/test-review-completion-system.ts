/**
 * BharatYatra — Complete Trip Completion & Customer Feedback Test Suite
 * Validating All 15 Scenarios from Master Specification Section 16
 */

import { reviewStore, TripReview } from '../lib/reviews/review-store';
import { TripCompletionHelper } from '../lib/trips/completion-helper';
import { TripItem } from '../lib/trips/trip-storage';
import { notificationStore } from '../lib/notifications/notification-store';

console.log('================================================================');
console.log('BHARATYATRA TRIP COMPLETION & CUSTOMER FEEDBACK — VERIFICATION');
console.log('================================================================\n');

const RUN_ID = Date.now();
let passedTests = 0;
let totalTests = 15;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    passedTests++;
    console.log(`✅ [SCENARIO ${passedTests}/${totalTests}] ${testName}`);
    if (details) console.log(`   ℹ️ ${details}`);
  } else {
    console.error(`❌ FAILED: ${testName}`);
    if (details) console.error(`   Details: ${details}`);
    process.exit(1);
  }
}

async function runTests() {
  // -------------------------------------------------------------
  // SCENARIO 1: Successfully completed trip detection
  // -------------------------------------------------------------
  const completedTrip: TripItem = {
    tripId: `trip_comp_${RUN_ID}`,
    id: `trip_comp_${RUN_ID}`,
    title: 'Gujarat Heritage Circuit',
    destination: 'Ahmedabad & Somnath',
    startDate: '2026-10-15',
    endDate: '2026-10-20',
    durationDays: 5,
    travelers: 2,
    status: 'COMPLETED',
  };
  const evalResult1 = TripCompletionHelper.evaluateTrip(completedTrip, `usr_tester_01_${RUN_ID}`);
  assert(
    evalResult1.isConfirmedCompleted === true && evalResult1.isEligibleForReview === true,
    'Successfully completed trip detected',
    'Identified status COMPLETED and made trip eligible for celebration feedback'
  );

  // -------------------------------------------------------------
  // SCENARIO 2: Customer confirms trip completion
  // -------------------------------------------------------------
  const awaitingTrip: TripItem = {
    tripId: `trip_await_${RUN_ID}`,
    id: `trip_await_${RUN_ID}`,
    title: 'Kutch White Desert Voyage',
    destination: 'Rann of Kutch',
    startDate: '2026-10-25',
    endDate: '2026-10-28',
    durationDays: 3,
    travelers: 4,
    status: 'SAVED',
  };
  const evalBefore = TripCompletionHelper.evaluateTrip(awaitingTrip, `usr_tester_02_${RUN_ID}`);
  // Customer confirms "Yes, my trip is completed"
  awaitingTrip.status = 'COMPLETED';
  awaitingTrip.rawStatus = 'COMPLETED';
  const evalAfter = TripCompletionHelper.evaluateTrip(awaitingTrip, `usr_tester_02_${RUN_ID}`);
  assert(
    evalBefore.isAwaitingCustomerConfirmation === true &&
    evalAfter.isConfirmedCompleted === true,
    'Customer confirms trip completion',
    'Transitioned from awaiting confirmation to confirmed completed on customer confirmation'
  );

  // -------------------------------------------------------------
  // SCENARIO 3: Trip is still ongoing
  // -------------------------------------------------------------
  const ongoingTrip: TripItem = {
    tripId: `trip_ong_${RUN_ID}`,
    id: `trip_ong_${RUN_ID}`,
    title: 'Himalayan Mountain Expedition',
    destination: 'Manali & Spiti',
    startDate: '2026-10-20',
    endDate: '2026-10-27',
    durationDays: 7,
    status: 'ACTIVE',
    rawStatus: 'ONGOING',
  };
  const evalOngoing = TripCompletionHelper.evaluateTrip(ongoingTrip, `usr_tester_03_${RUN_ID}`);
  assert(
    evalOngoing.isOngoing === true && evalOngoing.isConfirmedCompleted === false,
    'Trip is still ongoing',
    'Customer reported ongoing journey; suppressed completion celebration prompt'
  );

  // -------------------------------------------------------------
  // SCENARIO 4: Customer submits a 5-star review
  // -------------------------------------------------------------
  const { review: review5Star } = await reviewStore.submitTripReview({
    tripId: `trip_star5_${RUN_ID}`,
    userId: `usr_happy_${RUN_ID}`,
    customerName: 'Aarav Sharma',
    customerEmail: `aarav_${RUN_ID}@example.com`,
    destination: 'Udaipur, Rajasthan',
    tripDates: { startDate: '2026-10-10', durationDays: 4 },
    travellerCount: 2,
    overallRating: 5,
    writtenReview: 'Absolutely incredible trip! Everything from hotel bookings to the itinerary was seamless.',
    positiveHighlights: ['Easy trip planning', 'Great accommodation', 'Helpful recommendations'],
  });
  assert(
    review5Star.overallRating === 5 &&
    review5Star.isResolved === true &&
    review5Star.positiveHighlights.includes('Easy trip planning'),
    'Customer submits a 5-star review',
    'Recorded 5-star rating with positive highlights and auto-marked resolved'
  );

  // -------------------------------------------------------------
  // SCENARIO 5: Customer submits a 1-star review (critical issue flagging)
  // -------------------------------------------------------------
  const { review: review1Star } = await reviewStore.submitTripReview({
    tripId: `trip_star1_${RUN_ID}`,
    userId: `usr_upset_${RUN_ID}`,
    customerName: 'Rohit Verma',
    customerEmail: `rohit_${RUN_ID}@example.com`,
    destination: 'Goa',
    tripDates: { startDate: '2026-10-12', durationDays: 3 },
    overallRating: 1,
    writtenReview: 'Flight was delayed and transit cab was not waiting at the airport.',
    improvementSuggestions: ['Improved transportation options', 'Faster customer support'],
  });
  assert(
    review1Star.overallRating === 1 &&
    review1Star.isResolved === false,
    'Customer submits a 1-star review',
    'Critical 1-star feedback flagged as unresolved for high-priority operations response'
  );

  // -------------------------------------------------------------
  // SCENARIO 6: Customer submits written feedback
  // -------------------------------------------------------------
  assert(
    review5Star.writtenReview.length > 20 &&
    review1Star.writtenReview.includes('delayed'),
    'Customer submits written feedback',
    'Written journey feedback captured accurately'
  );

  // -------------------------------------------------------------
  // SCENARIO 7: Customer skips optional questions
  // -------------------------------------------------------------
  const { review: reviewSkippedOptional } = await reviewStore.submitTripReview({
    tripId: `trip_skip_${RUN_ID}`,
    userId: `usr_quick_${RUN_ID}`,
    customerName: 'Neha Patel',
    customerEmail: `neha_${RUN_ID}@example.com`,
    destination: 'Gir National Park',
    tripDates: { startDate: '2026-10-14', durationDays: 2 },
    overallRating: 4,
    writtenReview: 'Wonderful safari experience with our family.',
    // Optional category ratings and photos intentionally omitted
  });
  assert(
    Object.keys(reviewSkippedOptional.categoryRatings).length === 0 &&
    reviewSkippedOptional.photos.length === 0,
    'Customer skips optional questions',
    'Cleanly handled omitted category ratings and photographs without validation failure'
  );

  // -------------------------------------------------------------
  // SCENARIO 8: Customer uploads photographs
  // -------------------------------------------------------------
  const { review: reviewWithPhotos } = await reviewStore.submitTripReview({
    tripId: `trip_photos_${RUN_ID}`,
    userId: `usr_photo_${RUN_ID}`,
    customerName: 'Kunal Joshi',
    customerEmail: `kunal_${RUN_ID}@example.com`,
    destination: 'Varanasi',
    tripDates: { startDate: '2026-10-18', durationDays: 3 },
    overallRating: 5,
    writtenReview: 'Mesmerizing evening Aarti and boat ride on the Ganga.',
    photos: [
      { id: 'img_1', url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc', caption: 'Ganga Aarti' },
      { id: 'img_2', url: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8', caption: 'Assi Ghat Sunrise' },
    ],
    publicConsent: true,
  });
  assert(
    reviewWithPhotos.photos.length === 2 &&
    reviewWithPhotos.photos[0].caption === 'Ganga Aarti',
    'Customer uploads photographs',
    'Successfully stored memory images with attached captions and public consent'
  );

  // -------------------------------------------------------------
  // SCENARIO 9: Duplicate review prevention (editing existing)
  // -------------------------------------------------------------
  const { review: updatedSameTrip, isNew } = await reviewStore.submitTripReview({
    tripId: `trip_star5_${RUN_ID}`, // Same trip as Scenario 4
    userId: `usr_happy_${RUN_ID}`,
    customerName: 'Aarav Sharma',
    customerEmail: `aarav_${RUN_ID}@example.com`,
    destination: 'Udaipur, Rajasthan',
    tripDates: { startDate: '2026-10-10', durationDays: 4 },
    overallRating: 5,
    writtenReview: 'Updated review: The private heritage hotel was truly unforgettable!',
  });
  assert(
    isNew === false &&
    updatedSameTrip.id === review5Star.id &&
    updatedSameTrip.writtenReview.includes('Updated review'),
    'Duplicate review prevention',
    'Updated existing review record instead of creating duplicate entry'
  );

  // -------------------------------------------------------------
  // SCENARIO 10: Admin replies to review
  // -------------------------------------------------------------
  const repliedReview = await reviewStore.addAdminReply(
    review1Star.id,
    'Dear Rohit, we sincerely apologize for the transit delay in Goa. Our logistics manager has issued a compensation credit to your account.',
    'Rajesh Kumar (Operations Support Lead)',
    true
  );
  assert(
    repliedReview.officialReply !== undefined &&
    repliedReview.officialReply.responderName.includes('Rajesh Kumar') &&
    repliedReview.repliesThread.length === 1 &&
    repliedReview.isResolved === true,
    'Admin replies to review',
    'Official BharatYatra response appended with timestamp and resolution flag'
  );

  // -------------------------------------------------------------
  // SCENARIO 11: Customer receives response notification
  // -------------------------------------------------------------
  const customerNotifications = notificationStore.getNotifications({
    userId: `usr_upset_${RUN_ID}`,
  });
  assert(
    customerNotifications.length > 0 &&
    customerNotifications.some((n) => n.title.includes('Response to your')),
    'Customer receives response notification',
    'Dispatched in-app alert informing customer of official response'
  );

  // -------------------------------------------------------------
  // SCENARIO 12: Customer replies to admin in two-way thread
  // -------------------------------------------------------------
  const customerThreadUpdated = await reviewStore.addCustomerReply(
    review1Star.id,
    `usr_upset_${RUN_ID}`,
    'Thank you Rajesh, I appreciate the prompt resolution and credit!'
  );
  assert(
    customerThreadUpdated.repliesThread.length === 2 &&
    customerThreadUpdated.repliesThread[1].sender === 'CUSTOMER',
    'Customer replies to admin in two-way thread',
    'Thread extended with customer response in conversation-style format'
  );

  // -------------------------------------------------------------
  // SCENARIO 13: Customer edits review
  // -------------------------------------------------------------
  const { review: editedAfterResolution } = await reviewStore.submitTripReview({
    tripId: `trip_star1_${RUN_ID}`,
    userId: `usr_upset_${RUN_ID}`,
    customerName: 'Rohit Verma',
    customerEmail: `rohit_${RUN_ID}@example.com`,
    destination: 'Goa',
    tripDates: { startDate: '2026-10-12', durationDays: 3 },
    overallRating: 4, // Upgraded rating after helpful resolution
    writtenReview: 'Initial transit delay was resolved promptly by BharatYatra support. Good service!',
  });
  assert(
    editedAfterResolution.overallRating === 4 &&
    editedAfterResolution.writtenReview.includes('resolved promptly'),
    'Customer edits review',
    'Review successfully updated to reflect resolved customer satisfaction'
  );

  // -------------------------------------------------------------
  // SCENARIO 14: Public review moderation
  // -------------------------------------------------------------
  reviewStore.moderateReview(reviewWithPhotos.id, 'PUBLISHED', 'Verified authentic customer feedback.');
  const publicReviews = reviewStore.getPublicReviews();
  const hasApproved = publicReviews.some((r) => r.id === reviewWithPhotos.id);
  assert(
    hasApproved === true,
    'Public review moderation',
    'Approved review with public consent successfully listed in public showcase'
  );

  // -------------------------------------------------------------
  // SCENARIO 15: Unauthorized review access prevention
  // -------------------------------------------------------------
  let unauthorizedBlocked = false;
  try {
    await reviewStore.addCustomerReply(
      review5Star.id,
      'usr_intruder_999', // Non-owner user ID
      'Unauthorized message attempt'
    );
  } catch (err: any) {
    unauthorizedBlocked = err.message.includes('Unauthorized');
  }
  assert(
    unauthorizedBlocked === true,
    'Unauthorized review access prevention',
    'Strictly rejected reply attempt from user who does not own the review'
  );

  console.log('\n================================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} TRIP COMPLETION & REVIEW SCENARIOS PASSED 100%`);
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
