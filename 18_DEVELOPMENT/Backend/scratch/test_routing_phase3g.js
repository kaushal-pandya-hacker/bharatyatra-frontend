/**
 * CHALO FARVA — PHASE 3G TEST SUITE
 * Live Routing, Provider Abstraction, Fallback, Matrix, Optimization, Caching & Security
 */

const BASE_URL = 'http://localhost:4000/api/v1';

async function runTests() {
  console.log('====================================================');
  console.log('   CHALO FARVA — PHASE 3G TEST SUITE');
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

  // Ahmedabad, Vadodara, Statue of Unity, Anand coordinates
  const ahmedabad = { latitude: 23.0225, longitude: 72.5714 };
  const vadodara = { latitude: 22.3072, longitude: 73.1812 };
  const statueOfUnity = { latitude: 21.838, longitude: 73.7191 };
  const anand = { latitude: 22.5645, longitude: 72.9289 };

  // --- 1. Coordinate Validation Tests ---
  console.log('--- 1. Geographic Coordinate Validation Tests ---');
  try {
    const invalidLatRes = await fetch(`${BASE_URL}/routes/distance?originLat=999&originLng=72.57&destLat=22.3&destLng=73.18`);
    assert(invalidLatRes.status === 400, 'Rejects latitude out of bounds (> 90)');

    const invalidLngRes = await fetch(`${BASE_URL}/routes/distance?originLat=23.02&originLng=-999&destLat=22.3&destLng=73.18`);
    assert(invalidLngRes.status === 400, 'Rejects longitude out of bounds (< -180)');

    const nanRes = await fetch(`${BASE_URL}/routes/distance?originLat=abc&originLng=72.57&destLat=22.3&destLng=73.18`);
    assert(nanRes.status === 400, 'Rejects non-numeric NaN coordinate query params');
  } catch (err) {
    console.error('Validation test error:', err.message);
    failed++;
  }

  // --- 2. Distance API & Geometry Tests ---
  console.log('\n--- 2. Distance API & Geometry Tests ---');
  try {
    const distRes = await fetch(
      `${BASE_URL}/routes/distance?originLat=${ahmedabad.latitude}&originLng=${ahmedabad.longitude}&destLat=${vadodara.latitude}&destLng=${vadodara.longitude}&includeGeometry=true`
    );
    const distData = await distRes.json();

    assert(distRes.status === 200, 'Distance endpoint returns HTTP 200 OK');
    assert(typeof distData.distanceKm === 'number' && distData.distanceKm > 80 && distData.distanceKm < 150, `Calculates reasonable road distance (${distData.distanceKm} km)`);
    assert(typeof distData.estimatedDurationMinutes === 'number' && distData.estimatedDurationMinutes > 0, `Calculates travel duration (${distData.estimatedDurationMinutes} mins)`);
    assert(typeof distData.estimated === 'boolean', `Includes estimated boolean flag (estimated: ${distData.estimated})`);
    assert(typeof distData.provider === 'string' && distData.provider.length > 0, `Includes provider metadata (${distData.provider})`);
    assert(Array.isArray(distData.geometry) && distData.geometry.length >= 2, `Returns route polyline geometry (${distData.geometry?.length} coordinates)`);
    assert(Array.isArray(distData.legs) && distData.legs.length > 0, 'Returns leg breakdown');
  } catch (err) {
    console.error('Distance API test error:', err.message);
    failed++;
  }

  // --- 3. Route Estimation API Tests ---
  console.log('\n--- 3. Route Estimation API Tests ---');
  try {
    const estRes = await fetch(
      `${BASE_URL}/routes/estimate?originLat=${ahmedabad.latitude}&originLng=${ahmedabad.longitude}&destLat=${statueOfUnity.latitude}&destLng=${statueOfUnity.longitude}&mode=driving&includeGeometry=true`
    );
    const estData = await estRes.json();

    assert(estRes.status === 200, 'Estimate endpoint returns HTTP 200 OK');
    assert(estData.distanceKm > 150, `Calculates Ahmedabad to Statue of Unity distance (${estData.distanceKm} km)`);
    assert(estData.estimatedDurationMinutes > 100, `Calculates travel duration (${estData.estimatedDurationMinutes} mins)`);
  } catch (err) {
    console.error('Estimate API test error:', err.message);
    failed++;
  }

  // --- 4. Multi-Stop Route Optimization Tests ---
  console.log('\n--- 4. Multi-Stop Route Optimization & Modes Tests ---');
  try {
    const stopsPayload = {
      origin: ahmedabad,
      stops: [
        { id: 'statue', title: 'Statue of Unity', ...statueOfUnity },
        { id: 'vadodara', title: 'Vadodara City', ...vadodara },
        { id: 'anand', title: 'Anand Dairy', ...anand },
      ],
      mode: 'driving',
      optimizationMode: 'fixed_start',
      includeGeometry: true,
    };

    const optRes = await fetch(`${BASE_URL}/routes/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stopsPayload),
    });
    const optData = await optRes.json();

    assert(optRes.status === 200, 'Route optimization returns HTTP 200 OK');
    assert(Array.isArray(optData.orderedStops) && optData.orderedStops.length === 3, 'Optimizes and returns all 3 intermediate stops');
    assert(optData.totalDistanceKm > 0, `Returns total route distance (${optData.totalDistanceKm} km)`);
    assert(optData.totalDurationMinutes > 0, `Returns total travel time (${optData.totalDurationMinutes} mins)`);
    assert(Array.isArray(optData.legs) && optData.legs.length === 3, 'Includes individual leg breakdown');
    assert(Array.isArray(optData.geometry), 'Includes route geometry polyline');
    assert(typeof optData.estimated === 'boolean', `Includes fallback estimated flag (${optData.estimated})`);

    // Verify fixed_end mode
    const fixedEndPayload = {
      ...stopsPayload,
      destination: ahmedabad,
      optimizationMode: 'fixed_start_and_end',
    };
    const fixedEndRes = await fetch(`${BASE_URL}/routes/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fixedEndPayload),
    });
    const fixedEndData = await fixedEndRes.json();
    assert(fixedEndRes.status === 200, 'Optimization with fixed_start_and_end mode returns HTTP 200 OK');
    assert(fixedEndData.legs.length === 4, 'Includes return leg to fixed end destination');
  } catch (err) {
    console.error('Optimization test error:', err.message);
    failed++;
  }

  // --- 5. Routing Matrix API Tests ---
  console.log('\n--- 5. Routing Distance & Duration Matrix Tests ---');
  try {
    const matrixPayload = {
      origins: [ahmedabad, vadodara],
      destinations: [statueOfUnity, anand],
      mode: 'driving',
    };

    const matrixRes = await fetch(`${BASE_URL}/routes/matrix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matrixPayload),
    });
    const matrixData = await matrixRes.json();

    assert(matrixRes.status === 200, 'Distance matrix returns HTTP 200 OK');
    assert(Array.isArray(matrixData.distances) && matrixData.distances.length === 2, 'Returns 2x2 distance matrix rows');
    assert(Array.isArray(matrixData.durations) && matrixData.durations.length === 2, 'Returns 2x2 duration matrix rows');
    assert(matrixData.distances[0].length === 2, 'Each row contains 2 destination distances');
  } catch (err) {
    console.error('Matrix test error:', err.message);
    failed++;
  }

  // --- 6. Caching & Coordinate Normalization Tests ---
  console.log('\n--- 6. Redis Route Caching & Key Normalization Tests ---');
  try {
    // Call distance with slightly different float precision
    const origin1 = { latitude: 23.0225001, longitude: 72.5714002 };
    const dest1 = { latitude: 22.3072004, longitude: 73.1812001 };

    const firstCall = await fetch(
      `${BASE_URL}/routes/distance?originLat=${origin1.latitude}&originLng=${origin1.longitude}&destLat=${dest1.latitude}&destLng=${dest1.longitude}`
    );
    const firstData = await firstCall.json();

    const secondCall = await fetch(
      `${BASE_URL}/routes/distance?originLat=23.0225009&originLng=72.5714008&destLat=22.3072001&destLng=73.1812009`
    );
    const secondData = await secondCall.json();

    assert(secondCall.status === 200, 'Cached route call returns HTTP 200 OK');
    assert(secondData.distanceKm === firstData.distanceKm, 'Normalized coordinate key hits cache cleanly');
  } catch (err) {
    console.error('Caching test error:', err.message);
    failed++;
  }

  // --- 7. Security & Waypoint Limits Tests ---
  console.log('\n--- 7. Security & Waypoint Limits Tests ---');
  try {
    // Excessive waypoints (> 50)
    const waypoints51 = Array.from({ length: 51 }, (_, i) => ({
      id: `stop-${i}`,
      title: `Stop ${i}`,
      latitude: 23.0 + i * 0.01,
      longitude: 72.5 + i * 0.01,
    }));

    const excessiveRes = await fetch(`${BASE_URL}/routes/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: ahmedabad, stops: waypoints51 }),
    });

    assert(excessiveRes.status === 400, 'Rejects route optimization payload exceeding 50 stop limit');
  } catch (err) {
    console.error('Security test error:', err.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`   PHASE 3G TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
