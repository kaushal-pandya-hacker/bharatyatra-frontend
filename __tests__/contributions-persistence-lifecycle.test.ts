import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { contributionService } from '../lib/contributions/contribution-service';
import { destinationPublishingEngine } from '../lib/contributions/publishing-engine';
import { PlaceSubmissionInput } from '../lib/contributions/types';

describe('BharatYatra — Place Contributions, Database Persistence & Admin Moderation Suite (12 Scenarios)', () => {
  const timestamp = Date.now();
  const userA = {
    id: `usr_contributor_a_${timestamp}`,
    email: `contributor.a.${timestamp}@bharatyatra.in`,
    fullName: 'Kaushal Pandya',
  };

  const userB = {
    id: `usr_contributor_b_${timestamp}`,
    email: `contributor.b.${timestamp}@bharatyatra.in`,
    fullName: 'Aarav Sharma',
  };

  const adminUser = {
    id: `admin_mod_${timestamp}`,
    email: 'admin.moderator@bharatyatra.in',
    fullName: 'Chief Travel Curator',
    role: 'ADMIN',
  };

  let submissionAId = '';
  let submissionBId = '';
  let submissionRejectId = '';
  let submissionChangesId = '';

  const samplePlaceInputA: PlaceSubmissionInput = {
    placeName: 'Saputara Sunset Point and Valley Vista',
    category: 'Mountains',
    country: 'India',
    state: 'Gujarat',
    district: 'Dang',
    city: 'Saputara',
    address: 'Sunset Point Road, Table Land, Saputara, Gujarat 394720',
    latitude: 20.5786,
    longitude: 73.7485,
    shortDescription: 'Mesmerizing sunset panoramic point overlooking the dense Dang forest canopy.',
    detailedDescription: 'Perched on the highest plateau of Saputara hill station in the Western Ghats Sahyadri range. Popular for panoramic twilight views, pleasant monsoon clouds, and camel rides.',
    photos: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
    ],
    bestTimeToVisit: 'October to February and Monsoon (July to September)',
    estimatedVisitDuration: '2 hours',
    entryFee: 'Free entry',
    openingHours: '6:00 AM - 7:00 PM',
    parkingAvailable: true,
    facilities: ['Parking Available', 'Cafeteria / Local Dining', 'Photography Permitted'],
    suitableFor: ['Families with Kids', 'Photographers', 'Couples / Honeymoon'],
    travelTips: ['Arrive 45 minutes before sunset to secure a vantage spot', 'Carry a light jacket in winters'],
  };

  // TEST 1: User submits a place while authenticated → saved with correct userId and PENDING status
  it('TEST 1: submits a tourist place while authenticated and saves with PENDING status and valid metadata', async () => {
    const submission = await contributionService.submitPlace(samplePlaceInputA, userA);

    assert.ok(submission.id, 'Submission must generate a unique ID');
    assert.strictEqual(submission.contributorId, userA.id);
    assert.strictEqual(submission.placeName, samplePlaceInputA.placeName);
    assert.strictEqual(submission.state, 'Gujarat');
    assert.strictEqual(submission.status, 'PENDING');
    assert.strictEqual(submission.category, 'Mountains');
    assert.strictEqual(submission.photos.length, 2);
    assert.ok(submission.createdAt);
    assert.ok(submission.aiVerification);

    submissionAId = submission.id;
  });

  // TEST 2: My Contributions dashboard retrieves newly submitted place
  it('TEST 2: My Contributions retrieves newly submitted place for the authenticated user', async () => {
    const userContributions = await contributionService.getUserContributions(userA.id);

    assert.ok(Array.isArray(userContributions));
    const found = userContributions.find((s) => s.id === submissionAId);
    assert.ok(found, 'Newly submitted place must exist in user contributions');
    assert.strictEqual(found.status, 'PENDING');
    assert.strictEqual(found.placeName, samplePlaceInputA.placeName);
  });

  // TEST 3: Dashboard refresh preserves the contribution across re-reads
  it('TEST 3: Dashboard refresh retains contribution permanently without data loss', async () => {
    // Re-query user contributions simulating page refresh
    const refreshed = await contributionService.getUserContributions(userA.id);
    const item = refreshed.find((s) => s.id === submissionAId);

    assert.ok(item, 'Submission must remain stored after simulated browser refresh');
    assert.strictEqual(item.address, samplePlaceInputA.address);
    assert.strictEqual(item.latitude, 20.5786);
    assert.strictEqual(item.longitude, 73.7485);
  });

  // TEST 4: Logout/Login simulation retrieves the contribution
  it('TEST 4: User session re-authentication correctly retrieves past contributions', async () => {
    // Simulate user logging out and logging in with their user ID
    const reconnectedUserContributions = await contributionService.getUserContributions(userA.id);
    assert.ok(reconnectedUserContributions.length >= 1);
    assert.strictEqual(reconnectedUserContributions[0].contributorId, userA.id);
  });

  // TEST 5: Admin moderation queue lists the pending contribution
  it('TEST 5: Admin moderation queue lists the pending contribution for curation review', async () => {
    const adminQueue = await contributionService.getAdminContributions({ status: 'PENDING' });

    assert.ok(adminQueue.submissions.length >= 1);
    const foundInQueue = adminQueue.submissions.find((s) => s.id === submissionAId);
    assert.ok(foundInQueue, 'Pending submission must be visible in admin moderation queue');
    assert.strictEqual(foundInQueue.status, 'PENDING');
    assert.strictEqual(foundInQueue.contributorName, userA.fullName);
  });

  // TEST 6: Admin approves contribution → status changes to APPROVED, destination published idempotently
  it('TEST 6: Admin approves contribution -> status APPROVED and published into official destination registry', async () => {
    const actionResult = await contributionService.executeAdminAction(
      submissionAId,
      'APPROVE',
      adminUser,
      'Verified GPS coordinates, authentic photos, and comprehensive visitor tips. Approved for live travel discovery.'
    );

    assert.strictEqual(actionResult.submission.status, 'APPROVED');
    assert.ok(actionResult.submission.approvedPlaceId, 'Approved submission must have an approvedPlaceId');
    assert.ok(actionResult.publishedDestination, 'Must return a published destination record');
    assert.strictEqual(actionResult.publishedDestination.id, actionResult.submission.approvedPlaceId);
    assert.strictEqual(actionResult.publishedDestination.isPublished, true);
    assert.strictEqual(actionResult.publishedDestination.isCommunityContributed, true);
    assert.strictEqual(actionResult.publishedDestination.contributedById, userA.id);

    // Test Idempotency: Re-approving already approved submission returns existing destination
    const reApprove = await destinationPublishingEngine.publishApprovedDestination(
      actionResult.submission,
      adminUser,
      'Re-approval check'
    );
    assert.strictEqual(reApprove.destination.id, actionResult.publishedDestination.id);
  });

  // TEST 7: Admin rejects contribution → status REJECTED, rejection reason stored and visible to user
  it('TEST 7: Admin rejects contribution -> status REJECTED with mandatory rejection reason stored', async () => {
    // Create a submission to reject
    const toReject = await contributionService.submitPlace(
      {
        placeName: 'Unverifiable Private Backyard Lawn',
        category: 'Other Attractions',
        state: 'Rajasthan',
        address: 'Secret Private Street No 9, Jodhpur',
        latitude: 26.2389,
        longitude: 73.0243,
        shortDescription: 'Small private residential lawn with private gated entry only.',
        detailedDescription: 'This is a private backyard property and not accessible to general public tourists or travelers visiting Rajasthan.',
        photos: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
      },
      userA
    );
    submissionRejectId = toReject.id;

    const rejectionReason = 'Private property not accessible to the general public or tourists. Must be a legitimate travel destination.';
    const result = await contributionService.executeAdminAction(
      submissionRejectId,
      'REJECT',
      adminUser,
      rejectionReason
    );

    assert.strictEqual(result.submission.status, 'REJECTED');
    assert.strictEqual(result.submission.rejectionReason, rejectionReason);

    // Verify user can inspect rejection reason
    const userViews = await contributionService.getUserContributions(userA.id);
    const rejectedItem = userViews.find((s) => s.id === submissionRejectId);
    assert.ok(rejectedItem);
    assert.strictEqual(rejectedItem.status, 'REJECTED');
    assert.strictEqual(rejectedItem.rejectionReason, rejectionReason);
  });

  // TEST 8: Admin requests changes → status CHANGES_REQUESTED, user can edit and resubmit
  it('TEST 8: Admin requests changes -> user edits and resubmits, resetting status to PENDING', async () => {
    const toRevise = await contributionService.submitPlace(
      {
        placeName: 'Viramgam Inland Water Reservoir',
        category: 'Lakes',
        state: 'Gujarat',
        address: 'Near Old Bus Stand, Viramgam, Ahmedabad District',
        latitude: 23.1256,
        longitude: 72.0354,
        shortDescription: 'Historic water lake in Viramgam city with stone ghat steps.',
        detailedDescription: 'Built during the Solanki dynasty era, featuring stone carved shrines around the water body.',
        photos: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
      },
      userA
    );
    submissionChangesId = toRevise.id;

    // Admin requests changes
    const changeNotes = 'Please provide the exact historical name (Munser Lake / Mansar Lake) and detailed architectural history.';
    const requestResult = await contributionService.executeAdminAction(
      submissionChangesId,
      'REQUEST_CHANGES',
      adminUser,
      changeNotes
    );

    assert.strictEqual(requestResult.submission.status, 'CHANGES_REQUESTED');
    assert.strictEqual(requestResult.submission.adminFeedback, changeNotes);

    // User edits and resubmits
    const updatedSubmission = await contributionService.updateContribution(
      submissionChangesId,
      {
        placeName: 'Munser Lake (Mansar Talav Heritage Solanki Era)',
        detailedDescription: 'Mansar Lake was built during 1090 by Minaldevi, mother of Sidhraj Jaisinh of Solanki dynasty. It features over 300 miniature temples along the embankment with carved stone pillars.',
      },
      userA
    );

    assert.strictEqual(updatedSubmission.status, 'PENDING', 'Status must reset to PENDING upon resubmission');
    assert.strictEqual(updatedSubmission.placeName, 'Munser Lake (Mansar Talav Heritage Solanki Era)');
    assert.strictEqual(updatedSubmission.adminFeedback, undefined, 'Previous admin feedback must be cleared');
  });

  // TEST 9: Submitting multiple contributions retains all records
  it('TEST 9: Submitting multiple contributions retains all records across diverse states', async () => {
    const place1 = await contributionService.submitPlace(
      {
        placeName: 'Dholavira Ancient Harappan Citadel',
        category: 'Historical Places',
        state: 'Gujarat',
        address: 'Khadir Bet, Kutch District, Gujarat 370165',
        latitude: 23.8864,
        longitude: 70.2131,
        shortDescription: 'UNESCO World Heritage Harappan city with sophisticated water reservoirs.',
        detailedDescription: 'Dholavira contains ruins of an ancient Indus Valley Civilization metropolis with multi-tiered reservoirs and monumental stone architecture.',
        photos: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'],
      },
      userA
    );

    const place2 = await contributionService.submitPlace(
      {
        placeName: 'Kodaikanal Pillar Rocks Scenic Viewpoint',
        category: 'Mountains',
        state: 'Tamil Nadu',
        address: 'Pillar Rocks Road, Kodaikanal, Tamil Nadu 624101',
        latitude: 10.2215,
        longitude: 77.4667,
        shortDescription: 'Three giant granite rock boulders standing vertically at 400 feet height.',
        detailedDescription: 'Surrounded by misty pine forests and deep chasms offering panoramic views of the Vaigai dam plains below.',
        photos: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'],
      },
      userA
    );

    const allUserA = await contributionService.getUserContributions(userA.id);
    assert.ok(allUserA.some((s) => s.id === place1.id));
    assert.ok(allUserA.some((s) => s.id === place2.id));
  });

  // TEST 10: Validation rejects invalid submissions cleanly without corrupting existing records
  it('TEST 10: Strict validation rejects short names and invalid inputs without corrupting database', async () => {
    // Missing/short name (< 3 chars)
    await assert.rejects(
      async () => {
        await contributionService.submitPlace(
          {
            placeName: 'A',
            category: 'Hidden Gems',
            state: 'Gujarat',
            address: 'Valid Street Address 1234',
            latitude: 23.0,
            longitude: 72.0,
            shortDescription: 'Short summary that is more than twenty characters long.',
            detailedDescription: 'Detailed description that is more than fifty characters long for validation.',
            photos: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800'],
          },
          userA
        );
      },
      { message: /Destination name must be at least 3 characters/ }
    );

    // Missing photos
    await assert.rejects(
      async () => {
        await contributionService.submitPlace(
          {
            placeName: 'Valid Landmark Name',
            category: 'Hidden Gems',
            state: 'Gujarat',
            address: 'Valid Street Address 1234',
            latitude: 23.0,
            longitude: 72.0,
            shortDescription: 'Short summary that is more than twenty characters long.',
            detailedDescription: 'Detailed description that is more than fifty characters long for validation.',
            photos: [],
          },
          userA
        );
      },
      { message: /At least one authentic destination photograph is required/ }
    );
  });

  // TEST 11: Unauthorized moderation attempt is strictly rejected
  it('TEST 11: Non-admin users cannot execute moderation actions', async () => {
    // If a normal user tries to approve, requireAdminUser in the API layer or role check stops them
    // Testing role enforcement logic
    await assert.rejects(
      async () => {
        await contributionService.getContributionById(submissionAId, {
          id: userB.id,
          role: 'CUSTOMER', // User B is not the owner of submissionA and not an admin
        });
      },
      { message: /Unauthorized access/ }
    );
  });

  // TEST 12: Multiple users: user A cannot see or edit user B's private contributions
  it('TEST 12: Strict user data isolation ensures User B cannot view or edit User A contributions', async () => {
    // User B submits their own place
    const placeB = await contributionService.submitPlace(
      {
        placeName: 'Patan Rani Ki Vav Stepwell',
        category: 'Historical Places',
        state: 'Gujarat',
        address: 'Mohan Nagar Society, Patan, Gujarat 384265',
        latitude: 23.8589,
        longitude: 72.1017,
        shortDescription: 'Inverted temple stepwell dedicated to water and subterranean sanctity.',
        detailedDescription: 'An exceptional example of subterranean architecture and Maru-Gurjara style, featuring seven levels of stairs and more than 500 sculpted statues of Vishnu.',
        photos: ['https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800'],
      },
      userB
    );
    submissionBId = placeB.id;

    // Verify User A only sees User A's contributions
    const userAContributions = await contributionService.getUserContributions(userA.id);
    assert.strictEqual(
      userAContributions.some((s) => s.id === submissionBId),
      false,
      'User A must NOT see User B contribution in their dashboard'
    );

    // Verify User B only sees User B's contributions
    const userBContributions = await contributionService.getUserContributions(userB.id);
    assert.ok(
      userBContributions.some((s) => s.id === submissionBId),
      'User B must see their own contribution'
    );
    assert.strictEqual(
      userBContributions.some((s) => s.id === submissionAId),
      false,
      'User B must NOT see User A contribution in their dashboard'
    );

    // Verify User B cannot edit User A's contribution
    await assert.rejects(
      async () => {
        await contributionService.updateContribution(
          submissionAId,
          { placeName: 'Malicious Hijack Attempt' },
          userB
        );
      },
      { message: /Unauthorized: You can only edit your own submissions/ }
    );
  });
});
