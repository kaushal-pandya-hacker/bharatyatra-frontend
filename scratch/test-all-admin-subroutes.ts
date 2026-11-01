import { NextRequest } from 'next/server';
import { GET as getTravelPartners } from '../app/api/v1/admin/travel-partners/route';
import { GET as getTravelPackages } from '../app/api/v1/admin/travel-packages/route';
import { GET as getTravelCommissions } from '../app/api/v1/admin/travel-commissions/route';
import { GET as getTravelPartnerAudit } from '../app/api/v1/admin/travel-partner-audit/route';
import { GET as getSuppliers } from '../app/api/v1/admin/suppliers/route';
import { PATCH as patchSupplierVerification } from '../app/api/v1/admin/suppliers/[id]/verification/route';
import { GET as getInventory } from '../app/api/v1/admin/inventory/route';
import { PATCH as patchInventoryStatus } from '../app/api/v1/admin/inventory/[id]/status/route';
import { GET as getBookings } from '../app/api/v1/admin/bookings/route';
import { GET as getSettlements } from '../app/api/v1/admin/settlements/route';
import { POST as postSettlementStatus } from '../app/api/v1/admin/settlements/[id]/status/route';
import { GET as getAuditLogs } from '../app/api/v1/admin/audit-logs/route';

async function testAll() {
  console.log('--- TESTING ALL ADMIN SUBROUTES WITH ADMIN TOKEN ---');
  const token = 'admin-token-admin-super-001-1793522553085';
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const tests: Array<{ name: string; run: () => Promise<any> }> = [
    {
      name: 'GET /api/v1/admin/travel-partners',
      run: async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/admin/travel-partners', { headers });
        const res = await getTravelPartners(req);
        const data = await res.json();
        return { status: res.status, ok: res.status === 200 && data.success === true };
      },
    },
    {
      name: 'GET /api/v1/admin/travel-packages',
      run: async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/admin/travel-packages', { headers });
        const res = await getTravelPackages(req);
        const data = await res.json();
        return { status: res.status, ok: res.status === 200 && data.success === true };
      },
    },
    {
      name: 'GET /api/v1/admin/travel-commissions',
      run: async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/admin/travel-commissions', { headers });
        const res = await getTravelCommissions(req);
        const data = await res.json();
        return { status: res.status, ok: res.status === 200 && data.success === true };
      },
    },
    {
      name: 'GET /api/v1/admin/travel-partner-audit',
      run: async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/admin/travel-partner-audit', { headers });
        const res = await getTravelPartnerAudit(req);
        const data = await res.json();
        return { status: res.status, ok: res.status === 200 && data.success === true };
      },
    },
    {
      name: 'GET /api/v1/admin/suppliers',
      run: async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/admin/suppliers', { headers });
        const res = await getSuppliers(req);
        const data = await res.json();
        return { status: res.status, ok: res.status === 200 && data.success === true && Array.isArray(data.data) };
      },
    },
    {
      name: 'PATCH /api/v1/admin/suppliers/[id]/verification',
      run: async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/admin/suppliers/supp-001/verification', {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status: 'VERIFIED', reason: 'Automated test verification' }),
        });
        const res = await patchSupplierVerification(req, { params: { id: 'supp-001' } });
        const data = await res.json();
        return { status: res.status, ok: res.status === 200 && data.success === true };
      },
    },
    {
      name: 'GET /api/v1/admin/inventory',
      run: async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/admin/inventory', { headers });
        const res = await getInventory(req);
        const data = await res.json();
        return { status: res.status, ok: res.status === 200 && data.success === true && Array.isArray(data.data) };
      },
    },
    {
      name: 'PATCH /api/v1/admin/inventory/[id]/status',
      run: async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/admin/inventory/inv-001/status', {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status: 'ACTIVE', reason: 'Listing approved' }),
        });
        const res = await patchInventoryStatus(req, { params: { id: 'inv-001' } });
        const data = await res.json();
        return { status: res.status, ok: res.status === 200 && data.success === true };
      },
    },
    {
      name: 'GET /api/v1/admin/bookings',
      run: async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/admin/bookings', { headers });
        const res = await getBookings(req);
        const data = await res.json();
        return { status: res.status, ok: res.status === 200 && data.success === true && Array.isArray(data.data) };
      },
    },
    {
      name: 'GET /api/v1/admin/settlements',
      run: async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/admin/settlements', { headers });
        const res = await getSettlements(req);
        const data = await res.json();
        return { status: res.status, ok: res.status === 200 && data.success === true && Array.isArray(data.data?.items) };
      },
    },
    {
      name: 'POST /api/v1/admin/settlements/[id]/status',
      run: async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/admin/settlements/stl-001/status', {
          method: 'POST',
          headers,
          body: JSON.stringify({ status: 'SETTLED', settlementReference: 'STL-AUTO-TEST' }),
        });
        const res = await postSettlementStatus(req, { params: { id: 'stl-001' } });
        const data = await res.json();
        return { status: res.status, ok: res.status === 200 && data.success === true };
      },
    },
    {
      name: 'GET /api/v1/admin/audit-logs',
      run: async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/admin/audit-logs', { headers });
        const res = await getAuditLogs(req);
        const data = await res.json();
        return { status: res.status, ok: res.status === 200 && data.success === true && Array.isArray(data.data) };
      },
    },
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const result = await t.run();
      if (result.ok) {
        console.log(`✅ ${t.name}: PASSED (HTTP ${result.status})`);
        passed++;
      } else {
        console.error(`❌ ${t.name}: FAILED (HTTP ${result.status})`);
      }
    } catch (err: any) {
      console.error(`❌ ${t.name}: EXCEPTION - ${err?.message}`);
    }
  }

  console.log(`\nALL ADMIN SUBROUTES RESULT: ${passed} / ${tests.length} PASSED`);
  if (passed !== tests.length) {
    process.exit(1);
  }
}

testAll().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

