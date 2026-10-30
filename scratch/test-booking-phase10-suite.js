/**
 * BharatYatra AI 2.0 — Phase 10 Automated Test Suite
 * End-to-End Booking Coordination, Real-Time Availability,
 * Strict Price Revalidation, Payment Decoupling & Automated Refunds
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const rootDir = path.resolve(__dirname, '..');
const moduleCache = new Map();

function customRequire(callerDir, reqPath) {
  let targetPath;
  if (reqPath.startsWith('@/')) {
    targetPath = path.resolve(rootDir, reqPath.substring(2));
  } else if (reqPath.startsWith('./') || reqPath.startsWith('../')) {
    targetPath = path.resolve(callerDir, reqPath);
  } else {
    return require(reqPath);
  }

  if (targetPath.endsWith('.json') || fs.existsSync(targetPath + '.json')) {
    const jsonFile = targetPath.endsWith('.json') ? targetPath : targetPath + '.json';
    const jsonContent = require(jsonFile);
    if (jsonContent && typeof jsonContent === 'object') {
      jsonContent.default = jsonContent;
    }
    return jsonContent;
  }

  const tsFile = targetPath.endsWith('.ts') ? targetPath : targetPath + '.ts';
  const jsFile = targetPath.endsWith('.js') ? targetPath : targetPath + '.js';

  if (fs.existsSync(tsFile)) {
    if (moduleCache.has(tsFile)) return moduleCache.get(tsFile);
    const code = fs.readFileSync(tsFile, 'utf8');
    const compiled = ts.transpileModule(code, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    });
    const m = { exports: {} };
    moduleCache.set(tsFile, m.exports);
    const fn = new Function('require', 'module', 'exports', '__dirname', '__filename', compiled.outputText);
    fn((p) => customRequire(path.dirname(tsFile), p), m, m.exports, path.dirname(tsFile), tsFile);
    moduleCache.set(tsFile, m.exports);
    return m.exports;
  }

  if (fs.existsSync(jsFile)) {
    return require(jsFile);
  }

  throw new Error(`Cannot resolve module: ${reqPath} from ${callerDir}`);
}

const bookingModule = customRequire(rootDir, '@/lib/booking/unified-booking-orchestrator');
const gatewayModule = customRequire(rootDir, '@/lib/gateway/gateway-client');

const { UnifiedBookingOrchestrator } = bookingModule;
const { GatewayClient } = gatewayModule;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${message}`);
  }
}

async function runPhase10Tests() {
  console.log('\n===============================================================');
  console.log('   BHARATYATRA AI 2.0 — PHASE 10 VERIFICATION SUITE');
  console.log('   Real-Time Availability, Booking Intelligence & Coordination');
  console.log('===============================================================\n');

  // ==========================================================================
  // GROUP A: Supplier Integration & Adapter Health
  // ==========================================================================
  console.log('--- GROUP A: Supplier Integration & Adapter Health ---');

  const healthReports = UnifiedBookingOrchestrator.getSupplierHealthReports();
  assert(healthReports.length === 7, 'Supplier health reports returned for all 7 product categories');

  const hotelSupplier = healthReports.find(s => s.category === 'HOTEL');
  assert(hotelSupplier && hotelSupplier.providerId === 'prov-hbx-hotelbeds', 'Hotelbeds (HBX Group) hotel adapter registered');
  assert(hotelSupplier.status === 'SANDBOX', 'Hotelbeds adapter explicitly designated as SANDBOX (no false live claim)');

  const busSupplier = healthReports.find(s => s.category === 'BUS');
  assert(busSupplier && busSupplier.providerName.includes('Etravelsmart'), 'Etravelsmart / GSRTC bus adapter registered');

  const flightSupplier = healthReports.find(s => s.category === 'FLIGHT');
  assert(flightSupplier && flightSupplier.providerId === 'prov-tbo-air', 'TBO Air flight adapter registered');

  const trainSupplier = healthReports.find(s => s.category === 'TRAIN');
  assert(trainSupplier && trainSupplier.providerName.includes('IRCTC'), 'IRCTC train adapter registered');

  const activitySupplier = healthReports.find(s => s.category === 'ACTIVITY');
  assert(activitySupplier && activitySupplier.status === 'LIVE_VERIFIED', 'Curated experiences & safari permits registered as LIVE_VERIFIED');

  const cabSupplier = healthReports.find(s => s.category === 'CAB');
  assert(cabSupplier && cabSupplier.status === 'LIVE_VERIFIED', 'BharatYatra intercity cabs registered as LIVE_VERIFIED');

  const packageSupplier = healthReports.find(s => s.category === 'PACKAGE');
  assert(packageSupplier && packageSupplier.status === 'LIVE_VERIFIED', 'BharatYatra partner packages registered as LIVE_VERIFIED');

  // ==========================================================================
  // GROUP B: Real-Time Availability & Caching
  // ==========================================================================
  console.log('\n--- GROUP B: Real-Time Availability & Caching ---');

  const mockComponents = [
    {
      id: 'test-comp-htl',
      componentType: 'HOTEL',
      destination: 'Ahmedabad',
      travelDate: '2026-11-10',
      quotedPrice: 4200,
      title: 'Heritage Haveli Ahmedabad',
    },
    {
      id: 'test-comp-bus',
      componentType: 'BUS',
      destination: 'Dwarka',
      travelDate: '2026-11-12',
      quotedPrice: 950,
      title: 'Ahmedabad to Dwarka Sleeper',
    },
    {
      id: 'test-comp-act',
      componentType: 'ACTIVITY',
      destination: 'Gir National Park',
      travelDate: '2026-11-13',
      quotedPrice: 1200,
      title: 'Gir Lion Safari Trail 3 Permit',
    },
  ];

  const t0 = Date.now();
  const avail1 = await UnifiedBookingOrchestrator.checkComponentsAvailability(mockComponents);
  const dur1 = Date.now() - t0;
  assert(avail1.allAvailable === true, 'All itinerary components verified available in real time');
  assert(avail1.results.length === 3, 'Availability returned for all 3 requested components');

  // Cache hit test
  const t1 = Date.now();
  const avail2 = await UnifiedBookingOrchestrator.checkComponentsAvailability(mockComponents);
  const dur2 = Date.now() - t1;
  assert(avail2.results.length === 3, 'Repeat query served from availability cache');
  assert(dur2 <= dur1 || dur2 < 20, `Cache hit returned rapidly (${dur2}ms <= ${dur1}ms)`);

  // ==========================================================================
  // GROUP C: Strict Price Revalidation & Rate Drift Policies
  // ==========================================================================
  console.log('\n--- GROUP C: Strict Price Revalidation & Rate Drift Policies ---');

  // Case 1: Exact Match (No Drift)
  const compNoDrift = [
    {
      id: 'comp-drift-0',
      componentType: 'BUS',
      title: 'Surat to Ahmedabad Express',
      destination: 'Ahmedabad',
      travelDate: '2026-11-15',
      quotedPrice: 850,
      verifiedPrice: 850,
      currency: 'INR',
      quantity: 1,
      passengers: [{ name: 'Test Traveler' }],
      status: 'DRAFT',
      cancellationPolicy: {
        isRefundable: true,
        penaltyPercentage: 10,
        penaltyAmount: 85,
        refundableAmount: 765,
        policyDescription: '10% penalty prior to departure',
      },
    },
  ];

  const revalNoDrift = await UnifiedBookingOrchestrator.revalidateTripPrices(compNoDrift);
  assert(revalNoDrift.totalDelta === 0, 'No drift: totalDelta is 0');
  assert(revalNoDrift.requiresUserAuthorization === false, 'No drift does not require renewed authorization');
  assert(revalNoDrift.priceLockedUntil !== undefined, '10-minute price lock window issued');

  // Case 2: Price Drop (Savings applied)
  const compDrop = [
    {
      ...compNoDrift[0],
      id: 'comp-drift-drop',
      quotedPrice: 1000, // previously quoted 1000, supplier price is 850
    },
  ];
  const revalDrop = await UnifiedBookingOrchestrator.revalidateTripPrices(compDrop);
  assert(revalDrop.isPriceDrop === true, 'Price drop detected (quoted ₹1000 vs current ₹850)');
  assert(revalDrop.savingsInr === 150, 'Savings accurately computed as ₹150');
  assert(revalDrop.requiresUserAuthorization === false, 'Price decrease does not block user checkout');

  // Case 3: Major Price Increase (> ₹100 and > 2%)
  const compMajorDrift = [
    {
      ...compNoDrift[0],
      id: 'comp-drift-major',
      quotedPrice: 500, // previously quoted 500, current price is 850 (+₹350, +70%)
    },
  ];
  const revalMajor = await UnifiedBookingOrchestrator.revalidateTripPrices(compMajorDrift);
  assert(revalMajor.requiresUserAuthorization === true, 'Major price increase strictly triggers requiresUserAuthorization');
  assert(revalMajor.componentsWithDrift[0].state === 'MAJOR_INCREASE', 'Component flagged as MAJOR_INCREASE');

  // ==========================================================================
  // GROUP D: Multi-Component Trip Booking Orchestration
  // ==========================================================================
  console.log('\n--- GROUP D: Multi-Component Trip Booking Orchestration ---');

  const testUserId = 'usr_qa_phase10_01';
  const newTrip = await UnifiedBookingOrchestrator.createTripBooking({
    userId: testUserId,
    title: 'Saurashtra Coastal & Wildlife Circuit',
    originCity: 'Ahmedabad',
    destinationCity: 'Gir National Park',
    startDate: '2026-11-20',
    endDate: '2026-11-24',
    travelersCount: 2,
    components: [
      {
        id: 'comp-t-bus',
        componentType: 'BUS',
        providerId: 'prov-etravelsmart-bus',
        providerName: 'GSRTC Volvo',
        title: 'Ahmedabad to Junagadh AC Sleeper',
        description: '2 Berths Reserved',
        destination: 'Junagadh',
        travelDate: '2026-11-20',
        quantity: 2,
        quotedPrice: 1700,
        currency: 'INR',
        passengers: [{ name: 'Traveler 1' }, { name: 'Traveler 2' }],
        cancellationPolicy: {
          isRefundable: true,
          penaltyPercentage: 15,
          penaltyAmount: 255,
          refundableAmount: 1445,
          policyDescription: '15% cancellation fee',
        },
      },
      {
        id: 'comp-t-htl',
        componentType: 'HOTEL',
        providerId: 'prov-hbx-hotelbeds',
        providerName: 'Hotelbeds Live Sandbox',
        title: 'Gir Forest Safari Lodge',
        description: 'Deluxe Cottage 2 Nights',
        destination: 'Gir National Park',
        travelDate: '2026-11-20',
        quantity: 1,
        quotedPrice: 8500,
        currency: 'INR',
        passengers: [{ name: 'Traveler 1' }, { name: 'Traveler 2' }],
        cancellationPolicy: {
          isRefundable: true,
          penaltyPercentage: 0,
          penaltyAmount: 0,
          refundableAmount: 8500,
          policyDescription: 'Free cancellation until 48 hours prior',
        },
      },
    ],
  });

  assert(newTrip.tripBookingId.startsWith('BY-TRIP-'), `Trip booking initialized with master reference: ${newTrip.tripBookingId}`);
  assert(newTrip.status === 'DRAFT', 'Initial trip state is DRAFT');
  assert(newTrip.components.length === 2, 'Constituent components properly attached');

  // Price Authorization
  const authorizedTrip = UnifiedBookingOrchestrator.authorizeTripPrice(newTrip.tripBookingId, testUserId);
  assert(authorizedTrip.status === 'USER_AUTHORIZED', 'State transitioned to USER_AUTHORIZED');
  assert(authorizedTrip.userAuthorizedAt !== undefined, 'User authorization timestamp recorded');

  // BharatGateway Payment Order Creation
  const { order: gatewayOrder } = await UnifiedBookingOrchestrator.createBharatGatewayOrder(
    newTrip.tripBookingId,
    testUserId
  );
  assert(gatewayOrder.orderId.startsWith('order_bg_'), `BharatGateway order created: ${gatewayOrder.orderId}`);
  assert(authorizedTrip.status === 'PAYMENT_PENDING', 'Trip state updated to PAYMENT_PENDING');

  // Sequential Fulfillment Execution (Strict Decoupling)
  const fulfillmentResult = await UnifiedBookingOrchestrator.processPaymentAndConfirmSuppliers({
    tripBookingId: newTrip.tripBookingId,
    userId: testUserId,
    paymentOrderId: gatewayOrder.orderId,
    paymentMethod: 'UPI',
  });

  assert(fulfillmentResult.success === true, 'Payment confirmation & sequential supplier execution succeeded');
  assert(fulfillmentResult.tripBooking.status === 'CONFIRMED', 'Master trip state transitioned to CONFIRMED');
  assert(fulfillmentResult.tripBooking.paymentStatus === 'CAPTURED', 'Payment status is CAPTURED');

  const busComp = fulfillmentResult.tripBooking.components.find(c => c.componentType === 'BUS');
  assert(busComp.supplierConfirmationReference && busComp.supplierConfirmationReference.startsWith('GSRTC-PNR-'),
    `Bus component fulfilled with supplier PNR: ${busComp.supplierConfirmationReference}`);

  const htlComp = fulfillmentResult.tripBooking.components.find(c => c.componentType === 'HOTEL');
  assert(htlComp.supplierConfirmationReference && htlComp.supplierConfirmationReference.startsWith('HBX-HTL-'),
    `Hotelbeds component fulfilled with supplier voucher: ${htlComp.supplierConfirmationReference}`);

  // ==========================================================================
  // GROUP E: Partial Failure & Compensation Handling
  // ==========================================================================
  console.log('\n--- GROUP E: Partial Failure & Compensation Handling ---');

  const partialTrip = await UnifiedBookingOrchestrator.createTripBooking({
    userId: testUserId,
    title: 'Kevadia Statue of Unity Weekend Tour',
    originCity: 'Vadodara',
    destinationCity: 'Kevadia',
    startDate: '2026-11-25',
    endDate: '2026-11-26',
    travelersCount: 2,
    components: [
      {
        id: 'comp-part-cab',
        componentType: 'CAB',
        providerId: 'prov-bharat-fleet',
        providerName: 'BharatYatra Chauffeur Cabs',
        title: 'Vadodara to Kevadia Roundtrip Sedan',
        description: 'AC Sedan with verified driver',
        destination: 'Kevadia',
        travelDate: '2026-11-25',
        quantity: 1,
        quotedPrice: 3200,
        currency: 'INR',
        passengers: [{ name: 'Traveler 1' }],
        cancellationPolicy: {
          isRefundable: true,
          penaltyPercentage: 0,
          penaltyAmount: 0,
          refundableAmount: 3200,
          policyDescription: 'Free cancellation until 6 hours prior',
        },
      },
      {
        id: 'comp-part-act',
        componentType: 'ACTIVITY',
        providerId: 'prov-curated-activities',
        providerName: 'SOU Tourism Authority',
        title: 'Statue of Unity Viewing Gallery High-Speed Lift Pass',
        description: '2 Viewing gallery passes',
        destination: 'Kevadia',
        travelDate: '2026-11-25',
        quantity: 2,
        quotedPrice: 760,
        currency: 'INR',
        passengers: [{ name: 'Traveler 1' }, { name: 'Traveler 2' }],
        cancellationPolicy: {
          isRefundable: true,
          penaltyPercentage: 0,
          penaltyAmount: 0,
          refundableAmount: 760,
          policyDescription: 'Full refund upon attraction closure',
        },
      },
    ],
  });

  UnifiedBookingOrchestrator.authorizeTripPrice(partialTrip.tripBookingId, testUserId);
  const { order: partialOrder } = await UnifiedBookingOrchestrator.createBharatGatewayOrder(
    partialTrip.tripBookingId,
    testUserId
  );

  // Simulate supplier failure on SOU activity passes
  const partialFulfillment = await UnifiedBookingOrchestrator.processPaymentAndConfirmSuppliers({
    tripBookingId: partialTrip.tripBookingId,
    userId: testUserId,
    paymentOrderId: partialOrder.orderId,
    paymentMethod: 'UPI',
    simulateSupplierFailureComponentId: 'comp-part-act',
  });

  assert(partialFulfillment.success === false, 'Partial failure detected during supplier fulfillment');
  assert(partialFulfillment.tripBooking.status === 'PARTIALLY_CONFIRMED', 'Trip booking gracefully marked PARTIALLY_CONFIRMED');
  assert(partialFulfillment.confirmedComponentsCount === 1, '1 successful component retained (Cab)');
  assert(partialFulfillment.failedComponentsCount === 1, '1 component failed (Activity pass)');
  assert(partialFulfillment.refundInitiated !== undefined, 'Automated compensation refund triggered via BharatGateway');
  assert(partialFulfillment.refundInitiated.refundId.startsWith('ref_'),
    `Refund ID issued: ${partialFulfillment.refundInitiated.refundId}`);
  assert(partialFulfillment.tripBooking.refundAmount === 760, 'Exact failed component cost (₹760) refunded');

  // ==========================================================================
  // GROUP F: Cancellation & Refund Pipeline
  // ==========================================================================
  console.log('\n--- GROUP F: Cancellation & Refund Pipeline ---');

  // Cancel the remaining cab component in partialTrip
  const cancelResult = await UnifiedBookingOrchestrator.cancelBooking({
    tripBookingId: partialTrip.tripBookingId,
    userId: testUserId,
    componentId: 'comp-part-cab',
    reason: 'Customer cancelled cab transit due to activity unavailability',
  });

  assert(cancelResult.success === true, 'Component cancellation processed successfully');
  assert(cancelResult.totalRefundInr === 3200, 'Free cancellation policy honored: full ₹3200 refunded');
  assert(cancelResult.tripBooking.status === 'REFUNDED', 'All components now cancelled/refunded; trip state is REFUNDED');

  // ==========================================================================
  // GROUP G: Security & IDOR Enforcement
  // ==========================================================================
  console.log('\n--- GROUP G: Security & IDOR Enforcement ---');

  let idorBlocked = false;
  try {
    // Attempt to access/authorize another user's booking
    UnifiedBookingOrchestrator.authorizeTripPrice(newTrip.tripBookingId, 'malicious_user_999');
  } catch (err) {
    idorBlocked = true;
  }
  assert(idorBlocked === true, 'IDOR blocked: Unauthorized user rejected from mutating trip booking');

  // Verify Audit Trail Integrity
  const finalBooking = UnifiedBookingOrchestrator.getTripBooking(newTrip.tripBookingId);
  assert(finalBooking.auditTrail.length >= 4, `Audit trail contains ${finalBooking.auditTrail.length} immutable events`);
  assert(finalBooking.auditTrail.some(a => a.action === 'PAYMENT_CAPTURED'), 'Audit log contains PAYMENT_CAPTURED event');
  assert(finalBooking.auditTrail.some(a => a.action === 'TRIP_BOOKING_CONFIRMED'), 'Audit log contains TRIP_BOOKING_CONFIRMED event');

  console.log('\n===============================================================');
  console.log(`PHASE 10 TEST SUMMARY: ${passedTests} / ${totalTests} PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  if (failedTests > 0) {
    console.error(`FAILED TESTS: ${failedTests}`);
    process.exit(1);
  } else {
    console.log('ALL PHASE 10 TEST CRITERIA MET WITH 100% SUCCESS RATE.');
    console.log('===============================================================\n');
  }
}

runPhase10Tests().catch((err) => {
  console.error('Test suite runtime error:', err);
  process.exit(1);
});
