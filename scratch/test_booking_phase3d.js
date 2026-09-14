const http = require('http');

const API_BASE = 'http://localhost:4000/api/v1';

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, description, detail = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${description}`);
  } else {
    console.error(`❌ [FAIL] Test ${totalTests}: ${description}`);
    if (detail) console.error(`       Detail: ${JSON.stringify(detail)}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('CHALO FARVA — PHASE 3D AUTOMATED TEST SUITE');
  console.log('Booking Engine + Reservation Lifecycle Verification');
  console.log('====================================================\n');

  try {
    // ----------------------------------------------------
    // STEP 1: PREPARATION & REGRESSION FOUNDATION
    // ----------------------------------------------------
    console.log('--- SECTION 1: Setup Accounts & Inventory ---');

    const timestamp = Date.now();
    const customerAEmail = `cust_a_${timestamp}@example.com`;
    const customerBEmail = `cust_b_${timestamp}@example.com`;
    const supplierEmail = `supplier_${timestamp}@hotel.com`;

    // Register Customer A
    const custARes = await request('POST', '/auth/register', {
      email: customerAEmail,
      passwordHash: 'Password123!',
      fullName: 'Customer Alice',
    });
    assert(custARes.status === 201 && custARes.data.success, 'Register Customer A', custARes);
    const customerAToken = custARes.data.data.token;
    const customerAId = custARes.data.data.user.id;

    // Register Customer B
    const custBRes = await request('POST', '/auth/register', {
      email: customerBEmail,
      passwordHash: 'Password123!',
      fullName: 'Customer Bob',
    });
    assert(custBRes.status === 201 && custBRes.data.success, 'Register Customer B', custBRes);
    const customerBToken = custBRes.data.data.token;
    const customerBId = custBRes.data.data.user.id;

    // Register Supplier
    const suppRegRes = await request('POST', '/suppliers/register', {
      email: supplierEmail,
      password: 'Supplier123!',
      companyName: `Grand Somnath Heights ${timestamp}`,
      phoneNumber: '9876543210',
      businessType: 'HOTEL',
    });
    const supplierToken = suppRegRes.data.token || suppRegRes.data.data?.token;
    const supplierId = suppRegRes.data.supplier?.id || suppRegRes.data.data?.supplier?.id;
    assert(suppRegRes.status === 201 && !!supplierToken, 'Register Supplier', suppRegRes);

    // Admin Login
    const adminLoginRes = await request('POST', '/admin/login', {
      email: 'admin@chalofarva.com',
      password: 'AdminPassword123!',
    });
    const adminToken = adminLoginRes.data?.data?.token || adminLoginRes.data?.token;
    assert((adminLoginRes.status === 200 || adminLoginRes.status === 201) && !!adminToken, 'Admin Login', adminLoginRes);

    // Admin Verify Supplier
    const verifySuppRes = await request('PATCH', `/admin/suppliers/${supplierId}/verification`, {
      verificationStatus: 'VERIFIED',
      reason: 'Identity verified',
    }, adminToken);
    const verifyData = verifySuppRes.data?.data || verifySuppRes.data;
    assert(verifySuppRes.status === 200 && verifyData.verificationStatus === 'VERIFIED', 'Admin Verify Supplier', verifySuppRes);

    // Fetch Dwarka destination
    const destsRes = await request('GET', '/destinations');
    assert(destsRes.status === 200 && destsRes.data.data.length > 0, 'Fetch Destinations');
    const dwarka = destsRes.data.data.find((d) => d.slug === 'dwarka') || destsRes.data.data[0];

    // Create Hotel Inventory
    const createHotelRes = await request('POST', '/supplier/hotels', {
      name: `Somnath Palace Hotel ${timestamp}`,
      destinationId: dwarka.id,
      address: 'Near Temple Road',
      starRating: 4,
      pricePerNight: 3500.0,
      category: 'Luxury',
      amenities: ['WiFi', 'Breakfast', 'Parking'],
    }, supplierToken);
    const hotelData = createHotelRes.data?.data || createHotelRes.data;
    assert(createHotelRes.status === 201 && !!hotelData?.id, 'Supplier Create Hotel', createHotelRes);
    const hotelId = hotelData.id;

    // Admin Approve Hotel
    const appHotelRes = await request('PATCH', `/admin/inventory/hotel/${hotelId}/review`, {
      action: 'APPROVED',
      reason: 'Approved for listing',
    }, adminToken);
    assert(appHotelRes.status === 200, 'Admin Approve Hotel', appHotelRes);

    // Create Restaurant Inventory
    const createRestRes = await request('POST', '/supplier/restaurants', {
      name: `Dwarka Thali Dining ${timestamp}`,
      destinationId: dwarka.id,
      address: 'Main Chowk',
      cuisineType: 'Gujarati Kathiyawadi',
      priceRange: '₹₹',
      averageCost: 450.0,
      openingTime: '11:00 AM',
      closingTime: '10:30 PM',
    }, supplierToken);
    const restData = createRestRes.data?.data || createRestRes.data;
    assert(createRestRes.status === 201 && !!restData?.id, 'Supplier Create Restaurant', createRestRes);
    const restId = restData.id;

    // Admin Approve Restaurant
    const appRestRes = await request('PATCH', `/admin/inventory/restaurant/${restId}/review`, {
      action: 'APPROVED',
      reason: 'Approved for dining',
    }, adminToken);
    assert(appRestRes.status === 200, 'Admin Approve Restaurant', appRestRes);

    // Create Activity Inventory
    const createActRes = await request('POST', '/supplier/activities', {
      title: `Scuba Diving & Coral Tour ${timestamp}`,
      destinationId: dwarka.id,
      category: 'Water Sports',
      durationMinutes: 120,
      priceInr: 2200.0,
    }, supplierToken);
    const actData = createActRes.data?.data || createActRes.data;
    assert(createActRes.status === 201 && !!actData?.id, 'Supplier Create Activity', createActRes);
    const actId = actData.id;

    // Admin Approve Activity
    const appActRes = await request('PATCH', `/admin/inventory/activity/${actId}/review`, {
      action: 'APPROVED',
      reason: 'Approved for activity',
    }, adminToken);
    assert(appActRes.status === 200, 'Admin Approve Activity', appActRes);

    // ----------------------------------------------------
    // SECTION 2: ELIGIBILITY & SAFETY ENFORCEMENT
    // ----------------------------------------------------
    console.log('\n--- SECTION 2: Eligibility & Safety Enforcement ---');

    // 1. Unauthenticated Request Blocked
    const unauthRes = await request('POST', '/bookings', {
      inventoryType: 'HOTEL',
      inventoryId: hotelId,
      startDate: '2026-10-01',
      endDate: '2026-10-03',
    });
    assert(unauthRes.status === 401, 'Block Unauthenticated Booking Request (401)', unauthRes);

    // 2. Non-existent Inventory Rejected
    const nonExistentRes = await request('POST', '/bookings', {
      inventoryType: 'HOTEL',
      inventoryId: 'invalid_hotel_id_99999999999',
      startDate: '2026-10-01',
      endDate: '2026-10-03',
    }, customerAToken);
    assert(nonExistentRes.status === 404 || nonExistentRes.status === 400, 'Reject Non-existent Inventory (404/400)', nonExistentRes);

    // 3. Unapproved / Inactive Inventory Rejected
    // Create hotel and reject it via admin moderation
    const unapprovedHotel = await request('POST', '/supplier/hotels', {
      name: `Unapproved Lodge ${timestamp}`,
      destinationId: dwarka.id,
      pricePerNight: 1000.0,
    }, supplierToken);
    const unapprovedHotelData = unapprovedHotel.data?.data || unapprovedHotel.data;
    const unapprovedHotelId = unapprovedHotelData.id;

    // Reject via admin
    await request('PATCH', `/admin/inventory/hotel/${unapprovedHotelId}/review`, {
      action: 'REJECTED',
      reason: 'Safety compliance failure',
    }, adminToken);

    const bookingUnapprovedRes = await request('POST', '/bookings', {
      inventoryType: 'HOTEL',
      inventoryId: unapprovedHotelId,
      startDate: '2026-10-01',
      endDate: '2026-10-02',
    }, customerAToken);
    assert(bookingUnapprovedRes.status === 400, 'Reject Booking for Unapproved Inventory (400)', bookingUnapprovedRes);

    // 4. Suspended Supplier Inventory Rejected
    // Create another supplier and suspend it
    const tempSuppReg = await request('POST', '/suppliers/register', {
      email: `suspended_${timestamp}@test.com`,
      password: 'Supplier123!',
      companyName: `Suspended Supplier Co ${timestamp}`,
      phoneNumber: '9000000000',
    });
    const tempSuppToken = tempSuppReg.data?.token || tempSuppReg.data?.data?.token;
    const tempSuppId = tempSuppReg.data?.supplier?.id || tempSuppReg.data?.data?.supplier?.id;

    // Verify supplier
    await request('PATCH', `/admin/suppliers/${tempSuppId}/verification`, { verificationStatus: 'VERIFIED' }, adminToken);

    // Create hotel
    const tempHotel = await request('POST', '/supplier/hotels', {
      name: `Suspended Stay ${timestamp}`,
      destinationId: dwarka.id,
      pricePerNight: 2000.0,
    }, tempSuppToken);
    const tempHotelData = tempHotel.data?.data || tempHotel.data;
    const tempHotelId = tempHotelData.id;
    // Approve hotel
    await request('PATCH', `/admin/inventory/hotel/${tempHotelId}/review`, { action: 'APPROVED' }, adminToken);

    // Now suspend supplier
    await request('PATCH', `/admin/suppliers/${tempSuppId}/status`, { status: 'SUSPENDED' }, adminToken);

    // Attempt booking
    const bookingSuspendedRes = await request('POST', '/bookings', {
      inventoryType: 'HOTEL',
      inventoryId: tempHotelId,
      startDate: '2026-10-01',
      endDate: '2026-10-02',
    }, customerAToken);
    assert(bookingSuspendedRes.status === 400, 'Reject Booking for Suspended Supplier (400)', bookingSuspendedRes);

    // ----------------------------------------------------
    // SECTION 3: SUCCESSFUL BOOKING LIFECYCLE & PRICING SNAPSHOTS
    // ----------------------------------------------------
    console.log('\n--- SECTION 3: Booking Lifecycle & Price Snapshots ---');

    // 1. Create Hotel Booking (Customer A)
    const hotelBookingRes = await request('POST', '/bookings', {
      inventoryType: 'HOTEL',
      inventoryId: hotelId,
      startDate: '2026-10-10',
      endDate: '2026-10-13', // 3 nights
      quantity: 2, // 2 rooms
      adultCount: 4,
      childCount: 1,
      customerNotes: 'Require non-smoking rooms on higher floor.',
      // Intentionally pass fake prices to test server-side override
      unitPrice: 1.0,
      totalAmountInr: 1.0,
    }, customerAToken);

    assert(hotelBookingRes.status === 201 && hotelBookingRes.data.success, 'Create Hotel Booking', hotelBookingRes);
    const hotelBooking = hotelBookingRes.data.data;
    assert(hotelBooking.bookingReference && /^CF-2026-[A-Z0-9]{6}$/.test(hotelBooking.bookingReference), 'Booking Reference Pattern CF-2026-XXXXXX', hotelBooking.bookingReference);
    assert(hotelBooking.status === 'PENDING' || hotelBooking.status === 'CONFIRMED', 'Initial Status PENDING / CONFIRMED', hotelBooking.status);
    
    // Check price calculation: pricePerNight = 3500. 3 nights * 2 rooms = 6 units = 21,000 subtotal. 18% GST = 3,780. Total = 24,780.
    assert(Number(hotelBooking.unitPrice) === 3500, 'Server-Side Unit Price Snapshot (3500)', hotelBooking.unitPrice);
    assert(Number(hotelBooking.subtotal) === 21000, 'Server-Side Subtotal Calculation (21000)', hotelBooking.subtotal);
    assert(Number(hotelBooking.taxes) === 3780, 'Server-Side Taxes Calculation (3780)', hotelBooking.taxes);
    assert(Number(hotelBooking.totalAmountInr) === 24780, 'Server-Side Total Override Ignored Client Fake Price (24780)', hotelBooking.totalAmountInr);

    // 2. Create Restaurant Booking (Customer A)
    const restBookingRes = await request('POST', '/bookings', {
      inventoryType: 'RESTAURANT',
      inventoryId: restId,
      reservationTime: '2026-10-11T19:30:00.000Z',
      guestCount: 4,
      customerNotes: 'Window seating preferred.',
    }, customerAToken);

    assert(restBookingRes.status === 201 && restBookingRes.data.success, 'Create Restaurant Booking', restBookingRes);
    const restBooking = restBookingRes.data.data;
    assert(restBooking.bookingReference && /^CF-2026-[A-Z0-9]{6}$/.test(restBooking.bookingReference), 'Restaurant Reference Format', restBooking.bookingReference);
    // Average cost = 450. Quantity = 1 table/reservation. Subtotal = 450, 18% GST = 81, Total = 531.
    assert(Number(restBooking.unitPrice) === 450, 'Restaurant Unit Price Snapshot (450)', restBooking.unitPrice);
    assert(Number(restBooking.totalAmountInr) === 531, 'Restaurant Total Amount Calculation (531)', restBooking.totalAmountInr);

    // 3. Create Activity Booking (Customer A)
    const actBookingRes = await request('POST', '/bookings', {
      inventoryType: 'ACTIVITY',
      inventoryId: actId,
      startDate: '2026-10-12',
      quantity: 2, // 2 tickets
      adultCount: 2,
    }, customerAToken);

    assert(actBookingRes.status === 201 && actBookingRes.data.success, 'Create Activity Booking', actBookingRes);
    const actBooking = actBookingRes.data.data;
    // Price = 2200 * 2 = 4400 subtotal. 18% GST = 792. Total = 5192.
    assert(Number(actBooking.unitPrice) === 2200, 'Activity Unit Price Snapshot (2200)', actBooking.unitPrice);
    assert(Number(actBooking.totalAmountInr) === 5192, 'Activity Total Amount Calculation (5192)', actBooking.totalAmountInr);

    // ----------------------------------------------------
    // SECTION 4: IDEMPOTENCY SAFETY
    // ----------------------------------------------------
    console.log('\n--- SECTION 4: Idempotency Protection ---');

    const testIdempotencyKey = `CF-IDEMP-TEST-${timestamp}`;

    // First Call
    const idemp1Res = await request('POST', '/bookings', {
      inventoryType: 'HOTEL',
      inventoryId: hotelId,
      startDate: '2026-11-01',
      endDate: '2026-11-02',
      quantity: 1,
      idempotencyKey: testIdempotencyKey,
    }, customerAToken);

    assert(idemp1Res.status === 201 && idemp1Res.data.success, 'First Idempotent Booking Creation', idemp1Res);
    const idemp1Booking = idemp1Res.data.data;

    // Second Call (Re-submission)
    const idemp2Res = await request('POST', '/bookings', {
      inventoryType: 'HOTEL',
      inventoryId: hotelId,
      startDate: '2026-11-01',
      endDate: '2026-11-02',
      quantity: 1,
      idempotencyKey: testIdempotencyKey,
    }, customerAToken);

    assert(idemp2Res.status === 200 || idemp2Res.status === 201, 'Idempotent Re-submission Response Code (200/201)', idemp2Res);
    const idemp2Booking = idemp2Res.data.data;
    assert(idemp1Booking.id === idemp2Booking.id, 'Idempotency Returned Same Booking ID', { id1: idemp1Booking.id, id2: idemp2Booking.id });
    assert(idemp1Booking.bookingReference === idemp2Booking.bookingReference, 'Idempotency Returned Same Booking Reference', idemp1Booking.bookingReference);

    // ----------------------------------------------------
    // SECTION 5: CUSTOMER OWNERSHIP & IDOR PROTECTION
    // ----------------------------------------------------
    console.log('\n--- SECTION 5: Customer Ownership & IDOR Protection ---');

    // Customer A list bookings
    const custABookingsRes = await request('GET', '/bookings', null, customerAToken);
    assert(custABookingsRes.status === 200 && custABookingsRes.data.data.length >= 4, 'Customer A List Bookings (>= 4)', custABookingsRes.data.data.length);

    // Customer B list bookings (should be 0)
    const custBBookingsRes = await request('GET', '/bookings', null, customerBToken);
    assert(custBBookingsRes.status === 200 && custBBookingsRes.data.data.length === 0, 'Customer B List Bookings (0)', custBBookingsRes.data.data.length);

    // Customer A view specific booking detail
    const viewDetailRes = await request('GET', `/bookings/${hotelBooking.id}`, null, customerAToken);
    assert(viewDetailRes.status === 200 && viewDetailRes.data.data.id === hotelBooking.id, 'Customer A View Own Booking Detail', viewDetailRes);

    // Customer A view by reference
    const viewRefRes = await request('GET', `/bookings/reference/${hotelBooking.bookingReference}`, null, customerAToken);
    assert(viewRefRes.status === 200 && viewRefRes.data.data.bookingReference === hotelBooking.bookingReference, 'Customer A View Own Booking by Reference', viewRefRes);

    // IDOR TEST 1: Customer B attempt to view Customer A's booking by ID
    const idorViewRes = await request('GET', `/bookings/${hotelBooking.id}`, null, customerBToken);
    assert(idorViewRes.status === 403 || idorViewRes.status === 404, 'IDOR Protection: Customer B View Customer A Booking ID (403/404)', idorViewRes.status);

    // IDOR TEST 2: Customer B attempt to view Customer A's booking by Reference
    const idorRefRes = await request('GET', `/bookings/reference/${hotelBooking.bookingReference}`, null, customerBToken);
    assert(idorRefRes.status === 403 || idorRefRes.status === 404, 'IDOR Protection: Customer B View Customer A Booking Ref (403/404)', idorRefRes.status);

    // IDOR TEST 3: Customer B attempt to cancel Customer A's booking
    const idorCancelRes = await request('POST', `/bookings/${hotelBooking.id}/cancel`, {
      cancellationReason: 'Malicious cancellation attempt',
    }, customerBToken);
    assert(idorCancelRes.status === 403 || idorCancelRes.status === 404, 'IDOR Protection: Customer B Cancel Customer A Booking (403/404)', idorCancelRes.status);

    // ----------------------------------------------------
    // SECTION 6: STATE MACHINE & CANCELLATION WORKFLOW
    // ----------------------------------------------------
    console.log('\n--- SECTION 6: Controlled State Machine & Cancellation ---');

    // Customer A cancels own hotel booking
    const cancelRes = await request('POST', `/bookings/${hotelBooking.id}/cancel`, {
      cancellationReason: 'Change of personal travel itinerary plans.',
    }, customerAToken);

    assert(cancelRes.status === 200 && cancelRes.data.success, 'Customer A Cancel Own Booking', cancelRes);
    assert(cancelRes.data.data.status === 'CANCELLED', 'Status Transitioned to CANCELLED', cancelRes.data.data.status);
    assert(cancelRes.data.data.cancellationReason === 'Change of personal travel itinerary plans.', 'Recorded Cancellation Reason', cancelRes.data.data.cancellationReason);
    assert(cancelRes.data.data.cancelledAt !== null, 'Recorded CancelledAt Timestamp', cancelRes.data.data.cancelledAt);

    // Re-cancellation of already cancelled booking
    const recancelRes = await request('POST', `/bookings/${hotelBooking.id}/cancel`, {
      cancellationReason: 'Second cancel attempt',
    }, customerAToken);
    assert(recancelRes.status === 400, 'Block Re-cancellation of CANCELLED Booking (400)', recancelRes);

    // Verify booking state in list
    const updatedListRes = await request('GET', '/bookings', null, customerAToken);
    const cancelledInList = updatedListRes.data.data.find((b) => b.id === hotelBooking.id);
    assert(cancelledInList && cancelledInList.status === 'CANCELLED', 'Booking reflected as CANCELLED in My Bookings list', cancelledInList?.status);

    // ----------------------------------------------------
    // SECTION 7: SUPPLIER & ADMIN READ FOUNDATIONS
    // ----------------------------------------------------
    console.log('\n--- SECTION 7: Supplier & Admin Operational Views ---');

    // Supplier read bookings for their owned inventory
    const suppBookingsRes = await request('GET', '/supplier/bookings', null, supplierToken);
    assert(suppBookingsRes.status === 200 && suppBookingsRes.data.success, 'Supplier Read Inventory Bookings', suppBookingsRes);
    assert(suppBookingsRes.data.data.length >= 3, 'Supplier Receives Bookings for Owned Inventory', suppBookingsRes.data.data.length);
    const sampleSuppBooking = suppBookingsRes.data.data[0];
    assert(sampleSuppBooking.user && sampleSuppBooking.user.fullName, 'Supplier Booking Includes Customer User Profile', sampleSuppBooking.user);

    // Admin read operational bookings directory
    const adminBookingsRes = await request('GET', '/admin/bookings', null, adminToken);
    assert(adminBookingsRes.status === 200 && adminBookingsRes.data.success, 'Admin Read Operational Bookings Directory', adminBookingsRes);
    assert(adminBookingsRes.data.data.length >= 4, 'Admin Directory Returns System-Wide Bookings', adminBookingsRes.data.data.length);
    const sampleAdminBooking = adminBookingsRes.data.data[0];
    assert(sampleAdminBooking.supplier && (sampleAdminBooking.supplier.businessName || sampleAdminBooking.supplier.companyName), 'Admin Booking Includes Supplier Metadata', sampleAdminBooking.supplier);

    // ----------------------------------------------------
    // SUMMARY REPORT
    // ----------------------------------------------------
    console.log('\n====================================================');
    console.log(`TOTAL TESTS: ${totalTests}`);
    console.log(`PASSED: ${passedTests}`);
    console.log(`FAILED: ${totalTests - passedTests}`);
    console.log('====================================================');

    if (totalTests === passedTests) {
      console.log('\n🎉 ALL PHASE 3D BOOKING LIFECYCLE TESTS PASSED PERFECTLY!');
      process.exit(0);
    } else {
      console.error('\n❌ SOME TESTS FAILED.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal execution error:', err);
    process.exit(1);
  }
}

runTests();
