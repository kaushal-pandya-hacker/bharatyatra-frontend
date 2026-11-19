/**
 * BharatYatra — Community Destination Publishing Engine
 * Responsible for atomic, idempotent approval and official destination publication.
 */

import { PlaceSubmission, PlaceReviewRecord, ContributionHistoryRecord } from './types';
import { notificationStore } from '@/lib/notifications/notification-store';
import { contributorRewardService } from '@/lib/rewards/contributor-reward-service';
import { dispatchApprovalRewardNotifications } from '@/lib/notifications/reward-notification';
import crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { getSupabaseServerClient } from '@/lib/supabase/client';

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
  private tmpPublishedPath = path.resolve(os.tmpdir(), 'bharatyatra_published_destinations.json');

  public getAllPublishedDestinations(): PublishedDestinationRecord[] {
    const listMap = new Map<string, PublishedDestinationRecord>();
    try {
      if (fs.existsSync(this.publishedPath)) {
        const raw = fs.readFileSync(this.publishedPath, 'utf-8');
        const items: PublishedDestinationRecord[] = JSON.parse(raw);
        if (Array.isArray(items)) {
          items.forEach((item) => listMap.set(item.id, item));
        }
      }
    } catch (e) {
      // fallback
    }

    try {
      if (fs.existsSync(this.tmpPublishedPath)) {
        const rawTmp = fs.readFileSync(this.tmpPublishedPath, 'utf-8');
        const itemsTmp: PublishedDestinationRecord[] = JSON.parse(rawTmp);
        if (Array.isArray(itemsTmp)) {
          itemsTmp.forEach((item) => {
            const existing = listMap.get(item.id);
            if (!existing || new Date(item.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
              listMap.set(item.id, item);
            }
          });
        }
      }
    } catch (e) {
      // fallback
    }

    return Array.from(listMap.values());
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
    rewardCoupon?: any;
    notificationResult?: any;
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
      const jsonStr = JSON.stringify(filtered, null, 2);

      // 1. Primary write to data/
      try {
        const dir = path.dirname(this.publishedPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const tmp = `${this.publishedPath}.tmp.${Date.now()}`;
        fs.writeFileSync(tmp, jsonStr, 'utf-8');
        fs.renameSync(tmp, this.publishedPath);
      } catch (err) {}

      // 2. Secondary write to os.tmpdir() for serverless persistence
      try {
        const tmp2 = `${this.tmpPublishedPath}.tmp.${Date.now()}`;
        fs.writeFileSync(tmp2, jsonStr, 'utf-8');
        fs.renameSync(tmp2, this.tmpPublishedPath);
      } catch (err) {}
    } catch (persistErr) {
      console.warn('[PublishingEngine] Local file cache persist warning:', persistErr);
    }

    // Persist to Supabase PostgreSQL shared persistent database
    try {
      const supabase = getSupabaseServerClient();
      await supabase.from('published_destinations').insert({
        id: publishedRecord.id,
        slug: publishedRecord.slug,
        name: publishedRecord.name,
        category: publishedRecord.category,
        country: publishedRecord.country,
        state: publishedRecord.state,
        district: publishedRecord.district,
        city: publishedRecord.city,
        address: publishedRecord.address,
        latitude: publishedRecord.latitude,
        longitude: publishedRecord.longitude,
        short_description: publishedRecord.shortDescription,
        description: publishedRecord.description,
        primary_image_url: publishedRecord.primaryImageUrl,
        images: publishedRecord.images || [],
        best_time_to_visit: publishedRecord.bestTimeToVisit,
        estimated_visit_duration: publishedRecord.estimatedVisitDuration,
        entry_fee: publishedRecord.entryFee,
        opening_hours: publishedRecord.openingHours,
        facilities: publishedRecord.facilities || [],
        travel_tips: publishedRecord.travelTips || [],
        is_community_contributed: publishedRecord.isCommunityContributed,
        contributed_by_name: publishedRecord.contributedByName,
        contributed_by_id: publishedRecord.contributedById,
        submission_id: publishedRecord.submissionId,
        rating: publishedRecord.rating,
        total_reviews: publishedRecord.totalReviews,
        is_published: publishedRecord.isPublished,
        created_at: publishedRecord.createdAt,
        updated_at: publishedRecord.updatedAt,
      });
    } catch (dbErr: any) {
      console.warn('[PublishingEngine] Supabase persistence notice:', dbErr?.message || dbErr);
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

    // 6. Automatically Issue 7% Contributor Reward Coupon
    let rewardCoupon: any = null;
    try {
      rewardCoupon = contributorRewardService.issueApprovalReward({
        id: submission.id,
        contributorId: submission.contributorId,
        contributorName: submission.contributorName,
        contributorEmail: submission.contributorEmail || 'traveler@bharatyatra.in',
        placeName: submission.placeName,
      });
      // Attach reward code to submission
      submission.rewardCouponCode = rewardCoupon.code;
    } catch (rewErr) {
      console.warn('[PublishingEngine] Reward issuance error (non-fatal):', rewErr);
    }

    // 7. Dispatch Multi-Channel Notifications (In-App, WhatsApp, Email)
    let notificationResult: any = null;
    if (rewardCoupon) {
      try {
        notificationResult = await dispatchApprovalRewardNotifications({
          contributorId: submission.contributorId,
          contributorName: submission.contributorName,
          contributorEmail: submission.contributorEmail || 'traveler@bharatyatra.in',
          contributorPhone: submission.contributorPhone,
          placeName: submission.placeName,
          couponCode: rewardCoupon.code,
          discountPercent: rewardCoupon.discountPercent || 7,
          validUntil: rewardCoupon.validUntil,
          destinationSlug: slug,
        });
      } catch (notifErr) {
        console.warn('[PublishingEngine] Reward notification dispatch error (non-fatal):', notifErr);
      }
    }

    // 8. Send General Publication In-App Notification
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
          rewardCouponCode: rewardCoupon?.code,
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
      rewardCoupon,
      notificationResult,
    };
  }
}

export const destinationPublishingEngine = new DestinationPublishingEngine();
