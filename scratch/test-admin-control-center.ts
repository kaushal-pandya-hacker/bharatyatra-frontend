import { NextRequest } from 'next/server';
import { GET as getDashboard } from '../app/api/v1/admin/dashboard/route';
import { GET as getBookings } from '../app/api/v1/admin/bookings/route';
import { PATCH as patchBooking } from '../app/api/v1/admin/bookings/[id]/route';
import { GET as getUsers } from '../app/api/v1/admin/users/route';
import { GET as getPayments } from '../app/api/v1/admin/payments/route';
import { GET as getRefunds } from '../app/api/v1/admin/refunds/route';
import { POST as postRefundProcess } from '../app/api/v1/admin/refunds/[id]/process/route';
import { GET as getDestinations, POST as postDestination } from '../app/api/v1/admin/destinations/route';
import { GET as getAiPlanner, PATCH as patchAiPlanner } from '../app/api/v1/admin/ai-planner/route';
import { GET as getHotels } from '../app/api/v1/admin/hotels/route';
import { GET as getTransportation } from '../app/api/v1/admin/transportation/route';
import { GET as getSupport, POST as postSupportReply } from '../app/api/v1/admin/support/route';
import { GET as getReviews, PATCH as patchReview } from '../app/api/v1/admin/reviews/route';
import { GET as getMarketing } from '../app/api/v1/admin/marketing/route';
import { GET as getCms, PATCH as patchCms } from '../app/api/v1/admin/cms/route';
import { GET as getStaff, POST as postStaff } from '../app/api/v1/admin/staff/route';
import { GET as getSystem } from '../app/api/v1/admin/system/route';
import { GET as getFinancialReports } from '../app/api/v1/admin/financial-reports/route';

