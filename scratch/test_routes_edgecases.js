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

async function runEdgeCaseTests() {
  console.log('\n=== TESTING PHASE 2D ROUTING EDGE-CASES ===\n');

  let passed = 0;
  let failed = 0;

  const getData = (resData) => (resData && resData.data ? resData.data : resData);

  // Edge-Case 1: Same origin and destination (Zero distance)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/routes/distance?originLat=23.0225&originLng=72.5714&destLat=23.0225&destLng=72.5714',
      method: 'GET',
    });

    const d = getData(res.data);
    if (res.status === 200 && d && d.approxRoadDistanceKm === 0 && d.straightLineDistanceKm === 0) {
      console.log(`1. Same Origin/Destination -> PASS (Distance is 0.0 km)`);
      passed++;
    } else {
      console.error(`1. Same Origin/Destination -> FAIL (Status ${res.status})`, res.data);
      failed++;
    }
  } catch (err) {
    console.error(`1. Same Origin/Destination -> ERROR:`, err.message);
    failed++;
  }

  // Edge-Case 2: Single Stop Optimization
  try {
    const payload = {
      origin: { latitude: 22.2442, longitude: 68.9685 },
      stops: [
        { id: 'single-stop', title: 'Dwarkadhish Temple', category: 'ATTRACTION', latitude: 22.2378, longitude: 68.9678 },
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
    if (res.status === 200 && d && d.orderedStops && d.orderedStops.length === 1 && d.legs.length === 1) {
      console.log(`2. Single Stop Optimization -> PASS (Status 200, 1 stop ordered, Leg Distance: ${d.legs[0].distanceKm} km)`);
      passed++;
    } else {
      console.error(`2. Single Stop Optimization -> FAIL (Status ${res.status})`, res.data);
      failed++;
    }
  } catch (err) {
    console.error(`2. Single Stop Optimization -> ERROR:`, err.message);
    failed++;
  }

  // Edge-Case 3: Duplicate Coordinates in Stop List
  try {
    const payload = {
      origin: { latitude: 22.2442, longitude: 68.9685 },
      stops: [
        { id: 'stop-a', title: 'Location A', category: 'ATTRACTION', latitude: 22.2378, longitude: 68.9678 },
        { id: 'stop-b', title: 'Location B (Duplicate Coords)', category: 'RESTAURANT', latitude: 22.2378, longitude: 68.9678 },
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
    if (res.status === 200 && d && d.orderedStops && d.orderedStops.length === 2) {
      console.log(`3. Duplicate Coordinates -> PASS (Status 200, handles 0-distance legs cleanly)`);
      passed++;
    } else {
      console.error(`3. Duplicate Coordinates -> FAIL (Status ${res.status})`, res.data);
      failed++;
    }
  } catch (err) {
    console.error(`3. Duplicate Coordinates -> ERROR:`, err.message);
    failed++;
  }

  // Edge-Case 4: Extreme Boundary Coordinates (-90, -180 and 90, 180)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/routes/distance?originLat=-90&originLng=-180&destLat=90&destLng=180',
      method: 'GET',
    });

    const d = getData(res.data);
    if (res.status === 200 && d && d.approxRoadDistanceKm > 0) {
      console.log(`4. Extreme Global Coordinates (-90,-180 to 90,180) -> PASS (Distance: ${d.approxRoadDistanceKm} km)`);
      passed++;
    } else {
      console.error(`4. Extreme Global Coordinates -> FAIL (Status ${res.status})`, res.data);
      failed++;
    }
  } catch (err) {
    console.error(`4. Extreme Global Coordinates -> ERROR:`, err.message);
    failed++;
  }

  // Edge-Case 5: NaN / Non-numeric coordinate string input
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/routes/distance?originLat=abc&originLng=72.5714&destLat=22.2442&destLng=68.9685',
      method: 'GET',
    });

    if (res.status === 400) {
      console.log(`5. Non-numeric Coordinate String -> PASS (Status 400 Bad Request)`);
      passed++;
    } else {
      console.error(`5. Non-numeric Coordinate String -> FAIL (Expected 400, got ${res.status})`);
      failed++;
    }
  } catch (err) {
    console.error(`5. Non-numeric String Test -> ERROR:`, err.message);
    failed++;
  }

  console.log(`\n=== EDGE-CASE RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runEdgeCaseTests();
