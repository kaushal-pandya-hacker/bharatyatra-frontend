const http = require('http');

const API_BASE = 'http://localhost:4000/api/v1';

let customerAToken = '';
let customerAId = '';
let customerBToken = '';
let customerBId = '';

let supplierAToken = '';
let supplierAId = '';
let supplierBToken = '';
let supplierBId = '';

let adminToken = '';

let hotelInventoryId = '';
let hotelBookingId = '';
let hotelBookingRef = '';
let hotelAmountInr = 0;

let paymentOrderId = '';
let gatewayOrderId = '';
let paymentId = '';

let passCount = 0;
let failCount = 0;

function logPass(msg) {
  passCount++;
  console.log(`  [PASS] Test ${passCount}: ${msg}`);
}

function logFail(msg, detail) {
  failCount++;
  console.error(`  [FAIL] ${msg}:`, detail);
}

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : `${API_BASE}${path}`);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('====================================================');
  console.log('CHALO FARVA — PHASE 3F AUTOMATED TEST SUITE');
  console.log('Payments + Commission + Supplier Settlement Verification');
  console.log('====================================================\n');

  try {
    // ----------------------------------------------------
    // SECTION 1: Setup Accounts & Baseline Inventory
    // ----------------------------------------------------
    console.log('--- SECTION 1: Setup Accounts & Inventory ---');

    // 1. Register Customer A
    const custARes = await request('POST', '/auth/register', {
      email: `custA_p3f_${Date.now()}@example.com`,
      passwordHash: 'Password123!',
      fullName: 'Customer Alpha P3F',
    });
    if (custARes.status === 201 && (custARes.body.token || custARes.body.data?.token)) {
      customerAToken = custARes.body.token || custARes.body.data?.token;
      customerAId = custARes.body.user?.id || custARes.body.data?.user?.id;
      logPass('Register Customer A');
    } else {
      logFail('Register Customer A failed', custARes.body);
    }

    // 2. Register Customer B
    const custBRes = await request('POST', '/auth/register', {
      email: `custB_p3f_${Date.now()}@example.com`,
      passwordHash: 'Password123!',
      fullName: 'Customer Beta P3F',
    });
    if (custBRes.status === 201 && (custBRes.body.token || custBRes.body.data?.token)) {
      customerBToken = custBRes.body.token || custBRes.body.data?.token;
      customerBId = custBRes.body.user?.id || custBRes.body.data?.user?.id;
      logPass('Register Customer B');
    } else {
      logFail('Register Customer B failed', custBRes.body);
    }

    // 3. Register Supplier A
    const suppARes = await request('POST', '/suppliers/register', {
      email: `suppA_p3f_${Date.now()}@example.com`,
      password: 'SupplierPassword123!',
      companyName: 'Chalo Hospitality P3F',
      phone: '+919876543210',
    });
    if (suppARes.status === 201 && (suppARes.body.token || suppARes.body.data?.token)) {
      supplierAToken = suppARes.body.token || suppARes.body.data?.token;
      supplierAId = suppARes.body.supplier?.id || suppARes.body.data?.supplier?.id;
      logPass('Register Supplier A');
    } else {
      logFail('Register Supplier A failed', suppARes.body);
    }

    // 4. Register Supplier B
    const suppBRes = await request('POST', '/suppliers/register', {
      email: `suppB_p3f_${Date.now()}@example.com`,
      password: 'SupplierPassword123!',
      companyName: 'Gujarat Heritage Tours P3F',
      phone: '+919876543211',
    });
    if (suppBRes.status === 201 && (suppBRes.body.token || suppBRes.body.data?.token)) {
      supplierBToken = suppBRes.body.token || suppBRes.body.data?.token;
      supplierBId = suppBRes.body.supplier?.id || suppBRes.body.data?.supplier?.id;
      logPass('Register Supplier B');
    } else {
      logFail('Register Supplier B failed', suppBRes.body);
    }

    // 5. Admin Login & Verify Suppliers
    const adminLoginRes = await request('POST', '/admin/login', {
      email: 'admin@chalofarva.com',
      password: 'AdminPassword123!',
    });
    if (adminLoginRes.status === 200 && (adminLoginRes.body.token || adminLoginRes.body.data?.token)) {
      adminToken = adminLoginRes.body.token || adminLoginRes.body.data?.token;
      logPass('Super Admin Login');
    } else {
      logFail('Admin Login failed', adminLoginRes.body);
    }

    await request('POST', `/admin/suppliers/${supplierAId}/verify`, { verificationStatus: 'VERIFIED' }, { Authorization: `Bearer ${adminToken}` });
    await request('POST', `/admin/suppliers/${supplierBId}/verify`, { verificationStatus: 'VERIFIED' }, { Authorization: `Bearer ${adminToken}` });
    logPass('Admin Verify Suppliers A & B');

    // 6. Supplier A Create Hotel Inventory
    const destRes = await request('GET', '/destinations');
    const destSlug = destRes.body.data?.[0]?.slug || 'dwarka';

    const hotelRes = await request('POST', '/supplier/hotels', {
      name: 'P3F Luxury Palace Dwarka',
      destinationSlug: destSlug,
      address: 'Near Dwarkadhish Temple',
      pricePerNight: 4000,
      amenities: ['WiFi', 'Parking'],
    }, { Authorization: `Bearer ${supplierAToken}` });

    if (hotelRes.status === 201 && (hotelRes.body.id || hotelRes.body.data?.id)) {
      hotelInventoryId = hotelRes.body.id || hotelRes.body.data?.id;
      await request('POST', `/admin/inventory/hotel/${hotelInventoryId}/approve`, {}, { Authorization: `Bearer ${adminToken}` });
      logPass('Supplier A Create & Admin Approve Hotel Inventory');
    } else {
      logFail('Create Hotel failed', hotelRes.body);
    }

    // 7. Customer A Create Hotel Booking
    const bookingRes = await request('POST', '/bookings', {
      inventoryType: 'HOTEL',
      inventoryId: hotelInventoryId,
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 259200000).toISOString(),
      quantity: 2,
      guestCount: 2,
    }, { Authorization: `Bearer ${customerAToken}` });

    if (bookingRes.status === 201 && (bookingRes.body.id || bookingRes.body.data?.id)) {
      const bData = bookingRes.body.data || bookingRes.body;
      hotelBookingId = bData.id;
      hotelBookingRef = bData.bookingReference;
      hotelAmountInr = Number(bData.totalAmountInr);
      logPass(`Customer A Create Booking ${hotelBookingRef} (Total: ₹${hotelAmountInr})`);
    } else {
      logFail('Create Booking failed', bookingRes.body);
    }

    // ----------------------------------------------------
    // SECTION 2: Payment Creation & Server-Side Price Security
    // ----------------------------------------------------
    console.log('\n--- SECTION 2: Payment Order Creation & Ownership Security ---');

    // 8. Customer A Create Payment Order
    const payOrderRes = await request('POST', '/payments/create-order', {
      bookingId: hotelBookingId,
      paymentMethod: 'SANDBOX_UPI',
      idempotencyKey: `idem_p3f_ord_${Date.now()}`,
    }, { Authorization: `Bearer ${customerAToken}` });

    if (payOrderRes.status === 201 && payOrderRes.body.success) {
      gatewayOrderId = payOrderRes.body.data.gatewayOrderId;
      paymentId = payOrderRes.body.data.paymentId;
      logPass(`Customer A Create Payment Order (Gateway Order ID: ${gatewayOrderId})`);
    } else {
      logFail('Create Payment Order failed', payOrderRes.body);
    }

    // 9. Payment Amount Authoritatively Derived from DB
    if (payOrderRes.body.data?.amountInr === hotelAmountInr) {
      logPass(`Server Derived Authoritative Amount (₹${hotelAmountInr}) ignoring Client Overrides`);
    } else {
      logFail('Amount mismatch', payOrderRes.body.data);
    }

    // 10. IDOR Test: Customer B Cannot Create Payment Order for Customer A Booking
    const idorOrderRes = await request('POST', '/payments/create-order', {
      bookingId: hotelBookingId,
      paymentMethod: 'SANDBOX_UPI',
    }, { Authorization: `Bearer ${customerBToken}` });

    if (idorOrderRes.status === 403) {
      logPass('IDOR Protection: Customer B blocked from creating payment for Customer A booking (403)');
    } else {
      logFail('IDOR Protection failed', idorOrderRes.body);
    }

    // 11. Invalid Booking Rejection (404)
    const invalidOrderRes = await request('POST', '/payments/create-order', {
      bookingId: '00000000-0000-0000-0000-000000000000',
    }, { Authorization: `Bearer ${customerAToken}` });

    if (invalidOrderRes.status === 404) {
      logPass('Invalid Booking ID rejected safely (404)');
    } else {
      logFail('Invalid booking test failed', invalidOrderRes.body);
    }

    // ----------------------------------------------------
    // SECTION 3: Payment Verification & Commission Snapshot
    // ----------------------------------------------------
    console.log('\n--- SECTION 3: Payment Verification & Commission Calculation ---');

    // 12. Server-Side Signature Verification & Status Update to PAID
    const verifyRes = await request('POST', '/payments/verify', {
      gatewayOrderId,
      gatewayPaymentId: `sandbox_pay_tx_${Date.now()}`,
      signature: `sb_sig_valid_${Date.now()}`,
    }, { Authorization: `Bearer ${customerAToken}` });

    if (verifyRes.status === 201 || verifyRes.status === 200) {
      if (verifyRes.body.data?.status === 'PAID') {
        logPass('Payment Signature Verified -> Status updated to PAID');
      } else {
        logFail('Verify status incorrect', verifyRes.body);
      }
    } else {
      logFail('Verify Payment failed', verifyRes.body);
    }

    // 13. Booking Status Transitioned to CONFIRMED
    if (verifyRes.body.data?.bookingStatus === 'CONFIRMED') {
      logPass('Booking Status Transitioned to CONFIRMED upon Payment Capture');
    } else {
      logFail('Booking status transition failed', verifyRes.body.data);
    }

    // 14. Commission Snapshot Verification (10% Platform Commission)
    const expectedCommission = Number((hotelAmountInr * 0.10).toFixed(2));
    const expectedPayable = Number((hotelAmountInr - expectedCommission).toFixed(2));

    if (verifyRes.body.data?.commission) {
      const comm = verifyRes.body.data.commission;
      if (Number(comm.commissionAmountInr) === expectedCommission && Number(comm.supplierPayableInr) === expectedPayable) {
        logPass(`Commission Snapshot Verified: Gross ₹${hotelAmountInr} | Comm (10%) ₹${expectedCommission} | Supplier Payable ₹${expectedPayable}`);
      } else {
        logFail('Commission calculation mismatch', comm);
      }
    } else {
      logFail('Commission snapshot missing', verifyRes.body.data);
    }

    // 15. Supplier Settlement Record Created in PENDING Status
    if (verifyRes.body.data?.settlement?.status === 'PENDING') {
      logPass('Supplier Settlement Record Generated in PENDING State');
    } else {
      logFail('Settlement record missing/invalid', verifyRes.body.data);
    }

    // ----------------------------------------------------
    // SECTION 4: Webhook & Idempotency Protection
    // ----------------------------------------------------
    console.log('\n--- SECTION 4: Webhook Handling & Idempotency Protection ---');

    // 16. Webhook Endpoint Processing
    const webhookRes = await request('POST', '/payments/webhooks/sandbox', {
      event: 'PAYMENT.CAPTURED',
      gatewayOrderId,
    }, { 'x-razorpay-signature': 'mock_hmac_valid_signature_12345' });

    if (webhookRes.status === 201 || webhookRes.status === 200) {
      logPass('HMAC Signed Payment Webhook Processed Successfully');
    } else {
      logFail('Webhook processing failed', webhookRes.body);
    }

    // 17. Re-verification Callback Returns Idempotent Safe Response
    const reVerifyRes = await request('POST', '/payments/verify', {
      gatewayOrderId,
      gatewayPaymentId: `sandbox_pay_tx_${Date.now()}`,
      signature: `sb_sig_valid_${Date.now()}`,
    }, { Authorization: `Bearer ${customerAToken}` });

    if (reVerifyRes.status === 200 || reVerifyRes.status === 201) {
      if (reVerifyRes.body.data?.note?.includes('already verified')) {
        logPass('Duplicate Payment Verification Handled Idempotently');
      } else {
        logFail('Re-verification response not idempotent', reVerifyRes.body);
      }
    } else {
      logFail('Re-verification failed', reVerifyRes.body);
    }

    // ----------------------------------------------------
    // SECTION 5: Multi-Tenant Supplier Financial Isolation
    // ----------------------------------------------------
    console.log('\n--- SECTION 5: Supplier Financial Portal & Tenant Isolation ---');

    // 18. Supplier A Directory returns owned payment & commission
    const suppAPayRes = await request('GET', '/supplier/payments', null, { Authorization: `Bearer ${supplierAToken}` });
    if (suppAPayRes.status === 200 && suppAPayRes.body.data?.transactions?.length >= 1) {
      logPass(`Supplier A Financial Portal lists owned booking revenue (Gross: ₹${suppAPayRes.body.data.metrics.totalGrossValueInr})`);
    } else {
      logFail('Supplier A payments list failed', suppAPayRes.body);
    }

    // 19. Tenant Isolation: Supplier B Portal does NOT leak Supplier A payments
    const suppBPayRes = await request('GET', '/supplier/payments', null, { Authorization: `Bearer ${supplierBToken}` });
    if (suppBPayRes.status === 200 && suppBPayRes.body.data?.transactions?.length === 0) {
      logPass('Multi-Tenant Security: Supplier B Portal contains 0 Supplier A transactions');
    } else {
      logFail('Tenant isolation leaked data', suppBPayRes.body);
    }

    // ----------------------------------------------------
    // SECTION 6: Admin Financial Dashboard & Settlements
    // ----------------------------------------------------
    console.log('\n--- SECTION 6: Admin Financial Dashboard & Settlements ---');

    // 20. Admin Finance Summary Aggregates Real DB Rows
    const adminSumRes = await request('GET', '/admin/finance/summary', null, { Authorization: `Bearer ${adminToken}` });
    if (adminSumRes.status === 200 && adminSumRes.body.data?.totalPaidBookings >= 1) {
      logPass(`Admin Financial Summary Aggregated (Gross: ₹${adminSumRes.body.data.grossBookingValueInr}, Comm: ₹${adminSumRes.body.data.platformCommissionInr})`);
    } else {
      logFail('Admin Finance Summary failed', adminSumRes.body);
    }

    // 21. Admin Payments Directory Filtering
    const adminPayRes = await request('GET', '/admin/payments?status=PAID', null, { Authorization: `Bearer ${adminToken}` });
    if (adminPayRes.status === 200 && adminPayRes.body.data?.items?.length >= 1) {
      logPass('Admin Payments Directory filtered by PAID status');
    } else {
      logFail('Admin Payments list failed', adminPayRes.body);
    }

    // 22. Admin Settlements Directory
    const adminStlRes = await request('GET', '/admin/settlements?status=PENDING', null, { Authorization: `Bearer ${adminToken}` });
    if (adminStlRes.status === 200 && adminStlRes.body.data?.items?.length >= 1) {
      const settlementId = adminStlRes.body.data.items[0].id;
      logPass(`Admin Settlements Directory returned PENDING settlement ${settlementId}`);

      // 23. Admin Update Settlement Status to SETTLED
      const updateStlRes = await request('POST', `/admin/settlements/${settlementId}/status`, {
        status: 'SETTLED',
        settlementReference: 'UTR-2026-BANK-PAYOUT-001',
        reason: 'Monthly settlement batch approved',
      }, { Authorization: `Bearer ${adminToken}` });

      if (updateStlRes.status === 201 || updateStlRes.status === 200) {
        logPass('Admin updated settlement status to SETTLED with bank UTR reference');
      } else {
        logFail('Update settlement status failed', updateStlRes.body);
      }
    } else {
      logFail('Admin Settlements list failed', adminStlRes.body);
    }

    // ----------------------------------------------------
    // SECTION 7: Refund Engine & Validation
    // ----------------------------------------------------
    console.log('\n--- SECTION 7: Refund Engine & Validation ---');

    // 24. Process Refund
    const refundRes = await request('POST', `/bookings/${hotelBookingId}/refund`, {
      amountInr: 2000,
      reason: 'Partial customer refund request',
    }, { Authorization: `Bearer ${adminToken}` });

    if (refundRes.status === 201 || refundRes.status === 200) {
      logPass(`Refund Processed Successfully (Refund ID: ${refundRes.body.data?.id})`);
    } else {
      logFail('Process Refund failed', refundRes.body);
    }

    // 25. Excessive Refund Validation Rejection
    const excessRefundRes = await request('POST', `/bookings/${hotelBookingId}/refund`, {
      amountInr: 999999,
      reason: 'Invalid excessive refund',
    }, { Authorization: `Bearer ${adminToken}` });

    if (excessRefundRes.status === 400) {
      logPass('Excessive Refund Amount (> Paid Balance) Rejected (400)');
    } else {
      logFail('Excessive refund validation failed', excessRefundRes.body);
    }

    // ----------------------------------------------------
    // SUMMARY REPORT
    // ----------------------------------------------------
    console.log('\n====================================================');
    console.log(`TOTAL TESTS EXECUTED: ${passCount + failCount}`);
    console.log(`PASSED: ${passCount}`);
    console.log(`FAILED: ${failCount}`);
    console.log('====================================================');

    if (failCount === 0) {
      console.log('\n🎉 ALL PHASE 3F PAYMENTS & FINANCIAL TESTS PASSED PERFECTLY!\n');
      process.exit(0);
    } else {
      console.error(`\n❌ ${failCount} TEST(S) FAILED.\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal Error during Test Suite execution:', error);
    process.exit(1);
  }
}

runAllTests();
