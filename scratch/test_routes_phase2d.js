const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runPhase2DTests() {
  console.log('\n=== TESTING PHASE 2D MAPS, ROUTING & GEOGRAPHIC INTELLIGENCE APIS ===\n');

  let passed = 0;
  let failed = 0;

  // Helper to extract data regardless of wrapper
  const getData = (resData) => (resData && resData.data ? resData.data : resData);

  // 1. GET /api/v1/routes/distance (Valid points)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/routes/distance?originLat=23.0225&originLng=72.5714&destLat=22.2442&destLng=68.9685',
      method: 'GET',
    });

    const d = getData(res.data);
    if (res.status === 200 && d && d.approxRoadDistanceKm > 0) {
      console.log(`1. GET /api/v1/routes/distance (Ahmedabad -> Dwarka) -> PASS (Status ${res.status}, Distance: ${d.approxRoadDistanceKm} km)`);
      passed++;
    } else {
      console.error(`1. GET /api/v1/routes/distance -> FAIL (Status ${res.status})`, res.data);
      failed++;
    }
  } catch (err) {
    console.error(`1. GET /api/v1/routes/distance -> ERROR:`, err.message);
    failed++;
  }

  // 2. GET /api/v1/routes/estimate (Valid route estimate)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/routes/estimate?originLat=23.0225&originLng=72.5714&destLat=22.2442&destLng=68.9685&mode=driving',
      method: 'GET',
    });

    const d = getData(res.data);
    if (res.status === 200 && d && d.estimatedDurationMinutes > 0) {
      console.log(`2. GET /api/v1/routes/estimate -> PASS (Status ${res.status}, Est Duration: ${d.estimatedDurationMinutes} mins)`);
      passed++;
    } else {
      console.error(`2. GET /api/v1/routes/estimate -> FAIL (Status ${res.status})`, res.data);
      failed++;
    }
  } catch (err) {
    console.error(`2. GET /api/v1/routes/estimate -> ERROR:`, err.message);
    failed++;
  }

  // 3. POST /api/v1/routes/optimize (Multi-stop TSP route optimization)
  try {
    const payload = {
      origin: { latitude: 22.2442, longitude: 68.9685 }, // Dwarka Center
      stops: [
        { id: 'stop-1', title: 'Bet Dwarka', category: 'ATTRACTION', latitude: 22.4578, longitude: 69.1123 },
        { id: 'stop-2', title: 'Dwarkadhish Temple', category: 'ATTRACTION', latitude: 22.2378, longitude: 68.9678 },
        { id: 'stop-3', title: 'Gomti Ghat', category: 'ATTRACTION', latitude: 22.2411, longitude: 68.9685 },
        { id: 'stop-4', title: 'Shreenathji Dining Hall', category: 'RESTAURANT', latitude: 22.2450, longitude: 68.9700 },
      ],
      mode: 'driving',
    };

    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/v1/routes/optimize',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      payload,
    );

    const d = getData(res.data);
    if (res.status === 200 && d && d.orderedStops && d.orderedStops.length === 4) {
      console.log(`3. POST /api/v1/routes/optimize -> PASS (Status ${res.status}, Total Road Distance: ${d.totalDistanceKm} km, Legs: ${d.legs.length})`);
      passed++;
    } else {
      console.error(`3. POST /api/v1/routes/optimize -> FAIL (Status ${res.status})`, res.data);
      failed++;
    }
  } catch (err) {
    console.error(`3. POST /api/v1/routes/optimize -> ERROR:`, err.message);
    failed++;
  }

  // 4. Invalid Latitude validation
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/routes/distance?originLat=999&originLng=72.5714&destLat=22.2442&destLng=68.9685',
      method: 'GET',
    });

    if (res.status === 400) {
      console.log(`4. GET /api/v1/routes/distance (Invalid Lat 999) -> PASS (Status 400 Bad Request correctly returned)`);
      passed++;
    } else {
      console.error(`4. GET /api/v1/routes/distance (Invalid Lat) -> FAIL (Expected 400, got ${res.status})`);
      failed++;
    }
  } catch (err) {
    console.error(`4. Invalid Lat Test -> ERROR:`, err.message);
    failed++;
  }

  // 5. Invalid Longitude validation
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/routes/distance?originLat=23.0225&originLng=-999&destLat=22.2442&destLng=68.9685',
      method: 'GET',
    });

    if (res.status === 400) {
      console.log(`5. GET /api/v1/routes/distance (Invalid Lng -999) -> PASS (Status 400 Bad Request correctly returned)`);
      passed++;
    } else {
      console.error(`5. GET /api/v1/routes/distance (Invalid Lng) -> FAIL (Expected 400, got ${res.status})`);
      failed++;
    }
  } catch (err) {
    console.error(`5. Invalid Lng Test -> ERROR:`, err.message);
    failed++;
  }

  // 6. Missing stops in optimize payload
  try {
    const payload = {
      origin: { latitude: 22.2442, longitude: 68.9685 },
      stops: [],
    };

    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/v1/routes/optimize',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      payload,
    );

    if (res.status === 400) {
      console.log(`6. POST /api/v1/routes/optimize (Empty Stops) -> PASS (Status 400 Bad Request correctly returned)`);
      passed++;
    } else {
      console.error(`6. POST /api/v1/routes/optimize (Empty Stops) -> FAIL (Expected 400, got ${res.status})`);
      failed++;
    }
  } catch (err) {
    console.error(`6. Empty Stops Test -> ERROR:`, err.message);
    failed++;
  }

  // 7. Excessive stops (>50) in optimize payload
  try {
    const stopsArray = [];
    for (let i = 0; i < 55; i++) {
      stopsArray.push({ id: `stop-${i}`, title: `Stop ${i}`, latitude: 22.2 + i * 0.001, longitude: 68.9 + i * 0.001 });
    }

    const payload = {
      origin: { latitude: 22.2442, longitude: 68.9685 },
      stops: stopsArray,
    };

    const res = await makeRequest(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/v1/routes/optimize',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      payload,
    );

    if (res.status === 400) {
      console.log(`7. POST /api/v1/routes/optimize (Excessive 55 Stops) -> PASS (Status 400 Bad Request correctly returned)`);
      passed++;
    } else {
      console.error(`7. POST /api/v1/routes/optimize (Excessive Stops) -> FAIL (Expected 400, got ${res.status})`);
      failed++;
    }
  } catch (err) {
    console.error(`7. Excessive Stops Test -> ERROR:`, err.message);
    failed++;
  }

  // 8. Disclaimer & provider metadata verification
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/routes/distance?originLat=23.0225&originLng=72.5714&destLat=22.2442&destLng=68.9685',
      method: 'GET',
    });

    const d = getData(res.data);
    if (d && d.disclaimer && d.disclaimer.includes('approx. road distance')) {
      console.log(`8. Check Routing Transparency & Disclaimer -> PASS ("${d.disclaimer}")`);
      passed++;
    } else {
      console.error(`8. Check Routing Transparency -> FAIL`, res.data);
      failed++;
    }
  } catch (err) {
    console.error(`8. Disclaimer Test -> ERROR:`, err.message);
    failed++;
  }

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runPhase2DTests();
