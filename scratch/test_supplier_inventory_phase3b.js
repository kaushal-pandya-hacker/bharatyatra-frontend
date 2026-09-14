const http = require('http');

const API_BASE = 'http://localhost:4000/api/v1';

let testsPassed = 0;
let testsFailed = 0;

function logTest(num, title, passed, detail = '') {
  if (passed) {
    testsPassed++;
    console.log(`[PASS] Test ${num}: ${title} ${detail}`);
  } else {
    testsFailed++;
    console.error(`[FAIL] Test ${num}: ${title} - ${detail}`);
  }
}

function httpRequest(method, path, body = null, token = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: reqHeaders,
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => (responseBody += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runSupplierInventoryPhase3bTests() {
  console.log('====================================================');
  console.log('CHALO FARVA — PHASE 3B SUPPLIER INVENTORY TEST SUITE');
  console.log('====================================================\n');

  const timestamp = Date.now();
  let tokenA = null;
  let tokenB = null;
  let destinationId = null;
  let destinationSlug = 'dwarka';

  let hotelAId = null;
  let restaurantAId = null;
  let activityAId = null;

  try {
    // Retrieve sample destination ID
    const destRes = await httpRequest('GET', '/destinations');
    if (destRes.body.data && destRes.body.data.length > 0) {
      destinationId = destRes.body.data[0].id;
      destinationSlug = destRes.body.data[0].slug;
    }

    // Register & Login Supplier A
    const regARes = await httpRequest('POST', '/suppliers/register', {
      companyName: `Somnath Beach Resort ${timestamp}`,
      businessType: 'HOTEL',
      email: `suppA_${timestamp}@chalofarva.com`,
      password: 'Password@123',
    });
    tokenA = regARes.body.token || regARes.body.data?.token;

    // Register & Login Supplier B
    const regBRes = await httpRequest('POST', '/suppliers/register', {
      companyName: `Dwarka Heritage Stays ${timestamp}`,
      businessType: 'HOTEL',
      email: `suppB_${timestamp}@chalofarva.com`,
      password: 'Password@123',
    });
    tokenB = regBRes.body.token || regBRes.body.data?.token;

    // ----------------------------------------------------
    // SUPPLIER AUTH (1-2)
    // ----------------------------------------------------
    const pass1 = !!tokenA && !!tokenB;
    logTest(1, 'Supplier Login & Token Issuance', pass1, `Token A & B generated`);

    const meRes = await httpRequest('GET', '/suppliers/me', null, tokenA);
    const pass2 = meRes.status === 200 && meRes.body.data?.companyName?.includes('Somnath Beach');
    logTest(2, 'Supplier Authentication Check (GET /suppliers/me)', pass2, `Company: ${meRes.body.data?.companyName}`);

    // ----------------------------------------------------
    // HOTELS (3-7)
    // ----------------------------------------------------
    const createHotelRes = await httpRequest('POST', '/supplier/hotels', {
      destinationId,
      name: `Grand Somnath Palace ${timestamp}`,
      description: 'Luxury sea view hotel near temple',
      address: 'Somnath Temple Road',
      category: 'Resort',
      starRating: 4,
      pricePerNight: 4800,
      status: 'ACTIVE',
    }, tokenA);
    const pass3 = createHotelRes.status === 201 && createHotelRes.body.data?.id;
    if (pass3) hotelAId = createHotelRes.body.data.id;
    logTest(3, 'Create Supplier Hotel (POST /supplier/hotels)', pass3, `Hotel ID: ${hotelAId}`);

    const getHotelRes = await httpRequest('GET', `/supplier/hotels/${hotelAId}`, null, tokenA);
    const pass4 = getHotelRes.status === 200 && getHotelRes.body.data?.name?.includes('Grand Somnath');
    logTest(4, 'Read Own Hotel (GET /supplier/hotels/:id)', pass4, `Name: ${getHotelRes.body.data?.name}`);

    const updateHotelRes = await httpRequest('PATCH', `/supplier/hotels/${hotelAId}`, {
      pricePerNight: 5500,
      name: `Grand Somnath Palace Premium ${timestamp}`,
    }, tokenA);
    const pass5 = updateHotelRes.status === 200 && Number(updateHotelRes.body.data?.pricePerNight) === 5500;
    logTest(5, 'Update Own Hotel (PATCH /supplier/hotels/:id)', pass5, `New Price: ₹${updateHotelRes.body.data?.pricePerNight}`);

    const deactHotelRes = await httpRequest('DELETE', `/supplier/hotels/${hotelAId}`, null, tokenA);
    const pass6 = deactHotelRes.status === 200 && deactHotelRes.body.data?.status === 'INACTIVE';
    logTest(6, 'Deactivate Own Hotel (DELETE /supplier/hotels/:id)', pass6, `Status: ${deactHotelRes.body.data?.status}`);

    const reactHotelRes = await httpRequest('PATCH', `/supplier/hotels/${hotelAId}`, { status: 'ACTIVE' }, tokenA);
    const pass7 = reactHotelRes.status === 200 && reactHotelRes.body.data?.status === 'ACTIVE';
    logTest(7, 'Reactivate Own Hotel (PATCH /supplier/hotels/:id status=ACTIVE)', pass7, `Status: ${reactHotelRes.body.data?.status}`);

    // ----------------------------------------------------
    // RESTAURANTS (8-12)
    // ----------------------------------------------------
    const createRestRes = await httpRequest('POST', '/supplier/restaurants', {
      destinationId,
      name: `Kathiyawadi Thali House ${timestamp}`,
      cuisineType: 'Gujarati Kathiyawadi',
      averageCost: 350,
      status: 'ACTIVE',
    }, tokenA);
    const pass8 = createRestRes.status === 201 && createRestRes.body.data?.id;
    if (pass8) restaurantAId = createRestRes.body.data.id;
    logTest(8, 'Create Supplier Restaurant (POST /supplier/restaurants)', pass8, `Rest ID: ${restaurantAId}`);

    const getRestRes = await httpRequest('GET', `/supplier/restaurants/${restaurantAId}`, null, tokenA);
    const pass9 = getRestRes.status === 200 && getRestRes.body.data?.name?.includes('Kathiyawadi Thali');
    logTest(9, 'Read Own Restaurant (GET /supplier/restaurants/:id)', pass9, `Name: ${getRestRes.body.data?.name}`);

    const updateRestRes = await httpRequest('PATCH', `/supplier/restaurants/${restaurantAId}`, { averageCost: 400 }, tokenA);
    const pass10 = updateRestRes.status === 200 && Number(updateRestRes.body.data?.averageCost) === 400;
    logTest(10, 'Update Own Restaurant (PATCH /supplier/restaurants/:id)', pass10, `Cost: ₹${updateRestRes.body.data?.averageCost}`);

    const deactRestRes = await httpRequest('DELETE', `/supplier/restaurants/${restaurantAId}`, null, tokenA);
    const pass11 = deactRestRes.status === 200 && deactRestRes.body.data?.status === 'INACTIVE';
    logTest(11, 'Deactivate Own Restaurant (DELETE /supplier/restaurants/:id)', pass11, `Status: ${deactRestRes.body.data?.status}`);

    const reactRestRes = await httpRequest('PATCH', `/supplier/restaurants/${restaurantAId}`, { status: 'ACTIVE' }, tokenA);
    const pass12 = reactRestRes.status === 200 && reactRestRes.body.data?.status === 'ACTIVE';
    logTest(12, 'Reactivate Own Restaurant (PATCH /supplier/restaurants/:id)', pass12, `Status: ${reactRestRes.body.data?.status}`);

    // ----------------------------------------------------
    // ACTIVITIES (13-17)
    // ----------------------------------------------------
    const createActRes = await httpRequest('POST', '/supplier/activities', {
      destinationId,
      title: `Dwarka Sunset Boat Ride ${timestamp}`,
      category: 'Water Sports',
      priceInr: 950,
      durationMinutes: 90,
      status: 'ACTIVE',
    }, tokenA);
    const pass13 = createActRes.status === 201 && createActRes.body.data?.id;
    if (pass13) activityAId = createActRes.body.data.id;
    logTest(13, 'Create Supplier Activity (POST /supplier/activities)', pass13, `Act ID: ${activityAId}`);

    const getActRes = await httpRequest('GET', `/supplier/activities/${activityAId}`, null, tokenA);
    const pass14 = getActRes.status === 200 && getActRes.body.data?.title?.includes('Sunset Boat');
    logTest(14, 'Read Own Activity (GET /supplier/activities/:id)', pass14, `Title: ${getActRes.body.data?.title}`);

    const updateActRes = await httpRequest('PATCH', `/supplier/activities/${activityAId}`, { priceInr: 1100 }, tokenA);
    const pass15 = updateActRes.status === 200 && Number(updateActRes.body.data?.priceInr) === 1100;
    logTest(15, 'Update Own Activity (PATCH /supplier/activities/:id)', pass15, `Price: ₹${updateActRes.body.data?.priceInr}`);

    const deactActRes = await httpRequest('DELETE', `/supplier/activities/${activityAId}`, null, tokenA);
    const pass16 = deactActRes.status === 200 && deactActRes.body.data?.status === 'INACTIVE';
    logTest(16, 'Deactivate Own Activity (DELETE /supplier/activities/:id)', pass16, `Status: ${deactActRes.body.data?.status}`);

    const reactActRes = await httpRequest('PATCH', `/supplier/activities/${activityAId}`, { status: 'ACTIVE' }, tokenA);
    const pass17 = reactActRes.status === 200 && reactActRes.body.data?.status === 'ACTIVE';
    logTest(17, 'Reactivate Own Activity (PATCH /supplier/activities/:id)', pass17, `Status: ${reactActRes.body.data?.status}`);

    // ----------------------------------------------------
    // SECURITY & IDOR PROTECTION (18-24)
    // ----------------------------------------------------
    const sec18 = await httpRequest('GET', `/supplier/hotels/${hotelAId}`, null, tokenB);
    const pass18 = sec18.status === 404 || sec18.status === 403;
    logTest(18, 'IDOR Protection: Supplier B cannot read Supplier A Hotel (404/403)', pass18, `Status: ${sec18.status}`);

    const sec19 = await httpRequest('PATCH', `/supplier/hotels/${hotelAId}`, { pricePerNight: 100 }, tokenB);
    const pass19 = sec19.status === 404 || sec19.status === 403;
    logTest(19, 'IDOR Protection: Supplier B cannot update Supplier A Hotel (404/403)', pass19, `Status: ${sec19.status}`);

    const sec20 = await httpRequest('DELETE', `/supplier/hotels/${hotelAId}`, null, tokenB);
    const pass20 = sec20.status === 404 || sec20.status === 403;
    logTest(20, 'IDOR Protection: Supplier B cannot delete Supplier A Hotel (404/403)', pass20, `Status: ${sec20.status}`);

    const sec21 = await httpRequest('GET', `/supplier/restaurants/${restaurantAId}`, null, tokenB);
    const pass21 = sec21.status === 404 || sec21.status === 403;
    logTest(21, 'IDOR Protection: Supplier B cannot read Supplier A Restaurant (404/403)', pass21, `Status: ${sec21.status}`);

    const sec22 = await httpRequest('PATCH', `/supplier/restaurants/${restaurantAId}`, { averageCost: 10 }, tokenB);
    const pass22 = sec22.status === 404 || sec22.status === 403;
    logTest(22, 'IDOR Protection: Supplier B cannot update Supplier A Restaurant (404/403)', pass22, `Status: ${sec22.status}`);

    const sec23 = await httpRequest('GET', `/supplier/activities/${activityAId}`, null, tokenB);
    const pass23 = sec23.status === 404 || sec23.status === 403;
    logTest(23, 'IDOR Protection: Supplier B cannot read Supplier A Activity (404/403)', pass23, `Status: ${sec23.status}`);

    const sec24 = await httpRequest('PATCH', `/supplier/activities/${activityAId}`, { priceInr: 10 }, tokenB);
    const pass24 = sec24.status === 404 || sec24.status === 403;
    logTest(24, 'IDOR Protection: Supplier B cannot update Supplier A Activity (404/403)', pass24, `Status: ${sec24.status}`);

    // ----------------------------------------------------
    // INPUT DTO VALIDATION (25-28)
    // ----------------------------------------------------
    const val25 = await httpRequest('POST', '/supplier/hotels', {
      destinationId,
      name: 'Invalid Lat Hotel',
      latitude: 999.0, // Invalid lat > 90
      pricePerNight: 2000,
    }, tokenA);
    const pass25 = val25.status === 400;
    logTest(25, 'Input Validation: Invalid latitude 999 rejected (400)', pass25, `Status: ${val25.status}`);

    const val26 = await httpRequest('POST', '/supplier/hotels', {
      destinationId,
      // Missing name
      pricePerNight: 2000,
    }, tokenA);
    const pass26 = val26.status === 400;
    logTest(26, 'Input Validation: Missing required name rejected (400)', pass26, `Status: ${val26.status}`);

    const val27 = await httpRequest('POST', '/supplier/hotels', {
      destinationId,
      name: 'Negative Price Hotel',
      pricePerNight: -500, // Invalid negative price
    }, tokenA);
    const pass27 = val27.status === 400;
    logTest(27, 'Input Validation: Negative price -500 rejected (400)', pass27, `Status: ${val27.status}`);

    const val28 = await httpRequest('GET', '/supplier/hotels/00000000-0000-0000-0000-000000000000', null, tokenA);
    const pass28 = val28.status === 404;
    logTest(28, 'Input Validation: Non-existent UUID hotel returned 404 Not Found', pass28, `Status: ${val28.status}`);

    // ----------------------------------------------------
    // CUSTOMER INTEGRATION & REGRESSION (29-34)
    // ----------------------------------------------------
    const custHotelRes = await httpRequest('GET', `/destinations/${destinationSlug}/hotels`);
    const activeHotelFound = custHotelRes.body.data?.some(h => h.id === hotelAId);
    const pass29 = custHotelRes.status === 200 && activeHotelFound;
    logTest(29, 'Customer Integration: Active supplier hotel retrieved by customer API', pass29, `Found: ${activeHotelFound}`);

    // Deactivate hotel & verify removal from customer API
    await httpRequest('DELETE', `/supplier/hotels/${hotelAId}`, null, tokenA);
    const custHotelDeactRes = await httpRequest('GET', `/destinations/${destinationSlug}/hotels`);
    const deactHotelFound = custHotelDeactRes.body.data?.some(h => h.id === hotelAId);
    const pass30 = custHotelDeactRes.status === 200 && !deactHotelFound;
    logTest(30, 'Customer Integration: Deactivated hotel filtered out of customer API', pass30, `Found: ${deactHotelFound}`);

    const custRestRes = await httpRequest('GET', `/destinations/${destinationSlug}/restaurants`);
    const activeRestFound = custRestRes.body.data?.some(r => r.id === restaurantAId);
    const pass31 = custRestRes.status === 200 && activeRestFound;
    logTest(31, 'Customer Integration: Active supplier restaurant retrieved by customer API', pass31, `Found: ${activeRestFound}`);

    const custActRes = await httpRequest('GET', `/destinations/${destinationSlug}/activities`);
    const activeActFound = custActRes.body.data?.some(a => a.id === activityAId);
    const pass32 = custActRes.status === 200 && activeActFound;
    logTest(32, 'Customer Integration: Active supplier activity retrieved by customer API', pass32, `Found: ${activeActFound}`);

    const custDestRes = await httpRequest('GET', '/destinations');
    const pass33 = custDestRes.status === 200 && custDestRes.body.data?.length > 0;
    logTest(33, 'Customer Regression: Destination API functional', pass33, `Count: ${custDestRes.body.data?.length}`);

    const routeRes = await httpRequest('GET', '/routes/distance?originLat=23.0225&originLng=72.5714&destLat=22.2442&destLng=68.9685');
    const pass34 = routeRes.status === 200 && routeRes.body.data?.distanceKm > 0;
    logTest(34, 'Customer Regression: Route API functional', pass34, `Distance: ${routeRes.body.data?.distanceKm} km`);

  } catch (err) {
    console.error('Fatal test runner error:', err);
  }

  console.log('\n====================================================');
  console.log(`PHASE 3B SUPPLIER INVENTORY TEST RESULT SUMMARY:`);
  console.log(`PASS: ${testsPassed} / 34`);
  console.log(`FAIL: ${testsFailed} / 34`);
  console.log('====================================================');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runSupplierInventoryPhase3bTests();
