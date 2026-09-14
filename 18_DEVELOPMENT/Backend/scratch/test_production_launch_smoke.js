/**
 * CHALO FARVA — MASTER PRODUCTION LAUNCH SMOKE TEST SUITE
 * Complete Pre-Launch Verification across Customer, Supplier, Admin, Security, Payments & Health
 */

const BASE_URL = 'http://localhost:4000/api/v1';

async function runLaunchSmokeTests() {
  console.log('================================================================');
  console.log('    CHALO FARVA — MASTER PRODUCTION LAUNCH SMOKE TEST SUITE    ');
  console.log('================================================================\n');

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

  // --- 1. INFRASTRUCTURE & HEALTH PROBES ---
  console.log('--- 1. Infrastructure Health & Liveness Probes ---');
  try {
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint responds HTTP 200 OK');
    assert(healthData.status === 'UP', 'Global health status is UP');
    assert(healthData.dependencies.database === 'HEALTHY', 'PostgreSQL database dependency is HEALTHY');
    assert(healthData.dependencies.redis === 'HEALTHY', 'Redis cache dependency is HEALTHY');

    const livenessRes = await fetch(`${BASE_URL}/health/liveness`);
    const livenessData = await livenessRes.json();
    assert(livenessRes.status === 200 && livenessData.status === 'UP', 'Liveness probe returns HTTP 200 UP');

    const readinessRes = await fetch(`${BASE_URL}/health/readiness`);
    const readinessData = await readinessRes.json();
    assert(readinessRes.status === 200 && readinessData.status === 'UP', 'Readiness probe returns HTTP 200 UP');
  } catch (err) {
    console.error('Health probe error:', err.message);
    failed++;
  }

  // --- 2. ADMIN AUTH & PRE-SETUP ---
  console.log('\n--- 2. Admin Authentication & Infrastructure Setup ---');
  let adminToken = null;
  try {
    const adminLoginRes = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@chalofarva.com',
        password: 'AdminPassword123!',
      }),
    });
    const adminData = await adminLoginRes.json();
    adminToken = adminData.data?.token || adminData.token;
    assert(adminLoginRes.ok && adminToken, 'Admin authenticates successfully');

    // Admin Dashboard Metrics
    const adminDashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminDashRes.ok, 'Admin fetches system operational metrics');
  } catch (err) {
    console.error('Admin auth error:', err.message);
    failed++;
  }

  // --- 3. SUPPLIER REGISTRATION & INVENTORY MODERATION ---
  console.log('\n--- 3. Supplier Registration, Inventory Creation & Moderation ---');
  let supplierAToken = null;
  let supplierBToken = null;
  let hotelId = null;

  try {
    const timestamp = Date.now();
    // Supplier A Registration
    const suppAReg = await fetch(`${BASE_URL}/supplier/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Launch Heritage Stays',
        fullName: 'Supplier Alpha',
        email: `launch_supp_a_${timestamp}@chalofarva.com`,
        password: 'Password123!',
        phone: '+919876543210',
      }),
    });
    const suppAData = await suppAReg.json();
    supplierAToken = suppAData.data?.token || suppAData.token;
    assert(suppAReg.status === 201 && supplierAToken, 'Supplier A registration successful');

    // Supplier B Registration
    const suppBReg = await fetch(`${BASE_URL}/supplier/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Launch Safari Tours',
        fullName: 'Supplier Beta',
        email: `launch_supp_b_${timestamp}@chalofarva.com`,
        password: 'Password123!',
        phone: '+919876543211',
      }),
    });
    const suppBData = await suppBReg.json();
    supplierBToken = suppBData.data?.token || suppBData.token;
    assert(suppBReg.status === 201 && supplierBToken, 'Supplier B registration successful');

    // Supplier A creates Hotel inventory
    const createHotelRes = await fetch(`${BASE_URL}/supplier/hotels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supplierAToken}`,
      },
      body: JSON.stringify({
        name: 'Grand Dwarka Palace',
        description: 'Luxury seaside stay',
        destinationSlug: 'dwarka',
        address: 'Beach Road, Dwarka',
        pricePerNight: 4000,
        starRating: 4,
        amenities: ['WiFi', 'Pool', 'Breakfast'],
        latitude: 22.2442,
        longitude: 68.9685,
      }),
    });
    const hotelData = await createHotelRes.json();
    const createdHotel = hotelData.data || hotelData;
    hotelId = createdHotel.id;
    assert(createHotelRes.ok && hotelId, 'Supplier A creates hotel listing');

    // Admin approves hotel inventory
    if (hotelId && adminToken) {
      const reviewRes = await fetch(`${BASE_URL}/admin/inventory/hotel/${hotelId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'APPROVED',
          reason: 'Verified production listing',
        }),
      });
      assert(reviewRes.ok, 'Admin approves hotel listing for public discovery');
    }
  } catch (err) {
    console.error('Supplier journey error:', err.message);
    failed++;
  }

  // --- 4. CUSTOMER END-TO-END JOURNEY ---
  console.log('\n--- 4. Customer End-to-End Journey ---');
  let customerToken = null;
  let bookingId = null;

  try {
    const timestamp = Date.now();
    const customerEmail = `launch_cust_${timestamp}@chalofarva.com`;
    const custRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail,
        passwordHash: 'Password123!',
        fullName: 'Launch Traveler',
      }),
    });
    const custRegData = await custRegRes.json();
    customerToken = custRegData.data?.token || custRegData.token;
    assert(custRegRes.status === 201 && customerToken, 'Customer registration successful & token issued');

    // Search Destinations
    const destRes = await fetch(`${BASE_URL}/destinations`);
    const destData = await destRes.json();
    assert(destRes.ok && Array.isArray(destData.data || destData), 'Customer searches destination inventory catalog');

    // Generate Trip
    const tripRes = await fetch(`${BASE_URL}/trips/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        destination: 'Dwarka',
        startDate: '2026-11-10',
        endDate: '2026-11-14',
        durationDays: 4,
        travellerCount: 2,
        budgetInr: 30000,
      }),
    });
    const tripData = await tripRes.json();
    assert(tripRes.ok, 'Customer generates AI trip itinerary');

    // Create Booking for approved hotel
    if (hotelId) {
      const bookingRes = await fetch(`${BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          inventoryType: 'HOTEL',
          inventoryId: hotelId,
          startDate: '2026-11-10',
          endDate: '2026-11-13',
          quantity: 1,
          guestCount: 2,
        }),
      });
      const bookingData = await bookingRes.json();
      const createdBooking = bookingData.data || bookingData;
      bookingId = createdBooking.id;
      assert(bookingRes.ok && bookingId, 'Customer creates booking for approved hotel listing');

      // Payment Order Creation (Sandbox Mode)
      const payRes = await fetch(`${BASE_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          bookingId: bookingId,
          paymentMethod: 'UPI',
          currency: 'INR',
        }),
      });
      assert(payRes.ok, 'Customer creates payment order safely in Sandbox Mode');
    }

    // Notifications Inbox Check
    const notifRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(notifRes.ok, 'Customer fetches notifications inbox');
  } catch (err) {
    console.error('Customer journey error:', err.message);
    failed++;
  }

  // --- 5. SECURITY & INFORMATION LEAKAGE TESTS ---
  console.log('\n--- 5. Security, RBAC, IDOR & Error Sanitization ---');
  try {
    // Unauthenticated access check
    const unauthRes = await fetch(`${BASE_URL}/admin/dashboard`);
    assert(unauthRes.status === 401 || unauthRes.status === 403, 'Rejects unauthenticated request to admin dashboard (401/403)');

    // Customer accessing Admin API
    const custAdminRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(custAdminRes.status === 403 || custAdminRes.status === 401, 'CUSTOMER role blocked from admin endpoint (HTTP 403 Forbidden)');

    // IDOR Protection: Supplier B trying to modify Supplier A hotel
    if (hotelId && supplierBToken) {
      const idorPatchRes = await fetch(`${BASE_URL}/supplier/hotels/${hotelId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supplierBToken}`,
        },
        body: JSON.stringify({ pricePerNight: 9999 }),
      });
      assert(idorPatchRes.status === 404 || idorPatchRes.status === 403, 'IDOR PROTECTION: Supplier B blocked from patching Supplier A hotel');
    }

    // Error response sanitization check
    const errRes = await fetch(`${BASE_URL}/bookings/invalid-uuid-string-999`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const errText = await errRes.text();
    assert(!errText.includes('SELECT'), 'Sanitization: Error response does not leak raw SQL query strings');
    assert(!errText.includes('PrismaClientKnownRequestError'), 'Sanitization: Error response does not leak Prisma ORM details');
    assert(!errText.includes('node_modules'), 'Sanitization: Error response does not leak server stack traces');
  } catch (err) {
    console.error('Security smoke test error:', err.message);
    failed++;
  }

  // --- 6. LIVE ROAD ROUTING ENGINE ---
  console.log('\n--- 6. Live Road Routing Verification ---');
  try {
    const routeRes = await fetch(`${BASE_URL}/routes/distance?originLat=23.0225&originLng=72.5714&destLat=22.2442&destLng=68.9685`);
    const routeData = await routeRes.json();
    assert(routeRes.ok, 'Live road routing endpoint returns HTTP 200 OK');
    assert((routeData.data?.distanceKm || routeData.distanceKm) > 0, 'Calculates valid road distance');
  } catch (err) {
    console.error('Routing smoke test error:', err.message);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`   LAUNCH SMOKE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLaunchSmokeTests();
