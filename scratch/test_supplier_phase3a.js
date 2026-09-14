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

async function runSupplierPhase3aTests() {
  console.log('====================================================');
  console.log('CHALO FARVA — PHASE 3A SUPPLIER MARKETPLACE TEST SUITE');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const supplier1 = {
    companyName: `Lords Somnath Resort ${timestamp}`,
    businessType: 'HOTEL',
    email: `vendor1_${timestamp}@chalofarva.com`,
    password: 'Password@123',
    phoneNumber: '+919876543210',
    city: 'Somnath',
  };

  const supplier2 = {
    companyName: `GSRTC Express ${timestamp}`,
    businessType: 'BUS',
    email: `vendor2_${timestamp}@chalofarva.com`,
    password: 'Password@123',
    phoneNumber: '+919876543211',
    city: 'Ahmedabad',
  };

  let token1 = null;
  let token2 = null;
  let supplier1Id = null;
  let supplier2Id = null;
  let createdInventoryId = null;

  try {
    // TEST 1: Register Supplier 1
    const reg1Res = await httpRequest('POST', '/suppliers/register', supplier1);
    const pass1 = reg1Res.status === 201 && (reg1Res.body.token || reg1Res.body.data?.token);
    if (pass1) {
      token1 = reg1Res.body.token || reg1Res.body.data.token;
      supplier1Id = reg1Res.body.supplier?.id || reg1Res.body.data?.supplier?.id;
    }
    logTest(1, 'POST /suppliers/register - Supplier 1 Registration', pass1, `Status: ${reg1Res.status}`);

    // TEST 2: Duplicate Email Registration (409 Conflict)
    const regDupRes = await httpRequest('POST', '/suppliers/register', supplier1);
    const pass2 = regDupRes.status === 409;
    logTest(2, 'POST /suppliers/register - Duplicate Email Prevention (409)', pass2, `Status: ${regDupRes.status}`);

    // TEST 3: Login Supplier 1
    const login1Res = await httpRequest('POST', '/suppliers/login', {
      email: supplier1.email,
      password: supplier1.password,
    });
    const pass3 = login1Res.status === 201 && (login1Res.body.token || login1Res.body.data?.token);
    logTest(3, 'POST /suppliers/login - Supplier 1 Login & Token Issuance', pass3, `Status: ${login1Res.status}`);

    // TEST 4: Invalid Password Login (401 Unauthorized)
    const loginBadPass = await httpRequest('POST', '/suppliers/login', {
      email: supplier1.email,
      password: 'WrongPassword123',
    });
    const pass4 = loginBadPass.status === 401;
    logTest(4, 'POST /suppliers/login - Invalid Password Rejection (401)', pass4, `Status: ${loginBadPass.status}`);

    // TEST 5: Non-existent Account Login (401 Unauthorized)
    const loginNoAccount = await httpRequest('POST', '/suppliers/login', {
      email: `nonexistent_${timestamp}@chalofarva.com`,
      password: 'Password@123',
    });
    const pass5 = loginNoAccount.status === 401;
    logTest(5, 'POST /suppliers/login - Non-existent Email Rejection (401)', pass5, `Status: ${loginNoAccount.status}`);

    // TEST 6: Register Supplier 2
    const reg2Res = await httpRequest('POST', '/suppliers/register', supplier2);
    const pass6 = reg2Res.status === 201 && (reg2Res.body.token || reg2Res.body.data?.token);
    if (pass6) {
      token2 = reg2Res.body.token || reg2Res.body.data.token;
      supplier2Id = reg2Res.body.supplier?.id || reg2Res.body.data?.supplier?.id;
    }
    logTest(6, 'POST /suppliers/register - Supplier 2 Registration', pass6, `Status: ${reg2Res.status}`);

    // TEST 7: GET /suppliers/me - Authenticated Profile Retrieval
    const profile1Res = await httpRequest('GET', '/suppliers/me', null, token1);
    const pass7 = profile1Res.status === 200 && profile1Res.body.data?.companyName;
    logTest(7, 'GET /suppliers/me - Authenticated Supplier 1 Profile Retrieval', pass7, `Company: ${profile1Res.body.data?.companyName}`);

    // TEST 8: GET /suppliers/me - Unauthorized Access (No Token -> 401)
    const profileNoToken = await httpRequest('GET', '/suppliers/me');
    const pass8 = profileNoToken.status === 401;
    logTest(8, 'GET /suppliers/me - Unauthorized Access Rejection (401)', pass8, `Status: ${profileNoToken.status}`);

    // TEST 9: PATCH /suppliers/me - Update Profile
    const patchRes = await httpRequest('PATCH', '/suppliers/me', { companyName: `${supplier1.companyName} Updated` }, token1);
    const pass9 = patchRes.status === 200 && patchRes.body.data?.companyName?.includes('Updated');
    logTest(9, 'PATCH /suppliers/me - Supplier Profile Update', pass9, `Updated: ${patchRes.body.data?.companyName}`);

    // TEST 10: GET /suppliers/dashboard - Supplier 1 Dashboard Telemetry
    const dash1Res = await httpRequest('GET', '/suppliers/dashboard', null, token1);
    const pass10 = dash1Res.status === 200 && dash1Res.body.data?.activeInventoryCount !== undefined;
    logTest(10, 'GET /suppliers/dashboard - Supplier 1 Dashboard Telemetry', pass10, `Active Inventory: ${dash1Res.body.data?.activeInventoryCount}`);

    // TEST 11: GET /suppliers/inventory - Supplier 1 Initial Inventory
    const inv1Res = await httpRequest('GET', '/suppliers/inventory', null, token1);
    const pass11 = inv1Res.status === 200 && Array.isArray(inv1Res.body.data);
    const initialInv1Count = inv1Res.body.data ? inv1Res.body.data.length : 0;
    logTest(11, 'GET /suppliers/inventory - Supplier 1 Inventory Retrieval', pass11, `Items: ${initialInv1Count}`);

    // TEST 12: GET /suppliers/inventory - Supplier 2 Isolated Inventory
    const inv2Res = await httpRequest('GET', '/suppliers/inventory', null, token2);
    const pass12 = inv2Res.status === 200 && Array.isArray(inv2Res.body.data);
    const initialInv2Count = inv2Res.body.data ? inv2Res.body.data.length : 0;
    logTest(12, 'GET /suppliers/inventory - Supplier 2 Isolated Inventory Retrieval', pass12, `Items: ${initialInv2Count}`);

    // TEST 13: POST /suppliers/inventory - Add Item for Supplier 1
    const addInvRes = await httpRequest('POST', '/suppliers/inventory', {
      title: 'Deluxe Sea View Suite',
      category: 'HOTEL',
      basePriceInr: 4500,
      availableCapacity: 12,
    }, token1);
    const pass13 = addInvRes.status === 201 && addInvRes.body.data?.inventoryId;
    if (pass13) {
      createdInventoryId = addInvRes.body.data.inventoryId;
    }
    logTest(13, 'POST /suppliers/inventory - Add New Item for Supplier 1', pass13, `ID: ${createdInventoryId}`);

    // TEST 14: Tenant Data Isolation Verification
    const postInv1Res = await httpRequest('GET', '/suppliers/inventory', null, token1);
    const postInv2Res = await httpRequest('GET', '/suppliers/inventory', null, token2);
    const pass14 = (postInv1Res.body.data.length === initialInv1Count + 1) && (postInv2Res.body.data.length === initialInv2Count);
    logTest(14, 'Tenant Isolation - Supplier 1 Inventory Incremented & Supplier 2 Untouched', pass14, `Supplier 1: ${postInv1Res.body.data?.length}, Supplier 2: ${postInv2Res.body.data?.length}`);

    // TEST 15: PATCH /suppliers/inventory/:id - Price Update
    const patchPriceRes = await httpRequest('PATCH', `/suppliers/inventory/${createdInventoryId}`, { basePriceInr: 5200 }, token1);
    const pass15 = patchPriceRes.status === 200 && patchPriceRes.body.data?.basePriceInr === 5200;
    logTest(15, 'PATCH /suppliers/inventory/:id - Price Update to ₹5200', pass15, `Updated Price: ${patchPriceRes.body.data?.basePriceInr}`);

    // TEST 16: IDOR Protection Verification - Tenant 2 mutating Tenant 1 item rejected
    const idorPatchRes = await httpRequest('PATCH', `/suppliers/inventory/${createdInventoryId}`, { basePriceInr: 100 }, token2);
    const pass16 = idorPatchRes.status === 404 || idorPatchRes.status === 403;
    logTest(16, 'IDOR Protection - Tenant 2 Cannot Mutate Tenant 1 Inventory (404/403)', pass16, `Status: ${idorPatchRes.status}`);

  } catch (err) {
    console.error('Fatal test runner error:', err);
  }

  console.log('\n====================================================');
  console.log(`PHASE 3A SUPPLIER TEST RESULT SUMMARY:`);
  console.log(`PASS: ${testsPassed} / 16`);
  console.log(`FAIL: ${testsFailed} / 16`);
  console.log('====================================================');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runSupplierPhase3aTests();
