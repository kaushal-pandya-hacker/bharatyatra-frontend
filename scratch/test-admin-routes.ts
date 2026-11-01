import { NextRequest } from 'next/server';
import { GET as getMe } from '../app/api/v1/me/route';
import { POST as adminLogin } from '../app/api/v1/admin/login/route';
import { GET as adminDashboard } from '../app/api/v1/admin/dashboard/route';

async function runTests() {
  console.log('--- STARTING ADMIN & ME ROUTE TESTS ---');
  let passed = 0;
  let failed = 0;

  // Test 1: Unauthenticated GET /api/v1/me returns HTTP 401 (not 500!)
  {
    const req = new NextRequest('http://localhost:3000/api/v1/me', {
      method: 'GET',
    });
    const res = await getMe(req);
    const body = await res.json();
    if (res.status === 401 && body.success === false) {
      console.log('✅ TEST 1 PASSED: Unauthenticated GET /api/v1/me returns HTTP 401.');
      passed++;
    } else {
      console.error('❌ TEST 1 FAILED: Expected 401, got status', res.status, body);
      failed++;
    }
  }

  // Test 2: Expired / Invalid token GET /api/v1/me returns HTTP 401
  {
    const req = new NextRequest('http://localhost:3000/api/v1/me', {
      method: 'GET',
      headers: { Authorization: 'Bearer invalid-token-12345' },
    });
    const res = await getMe(req);
    const body = await res.json();
    if (res.status === 401 && body.success === false) {
      console.log('✅ TEST 2 PASSED: Invalid token GET /api/v1/me returns HTTP 401.');
      passed++;
    } else {
      console.error('❌ TEST 2 FAILED: Expected 401, got status', res.status, body);
      failed++;
    }
  }

  // Test 3: POST /api/v1/admin/login with invalid password returns HTTP 401
  {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@bharatyatra.com', password: 'WrongPassword' }),
    });
    const res = await adminLogin(req);
    const body = await res.json();
    if (res.status === 401 && body.success === false) {
      console.log('✅ TEST 3 PASSED: POST /api/v1/admin/login with bad password returns HTTP 401.');
      passed++;
    } else {
      console.error('❌ TEST 3 FAILED: Expected 401, got status', res.status, body);
      failed++;
    }
  }

  // Test 4: POST /api/v1/admin/login with correct credentials returns HTTP 200 + token
  let adminToken = '';
  {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@bharatyatra.com', password: 'AdminPassword123!' }),
    });
    const res = await adminLogin(req);
    const body = await res.json();
    if (res.status === 200 && body.success === true && body.data?.token && body.data?.user?.role === 'ADMIN') {
      adminToken = body.data.token;
      console.log('✅ TEST 4 PASSED: POST /api/v1/admin/login returns HTTP 200 with admin token.');
      passed++;
    } else {
      console.error('❌ TEST 4 FAILED: Expected 200 with admin token, got status', res.status, body);
      failed++;
    }
  }

  // Test 5: GET /api/v1/me with Admin token returns HTTP 200 and role ADMIN
  {
    const req = new NextRequest('http://localhost:3000/api/v1/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const res = await getMe(req);
    const body = await res.json();
    if (res.status === 200 && body.success === true && body.data?.role === 'ADMIN') {
      console.log('✅ TEST 5 PASSED: GET /api/v1/me with admin token returns HTTP 200 + ADMIN profile.');
      passed++;
    } else {
      console.error('❌ TEST 5 FAILED: Expected 200 + ADMIN profile, got status', res.status, body);
      failed++;
    }
  }

  // Test 6: GET /api/v1/admin/dashboard without token returns HTTP 401
  {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/dashboard', {
      method: 'GET',
    });
    const res = await adminDashboard(req);
    const body = await res.json();
    if (res.status === 401 && body.success === false) {
      console.log('✅ TEST 6 PASSED: GET /api/v1/admin/dashboard without auth returns HTTP 401.');
      passed++;
    } else {
      console.error('❌ TEST 6 FAILED: Expected 401, got status', res.status, body);
      failed++;
    }
  }

  // Test 7: GET /api/v1/admin/dashboard with admin token returns HTTP 200
  {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/dashboard', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const res = await adminDashboard(req);
    const body = await res.json();
    if (res.status === 200 && body.success === true && body.data?.suppliers) {
      console.log('✅ TEST 7 PASSED: GET /api/v1/admin/dashboard with admin token returns HTTP 200 with metrics.');
      passed++;
    } else {
      console.error('❌ TEST 7 FAILED: Expected 200 with metrics, got status', res.status, body);
      failed++;
    }
  }

  console.log(`\nTEST SUMMARY: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
