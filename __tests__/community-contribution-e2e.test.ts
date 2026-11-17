import test from 'node:test';
import assert from 'node:assert/strict';
import { contributionService } from '../lib/contributions/contribution-service';
import { contributorRewardService } from '../lib/rewards/contributor-reward-service';
import { destinationPublishingEngine } from '../lib/contributions/publishing-engine';
import { dispatchApprovalRewardNotifications, formatRewardWhatsAppText } from '../lib/notifications/reward-notification';

test('BharatYatra Community Contribution & 7% Reward End-to-End Workflow', async (t) => {
  const testUser = {
    id: `qa_user_${Date.now()}`,
    email: 'kaushal.pandya@bharatyatra.in',
    fullName: 'Kaushal Pandya',
    phone: '+91 96242 82521',
  };

  const adminUser = {
    id: 'admin_qa_001',
    email: 'admin@bharatyatra.in',
    fullName: 'Admin Operations Lead',
    role: 'ADMIN',
  };

  let submissionId = '';
  let issuedCouponCode = '';

  await t.test('Phase 1 & 2: User submits a community tourist destination', async () => {
    const submission = await contributionService.submitPlace(
      {
        placeName: `[QA TEST] Lothal Ancient Dockyard Heritage`,
        category: 'Historical Places',
        state: 'Gujarat',
        district: 'Ahmedabad',
        city: 'Saragwala',
        address: 'Lothal Archaeological Site, Saragwala, Gujarat 382220',
        latitude: 22.5224,
        longitude: 72.2494,
        shortDescription: 'One of the most prominent cities of the ancient Indus Valley Civilization with world oldest tidal dockyard.',
        detailedDescription: 'Discovered in 1954, Lothal holds the world oldest known port basin connecting the city to an ancient course of the Sabarmati river. Features bead-making factory and drainage system.',
        photos: [
          'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
        ],
        bestTimeToVisit: 'October to March',
        estimatedVisitDuration: '3-4 hours',
        entryFee: '₹25 for Indian Citizens, ₹300 for Foreigners',
        openingHours: '10:00 AM - 5:00 PM (Closed on Fridays)',
        facilities: ['Parking', 'Drinking Water', 'Restrooms', 'Museum'],
        travelTips: ['Visit the ASI Archaeological Museum on site', 'Hire an authorized ASI guide'],
      },
      testUser
    );

    assert.ok(submission.id, 'Submission must generate unique ID');
    assert.equal(submission.status, 'PENDING');
    assert.equal(submission.contributorId, testUser.id);
    submissionId = submission.id;
  });

  await t.test('Phase 3 & 4: Admin reviews and approves submission -> Destination Published', async () => {
    assert.ok(submissionId, 'Submission ID must exist');

    const result = await contributionService.executeAdminAction(
      submissionId,
      'APPROVE',
      adminUser,
      'Verified authentic ASI heritage landmark with verified geo-coordinates.'
    );

    assert.equal(result.submission.status, 'APPROVED');
    assert.ok(result.submission.approvedPlaceId, 'Approved submission must have approvedPlaceId');
    assert.ok(result.submission.rewardCouponCode, 'Approval must automatically generate 7% reward coupon code');
    issuedCouponCode = result.submission.rewardCouponCode;
  });

  await t.test('Phase 5: 7% Contributor Reward Generation & Idempotency Guarantee', async () => {
    assert.ok(issuedCouponCode, 'Issued coupon code must exist');
    assert.match(issuedCouponCode, /^BHARAT7-[A-F0-9]{6}$/, 'Coupon code must follow BHARAT7-XXXXXX pattern');

    // Verify coupon is stored in rewards service
    const coupon = contributorRewardService.getCouponByCode(issuedCouponCode);
    assert.ok(coupon, 'Coupon must exist in reward store');
    assert.equal(coupon?.status, 'ACTIVE');
    assert.equal(coupon?.discountPercent, 7);
    assert.equal(coupon?.minBookingInr, 2500);
    assert.equal(coupon?.maxDiscountInr, 2000);
    assert.equal(coupon?.contributorId, testUser.id);

    // Verify Idempotency: Attempting to issue approval reward again returns identical coupon
    const duplicate = contributorRewardService.issueApprovalReward({
      id: submissionId,
      contributorId: testUser.id,
      contributorName: testUser.fullName,
      contributorEmail: testUser.email,
      placeName: '[QA TEST] Lothal Ancient Dockyard Heritage',
    });
    assert.equal(duplicate.code, issuedCouponCode, 'Reward issuance must be idempotent for the same submission');
  });

  await t.test('Phase 6 & 7: Multi-Channel Notifications (WhatsApp & Email truthfulness, In-App delivered)', async () => {
    // 1. WhatsApp Template text formatting check
    const waText = formatRewardWhatsAppText({
      contributorId: testUser.id,
      contributorName: testUser.fullName,
      contributorEmail: testUser.email,
      placeName: 'Lothal Ancient Dockyard',
      couponCode: issuedCouponCode,
      discountPercent: 7,
      validUntil: new Date(Date.now() + 90 * 86400000).toISOString(),
    });

    assert.ok(waText.includes('Your place contribution has been approved'), 'Must state contribution approved');
    assert.ok(waText.includes('7% discount'), 'Must state 7% discount');
    assert.ok(waText.includes(issuedCouponCode), 'Must contain generated coupon code');

    // 2. Dispatch notification and check truthful reporting without hallucination
    const dispatchResult = await dispatchApprovalRewardNotifications({
      contributorId: testUser.id,
      contributorName: testUser.fullName,
      contributorEmail: testUser.email,
      contributorPhone: testUser.phone,
      placeName: 'Lothal Ancient Dockyard',
      couponCode: issuedCouponCode,
      discountPercent: 7,
      validUntil: new Date(Date.now() + 90 * 86400000).toISOString(),
      destinationSlug: 'lothal-ancient-dockyard',
    });

    assert.equal(dispatchResult.inAppStatus, 'SENT', 'In-App notification must be delivered');
    // In local/test environment without WHATSAPP_API_TOKEN, WhatsApp must report NOT_CONFIGURED truthfully
    assert.equal(dispatchResult.whatsApp.status, 'NOT_CONFIGURED', 'WhatsApp must report NOT_CONFIGURED when API token is omitted');
    assert.ok(dispatchResult.whatsApp.whatsAppDirectUrl?.includes('919624282521'), 'Must provide direct WhatsApp click-to-chat URL');
  });

  await t.test('Phase 9: Booking Checkout Coupon Validation & Single-Use Redemption', async () => {
    // 1. Rejected if below minimum booking value (₹2,500)
    const lowVal = contributorRewardService.validateCoupon({
      code: issuedCouponCode,
      userId: testUser.id,
      bookingAmountInr: 1500,
    });
    assert.equal(lowVal.valid, false);
    assert.ok(lowVal.error?.includes('Minimum booking value of ₹2,500'));

    // 2. Rejected if attempted by a different user
    const otherUserVal = contributorRewardService.validateCoupon({
      code: issuedCouponCode,
      userId: 'stranger_user_999',
      bookingAmountInr: 5000,
    });
    assert.equal(otherUserVal.valid, false);
    assert.ok(otherUserVal.error?.includes('personal to'));

    // 3. Successfully applied for valid booking (₹10,000 -> 7% = ₹700 discount)
    const validBooking = contributorRewardService.validateCoupon({
      code: issuedCouponCode,
      userId: testUser.id,
      userEmail: testUser.email,
      bookingAmountInr: 10000,
    });
    assert.equal(validBooking.valid, true);
    assert.equal(validBooking.discountPercent, 7);
    assert.equal(validBooking.discountAmountInr, 700);
    assert.equal(validBooking.finalAmountInr, 9300);

    // 4. Large booking (₹50,000 -> 7% = ₹3,500 -> capped at ₹2,000 maxDiscountInr)
    const cappedBooking = contributorRewardService.validateCoupon({
      code: issuedCouponCode,
      userId: testUser.id,
      bookingAmountInr: 50000,
    });
    assert.equal(cappedBooking.valid, true);
    assert.equal(cappedBooking.discountAmountInr, 2000, 'Discount must be capped at ₹2,000');
    assert.equal(cappedBooking.finalAmountInr, 48000);

    // 5. Successful single-use redemption
    const redeemResult = contributorRewardService.redeemCoupon({
      code: issuedCouponCode,
      userId: testUser.id,
      userEmail: testUser.email,
      bookingId: 'BK-QA-77291',
      bookingAmountInr: 10000,
    });
    assert.equal(redeemResult.success, true);
    assert.equal(redeemResult.discountSavedInr, 700);

    // 6. Rejected on second attempt (already redeemed)
    const reRedeem = contributorRewardService.validateCoupon({
      code: issuedCouponCode,
      userId: testUser.id,
      bookingAmountInr: 10000,
    });
    assert.equal(reRedeem.valid, false);
    assert.ok(reRedeem.error?.includes('already been redeemed'));

    // 7. Rollback / Release test
    const releaseSuccess = contributorRewardService.releaseCoupon(issuedCouponCode, 'Payment gateway simulation timeout recovery');
    assert.equal(releaseSuccess, true);

    const afterRelease = contributorRewardService.getCouponByCode(issuedCouponCode);
    assert.equal(afterRelease?.status, 'ACTIVE', 'Released coupon must return to ACTIVE status');
  });
});
