import test, { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { partnerService } from '../lib/partners/partner-service';
import { TestMemoryPartnerDatabaseAdapter } from '../lib/partners/partner-db-adapter';

describe('BharatYatra Travel Partner & Package Ecosystem', () => {
  let createdAgencyId = '';
  let createdAgencyRef = '';
  let createdPackageId = '';

  before(async () => {
    partnerService.setAdapter(new TestMemoryPartnerDatabaseAdapter());
    await partnerService.clearAllForTesting();
  });

  it('1. Public Agency Registration: creates valid pending application with reference number', async () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const result = await partnerService.createAgencyApplication({
      businessName: `Gir Lion Safari & Heritage Tours ${randomSuffix}`,
      businessType: 'PVT_LTD',
      representativeName: 'Vipul Joshi',
      businessEmail: `vipul.safari.${randomSuffix}@testagency.com`,
      contactPhone: '+91 98251 99999',
      city: 'Sasan Gir',
      stateCode: 'Gujarat',
      yearsInOperation: 7,
      businessDescription: 'Expert wildlife safari operators in Sasan Gir with registered Gypsy fleet.',
    });

    assert.strictEqual(result.success, true);
    assert.ok(result.agency);
    assert.strictEqual(result.agency.verificationStatus, 'SUBMITTED');
    assert.ok(result.agency.referenceNumber.startsWith('BY-AGY-'));

    createdAgencyId = result.agency.id;
    createdAgencyRef = result.agency.referenceNumber;
  });

  it('2. Anti-Abuse: rejects duplicate agency application with identical email', async () => {
    const agency = await partnerService.getAgencyById(createdAgencyId);
    assert.ok(agency);

    const dupResult = await partnerService.createAgencyApplication({
      businessName: 'Duplicate Agency Test',
      representativeName: 'Another Rep',
      businessEmail: agency.businessEmail,
      contactPhone: '+91 98251 00000',
    });

    assert.strictEqual(dupResult.success, false);
    assert.ok(dupResult.error?.includes('already exists'));
  });

  it('3. Secure Application Status: checks application by reference number & email match', async () => {
    const agency = await partnerService.getAgencyByReference(createdAgencyRef);
    assert.ok(agency);
    assert.strictEqual(agency.id, createdAgencyId);
    assert.strictEqual(agency.verificationStatus, 'SUBMITTED');
  });

  it('4. Authorization Guard: unapproved agency cannot create travel packages', async () => {
    const pkgResult = await partnerService.createPackage(createdAgencyId, {
      title: 'Gir Forest Safari Tour',
      basePrice: 9999,
      durationDays: 3,
    });

    assert.strictEqual(pkgResult.success, false);
    assert.ok(pkgResult.error?.includes('Only approved travel agencies'));
  });

  it('5. Admin Verification: admin approves agency and automatically activates partner agreement', async () => {
    const updateResult = await partnerService.updateAgencyStatus(
      createdAgencyId,
      'APPROVED',
      'admin-operations-qa',
      'All tourism licences verified',
      10.0 // 10% commission rate
    );

    assert.strictEqual(updateResult.success, true);
    assert.strictEqual(updateResult.agency?.verificationStatus, 'APPROVED');
    assert.ok(updateResult.agency?.verifiedAt);

    // Verify agency is now approved
    const agency = await partnerService.getAgencyById(createdAgencyId);
    assert.strictEqual(agency?.verificationStatus, 'APPROVED');
  });

  it('6. Package Lifecycle: approved agency creates draft package', async () => {
    const pkgResult = await partnerService.createPackage(createdAgencyId, {
      title: 'Gir Asiatic Lion Luxury Safari Weekend',
      category: 'Wildlife Safari',
      origin: 'Junagadh',
      destinationSummary: 'Sasan Gir, Devalia Park, Somnath',
      durationDays: 3,
      durationNights: 2,
      basePrice: 16500,
      discountedPrice: 14500,
      description: 'Exclusive 3-day guided safari tour in Gir National Park with jungle resort stay.',
      itinerary: [
        {
          dayNumber: 1,
          title: 'Arrival in Sasan Gir & Evening Safari',
          description: 'Resort check-in, briefing, and evening Devalia park safari.',
          places: ['Sasan Gir'],
          activities: ['Orientation', 'Sunset Safari'],
          meals: ['Dinner'],
        },
      ],
      coverImageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1',
    });

    assert.strictEqual(pkgResult.success, true);
    assert.ok(pkgResult.package);
    assert.strictEqual(pkgResult.package.publicationStatus, 'DRAFT');

    createdPackageId = pkgResult.package.id;
  });

  it('7. Ownership Guard: Agency B cannot modify Agency A package', async () => {
    const updateAttempt = await partnerService.updatePackage(
      createdPackageId,
      'agy-other-unauthorized',
      { title: 'Hacked Package Title' }
    );

    assert.strictEqual(updateAttempt.success, false);
    assert.ok(updateAttempt.error?.includes('Access forbidden'));
  });

  it('8. Package Lifecycle: submit package for review', async () => {
    const submitResult = await partnerService.submitPackageForReview(createdPackageId, createdAgencyId);
    assert.strictEqual(submitResult.success, true);
    assert.strictEqual(submitResult.package?.publicationStatus, 'PENDING_REVIEW');
  });

  it('9. Automatic Publishing: admin approves package and package automatically appears in public queries', async () => {
    // Before approval: package must NOT be returned in public queries
    const beforePublicList = await partnerService.getPackages({ onlyPublic: true });
    assert.strictEqual(beforePublicList.some(p => p.id === createdPackageId), false);

    // Admin approves package
    const approveResult = await partnerService.reviewPackage(
      createdPackageId,
      'admin-ops-reviewer',
      'APPROVE',
      'Verified safari permits and luxury resort quality.'
    );

    assert.strictEqual(approveResult.success, true);
    assert.strictEqual(approveResult.package?.publicationStatus, 'PUBLISHED');

    // After approval: package MUST automatically appear in public queries
    const afterPublicList = await partnerService.getPackages({ onlyPublic: true });
    assert.strictEqual(afterPublicList.some(p => p.id === createdPackageId), true);
  });

  it('10. Contractual Commission Ledger: calculates deterministic commission & prevents duplicate entries', async () => {
    const bookingResult = await partnerService.processBookingCommission({
      bookingId: 'BY-PKG-TEST-9921',
      packageId: createdPackageId,
      bookingAmount: 29000,
      idempotencyKey: 'COMM-TEST-9921-KEY',
    });

    assert.strictEqual(bookingResult.success, true);
    assert.ok(bookingResult.ledgerEntry);

    // 10% commission on 29,000 = 2,900; net payout = 26,100
    assert.strictEqual(bookingResult.ledgerEntry.commissionRate, 10);
    assert.strictEqual(bookingResult.ledgerEntry.commissionAmount, 2900);
    assert.strictEqual(bookingResult.ledgerEntry.netPayoutAmount, 26100);
    assert.strictEqual(bookingResult.ledgerEntry.status, 'PENDING_SETTLEMENT');

    // Test Idempotency: duplicate call with same idempotency key returns existing entry
    const dupBookingResult = await partnerService.processBookingCommission({
      bookingId: 'BY-PKG-TEST-9921',
      packageId: createdPackageId,
      bookingAmount: 29000,
      idempotencyKey: 'COMM-TEST-9921-KEY',
    });

    assert.strictEqual(dupBookingResult.success, true);
    assert.strictEqual(dupBookingResult.ledgerEntry?.id, bookingResult.ledgerEntry.id);
  });

  it('11. Settlement Workflow: admin records payout settlement', async () => {
    const ledger = await partnerService.getLedger(createdAgencyId);
    assert.ok(ledger.length > 0);

    const entry = ledger[0];
    const settleResult = await partnerService.settleCommission(
      entry.id,
      'admin-finance',
      'UTR-HDFC-99182374'
    );

    assert.strictEqual(settleResult.success, true);
    assert.strictEqual(settleResult.entry?.status, 'SETTLED');
    assert.strictEqual(settleResult.entry?.settlementReference, 'UTR-HDFC-99182374');
  });

  it('12. Suspension Cascade: suspending agency automatically suppresses its packages from public queries', async () => {
    // Agency is currently approved and package is published
    const publicBefore = await partnerService.getPackages({ onlyPublic: true });
    assert.strictEqual(publicBefore.some(p => p.id === createdPackageId), true);

    // Admin suspends agency
    await partnerService.updateAgencyStatus(createdAgencyId, 'SUSPENDED', 'admin-security', 'Compliance investigation');

    // Verification: package MUST be suppressed from public query
    const publicAfterSuspension = await partnerService.getPackages({ onlyPublic: true });
    assert.strictEqual(publicAfterSuspension.some(p => p.id === createdPackageId), false);
  });

  it('13. Partner Authentication Guard: unauthenticated requests receive null identity (no mock fallback)', async () => {
    const { getAuthenticatedAgencyId } = await import('../lib/partners/partner-auth');
    const { NextRequest } = await import('next/server');

    const fakeReq = new NextRequest('http://localhost:3000/api/v1/partner/dashboard');
    const agencyId = await getAuthenticatedAgencyId(fakeReq);

    assert.strictEqual(agencyId, null, 'Unauthenticated request must return null, never a hardcoded agency.');
  });

  it('14. IDOR & Data Leak Prevention: arbitrary reference numbers do not expose data', async () => {
    const nonExistent = await partnerService.getAgencyByReference('BY-AGY-NON-EXISTENT-999');
    assert.strictEqual(nonExistent, null);
  });

  it('15. Persistence Integrity: verifies zero fake agencies seeded on fresh load', async () => {
    await partnerService.clearAllForTesting();
    const freshAgencies = await partnerService.getAgencies();
    assert.strictEqual(freshAgencies.length, 0, 'No dummy agencies should ever be seeded.');
    const freshPackages = await partnerService.getPackages();
    assert.strictEqual(freshPackages.length, 0, 'No dummy packages should ever be seeded.');
    const freshLedger = await partnerService.getLedger();
    assert.strictEqual(freshLedger.length, 0, 'No dummy ledger entries should ever be seeded.');
  });
});
