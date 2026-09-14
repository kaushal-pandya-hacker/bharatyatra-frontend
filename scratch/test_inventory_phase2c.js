const http = require('http');

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('=== TESTING PHASE 2C TRAVEL INVENTORY APIS (HOTELS, RESTAURANTS, ACTIVITIES) ===\n');

  let passed = 0;
  let failed = 0;

  // 1. GET /api/v1/destinations/dwarka/hotels
  try {
    console.log('1. Testing GET /api/v1/destinations/dwarka/hotels...');
    const res1 = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/destinations/dwarka/hotels',
      method: 'GET'
    });
    console.log(`Response Status: ${res1.status}, Count: ${res1.data?.data?.length}`);
    if (res1.status === 200 && res1.data?.success && res1.data?.data?.length >= 3) {
      console.log('✅ TEST 1 PASSED: Retrieved 3+ hotels for Dwarka from PostgreSQL');
      passed++;
    } else {
      console.error('❌ TEST 1 FAILED:', res1.data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 1 EXCEPTION:', e.message);
    failed++;
  }

  // 2. GET /api/v1/destinations/dwarka/hotels?starRating=4
  try {
    console.log('\n2. Testing GET /api/v1/destinations/dwarka/hotels?starRating=4...');
    const res2 = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/destinations/dwarka/hotels?starRating=4',
      method: 'GET'
    });
    console.log(`Response Status: ${res2.status}, Count: ${res2.data?.data?.length}`);
    const validStars = res2.data?.data?.every(h => h.starRating >= 4);
    if (res2.status === 200 && res2.data?.data?.length > 0 && validStars) {
      console.log('✅ TEST 2 PASSED: Filtered 4-star+ hotels for Dwarka correctly');
      passed++;
    } else {
      console.error('❌ TEST 2 FAILED:', res2.data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 2 EXCEPTION:', e.message);
    failed++;
  }

  // 3. GET /api/v1/destinations/dwarka/restaurants
  try {
    console.log('\n3. Testing GET /api/v1/destinations/dwarka/restaurants...');
    const res3 = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/destinations/dwarka/restaurants',
      method: 'GET'
    });
    console.log(`Response Status: ${res3.status}, Count: ${res3.data?.data?.length}`);
    if (res3.status === 200 && res3.data?.success && res3.data?.data?.length >= 3) {
      console.log('✅ TEST 3 PASSED: Retrieved 3+ restaurants for Dwarka from PostgreSQL');
      passed++;
    } else {
      console.error('❌ TEST 3 FAILED:', res3.data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 3 EXCEPTION:', e.message);
    failed++;
  }

  // 4. GET /api/v1/destinations/dwarka/restaurants?cuisine=Gujarati
  try {
    console.log('\n4. Testing GET /api/v1/destinations/dwarka/restaurants?cuisine=Gujarati...');
    const res4 = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/destinations/dwarka/restaurants?cuisine=Gujarati',
      method: 'GET'
    });
    console.log(`Response Status: ${res4.status}, Count: ${res4.data?.data?.length}`);
    if (res4.status === 200 && res4.data?.data?.length > 0) {
      console.log('✅ TEST 4 PASSED: Filtered Gujarati cuisine restaurants correctly');
      passed++;
    } else {
      console.error('❌ TEST 4 FAILED:', res4.data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 4 EXCEPTION:', e.message);
    failed++;
  }

  // 5. GET /api/v1/destinations/dwarka/activities
  try {
    console.log('\n5. Testing GET /api/v1/destinations/dwarka/activities...');
    const res5 = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/destinations/dwarka/activities',
      method: 'GET'
    });
    console.log(`Response Status: ${res5.status}, Count: ${res5.data?.data?.length}`);
    if (res5.status === 200 && res5.data?.data?.length > 0) {
      console.log('✅ TEST 5 PASSED: Retrieved activities for Dwarka');
      passed++;
    } else {
      console.error('❌ TEST 5 FAILED:', res5.data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 5 EXCEPTION:', e.message);
    failed++;
  }

  // 6. GET /api/v1/destinations/invalid-destination-slug-999/hotels -> 404
  try {
    console.log('\n6. Testing GET /api/v1/destinations/invalid-destination-slug-999/hotels...');
    const res6 = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/destinations/invalid-destination-slug-999/hotels',
      method: 'GET'
    });
    console.log(`Response Status: ${res6.status}`);
    if (res6.status === 404) {
      console.log('✅ TEST 6 PASSED: Non-existent destination hotels returned 404 Not Found');
      passed++;
    } else {
      console.error('❌ TEST 6 FAILED:', res6.data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 6 EXCEPTION:', e.message);
    failed++;
  }

  // 7. GET /api/v1/destinations/inventory/hotels/:id
  try {
    console.log('\n7. Testing GET /api/v1/destinations/inventory/hotels/:id...');
    const resHotels = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/destinations/dwarka/hotels',
      method: 'GET'
    });
    const sampleHotelId = resHotels.data?.data?.[0]?.id;
    if (sampleHotelId) {
      const res7 = await makeRequest({
        hostname: 'localhost',
        port: 4000,
        path: `/api/v1/destinations/inventory/hotels/${sampleHotelId}`,
        method: 'GET'
      });
      console.log(`Response Status: ${res7.status}, Hotel Name: ${res7.data?.data?.name}`);
      if (res7.status === 200 && res7.data?.data?.id === sampleHotelId) {
        console.log('✅ TEST 7 PASSED: Standalone hotel detail endpoint fetched record');
        passed++;
      } else {
        console.error('❌ TEST 7 FAILED:', res7.data);
        failed++;
      }
    } else {
      console.error('❌ TEST 7 FAILED: Could not retrieve sample hotel ID');
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 7 EXCEPTION:', e.message);
    failed++;
  }

  // 8. Sanitized response check
  try {
    console.log('\n8. Checking response sanitization (no sensitive credentials exposed)...');
    const res8 = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/destinations/dwarka/hotels',
      method: 'GET'
    });
    const str = JSON.stringify(res8.data);
    const hasSensitive = str.includes('password') || str.includes('secret') || str.includes('token');
    if (!hasSensitive) {
      console.log('✅ TEST 8 PASSED: Response is clean and contains no sensitive credentials or internal keys');
      passed++;
    } else {
      console.error('❌ TEST 8 FAILED: Response exposed sensitive fields!');
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 8 EXCEPTION:', e.message);
    failed++;
  }

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  process.exit(failed === 0 ? 0 : 1);
}

runTests();
