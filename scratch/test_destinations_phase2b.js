const http = require('http');

function makeRequest(options, postData = null) {
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
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== TESTING PHASE 2B DESTINATION DATA FOUNDATION APIS ===\n');

  let passed = 0;
  let failed = 0;

  // 1. GET /api/v1/destinations
  try {
    console.log('1. Testing GET /api/v1/destinations...');
    const res1 = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/destinations',
      method: 'GET'
    });
    console.log(`Response Status: ${res1.status}, Count: ${res1.data?.data?.length}`);
    if (res1.status === 200 && res1.data?.success && res1.data?.data?.length >= 20) {
      console.log('✅ TEST 1 PASSED: Retrieved 20+ real Gujarat destinations from PostgreSQL');
      passed++;
    } else {
      console.error('❌ TEST 1 FAILED:', res1.data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 1 EXCEPTION:', e.message);
    failed++;
  }

  // 2. GET /api/v1/destinations?search=dwarka
  try {
    console.log('\n2. Testing GET /api/v1/destinations?search=dwarka...');
    const res2 = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/destinations?search=dwarka',
      method: 'GET'
    });
    console.log(`Response Status: ${res2.status}, Matches: ${res2.data?.data?.length}`);
    const foundDwarka = res2.data?.data?.some(d => d.slug === 'dwarka' || d.name.toLowerCase().includes('dwarka'));
    if (res2.status === 200 && foundDwarka) {
      console.log('✅ TEST 2 PASSED: Search query "dwarka" matched Dwarka destination');
      passed++;
    } else {
      console.error('❌ TEST 2 FAILED:', res2.data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 2 EXCEPTION:', e.message);
    failed++;
  }

  // 3. GET /api/v1/destinations?region=Saurashtra
  try {
    console.log('\n3. Testing GET /api/v1/destinations?region=Saurashtra...');
    const res3 = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/destinations?region=Saurashtra',
      method: 'GET'
    });
    console.log(`Response Status: ${res3.status}, Count: ${res3.data?.data?.length}`);
    const allSaurashtra = res3.data?.data?.every(d => d.region === 'Saurashtra');
    if (res3.status === 200 && res3.data?.data?.length > 0 && allSaurashtra) {
      console.log('✅ TEST 3 PASSED: Region filter "Saurashtra" returned only Saurashtra destinations');
      passed++;
    } else {
      console.error('❌ TEST 3 FAILED:', res3.data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 3 EXCEPTION:', e.message);
    failed++;
  }

  // 4. GET /api/v1/destinations/dwarka
  try {
    console.log('\n4. Testing GET /api/v1/destinations/dwarka...');
    const res4 = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/destinations/dwarka',
      method: 'GET'
    });
    console.log(`Response Status: ${res4.status}, Name: ${res4.data?.data?.name}, Attractions: ${res4.data?.data?.attractions?.length}`);
    if (res4.status === 200 && res4.data?.data?.slug === 'dwarka' && res4.data?.data?.attractions?.length > 0) {
      console.log('✅ TEST 4 PASSED: Single destination detail fetched with relational attractions');
      passed++;
    } else {
      console.error('❌ TEST 4 FAILED:', res4.data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 4 EXCEPTION:', e.message);
    failed++;
  }

  // 5. GET /api/v1/destinations/dwarka/attractions
  try {
    console.log('\n5. Testing GET /api/v1/destinations/dwarka/attractions...');
    const res5 = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/destinations/dwarka/attractions',
      method: 'GET'
    });
    console.log(`Response Status: ${res5.status}, Count: ${res5.data?.data?.length}`);
    if (res5.status === 200 && res5.data?.data?.length > 0) {
      console.log('✅ TEST 5 PASSED: Destination attractions endpoint returned list');
      passed++;
    } else {
      console.error('❌ TEST 5 FAILED:', res5.data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 5 EXCEPTION:', e.message);
    failed++;
  }

  // 6. GET /api/v1/destinations/dwarka/activities
  try {
    console.log('\n6. Testing GET /api/v1/destinations/dwarka/activities...');
    const res6 = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/destinations/dwarka/activities',
      method: 'GET'
    });
    console.log(`Response Status: ${res6.status}, Count: ${res6.data?.data?.length}`);
    if (res6.status === 200 && res6.data?.data?.length > 0) {
      console.log('✅ TEST 6 PASSED: Destination activities endpoint returned list');
      passed++;
    } else {
      console.error('❌ TEST 6 FAILED:', res6.data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 6 EXCEPTION:', e.message);
    failed++;
  }

  // 7. GET /api/v1/destinations/invalid-destination-slug-999
  try {
    console.log('\n7. Testing GET /api/v1/destinations/invalid-destination-slug-999...');
    const res7 = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/destinations/invalid-destination-slug-999',
      method: 'GET'
    });
    console.log(`Response Status: ${res7.status}`);
    if (res7.status === 404) {
      console.log('✅ TEST 7 PASSED: Non-existent destination returned 404 Not Found');
      passed++;
    } else {
      console.error('❌ TEST 7 FAILED:', res7.data);
      failed++;
    }
  } catch (e) {
    console.error('❌ TEST 7 EXCEPTION:', e.message);
    failed++;
  }

  // 8. Sanitized response check
  try {
    console.log('\n8. Checking response sanitization (no sensitive fields)...');
    const res8 = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/destinations/dwarka',
      method: 'GET'
    });
    const str = JSON.stringify(res8.data);
    const hasPassword = str.includes('password') || str.includes('secret') || str.includes('token');
    if (!hasPassword) {
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
