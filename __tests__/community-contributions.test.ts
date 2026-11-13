import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { aiVerificationEngine } from '../lib/contributions/ai-verification';
import { destinationPublishingEngine, generateDestinationSlug } from '../lib/contributions/publishing-engine';
import { contributionService } from '../lib/contributions/contribution-service';
import type { PlaceSubmissionInput, PlaceSubmission } from '../lib/contributions/types';

describe('Community-Driven Destination Contribution System Test Suite', () => {
  describe('1. AI-Assisted Verification Engine', () => {
    it('should validate coordinates within India bounding box', () => {
      // New Delhi: 28.6139° N, 77.2090° E (Valid)
      const validReport = aiVerificationEngine.generateVerificationReport({
        placeName: 'Agrasen Ki Baoli',
        category: 'Historical Places',
        state: 'Delhi',
        district: 'New Delhi',
        city: 'New Delhi',
        address: 'Hailey Road, Near Connaught Place, New Delhi',
        latitude: 28.6260,
        longitude: 77.2250,
        shortDescription: 'Historical stepwell from the Mahabharata era with 108 steps.',
        detailedDescription: 'Agrasen ki Baoli is a 60-meter long and 15-meter wide historical step well on Hailey Road, near Connaught Place, Jantar Mantar in New Delhi, India. Although there are no known historical records to prove who built Agrasen ki Baoli, it is believed that it was originally built by the legendary king Agrasen.',
        photos: ['https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800'],
      });

      assert.strictEqual(validReport.locationSanity.withinIndiaBounds, true);
      assert.strictEqual(validReport.riskLevel, 'LOW');
      assert.ok(validReport.confidenceScore >= 70);
      assert.ok(validReport.completenessScore >= 70);
    });

    it('should flag coordinates outside India bounding box', () => {
      // London coordinates: 51.5074° N, 0.1278° W (Invalid for BharatYatra)
      const invalidReport = aiVerificationEngine.generateVerificationReport({
        placeName: 'Big Ben London',
        category: 'Historical Places',
        state: 'Delhi',
        district: 'Central',
        address: 'Westminster, London SW1A 0AA',
        latitude: 51.5074,
        longitude: -0.1278,
        shortDescription: 'Famous clock tower in London, outside India.',
        detailedDescription: 'Big Ben is the nickname for the Great Bell of the Great Clock of Westminster at the north end of the Palace of Westminster in London, England.',
        photos: ['https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800'],
      });

      assert.strictEqual(invalidReport.locationSanity.withinIndiaBounds, false);
      assert.ok(invalidReport.detectedIssues.some((issue) => issue.includes('outside the recognized geographic bounds of India')));
      assert.ok(invalidReport.riskLevel === 'HIGH' || invalidReport.riskLevel === 'MEDIUM');
    });

    it('should flag duplicate destinations with high similarity score', () => {
      // Testing with known landmark "Somnath Temple"
      const duplicateReport = aiVerificationEngine.generateVerificationReport({
        placeName: 'Somnath Temple',
        category: 'Religious Places',
        state: 'Gujarat',
        district: 'Gir Somnath',
        city: 'Veraval',
        address: 'Somnath, Prabhas Patan, Gujarat 362268',
        latitude: 20.8880,
        longitude: 70.4012,
        shortDescription: 'First among the twelve Aadi Jyotirlinga shrines of Shiva.',
        detailedDescription: 'The Somnath temple located in Prabhas Patan near Veraval in Saurashtra on the western coast of Gujarat, India, is believed to be the first among the twelve Jyotirlinga shrines of Shiva. It is an important pilgrimage and tourist spot of Gujarat.',
        photos: ['https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800'],
      });

      assert.ok(duplicateReport.duplicateCandidates.length > 0);
      const firstCandidate = duplicateReport.duplicateCandidates[0];
      assert.ok(firstCandidate.similarityScore >= 0.8);
      assert.ok(duplicateReport.detectedIssues.some((issue) => issue.includes('potential duplicate')));
    });

    it('should evaluate text completeness and quality', () => {
      // Very short / low-quality description
      const thinReport = aiVerificationEngine.generateVerificationReport({
        placeName: 'Mystery Cave',
        category: 'Hidden Gems',
        state: 'Himachal Pradesh',
        address: 'Near Old Village',
        latitude: 31.1048,
        longitude: 77.1734,
        shortDescription: 'Nice place.',
        detailedDescription: 'Good view, visit it.',
        photos: ['https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800'],
      });

      assert.ok(thinReport.detectedIssues.some((issue) => issue.includes('under the recommended 20 characters')));
      assert.ok(thinReport.detectedIssues.some((issue) => issue.includes('Detailed description is brief')));
    });
  });

  describe('2. Slug Generation & Idempotent Publishing Pipeline', () => {
    it('should generate URL-friendly canonical slugs', () => {
      const slug1 = generateDestinationSlug('Dudhsagar Waterfalls', 'Goa', 'Sonaulim');
      assert.strictEqual(slug1, 'dudhsagar-waterfalls-sonaulim');

      const slug2 = generateDestinationSlug('Rani Ki Vav', 'Gujarat');
      assert.strictEqual(slug2, 'rani-ki-vav-gujarat');
    });

    it('should publish destination idempotently with contributor attribution', async () => {
      const mockSubmission: PlaceSubmission = {
        id: 'test-sub-101',
        contributorId: 'user-arch-001',
        contributorName: 'Aarav Sharma',
        contributorEmail: 'aarav.sharma@example.com',
        placeName: 'Gadhvi Hidden Falls',
        category: 'Waterfalls',
        country: 'India',
        state: 'Gujarat',
        district: 'Dang',
        city: 'Ahwa',
        address: 'Deep forest path, Ahwa, Dang, Gujarat',
        latitude: 20.7630,
        longitude: 73.6890,
        shortDescription: 'Untouched perennial waterfall deep in the Dang forest.',
        detailedDescription: 'Gadhvi Hidden Falls is a scenic natural cascade nestled inside the dense teak forests of Dang. Accessible via a 2km trek through tribal hamlets, it features crystal clear pools and lush monsoon flora.',
        photos: ['https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800'],
        facilities: ['Walking Trek', 'Natural Pool'],
        travelTips: ['Wear trekking shoes', 'Carry drinking water'],
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
      };

      const adminUser = {
        id: 'admin-001',
        email: 'moderator@bharatyatra.in',
        fullName: 'Lead Travel Architect',
      };

      // First publish
      const result1 = await destinationPublishingEngine.publishApprovedDestination(
        mockSubmission,
        adminUser,
        'Verified coordinates and original photo authenticity.'
      );

      assert.strictEqual(result1.success, true);
      assert.ok(result1.destination.id);
      assert.strictEqual(result1.destination.isCommunityContributed, true);
      assert.strictEqual(result1.destination.contributedByName, 'Aarav Sharma');
      assert.strictEqual(result1.destination.contributedById, 'user-arch-001');
      assert.strictEqual(result1.destination.name, 'Gadhvi Hidden Falls');

      // Second publish (idempotent call with approved submission)
      mockSubmission.status = 'APPROVED';
      mockSubmission.approvedPlaceId = result1.destination.id;

      const result2 = await destinationPublishingEngine.publishApprovedDestination(
        mockSubmission,
        adminUser,
        'Duplicate approve check'
      );

      assert.strictEqual(result2.success, true);
      assert.strictEqual(result2.destination.id, result1.destination.id); // Same ID preserved!
    });
  });

  describe('3. Contribution Service Lifecycle & Authorization', () => {
    it('should submit a place and persist with initial PENDING status', async () => {
      const input: PlaceSubmissionInput = {
        placeName: 'Polo Forest Ancient Ruins',
        category: 'Historical Places',
        state: 'Gujarat',
        district: 'Sabarkantha',
        city: 'Idar',
        address: 'Polo Forest, Vijayanagar, Sabarkantha, Gujarat',
        latitude: 23.9780,
        longitude: 73.2840,
        shortDescription: '15th-century Jain and Shiva temples amidst dense dry deciduous forest.',
        detailedDescription: 'The ancient Polo forest is spread over 400 square kilometers near Vijayanagar. It was established around the 10th century by the Parihar kings of Idar and subsequently conquered by the Rathod Rajputs. The site features ruins of intricately carved 15th century Jain and Shiva shrines along the Harnav River.',
        photos: ['https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800'],
        bestTimeToVisit: 'September to February',
        entryFee: 'Free',
      };

      const user = {
        id: 'user-test-777',
        name: 'Pooja Patel',
        email: 'pooja.patel@example.com',
      };

      const submission = await contributionService.submitPlace(input, user);
      assert.ok(submission.id);
      assert.strictEqual(submission.status, 'PENDING');
      assert.strictEqual(submission.contributorId, user.id);
      assert.strictEqual(submission.contributorName, user.name);
      assert.ok(submission.aiVerification);

      // Verify user can fetch their submission
      const userList = await contributionService.getUserContributions(user.id);
      assert.ok(userList.some((s) => s.id === submission.id));

      // Verify other user cannot see this user's submissions in private query
      const otherUserList = await contributionService.getUserContributions('user-stranger-999');
      assert.ok(!otherUserList.some((s) => s.id === submission.id));

      // Admin execution: CLAIM_REVIEW
      const admin = { id: 'admin-qa', email: 'qa@bharatyatra.in', fullName: 'QA Moderator' };
      const claimResult = await contributionService.executeAdminAction(
        submission.id,
        'CLAIM_REVIEW',
        admin
      );
      assert.strictEqual(claimResult.submission.status, 'UNDER_REVIEW');

      // Admin execution: REQUEST_CHANGES
      const changeResult = await contributionService.executeAdminAction(
        submission.id,
        'REQUEST_CHANGES',
        admin,
        'Please clarify nearest railway station distance.'
      );
      assert.strictEqual(changeResult.submission.status, 'CHANGES_REQUESTED');

      // User updates and resubmits
      const resubmitted = await contributionService.updateContribution(
        submission.id,
        {
          travelTips: ['Nearest railway station is Himmatnagar (60km)'],
        },
        user
      );
      assert.strictEqual(resubmitted.status, 'PENDING');

      // Admin execution: APPROVE
      const approveResult = await contributionService.executeAdminAction(
        submission.id,
        'APPROVE',
        admin,
        'Coordinates and details fully verified.'
      );
      assert.strictEqual(approveResult.submission.status, 'APPROVED');
      assert.ok(approveResult.publishedDestination?.id);
    });
  });
});
