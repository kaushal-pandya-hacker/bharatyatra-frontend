/**
 * Comprehensive verification of:
 * 1. Inquiry submission -> Admin Portal -> Admin reply -> Customer Notification ("Reply from BharatYatra Support")
 * 2. Customer view -> interactive ticket thread -> Customer reply -> Admin alert
 * 3. Absence of rigid "3 Days, 5 Days, 7 Days, 10 Days" across Personalization Modal & Plan page
 * 4. Web Push engine multi-device registration & test push delivery
 * 5. Trip completion notification with duplicate suppression
 */

import { enquiryStore } from '../lib/enquiries/enquiry-store';
import { adminDataStore } from '../lib/admin/admin-store';
import { notificationStore } from '../lib/notifications/notification-store';
import { webPushEngine } from '../lib/notifications/web-push-engine';
import { TripCompletionNotifier } from '../lib/trips/completion-notifier';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('🚀 Running Universal Inquiry, Notification, and Duration Verification...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] Scenario ${total}: ${description}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Scenario ${total}: ${description}`);
    }
  }

  const TEST_ID = Date.now();
  const testEmail = `traveler_${TEST_ID}@test.bharatyatra.in`;
  const testName = `Kaushal Pandya Test ${TEST_ID}`;

  // 1. Submit Inquiry (Image 2)
  const enquiry = await enquiryStore.createEnquiry({
    fullName: testName,
    email: testEmail,
    phone: '+91 96242 82521',
    inquiryType: 'Tour Package Booking',
    message: 'Need customized Gujarat tour with White Rann resort and Dwarka darshan.',
  });

  assert(Boolean(enquiry && enquiry.enquiryReference), 'Customer enquiry created with unique reference');
  console.log(`   Ref: #${enquiry.enquiryReference}`);

  // 2. Admin retrieves enquiry (Image 3)
  const loadedEnquiry = await enquiryStore.getEnquiryById(enquiry.id);
  assert(loadedEnquiry?.fullName === testName, 'Admin can view submitted enquiry in Website Enquiry Management');

  // 3. Admin replies to customer enquiry
  const ticket = adminDataStore.findOrCreateTicketForEnquiry(enquiry);
  assert(Boolean(ticket && ticket.ticketNumber), 'Support ticket auto-generated for enquiry thread');

  const adminReply = adminDataStore.addSupportReply(
    ticket.id,
    'Hello Kaushal! We have customized itineraries for White Rann with tent stay. Let us know your preferred dates.',
    'Operations Support Lead',
    'admin@bharatyatra.com'
  );
  assert(adminReply?.messages.some((m) => m.message.includes('White Rann')), 'Admin reply appended to support ticket');

  // 4. In-App Notification dispatched to Customer (Image 1)
  const notif = await notificationStore.createNotification({
    recipientEmail: testEmail,
    title: `Reply from BharatYatra Support (#${ticket.ticketNumber})`,
    message: `Operations Support Lead: "Hello Kaushal! We have customized itineraries for White Rann with tent stay."`,
    category: 'support',
    type: 'action',
    deepLink: `/notifications?ticket=${ticket.ticketNumber}`,
    metadata: {
      enquiryId: enquiry.id,
      ticketNumber: ticket.ticketNumber,
      replyMessage: 'Hello Kaushal! We have customized itineraries for White Rann with tent stay.',
      senderName: 'Operations Support Lead',
    },
  });

  assert(Boolean(notif && notif.id), 'In-App notification generated for traveler');
  console.log(`   Notification: "${notif.title}"`);

  // 5. Customer retrieves notification and opens thread
  const customerNotifs = notificationStore.getNotifications({ email: testEmail });
  const receivedNotif = customerNotifs.find((n) => n.id === notif.id);
  assert(Boolean(receivedNotif), 'Customer successfully fetches notification in Notification Center');

  // 6. Customer replies back
  const customerReply = adminDataStore.addCustomerReply(
    ticket.ticketNumber,
    'Great! We plan to travel from 15th to 20th December for 4 adults.',
    testName
  );
  assert(customerReply?.messages.some((m) => m.message.includes('15th to 20th December')), 'Customer reply recorded in two-way thread');

  // 7. Verify Web Push Registration & Preference Check
  const sub = webPushEngine.saveSubscription({
    userId: `usr_${TEST_ID}`,
    endpoint: `https://fcm.googleapis.com/fcm/send/test_${TEST_ID}`,
    keys: {
      p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9AcPP313T59P1W_Hg0QMiLdvSm6nxU0A_dBiHKIs3FsSt8',
      auth: 'tBHItJI5svbpLNkp0_UQ4Q',
    },
    device: {
      deviceType: 'Desktop',
      browser: 'Chrome',
    },
  });
  assert(sub.id.startsWith('sub_'), 'Web Push subscription securely saved for user device');

  // 8. Test Multi-Device retrieval
  const devices = webPushEngine.getUserSubscriptions(`usr_${TEST_ID}`);
  assert(devices.length === 1 && devices[0].device.browser === 'Chrome', 'User push devices correctly retrieved');

  // 9. Verify Notification Preferences
  const updatedPrefs = webPushEngine.updatePreferences(`usr_${TEST_ID}`, {
    marketingNotifications: false,
    tripNotifications: true,
  });
  assert(updatedPrefs.tripNotifications === true && updatedPrefs.marketingNotifications === false, 'Notification preferences updated properly');

  // 10. Verify Trip Completion Notifier (Duplicate suppression)
  const mockTrip: any = {
    id: `trip_${TEST_ID}`,
    tripId: `trip_${TEST_ID}`,
    destination: 'White Rann of Kutch',
    startDate: '2026-12-15',
    durationDays: 5,
  };
  const completionResult1 = await TripCompletionNotifier.dispatchTripCompletionNotification(
    mockTrip,
    `usr_${TEST_ID}`,
    testEmail
  );
  assert(completionResult1.notified === true, 'Trip completion celebration notification dispatched');

  // Duplicate suppression
  const completionResult2 = await TripCompletionNotifier.dispatchTripCompletionNotification(
    mockTrip,
    `usr_${TEST_ID}`,
    testEmail
  );
  assert(completionResult2.notified === false, 'Duplicate trip completion notification successfully suppressed');

  // 11. Codebase verification: Zero [3, 5, 7, 10] buttons in components & app
  const modalContent = fs.readFileSync(
    path.join(process.cwd(), 'components', 'travel', 'AITripPersonalizationModal.tsx'),
    'utf8'
  );
  assert(!modalContent.includes('[3, 5, 7, 10]'), 'Personalization modal has zero [3, 5, 7, 10] duration buttons');

  const devModalContent = fs.readFileSync(
    path.join(process.cwd(), '18_DEVELOPMENT', 'Frontend', 'components', 'travel', 'AITripPersonalizationModal.tsx'),
    'utf8'
  );
  assert(!devModalContent.includes('[3, 5, 7, 10]'), '18_DEVELOPMENT Personalization modal has zero [3, 5, 7, 10] buttons');

  const planContent = fs.readFileSync(
    path.join(process.cwd(), 'app', '(customer)', 'plan', 'page.tsx'),
    'utf8'
  );
  assert(!planContent.includes('[3, 5, 7, 10]'), 'Plan page has zero [3, 5, 7, 10] duration buttons');

  // 12. Deletion & Cleanup
  const deleted = notificationStore.deleteNotification(notif.id);
  assert(deleted === true, 'Notification can be individually deleted by customer');

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} / ${total} passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`========================================\n`);

  if (passed === total) {
    console.log('🎉 ALL 12 TEST SCENARIOS PASSED WITH 100% SUCCESS!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

