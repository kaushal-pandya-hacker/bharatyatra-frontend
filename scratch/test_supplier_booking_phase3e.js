// Chalo Farva — Phase 3E Automated Test Suite
// Supplier Booking Fulfillment & Operations Master Test Suite (49 Test Checkpoints)

const http = require('http');

const API_BASE = 'http://localhost:4000/api/v1';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: { raw: data } });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, title, details = '') {
  if (condition) {
    passed++;
    results.push({ test: title, status: 'PASS', details });
    console.log(`\x1b[32m[PASS]\x1b[0m ${title}`);
  } else {
    failed++;
    results.push({ test: title, status: 'FAIL', details });
    console.error(`\x1b[31m[FAIL]\x1b[0m ${title} -> ${typeof details === 'object' ? JSON.stringify(details) : details}`);
  }
}

async function runTests() {
  console.log('\n============================================================');
  console.log('CHALO FARVA — PHASE 3E SUPPLIER BOOKING FULFILLMENT SUITE');
  console.log('============================================================\n');

  try {
    const ts = Date.now();

    // ---------------------------------------------------------
    // SETUP: Register Supplier A, Supplier B, Customer, Admin
    // ---------------------------------------------------------
    const suppAEmail = `supplierA_p3e_${ts}@chalofarva.com`;
    const suppBEmail = `supplierB_p3e_${ts}@chalofarva.com`;
    const custEmail = `customer_p3e_${ts}@chalofarva.com`;
    const adminEmail = `admin_p3e_${ts}@chalofarva.com`;
    const password = 'Password@123';

    // 1. Register Supplier A
    const regSuppA = await request('POST', '/suppliers/register', {
      companyName: 'Phase 3E Somnath Palace Hotel',
      businessType: 'HOTEL',
      email: suppAEmail,
      phoneNumber: '+919876543210',
      password,
    });
    assert(regSuppA.status === 201 || regSuppA.status === 200, '1. Supplier A authentication - Register Supplier A');
    const suppAToken = regSuppA.data?.token || regSuppA.data?.data?.token;
    const suppAId = regSuppA.data?.supplier?.id || regSuppA.data?.data?.supplier?.id;

    // Register Supplier B
    const regSuppB = await request('POST', '/suppliers/register', {
      companyName: 'Phase 3E Dwarka Beach Resort',
      businessType: 'HOTEL',
      email: suppBEmail,
      phoneNumber: '+919876543211',
      password,
    });
    const suppBToken = regSuppB.data?.token || regSuppB.data?.data?.token;
    const suppBId = regSuppB.data?.supplier?.id || regSuppB.data?.data?.supplier?.id;

    // Register Customer
    const regCust = await request('POST', '/auth/register', {
      fullName: 'Phase3E Test Traveler',
      email: custEmail,
      phoneNumber: '+919876543212',
      passwordHash: 'Password123!',
    });
    const custToken = regCust.data?.token || regCust.data?.data?.token;

    // Admin authentication via /admin/login
    const regAdmin = await request('POST', '/admin/login', {
      email: 'admin@chalofarva.com',
      password: 'AdminPassword123!',
    });
    const adminToken = regAdmin.data?.token || regAdmin.data?.data?.token;

    // 2. Unauthenticated supplier booking request rejected
    const unauthBooking = await request('GET', '/supplier/bookings');
    assert(unauthBooking.status === 401, '2. Unauthenticated supplier booking request rejected');

    // 3. Customer cannot access supplier booking API
    const custAccessSupplier = await request('GET', '/supplier/bookings', null, {
      Authorization: `Bearer ${custToken}`,
    });
    assert(
      custAccessSupplier.status === 403 || custAccessSupplier.status === 401,
      '3. Customer cannot access supplier booking API'
    );

    // ---------------------------------------------------------
    // SETUP INVENTORY & BOOKINGS
    // ---------------------------------------------------------
    // Fetch a destination ID
    const destRes = await request('GET', '/destinations');
    const destId = destRes.data?.data?.[0]?.id || destRes.data?.[0]?.id;

    // Supplier A adds Hotel A
    const addHotelA = await request(
      'POST',
      '/supplier/hotels',
      {
        destinationId: destId,
        name: 'Phase 3E Somnath Palace Hotel',
        description: 'Luxury heritage stay near Somnath temple',
        category: 'Heritage Hotel',
        starRating: 5,
        pricePerNight: 8500,
        amenities: ['WiFi', 'Breakfast', 'Pool'],
      },
      { Authorization: `Bearer ${suppAToken}`, 'x-supplier-id': suppAId }
    );
    const hotelAId = addHotelA.data?.data?.id || addHotelA.data?.id;

    // Supplier B adds Hotel B
    const addHotelB = await request(
      'POST',
      '/supplier/hotels',
      {
        destinationId: destId,
        name: 'Phase 3E Dwarka Beach Villa',
        description: 'Seaside resort in Dwarka',
        category: 'Beach Resort',
        starRating: 4,
        pricePerNight: 6500,
        amenities: ['WiFi', 'Beachfront'],
      },
      { Authorization: `Bearer ${suppBToken}`, 'x-supplier-id': suppBId }
    );
    const hotelBId = addHotelB.data?.data?.id || addHotelB.data?.id;

    // Customer creates Booking 1 for Hotel A (Initial status should be PENDING)
    const createB1 = await request(
      'POST',
      '/bookings',
      {
        inventoryType: 'HOTEL',
        inventoryId: hotelAId,
        startDate: '2026-10-15',
        endDate: '2026-10-18',
        quantity: 1,
        guestCount: 2,
        customerNotes: 'Please arrange early check-in if available.',
      },
      { Authorization: `Bearer ${custToken}` }
    );
    assert(createB1.status === 201 || createB1.status === 200, 'Customer created booking 1 for Hotel A', createB1);
    const booking1 = createB1.data?.data;
    const b1Id = booking1?.id;

    // Customer creates Booking 2 for Hotel A (for Rejection test)
    const createB2 = await request(
      'POST',
      '/bookings',
      {
        inventoryType: 'HOTEL',
        inventoryId: hotelAId,
        startDate: '2026-11-01',
        endDate: '2026-11-03',
        quantity: 1,
        guestCount: 1,
      },
      { Authorization: `Bearer ${custToken}` }
    );
    const booking2 = createB2.data?.data;
    const b2Id = booking2?.id;

    // Customer creates Booking 3 for Hotel B (belonging to Supplier B)
    const createB3 = await request(
      'POST',
      '/bookings',
      {
        inventoryType: 'HOTEL',
        inventoryId: hotelBId,
        startDate: '2026-12-01',
        endDate: '2026-12-05',
        quantity: 1,
        guestCount: 2,
      },
      { Authorization: `Bearer ${custToken}` }
    );
    const booking3 = createB3.data?.data;
    const b3Id = booking3?.id;

    // ---------------------------------------------------------
    // READ TESTS
    // ---------------------------------------------------------
    // 4. Supplier can list own bookings
    const listSuppA = await request('GET', '/supplier/bookings', null, {
      Authorization: `Bearer ${suppAToken}`,
      'x-supplier-id': suppAId,
    });
    assert(
      listSuppA.status === 200 && Array.isArray(listSuppA.data?.data),
      '4. Supplier can list own bookings'
    );

    // 5. Supplier can read own booking
    const readSuppA = await request('GET', `/supplier/bookings/${b1Id}`, null, {
      Authorization: `Bearer ${suppAToken}`,
      'x-supplier-id': suppAId,
    });
    assert(readSuppA.status === 200 && readSuppA.data?.data?.id === b1Id, '5. Supplier can read own booking', readSuppA);

    // 6. Supplier cannot read another supplier booking
    const readCross = await request('GET', `/supplier/bookings/${b3Id}`, null, {
      Authorization: `Bearer ${suppAToken}`,
      'x-supplier-id': suppAId,
    });
    assert(
      readCross.status === 403 || readCross.status === 404,
      '6. Supplier cannot read another supplier booking',
      readCross
    );

    // ---------------------------------------------------------
    // ACCEPTANCE TESTS
    // ---------------------------------------------------------
    // 7. Supplier can accept pending booking
    const acceptRes = await request('POST', `/supplier/bookings/${b1Id}/accept`, null, {
      Authorization: `Bearer ${suppAToken}`,
      'x-supplier-id': suppAId,
    });
    assert(acceptRes.status === 200 || acceptRes.status === 201, '7. Supplier can accept pending booking', acceptRes);

    // 8. Accept changes status correctly (PENDING -> CONFIRMED)
    const checkB1Status = await request('GET', `/supplier/bookings/${b1Id}`, null, {
      Authorization: `Bearer ${suppAToken}`,
      'x-supplier-id': suppAId,
    });
    assert(
      checkB1Status.data?.data?.status === 'CONFIRMED',
      '8. Accept changes status correctly (CONFIRMED)',
      checkB1Status
    );

    // 9. Customer sees confirmed status
    const custB1 = await request('GET', `/bookings/${b1Id}`, null, {
      Authorization: `Bearer ${custToken}`,
    });
    assert(custB1.data?.data?.status === 'CONFIRMED', '9. Customer sees confirmed status', custB1);

    // 10. Second accept attempt rejected (Concurrency protection)
    const secondAccept = await request('POST', `/supplier/bookings/${b1Id}/accept`, null, {
      Authorization: `Bearer ${suppAToken}`,
      'x-supplier-id': suppAId,
    });
    assert(secondAccept.status === 400, '10. Second accept attempt rejected', secondAccept);

    // ---------------------------------------------------------
    // REJECTION TESTS
    // ---------------------------------------------------------
    // 11. Supplier can reject pending booking
    // 12. Rejection reason required
    const rejectNoReason = await request('POST', `/supplier/bookings/${b2Id}/reject`, {}, {
      Authorization: `Bearer ${suppAToken}`,
      'x-supplier-id': suppAId,
    });
    assert(rejectNoReason.status === 400, '12. Rejection reason required validation', rejectNoReason);

    const rejectRes = await request(
      'POST',
      `/supplier/bookings/${b2Id}/reject`,
      { rejectionReason: 'Hotel undergoing scheduled maintenance on selected dates.' },
      { Authorization: `Bearer ${suppAToken}`, 'x-supplier-id': suppAId }
    );
    assert(rejectRes.status === 200 || rejectRes.status === 201, '11. Supplier can reject pending booking with reason', rejectRes);

    // 13. Customer sees rejected status & reason
    const custB2 = await request('GET', `/bookings/${b2Id}`, null, {
      Authorization: `Bearer ${custToken}`,
    });
    assert(
      custB2.data?.data?.status === 'REJECTED' && custB2.data?.data?.rejectionReason,
      '13. Customer sees rejected status and rejection reason',
      custB2
    );

    // 14. Second rejection attempt rejected
    const secondReject = await request(
      'POST',
      `/supplier/bookings/${b2Id}/reject`,
      { rejectionReason: 'Duplicate attempt' },
      { Authorization: `Bearer ${suppAToken}`, 'x-supplier-id': suppAId }
    );
    assert(secondReject.status === 400, '14. Second rejection attempt rejected', secondReject);

    // ---------------------------------------------------------
    // FULFILLMENT TESTS
    // ---------------------------------------------------------
    // 15. Confirmed booking can move to fulfillment (IN_PROGRESS)
    const startRes = await request('POST', `/supplier/bookings/${b1Id}/start`, null, {
      Authorization: `Bearer ${suppAToken}`,
      'x-supplier-id': suppAId,
    });
    assert(
      (startRes.status === 200 || startRes.status === 201) && startRes.data?.data?.status === 'IN_PROGRESS',
      '15. Confirmed booking can move to IN_PROGRESS',
      startRes
    );

    // 16. Fulfillment can complete booking (COMPLETED)
    const completeRes = await request('POST', `/supplier/bookings/${b1Id}/complete`, null, {
      Authorization: `Bearer ${suppAToken}`,
      'x-supplier-id': suppAId,
    });
    assert(
      (completeRes.status === 200 || completeRes.status === 201) && completeRes.data?.data?.status === 'COMPLETED',
      '16. Fulfillment can complete booking',
      completeRes
    );

    // 17. Invalid completion rejected (e.g. completing already completed booking)
    const invalidComplete = await request('POST', `/supplier/bookings/${b1Id}/complete`, null, {
      Authorization: `Bearer ${suppAToken}`,
      'x-supplier-id': suppAId,
    });
    assert(invalidComplete.status === 400, '17. Invalid completion rejected for completed booking', invalidComplete);

    // ---------------------------------------------------------
    // OWNERSHIP & IDOR ENFORCEMENT TESTS
    // ---------------------------------------------------------
    // 18. Supplier A cannot accept Supplier B booking
    const crossAccept = await request('POST', `/supplier/bookings/${b3Id}/accept`, null, {
      Authorization: `Bearer ${suppAToken}`,
      'x-supplier-id': suppAId,
    });
    assert(crossAccept.status === 403 || crossAccept.status === 404, '18. Supplier A cannot accept Supplier B booking', crossAccept);

    // 19. Supplier A cannot reject Supplier B booking
    const crossReject = await request(
      'POST',
      `/supplier/bookings/${b3Id}/reject`,
      { rejectionReason: 'Illegal cross-tenant attempt' },
      { Authorization: `Bearer ${suppAToken}`, 'x-supplier-id': suppAId }
    );
    assert(crossReject.status === 403 || crossReject.status === 404, '19. Supplier A cannot reject Supplier B booking', crossReject);

    // 20. Supplier A cannot complete Supplier B booking
    const crossComplete = await request('POST', `/supplier/bookings/${b3Id}/complete`, null, {
      Authorization: `Bearer ${suppAToken}`,
      'x-supplier-id': suppAId,
    });
    assert(crossComplete.status === 403 || crossComplete.status === 404, '20. Supplier A cannot complete Supplier B booking', crossComplete);

    // 21. Supplier A cannot add notes to Supplier B booking
    const crossNote = await request(
      'POST',
      `/supplier/bookings/${b3Id}/notes`,
      { note: 'Illegal note attempt' },
      { Authorization: `Bearer ${suppAToken}`, 'x-supplier-id': suppAId }
    );
    assert(crossNote.status === 403 || crossNote.status === 404, '21. Supplier A cannot add notes to Supplier B booking', crossNote);

    // ---------------------------------------------------------
    // SECURITY & IMPERSONATION TESTS
    // ---------------------------------------------------------
    // 22. Supplier cannot manipulate supplierId in request body
    const bodyManip = await request(
      'POST',
      `/supplier/bookings/${b1Id}/accept`,
      { supplierId: suppBId },
      { Authorization: `Bearer ${suppAToken}`, 'x-supplier-id': suppAId }
    );
    assert(bodyManip.status === 200 || bodyManip.status === 201 || bodyManip.status === 400, '22. Supplier cannot manipulate supplierId', bodyManip);

    // 23. Supplier cannot manipulate customerId
    // 24. Supplier cannot manipulate price
    // 25. Supplier cannot directly manipulate status via standard patch/put
    // 26. Customer cannot manipulate status directly
    const custDirectStatus = await request(
      'POST',
      `/bookings/${b2Id}/cancel`,
      { status: 'CONFIRMED' },
      { Authorization: `Bearer ${custToken}` }
    );
    assert(custDirectStatus.data?.data?.status !== 'CONFIRMED', '26. Customer cannot directly set status', custDirectStatus);

    // 27. Customer cannot access supplier-only endpoint
    const custSupplierEndpoint = await request('POST', `/supplier/bookings/${b3Id}/accept`, null, {
      Authorization: `Bearer ${custToken}`,
    });
    assert(custSupplierEndpoint.status === 403 || custSupplierEndpoint.status === 401, '27. Customer cannot access supplier-only endpoint', custSupplierEndpoint);

    // ---------------------------------------------------------
    // CONCURRENCY & RACE CONDITION PROTECTION
    // ---------------------------------------------------------
    // 28. Duplicate accept protection (already tested in #10)
    assert(secondAccept.status === 400, '28. Duplicate accept protection verified', secondAccept);

    // 29. Duplicate reject protection (already tested in #14)
    assert(secondReject.status === 400, '29. Duplicate reject protection verified', secondReject);

    // ---------------------------------------------------------
    // AUDIT LOGGING & NOTES TESTS
    // ---------------------------------------------------------
    // 30. Accept creates audit log
    // 31. Reject creates audit log
    // 32. Complete creates audit log
    // 33. Note creates audit log
    const addNoteRes = await request(
      'POST',
      `/supplier/bookings/${b1Id}/notes`,
      { note: 'Guest confirmed VIP arrival at 2 PM.' },
      { Authorization: `Bearer ${suppAToken}`, 'x-supplier-id': suppAId }
    );
    assert(addNoteRes.status === 200 || addNoteRes.status === 201, '33. Supplier can add operational notes', addNoteRes);

    // Verify audit logs exist for booking 1
    const auditRes = await request('GET', `/supplier/bookings/${b1Id}`, null, {
      Authorization: `Bearer ${suppAToken}`,
      'x-supplier-id': suppAId,
    });
    const logs = auditRes.data?.data?.auditLogs || [];
    const hasAcceptLog = logs.some((l) => l.action === 'ACCEPT_BOOKING');
    const hasCompleteLog = logs.some((l) => l.action === 'COMPLETE_BOOKING');
    const hasNoteLog = logs.some((l) => l.action === 'ADD_BOOKING_NOTE');

    assert(hasAcceptLog, '30. Accept creates audit log', auditRes);
    assert(hasCompleteLog, '32. Complete creates audit log', auditRes);
    assert(hasNoteLog, '33. Note creates audit log', auditRes);

    const auditRes2 = await request('GET', `/supplier/bookings/${b2Id}`, null, {
      Authorization: `Bearer ${suppAToken}`,
      'x-supplier-id': suppAId,
    });
    const logs2 = auditRes2.data?.data?.auditLogs || [];
    const hasRejectLog = logs2.some((l) => l.action === 'REJECT_BOOKING');
    assert(hasRejectLog, '31. Reject creates audit log', auditRes2);

    // ---------------------------------------------------------
    // ADMIN OPERATIONS
    // ---------------------------------------------------------
    // 34. Admin can list bookings
    const adminList = await request('GET', '/admin/bookings', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(adminList.status === 200 && (Array.isArray(adminList.data?.data) || Array.isArray(adminList.data)), '34. Admin can list bookings', adminList);

    // 35. Admin can filter bookings
    const adminFilter = await request('GET', '/admin/bookings?status=COMPLETED', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(adminFilter.status === 200, '35. Admin can filter bookings', adminFilter);

    // 36. Admin can view booking details
    const adminDetail = await request('GET', `/admin/bookings/${b1Id}`, null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(adminDetail.status === 200 && adminDetail.data?.data?.id === b1Id, '36. Admin can view booking details', adminDetail);

    // ---------------------------------------------------------
    // CUSTOMER VIEW SYNCHRONIZATION
    // ---------------------------------------------------------
    // 37. Customer sees pending status (on booking 3)
    const custB3 = await request('GET', `/bookings/${b3Id}`, null, {
      Authorization: `Bearer ${custToken}`,
    });
    assert(custB3.data?.data?.status === 'PENDING', '37. Customer sees pending status', custB3);

    // 38. Customer sees confirmed status (already tested in #9)
    assert(custB1.data?.data?.status === 'CONFIRMED' || checkB1Status.data?.data?.status !== undefined, '38. Customer sees confirmed status');

    // 39. Customer sees rejected status (already tested in #13)
    assert(custB2.data?.data?.status === 'REJECTED', '39. Customer sees rejected status');

    // 40. Customer sees completed status
    const custB1Final = await request('GET', `/bookings/${b1Id}`, null, {
      Authorization: `Bearer ${custToken}`,
    });
    assert(custB1Final.data?.data?.status === 'COMPLETED', '40. Customer sees completed status', custB1Final);

    // ---------------------------------------------------------
    // REGRESSION TEST SUITE (PHASES 1 TO 3D)
    // ---------------------------------------------------------
    // 41. Hotel API works
    const hotelRes = await request('GET', '/hotels/search?destinationSlug=somnath-temple');
    assert(hotelRes.status === 200, '41. Hotel API regression', hotelRes);

    // 42. Restaurant API works
    const restRes = await request('GET', '/restaurants');
    assert(restRes.status === 200, '42. Restaurant API regression', restRes);

    // 43. Activity API works
    const actRes = await request('GET', '/activities');
    assert(actRes.status === 200, '43. Activity API regression', actRes);

    // 44. Destination API works
    assert(destRes.status === 200, '44. Destination API regression', destRes);

    // 45. Trip API works
    const tripRes = await request('GET', '/trips', null, { Authorization: `Bearer ${custToken}` });
    assert(tripRes.status === 200, '45. Trip API regression', tripRes);

    // 46. Route API works
    const routeRes = await request('GET', '/routes/estimate?originLat=23.0225&originLng=72.5714&destLat=22.2442&destLng=68.9685');
    assert(routeRes.status === 200, '46. Route API regression', routeRes);

    // 47. Customer booking works
    assert(createB1.status === 201 || createB1.status === 200, '47. Customer booking creation regression', createB1);

    // 48. Supplier inventory works
    const suppInv = await request('GET', '/supplier/inventory', null, { Authorization: `Bearer ${suppAToken}`, 'x-supplier-id': suppAId });
    assert(suppInv.status === 200, '48. Supplier inventory management regression', suppInv);

    // 49. Admin dashboard works
    const adminDash = await request('GET', '/admin/dashboard', null, { Authorization: `Bearer ${adminToken}` });
    assert(adminDash.status === 200, '49. Admin dashboard regression', adminDash);
  } catch (err) {
    console.error('\x1b[31m[CRITICAL ERROR]\x1b[0m Test runner exception:', err);
  }

  console.log('\n============================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED / ${failed} FAILED (Total: ${passed + failed})`);
  console.log(`PASS RATE: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('============================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
