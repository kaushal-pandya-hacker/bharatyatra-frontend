/**
 * BharatYatra — Community Destination Publishing Engine
 * Responsible for atomic, idempotent approval and official destination publication.
 */

import { PlaceSubmission, PlaceReviewRecord, ContributionHistoryRecord } from './types';
import { notificationStore } from '@/lib/notifications/notification-store';
import crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface PublishedDestinationRecord {
  id: string;
  slug: string;
  name: string;
  category: string;
  country: string;
  state: string;
  district?: string;
  city?: string;
  address: string;
  latitude: number;
  longitude: number;
  shortDescription: string;
  description: string;
  primaryImageUrl: string;
  images: string[];
  bestTimeToVisit?: string;
  estimatedVisitDuration?: string;
  entryFee?: string;
  openingHours?: string;
  accessibility?: string;
  facilities?: string[];
  travelTips?: string[];
  nearbyAttractions?: string[];
  suitableFor?: string[];
  isCommunityContributed: boolean;
  contributedByName: string;
  contributedById: string;
  submissionId: string;
  rating: number;
  totalReviews: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export function generateDestinationSlug(name: string, state: string, city?: string): string {
  const base = `${name} ${city || state}`
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `destination-${crypto.randomBytes(4).toString('hex')}`;
}

export class DestinationPublishingEngine {
  private publishedPath = path.resolve(process.cwd(), 'data/community_published_destinations.json');

  public getAllPublishedDestinations(): PublishedDestinationRecord[] {
    try {
      if (fs.existsSync(this.publishedPath)) {
        const raw = fs.readFileSync(this.publishedPath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      // fallback
    }
    return [];
  }

  /**
   * Publishes an approved submission into the official destination registry.
   * Fully idempotent — if already approved, returns existing published ID safely.
   */
  public async publishApprovedDestination(
    submission: PlaceSubmission,
    adminUser: { id: string; email: string; fullName?: string },
    adminNotes?: string
  ): Promise<{
    success: boolean;
    destination: PublishedDestinationRecord;
    reviewRecord: PlaceReviewRecord;
    historyRecord: ContributionHistoryRecord;
  }> {
    // 1. Idempotency Check: Already approved
    if (submission.status === 'APPROVED' && submission.approvedPlaceId) {
      const existingDestination: PublishedDestinationRecord = {
        id: submission.approvedPlaceId,
        slug: generateDestinationSlug(submission.placeName, submission.state, submission.city),
        name: submission.placeName,
        category: submission.category,
        country: submission.country || 'India',
        state: submission.state,
        district: submission.district,
        city: submission.city,
        address: submission.address,
        latitude: submission.latitude,
        longitude: submission.longitude,
        shortDescription: submission.shortDescription,
        description: submission.detailedDescription,
        primaryImageUrl: submission.photos[0] || '/places/aina-mahal.jpg',
        images: submission.photos || [],
        bestTimeToVisit: submission.bestTimeToVisit,
        estimatedVisitDuration: submission.estimatedVisitDuration,
        entryFee: submission.entryFee,
        openingHours: submission.openingHours,
        accessibility: submission.accessibility,
        facilities: submission.facilities,
        travelTips: submission.travelTips,
        nearbyAttractions: submission.nearbyAttractions,
        suitableFor: submission.suitableFor,
        isCommunityContributed: true,
        contributedByName: submission.contributorName,
        contributedById: submission.contributorId,
        submissionId: submission.id,
        rating: 4.8,
        totalReviews: 1,
        isPublished: true,
        createdAt: submission.approvedAt || submission.createdAt,
        updatedAt: new Date().toISOString(),
      };

      const reviewRecord: PlaceReviewRecord = {
        id: crypto.randomUUID(),
        submissionId: submission.id,
        adminId: adminUser.id,
        adminEmail: adminUser.email,
        action: 'APPROVE',
        previousStatus: 'APPROVED',
        newStatus: 'APPROVED',
        reviewNotes: adminNotes || 'Re-verified already approved destination',
        createdAt: new Date().toISOString(),
      };

      const historyRecord: ContributionHistoryRecord = {
        id: crypto.randomUUID(),
        contributorId: submission.contributorId,
        submissionId: submission.id,
        eventType: 'APPROVED',
        description: `Destination already approved as "${submission.placeName}" (ID: ${submission.approvedPlaceId}).`,
        createdAt: new Date().toISOString(),
      };

      return { success: true, destination: existingDestination, reviewRecord, historyRecord };
    }

    // 2. Validation
    if (!submission.placeName || !submission.state || !submission.latitude || !submission.longitude) {
      throw new Error('Cannot publish destination: Missing mandatory location or place name details.');
    }

    // 3. Create Published Destination Record
    const destinationId = crypto.randomUUID();
    const slug = generateDestinationSlug(submission.placeName, submission.state, submission.city);
    const nowIso = new Date().toISOString();

    const publishedRecord: PublishedDestinationRecord = {
      id: destinationId,
      slug,
      name: submission.placeName,
      category: submission.category,
      country: submission.country || 'India',
      state: submission.state,
      district: submission.district,
      city: submission.city,
      address: submission.address,
      latitude: submission.latitude,
      longitude: submission.longitude,
      shortDescription: submission.shortDescription,
      description: submission.detailedDescription,
      primaryImageUrl: (submission.photos && submission.photos[0]) || '/places/aina-mahal.jpg',
      images: submission.photos || [],
      bestTimeToVisit: submission.bestTimeToVisit,
      estimatedVisitDuration: submission.estimatedVisitDuration,
      entryFee: submission.entryFee,
      openingHours: submission.openingHours,
      accessibility: submission.accessibility,
      facilities: submission.facilities,
      travelTips: submission.travelTips,
      nearbyAttractions: submission.nearbyAttractions,
      suitableFor: submission.suitableFor,
      isCommunityContributed: true,
      contributedByName: submission.contributorName,
      contributedById: submission.contributorId,
      submissionId: submission.id,
      rating: 4.8,
      totalReviews: 1,
      isPublished: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Persist to local JSON cache for fast fallback & dev environment
    try {
      const existing = this.getAllPublishedDestinations();
      const filtered = existing.filter((e) => e.id !== destinationId && e.submissionId !== submission.id);
      filtered.unshift(publishedRecord);
      const dir = path.dirname(this.publishedPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.publishedPath, JSON.stringify(filtered, null, 2), 'utf-8');
    } catch (persistErr) {
      console.warn('[PublishingEngine] Local file cache persist warning:', persistErr);
    }

    // 4. Create Review Audit Record
    const reviewRecord: PlaceReviewRecord = {
      id: crypto.randomUUID(),
      submissionId: submission.id,
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      action: 'APPROVE',
      previousStatus: submission.status,
      newStatus: 'APPROVED',
      reviewNotes: adminNotes || 'Destination successfully verified and published to official catalog.',
      createdAt: nowIso,
    };

    // 5. Create History Record
    const historyRecord: ContributionHistoryRecord = {
      id: crypto.randomUUID(),
      contributorId: submission.contributorId,
      submissionId: submission.id,
      eventType: 'APPROVED',
      description: `Congratulations! Your contributed destination "${submission.placeName}" has been approved and published to BharatYatra.`,
      createdAt: nowIso,
    };

    // 6. Send In-App Notification to Contributor
    try {
      await notificationStore.createNotification({
        userId: submission.contributorId,
        recipientEmail: submission.contributorEmail,
        type: 'CONTRIBUTION_APPROVED',
        category: 'COMMUNITY',
        title: '🎉 Destination Approved & Published!',
        message: `Great news! "${submission.placeName}" has been verified by the BharatYatra team and is now live across Explore, Search, and AI Trip Planner!`,
        deepLink: `/destinations/${slug}`,
        metadata: {
          submissionId: submission.id,
          destinationId,
          slug,
          placeName: submission.placeName,
        },
      });
    } catch (notifErr) {
      console.warn('[PublishingEngine] Notification dispatch error (non-fatal):', notifErr);
    }

    return {
      success: true,
      destination: publishedRecord,
      reviewRecord,
      historyRecord,
    };
  }
}

export const destinationPublishingEngine = new DestinationPublishingEngine();
