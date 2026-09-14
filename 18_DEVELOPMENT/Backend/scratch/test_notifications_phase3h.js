/**
 * CHALO FARVA — PHASE 3H TEST SUITE
 * Centralized Notifications, Event Triggers, Multi-Channel Adapters, Idempotency, Preferences, Inbox Pagination, Security & Integration
 */

const BASE_URL = 'http://localhost:4000/api/v1';

async function runTests() {
  console.log('====================================================');
  console.log('   CHALO FARVA — PHASE 3H TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const testUser = 'usr_qa_customer_3h';
  const testSupplier = 'sup_gujarattravels_01';

  // --- 1. Notification Event Dispatching Tests ---
  console.log('--- 1. Multi-Channel Event Dispatching Tests ---');
  try {
    const dispatchPayload = {
      eventId: `evt_test_dispatch_${Date.now()}`,
      recipientId: testUser,
      recipientEmail: 'qa.traveler@chalofarva.com',
      recipientPhone: '+919876543210',
      category: 'BOOKING',
      priority: 'HIGH',
      templateId: 'booking_confirmed',
      templateVersion: 'v1.0',
      locale: 'en',
      channels: ['EMAIL', 'SMS', 'PUSH'],
      variables: {
        user_name: 'QA Traveler',
        booking_reference: 'CF-2026-TEST3H',
        service_name: 'Somnath Heritage Tour',
        date: '15 Oct 2026',
      },
      deepLink: '/bookings/bk_test_3h',
    };

    const dispatchRes = await fetch(`${BASE_URL}/notifications/dispatch-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dispatchPayload),
    });
    const records = await dispatchRes.json();

    assert(dispatchRes.status === 201 || dispatchRes.status === 200, 'Dispatch event returns HTTP 200/201');
    assert(Array.isArray(records) && records.length === 3, 'Dispatches across all 3 requested channels (EMAIL, SMS, PUSH)');
    assert(records[0].title === 'Your Booking is Confirmed!', 'Renders template title correctly');
    assert(records[0].body.includes('Somnath Heritage Tour'), 'Interpolates template variables into body');
  } catch (err) {
    console.error('Dispatch test error:', err.message);
    failed++;
  }

  // --- 2. Duplicate Event Suppression (Idempotency Key) Tests ---
  console.log('\n--- 2. Duplicate Event Suppression (Idempotency) Tests ---');
  try {
    const dedupEventId = `evt_dedup_${Date.now()}`;
    const payload = {
      eventId: dedupEventId,
      recipientId: testUser,
      recipientEmail: 'qa.traveler@chalofarva.com',
      category: 'PAYMENT',
      priority: 'NORMAL',
      templateId: 'payment_success',
      templateVersion: 'v1.0',
      channels: ['EMAIL'],
      variables: { amount: 5000, txn_reference: 'TXN-9900' },
    };

    const firstRes = await fetch(`${BASE_URL}/notifications/dispatch-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const firstRecords = await firstRes.json();
    assert(firstRecords.length === 1, 'First event dispatch creates notification record');

    const secondRes = await fetch(`${BASE_URL}/notifications/dispatch-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const secondRecords = await secondRes.json();
    assert(secondRecords.length === 0, 'Duplicate event with same eventId + recipient + channel is suppressed');
  } catch (err) {
    console.error('Idempotency test error:', err.message);
    failed++;
  }

  // --- 3. User Preferences & Quiet Hours Tests ---
  console.log('\n--- 3. User Preferences & Quiet Hours Tests ---');
  try {
    const prefRes = await fetch(`${BASE_URL}/notifications/preferences?userId=${testUser}`);
    const prefData = await prefRes.json();
    assert(Array.isArray(prefData) && prefData.length > 0, 'Retrieves user notification preferences');

    const updateRes = await fetch(`${BASE_URL}/notifications/preferences?userId=${testUser}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ category: 'MARKETING', channel: 'SMS', enabled: false }]),
    });
    assert(updateRes.status === 200, 'Updates user notification channel preference');
  } catch (err) {
    console.error('Preferences test error:', err.message);
    failed++;
  }

  // --- 4. Customer Inbox & Pagination Tests ---
  console.log('\n--- 4. Customer Inbox, Pagination & Read State Tests ---');
  try {
    const inboxRes = await fetch(`${BASE_URL}/notifications?userId=${testUser}&page=1&limit=10`);
    const inboxData = await inboxRes.json();

    assert(inboxRes.status === 200, 'Customer notifications inbox returns HTTP 200 OK');
    assert(Array.isArray(inboxData.data), 'Returns paginated array of notifications');
    assert(inboxData.meta && typeof inboxData.meta.unreadCount === 'number', `Returns unread counter (${inboxData.meta?.unreadCount})`);

    const unreadRes = await fetch(`${BASE_URL}/notifications/unread-count?userId=${testUser}`);
    const unreadData = await unreadRes.json();
    assert(typeof unreadData.unreadCount === 'number', 'Unread count endpoint returns numeric counter');

    if (inboxData.data.length > 0) {
      const targetId = inboxData.data[0].notificationId;
      const readRes = await fetch(`${BASE_URL}/notifications/${targetId}/read?userId=${testUser}`, {
        method: 'PATCH',
      });
      const readData = await readRes.json();
      assert(readData.readStatus === 'READ', 'Marks single notification as READ');
    }

    const readAllRes = await fetch(`${BASE_URL}/notifications/read-all?userId=${testUser}`, {
      method: 'POST',
    });
    const readAllData = await readAllRes.json();
    assert(typeof readAllData.updatedCount === 'number', `Marks all notifications as READ (${readAllData.updatedCount} updated)`);
  } catch (err) {
    console.error('Inbox test error:', err.message);
    failed++;
  }

  // --- 5. Supplier Tenant Isolation Tests ---
  console.log('\n--- 5. Supplier Tenant Isolation Security Tests ---');
  try {
    const supRes = await fetch(`${BASE_URL}/supplier/notifications?supplierId=${testSupplier}`);
    const supData = await supRes.json();
    assert(Array.isArray(supData), 'Supplier fetches tenant-isolated notification inbox');

    const otherSupRes = await fetch(`${BASE_URL}/supplier/notifications?supplierId=sup_isolated_b`);
    const otherSupData = await otherSupRes.json();
    assert(Array.isArray(otherSupData) && otherSupData.length === 0, 'Isolated Supplier B sees 0 notifications of Supplier A');
  } catch (err) {
    console.error('Supplier isolation test error:', err.message);
    failed++;
  }

  // --- 6. Admin Delivery Overview Tests ---
  console.log('\n--- 6. Admin Delivery Overview & Status Metrics Tests ---');
  try {
    const adminOverviewRes = await fetch(`${BASE_URL}/admin/notifications`);
    const overviewData = await adminOverviewRes.json();
    assert(typeof overviewData.totalNotifications === 'number', `Admin retrieves delivery overview (${overviewData.totalNotifications} total)`);

    const failuresRes = await fetch(`${BASE_URL}/admin/notifications/failures`);
    const failuresData = await failuresRes.json();
    assert(Array.isArray(failuresData), 'Admin retrieves delivery failures and retries log');

    const providersRes = await fetch(`${BASE_URL}/admin/notifications/providers`);
    const providersData = await providersRes.json();
    assert(Array.isArray(providersData) && providersData.length === 4, 'Admin retrieves multi-channel provider adapter health status');
  } catch (err) {
    console.error('Admin overview test error:', err.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`   PHASE 3H TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
