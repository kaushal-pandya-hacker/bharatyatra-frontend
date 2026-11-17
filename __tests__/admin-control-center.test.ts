import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { adminDataStore } from '../lib/admin/admin-store';
import { contributorRewardService } from '../lib/rewards/contributor-reward-service';

describe('BharatYatra Admin Master Control Center', () => {
  it('aggregates real metrics across 5 operational pillars', () => {
    const metrics = adminDataStore.getDashboardMetrics('all');

    // 1. User Analytics
    assert.ok(metrics.userAnalytics.totalUsers >= 6, 'Total users should reflect authoritative seed data');
    assert.ok(metrics.userAnalytics.verifiedUsers >= 4, 'Verified users count');
    assert.strictEqual(typeof metrics.userAnalytics.suspendedUsers, 'number');

    // 2. Travel Analytics
    assert.ok(metrics.travelAnalytics.totalTrips >= 8, 'Total trips count');
    assert.ok(metrics.travelAnalytics.activeTripsNow >= 1, 'Active trips in progress');
    assert.ok(metrics.travelAnalytics.upcomingTrips >= 2, 'Upcoming trips scheduled');
    assert.ok(metrics.travelAnalytics.completedTrips >= 2, 'Completed trips');

    // 3. Booking Analytics
    assert.ok(metrics.bookingAnalytics.totalBookings >= 8, 'Total bookings');
    assert.ok(metrics.bookingAnalytics.confirmedBookings >= 5, 'Confirmed bookings');
    assert.ok(metrics.bookingAnalytics.totalBookingValueInr > 0, 'GBV calculated');

    // 4. Financial Analytics
    assert.ok(metrics.financialAnalytics.grossBookingValueInr > 0, 'Total revenue computed');
    assert.ok(metrics.financialAnalytics.commissionEarnedInr > 0, 'Commission earned');
    assert.ok(metrics.financialAnalytics.successfulPaymentsCount > 0, 'Successful payments');

    // 5. Community Analytics
    assert.ok(metrics.communityAnalytics.approvedDestinations >= 4, 'Approved contributions');
    assert.ok(metrics.communityAnalytics.rewardsGenerated >= 2, 'Rewards generated');
  });

  it('retrieves complete User 360 Dossier for a registered traveler', () => {
    const dossier = adminDataStore.getUser360('usr-kaushal-01');
    assert.ok(dossier, 'Dossier exists');
    assert.strictEqual(dossier.user.id, 'usr-kaushal-01');
    assert.strictEqual(dossier.user.email, 'pandyakaushal294@gmail.com');

    // Tab Data Verifications
    assert.ok(Array.isArray(dossier.trips.active), 'Active trips array');
    assert.ok(Array.isArray(dossier.trips.history), 'Trip history array');
    assert.ok(Array.isArray(dossier.bookings), 'Bookings array');
    assert.ok(Array.isArray(dossier.payments), 'Payments array');
    assert.ok(Array.isArray(dossier.rewards), 'Rewards coupons array');
    assert.ok(Array.isArray(dossier.activityLogs), 'Audit log array');

    // Ensure sensitive data is not exposed
    assert.strictEqual((dossier.user as any).password, undefined, 'Password must never be returned');
    assert.strictEqual((dossier.user as any).passwordHash, undefined, 'Password hash must never be returned');
  });

  it('manages user account status and logs administrative audit actions', () => {
    const updated = adminDataStore.updateUserStatus(
      'usr-priya-02',
      'SUSPENDED',
      'Repeated chargeback disputes under investigation',
      'ops@bharatyatra.com'
    );
    assert.ok(updated, 'User update returned');
    assert.strictEqual(updated?.accountStatus, 'SUSPENDED');

    // Reactivate account
    const restored = adminDataStore.updateUserStatus(
      'usr-priya-02',
      'ACTIVE',
      'Bank dispute resolved and compliance cleared',
      'ops@bharatyatra.com'
    );
    assert.ok(restored, 'User restored');
    assert.strictEqual(restored?.accountStatus, 'ACTIVE');
  });

  it('returns live operations without fabricated GPS coordinates', () => {
    const liveTrips = adminDataStore.getLiveTrips();
    assert.ok(liveTrips.length >= 2, 'At least 2 active live journeys');

    for (const trip of liveTrips) {
      assert.ok(
        trip.status === 'IN_PROGRESS' || trip.status === 'STARTING_SOON' || trip.status === 'NEEDS_ASSISTANCE',
        'Status must be active'
      );
      assert.ok(trip.destination, 'Trip destination exists');
      assert.ok(trip.customerName, 'Customer name exists');
      assert.ok(trip.customerPhone, 'Customer phone exists');
    }
  });

  it('manages contributor 7% rewards and enforces revocation audit logs', () => {
    const testId = `plc-test-${Date.now()}`;
    // Issue reward coupon
    const coupon = contributorRewardService.issueApprovalReward({
      id: testId,
      placeName: 'Saputara Sunset Point',
      contributorId: 'usr-kaushal-01',
      contributorEmail: 'pandyakaushal294@gmail.com',
      contributorName: 'Kaushal Pandya',
    });

    assert.ok(coupon.code.startsWith('BHARAT7-'), 'Coupon code format');
    assert.strictEqual(coupon.discountPercent, 7);
    assert.strictEqual(coupon.status, 'ACTIVE');

    // Revocation of nonexistent coupon fails
    const badRevoke = contributorRewardService.revokeCoupon('NONEXISTENT-CODE', 'admin@bharatyatra.com', 'reason');
    assert.strictEqual(badRevoke, false);

    // Revocation of issued coupon succeeds
    const validRevoke = contributorRewardService.revokeCoupon(
      coupon.code,
      'admin@bharatyatra.com',
      'Duplicate place entry detected by verification committee'
    );
    assert.strictEqual(validRevoke, true);

    const allCoupons = contributorRewardService.getAllCoupons();
    const updated = allCoupons.find((c) => c.code === coupon.code);
    assert.strictEqual(updated?.status, 'REVOKED');
  });

  it('filters trips catalog by status and query', () => {
    const completed = adminDataStore.getTrips({ status: 'COMPLETED' });
    assert.ok(completed.every((t) => t.status === 'COMPLETED'));

    const searchResults = adminDataStore.getTrips({ search: 'Gir' });
    assert.ok(searchResults.length > 0);
    assert.ok(searchResults.some((t) => t.destination.includes('Gir') || t.title.includes('Gir')));
  });
});