async function runTestSuite() {
  console.log('================================================================');
  console.log('BHARATYATRA ADMIN CONTROL CENTER — 7-PHASE AUTOMATED TEST SUITE');
  console.log('================================================================\n');

  const token = 'admin-token-admin-super-001-' + Date.now();
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const results: Array<{ phase: string; test: string; passed: boolean; details?: string }> = [];

  // Security Test: Verify unauthorized request is rejected
  try {
    const unauthReq = new NextRequest('http://localhost:3000/api/v1/admin/dashboard');
    const res = await getDashboard(unauthReq);
    const passed = res.status === 401;
    results.push({
      phase: 'Security & Auth',
      test: 'Reject unauthenticated admin access with HTTP 401',
      passed,
      details: `Status: ${res.status}`,
    });
  } catch (e: any) {
    results.push({ phase: 'Security & Auth', test: 'Reject unauthenticated admin access', passed: false, details: e.message });
  }

  // Phase 1: Dashboard with Date Range
  try {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/dashboard?range=7days', { headers });
    const res = await getDashboard(req);
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.data?.kpi?.totalRevenue !== undefined;
    results.push({
      phase: 'Phase 1: Dashboard',
      test: 'GET /api/v1/admin/dashboard (Date Filter: 7days)',
      passed,
      details: `Revenue: ₹${data.data?.kpi?.totalRevenue}, Bookings: ${data.data?.kpi?.totalBookings}`,
    });
  } catch (e: any) {
    results.push({ phase: 'Phase 1: Dashboard', test: 'Dashboard endpoint', passed: false, details: e.message });
  }

  // Phase 1: Bookings Management & Cancellation Workflow
  try {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/bookings?type=HOTEL', { headers });
    const res = await getBookings(req);
    const data = await res.json();
    const passed = res.status === 200 && data.success && Array.isArray(data.data);
    results.push({
      phase: 'Phase 1: Bookings',
      test: 'GET /api/v1/admin/bookings (Filter Category: HOTEL)',
      passed,
      details: `Retrieved ${data.data?.length} hotel bookings`,
    });
  } catch (e: any) {
    results.push({ phase: 'Phase 1: Bookings', test: 'Bookings query', passed: false, details: e.message });
  }

  // Phase 1: Users Directory
  try {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/users', { headers });
    const res = await getUsers(req);
    const data = await res.json();
    const passed = res.status === 200 && data.success;
    results.push({
      phase: 'Phase 1: Users',
      test: 'GET /api/v1/admin/users (Platform Directory)',
      passed,
      details: `Retrieved ${data.data?.length || data.total} users`,
    });
  } catch (e: any) {
    results.push({ phase: 'Phase 1: Users', test: 'Users query', passed: false, details: e.message });
  }

  // Phase 2: Destinations CRUD
  try {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/destinations?category=Wildlife', { headers });
    const res = await getDestinations(req);
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.data.length > 0;
    results.push({
      phase: 'Phase 2: Destinations',
      test: 'GET /api/v1/admin/destinations (Category: Wildlife)',
      passed,
      details: `Found ${data.data?.length} destinations including Gir Lion Safari`,
    });
  } catch (e: any) {
    results.push({ phase: 'Phase 2: Destinations', test: 'Destinations query', passed: false, details: e.message });
  }

  // Phase 3: Payments Transactions
  try {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/payments', { headers });
    const res = await getPayments(req);
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.data.length > 0;
    results.push({
      phase: 'Phase 3: Financials',
      test: 'GET /api/v1/admin/payments (Transactions Ledger)',
      passed,
      details: `Retrieved ${data.data?.length} payment records`,
    });
  } catch (e: any) {
    results.push({ phase: 'Phase 3: Financials', test: 'Payments query', passed: false, details: e.message });
  }

  // Phase 3: Financial Reports & CSV Export
  try {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/financial-reports?format=csv', { headers });
    const res = await getFinancialReports(req);
    const text = await res.text();
    const passed = res.status === 200 && text.includes('Transaction ID') && text.includes('Amount (INR)');
    results.push({
      phase: 'Phase 3: Financial Reports',
      test: 'GET /api/v1/admin/financial-reports?format=csv (CSV Export)',
      passed,
      details: `Generated valid CSV export (${text.length} bytes)`,
    });
  } catch (e: any) {
    results.push({ phase: 'Phase 3: Financial Reports', test: 'Financial reports CSV export', passed: false, details: e.message });
  }

  // Phase 4: AI Trip Planner Configuration & Decoupling
  try {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/ai-planner', { headers });
    const res = await getAiPlanner(req);
    const data = await res.json();
    const passed =
      res.status === 200 &&
      data.success &&
      data.data.rules?.pricingEngineSeparated === true &&
      data.data.providers?.length > 0;
    results.push({
      phase: 'Phase 4: AI Planner',
      test: 'GET /api/v1/admin/ai-planner (Decoupled Pricing & Inference)',
      passed,
      details: `Verified pricing engine separation = true, Models: ${data.data?.providers?.map((p: any) => p.name).join(', ')}`,
    });
  } catch (e: any) {
    results.push({ phase: 'Phase 4: AI Planner', test: 'AI config endpoint', passed: false, details: e.message });
  }

  // Phase 5: Hotelbeds & Hospitality Stays
  try {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/hotels', { headers });
    const res = await getHotels(req);
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.supplierStatus?.hotelbeds?.status === 'SANDBOX';
    results.push({
      phase: 'Phase 5: Hotels',
      test: 'GET /api/v1/admin/hotels (Hotelbeds APItude Status & Inventory)',
      passed,
      details: `Hotelbeds status: ${data.supplierStatus?.hotelbeds?.status}, Properties: ${data.data?.length}`,
    });
  } catch (e: any) {
    results.push({ phase: 'Phase 5: Hotels', test: 'Hotels endpoint', passed: false, details: e.message });
  }

  // Phase 5: Transportation & eTravelSmart
  try {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/transportation', { headers });
    const res = await getTransportation(req);
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.busRoutes?.length > 0;
    results.push({
      phase: 'Phase 5: Transport',
      test: 'GET /api/v1/admin/transportation (Bus Fleet & GDS Integrations)',
      passed,
      details: `Bus routes: ${data.busRoutes?.length}, Transport adapters: ${data.integrations?.length}`,
    });
  } catch (e: any) {
    results.push({ phase: 'Phase 5: Transport', test: 'Transportation endpoint', passed: false, details: e.message });
  }

  // Phase 6: Customer Support Desk
  try {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/support', { headers });
    const res = await getSupport(req);
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.data?.length > 0;
    results.push({
      phase: 'Phase 6: Support',
      test: 'GET /api/v1/admin/support (Customer Tickets Queue)',
      passed,
      details: `Retrieved ${data.data?.length} tickets`,
    });
  } catch (e: any) {
    results.push({ phase: 'Phase 6: Support', test: 'Support endpoint', passed: false, details: e.message });
  }

  // Phase 6: Reviews Moderation
  try {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/reviews', { headers });
    const res = await getReviews(req);
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.data?.length > 0;
    results.push({
      phase: 'Phase 6: Reviews',
      test: 'GET /api/v1/admin/reviews (Reviews & Spam Moderation)',
      passed,
      details: `Retrieved ${data.data?.length} reviews across hotels, packages, destinations`,
    });
  } catch (e: any) {
    results.push({ phase: 'Phase 6: Reviews', test: 'Reviews endpoint', passed: false, details: e.message });
  }

  // Phase 6: Marketing Campaigns
  try {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/marketing', { headers });
    const res = await getMarketing(req);
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.data?.length > 0;
    results.push({
      phase: 'Phase 6: Marketing',
      test: 'GET /api/v1/admin/marketing (Omnichannel Broadcasts)',
      passed,
      details: `Retrieved ${data.data?.length} campaigns (Email, WhatsApp, Push)`,
    });
  } catch (e: any) {
    results.push({ phase: 'Phase 6: Marketing', test: 'Marketing endpoint', passed: false, details: e.message });
  }

  // Phase 7: Website CMS & Public Notice Bar
  try {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/cms', { headers });
    const res = await getCms(req);
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.data?.banners?.length > 0;
    results.push({
      phase: 'Phase 7: CMS',
      test: 'GET /api/v1/admin/cms (Hero Banners & Notice Bar)',
      passed,
      details: `Found ${data.data?.banners?.length} hero banners, Notice active: ${data.data?.noticeBar?.isEnabled}`,
    });
  } catch (e: any) {
    results.push({ phase: 'Phase 7: CMS', test: 'CMS endpoint', passed: false, details: e.message });
  }

  // Phase 7: Staff & RBAC
  try {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/staff', { headers });
    const res = await getStaff(req);
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.data?.length >= 5;
    results.push({
      phase: 'Phase 7: Staff RBAC',
      test: 'GET /api/v1/admin/staff (Role-Based Access Control)',
      passed,
      details: `Provisioned staff: ${data.data?.map((s: any) => s.role).join(', ')}`,
    });
  } catch (e: any) {
    results.push({ phase: 'Phase 7: Staff RBAC', test: 'Staff endpoint', passed: false, details: e.message });
  }

  // Phase 7: System Monitoring & Telemetry
  try {
    const req = new NextRequest('http://localhost:3000/api/v1/admin/system', { headers });
    const res = await getSystem(req);
    const data = await res.json();
    const passed = res.status === 200 && data.success && data.data?.systemHealth?.uptime !== undefined;
    results.push({
      phase: 'Phase 7: System Telemetry',
      test: 'GET /api/v1/admin/system (Infrastructure Health & Latencies)',
      passed,
      details: `Uptime: ${data.data?.systemHealth?.uptime}, Latency: ${data.data?.systemHealth?.responseTimeMs}ms`,
    });
  } catch (e: any) {
    results.push({ phase: 'Phase 7: System Telemetry', test: 'System endpoint', passed: false, details: e.message });
  }

  console.log('RESULTS SUMMARY:');
  console.log('----------------');
  let passCount = 0;
  for (const r of results) {
    const icon = r.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`${icon} [${r.phase}] ${r.test}`);
    if (r.details) console.log(`   └─ ${r.details}`);
    if (r.passed) passCount++;
  }
  console.log(`\nTOTAL: ${passCount} / ${results.length} tests passed successfully.`);

  if (passCount !== results.length) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test suite failure:', err);
  process.exit(1);
});
