import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { contributionService } from '../lib/contributions/contribution-service';
import { destinationPublishingEngine, generateDestinationSlug } from '../lib/contributions/publishing-engine';
import { findDestinationMaster } from '../lib/ai-planner/destination-master-service';
import { CONTRIBUTION_CATEGORIES, ALL_14_CATEGORIES } from '../lib/contributions/types';
import type { PlaceSubmissionInput } from '../lib/contributions/types';

describe('User Destination Contribution & Admin Approval System — Complete Test Suite', () => {
  const authorUser = {
    id: 'user_contributor_alpha_123',
    email: 'traveler.alpha@bharatyatra.in',
    fullName: 'Kaushal Alpha Traveler',
  };

  const otherUser = {
    id: 'user_visitor_beta_456',
    email: 'traveler.beta@bharatyatra.in',
    fullName: 'Visitor Beta Traveler',
  };

  const adminUser = {
    id: 'admin_super_moderator_999',
    email: 'admin.moderator@bharatyatra.in',
    fullName: 'Chief Tourism Moderator',
  };

  describe('PHASE 1: 14 Supported Categories & Taxonomy Validation', () => {
    it('should support all 14 official contribution categories', () => {
      const expected = [
        'Hill Station',
        'Waterfall',
        'Temple',
        'Historical Place',
        'Beach',
        'Adventure',
        'Wildlife Sanctuary',
        'National Park',
        'Religious Place',
        'Lake',
        'Village Tourism',
        'Trekking',
        'Cultural Destination',
        'Other',
      ];
      assert.strictEqual(ALL_14_CATEGORIES.length, 14);
      for (const cat of expected) {
        assert.ok(ALL_14_CATEGORIES.includes(cat), `Category "${cat}" must be present in ALL_14_CATEGORIES`);
      }
    });
  });

  describe('PHASE 2 & 8: Submission Validations, Geographic Bounds & Security', () => {
    it('should reject coordinates outside Indian geographic boundaries', async () => {
      const outOfBoundsInput: PlaceSubmissionInput = {
        placeName: 'Eiffel Tower Tour',
        category: 'Historical Place',
        state: 'Delhi',
        address: 'Champ de Mars, Paris, France',
        latitude: 48.8584, // France
        longitude: 2.2945,  // France
        shortDescription: 'World famous iron lattice tower located in Paris France.',
        detailedDescription: 'The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France. It is named after the engineer Gustave Eiffel.',
        photos: ['https://images.unsplash.com/photo-1511739001486-6bfe10ce785f'],
      };

      await assert.rejects(
        async () => {
          await contributionService.submitPlace(outOfBoundsInput, authorUser);
        },
        (err: Error) => {
          assert.ok(err.message.includes('Indian geographical boundaries'));
          return true;
        }
      );
    });

    it('should reject submission missing required photos or short description', async () => {
      const invalidInput: PlaceSubmissionInput = {
        placeName: 'Polo Forest Hidden River',
        category: 'Waterfall',
        state: 'Gujarat',
        address: 'Polo Forest Road, Sabarkantha',
        latitude: 23.9876,
        longitude: 73.1234,
        shortDescription: 'Too short', // < 20 chars
        detailedDescription: 'Detailed description that is long enough to meet the 50 characters requirement for the test.',
        photos: [], // Missing photo
      };

      await assert.rejects(async () => {
        await contributionService.submitPlace(invalidInput, authorUser);
      });
    });

    it('should sanitize HTML inputs to prevent XSS attacks', async () => {
      const xssInput: PlaceSubmissionInput = {
        placeName: 'Khambhalida Buddhist Caves <script>alert("xss")</script>',
        category: 'Historical Place',
        state: 'Gujarat',
        city: 'Gondal',
        address: 'Near Bhadar River, Rajkot District <img src=x onerror=alert(1)>',
        latitude: 21.7856,
        longitude: 70.7634,
        shortDescription: 'Ancient Buddhist rock-cut caves carved in limestone rock with intricate motifs.',
        detailedDescription: 'Khambhalida Caves are three Buddhist rock-cut caves located in Gondal, Gujarat dating back to the 4th-5th century AD.',
        photos: ['https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800'],
      };

      const result = await contributionService.submitPlace(xssInput, authorUser, { skipRateLimit: true });
      assert.strictEqual(result.placeName, 'Khambhalida Buddhist Caves alert("xss")');
      assert.ok(!result.address.includes('<img'));
      assert.strictEqual(result.status, 'PENDING');
      assert.strictEqual(result.contributorId, authorUser.id);
    });

    it('should enforce rate limit of maximum 5 submissions per 24 hours per user', async () => {
      const spamUser = {
        id: `spammer_user_${Date.now()}`,
        email: 'spammer@example.com',
        fullName: 'Spam Submitter',
      };

      const baseInput: PlaceSubmissionInput = {
        placeName: 'Valid Place Submission',
        category: 'Hill Station',
        state: 'Gujarat',
        address: 'Hilltop Path, Dang District',
        latitude: 20.75,
        longitude: 73.5,
        shortDescription: 'Valid short summary with sufficient character length.',
        detailedDescription: 'Valid detailed description that exceeds the mandatory fifty characters requirement.',
        photos: ['https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800'],
      };

      // 5 submissions should succeed
      for (let i = 0; i < 5; i++) {
        await contributionService.submitPlace({ ...baseInput, placeName: `Place Number ${i + 1}` }, spamUser);
      }

      // 6th submission should be rejected by rate limiting
      await assert.rejects(
        async () => {
          await contributionService.submitPlace({ ...baseInput, placeName: 'Place Number 6 Over Limit' }, spamUser);
        },
        (err: Error) => {
          assert.ok(err.message.includes('Daily destination contribution limit reached'));
          return true;
        }
      );
    });
  });

  describe('PHASE 3 & 4: Privacy Isolation & Personal Destination Access', () => {
    let pendingSubmissionId: string;

    it('should allow author to retrieve their own pending submission', async () => {
      const input: PlaceSubmissionInput = {
        placeName: 'Zarwani Waterfall Eco Campsite',
        category: 'Waterfall',
        state: 'Gujarat',
        city: 'Rajpipla',
        address: 'Narmada Wildlife Sanctuary, Garudeshwar, Gujarat 393151',
        latitude: 21.8456,
        longitude: 73.6892,
        shortDescription: 'Scenic waterfall inside Shoolpaneshwar Wildlife Sanctuary with natural pool.',
        detailedDescription: 'Zarwani Waterfall is located deep inside the Shoolpaneshwar Wildlife Sanctuary near the Statue of Unity, offering tranquil trekking trails and scenic flora.',
        photos: ['https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800'],
      };

      const submission = await contributionService.submitPlace(input, authorUser, { skipRateLimit: true });
      pendingSubmissionId = submission.id;
      assert.ok(pendingSubmissionId);

      // Author queries submission directly -> SUCCESS
      const authorQuery = await contributionService.getContributionById(pendingSubmissionId, authorUser);
      assert.ok(authorQuery);
      assert.strictEqual(authorQuery.placeName, 'Zarwani Waterfall Eco Campsite');
    });

    it('should strictly BLOCK other non-admin users from accessing pending submissions (Privacy Isolation)', async () => {
      assert.ok(pendingSubmissionId);

      // User Beta queries User Alpha's pending submission -> Must reject with Unauthorized
      await assert.rejects(
        async () => {
          await contributionService.getContributionById(pendingSubmissionId, otherUser);
        },
        (err: Error) => {
          assert.ok(err.message.includes('Unauthorized access'));
          return true;
        }
      );
    });

    it('should allow admin to inspect any user submission', async () => {
      assert.ok(pendingSubmissionId);
      const adminQuery = await contributionService.getContributionById(pendingSubmissionId, {
        id: adminUser.id,
        role: 'ADMIN',
      });
      assert.ok(adminQuery);
      assert.strictEqual(adminQuery.id, pendingSubmissionId);
    });
  });

  describe('PHASE 5: AI Trip Planner Integration & Stable Destination IDs', () => {
    it('should resolve user-contributed pending destinations in destination master service', () => {
      const customPending = {
        id: 'dest_custom_zarwani_99',
        name: 'Zarwani Eco Campsite',
        placeName: 'Zarwani Eco Campsite',
        state: 'Gujarat',
        city: 'Rajpipla',
        category: 'Waterfall',
        latitude: 21.8456,
        longitude: 73.6892,
        status: 'PENDING',
        contributorName: 'Kaushal Alpha Traveler',
      };

      const resolved = findDestinationMaster('Zarwani Eco Campsite', [customPending]);
      assert.ok(resolved, 'Destination should resolve from user custom destinations');
      assert.strictEqual(resolved.canonicalName, 'Zarwani Eco Campsite');
      assert.strictEqual(resolved.latitude, 21.8456);
      assert.strictEqual(resolved.longitude, 73.6892);
      assert.strictEqual(resolved.verificationStatus, 'PENDING_USER_CONTRIBUTION');
    });
  });

  describe('PHASE 6: Admin Review Lifecycle (Approve, Request Changes, Reject, Duplicate)', () => {
    it('should preserve stable destination ID upon approval without breaking existing trip plans', async () => {
      const input: PlaceSubmissionInput = {
        placeName: 'Gira Waterfalls Waghai',
        category: 'Waterfall',
        state: 'Gujarat',
        city: 'Saputara',
        address: 'Waghai, Dang District, Gujarat 394730',
        latitude: 20.7678,
        longitude: 73.4987,
        shortDescription: 'Seasonal waterfall cascading from 30 meters height into the Ambika River.',
        detailedDescription: 'Gira Falls is a scenic waterfall located around 3 km from Waghai town in the Dang district of Gujarat. The water plunges into the Ambika river and is spectacular during monsoon.',
        photos: ['https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800'],
      };

      const submission = await contributionService.submitPlace(input, authorUser, { skipRateLimit: true });
      const originalSubmissionId = submission.id;

      // Admin Approves the submission
      const approvalResult = await contributionService.executeAdminAction(
        originalSubmissionId,
        'APPROVE',
        adminUser,
        'Approved by chief moderator for global BharatYatra catalog.'
      );

      assert.strictEqual(approvalResult.submission.status, 'APPROVED');
      assert.ok(approvalResult.publishedDestination);
      // STABLE ID PRESERVATION:
      assert.strictEqual(
        approvalResult.publishedDestination.id,
        originalSubmissionId,
        'Approved destination ID MUST match submission ID to guarantee zero broken trip references'
      );
      assert.strictEqual(approvalResult.publishedDestination.isPublished, true);
    });

    it('should support REQUEST_CHANGES action and allow author resubmission', async () => {
      const input: PlaceSubmissionInput = {
        placeName: 'Barda Wildlife Hills',
        category: 'Wildlife Sanctuary',
        state: 'Gujarat',
        city: 'Porbandar',
        address: 'Barda Hills Sanctuary, Ranavav, Gujarat',
        latitude: 21.8123,
        longitude: 69.8456,
        shortDescription: 'Forested hill terrain sanctuary home to leopards, crocodiles and migratory birds.',
        detailedDescription: 'Barda Wildlife Sanctuary is located approximately 15 kilometers from Porbandar and covers lush agricultural fields and forested hilly tracts.',
        photos: ['https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800'],
      };

      const submission = await contributionService.submitPlace(input, authorUser, { skipRateLimit: true });

      // Admin requests changes
      const actionResult = await contributionService.executeAdminAction(
        submission.id,
        'REQUEST_CHANGES',
        adminUser,
        'Please clarify best visiting hours and gate permits.'
      );

      assert.strictEqual(actionResult.submission.status, 'CHANGES_REQUESTED');
      assert.strictEqual(actionResult.submission.adminFeedback, 'Please clarify best visiting hours and gate permits.');

      // Author resubmits with updated opening hours
      const resubmitted = await contributionService.updateContribution(
        submission.id,
        {
          openingHours: '06:00 AM - 05:30 PM daily',
          shortDescription: 'Forested hill terrain sanctuary with gate permits available on site.',
        },
        authorUser
      );

      assert.strictEqual(resubmitted.status, 'PENDING');
      assert.strictEqual(resubmitted.openingHours, '06:00 AM - 05:30 PM daily');
    });

    it('should support DUPLICATE action and mark submission as duplicate with reference notes', async () => {
      const input: PlaceSubmissionInput = {
        placeName: 'Somnath Mahadev Mandir',
        category: 'Temple',
        state: 'Gujarat',
        city: 'Veraval',
        address: 'Prabhas Patan, Gujarat',
        latitude: 20.8880,
        longitude: 70.4012,
        shortDescription: 'First among the twelve sacred Jyotirlinga shrines of Lord Shiva on Arabian Sea.',
        detailedDescription: 'The Somnath temple located in Prabhas Patan near Veraval in Saurashtra on the western coast of Gujarat is believed to be the first among the twelve Jyotirlinga shrines of Shiva.',
        photos: ['https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800'],
      };

      const submission = await contributionService.submitPlace(input, authorUser, { skipRateLimit: true });

      // Admin flags as duplicate of existing verified place
      const actionResult = await contributionService.executeAdminAction(
        submission.id,
        'DUPLICATE',
        adminUser,
        'Duplicate entry of verified catalog destination: Somnath Temple (ID: somnath-temple).'
      );

      assert.strictEqual(actionResult.submission.status, 'REJECTED');
      assert.ok(actionResult.submission.rejectionReason?.toLowerCase().includes('duplicate'));
    });
  });
});
