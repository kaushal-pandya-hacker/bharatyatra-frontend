/**
 * BharatYatra — Community Contribution Master Data Service
 * Implements end-to-end contribution lifecycle, admin actions, and dual-persistence storage.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  PlaceSubmission,
  PlaceSubmissionInput,
  PlaceReviewRecord,
  ContributionHistoryRecord,
  ContributionStats,
  ContributionStatus,
  AdminReviewAction,
} from './types';
import { runAiDestinationVerification } from './ai-verification';
import { destinationPublishingEngine, PublishedDestinationRecord } from './publishing-engine';
import { notificationStore } from '@/lib/notifications/notification-store';
import { getSupabaseServerClient } from '@/lib/supabase/client';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'community_contributions.json');
const PUBLISHED_FILE = path.join(DATA_DIR, 'community_published_destinations.json');

interface StoredData {
  submissions: PlaceSubmission[];
  reviews: PlaceReviewRecord[];
  history: ContributionHistoryRecord[];
}

class ContributionService {
  private cache: Map<string, PlaceSubmission> = new Map();
  private reviews: PlaceReviewRecord[] = [];
  private history: ContributionHistoryRecord[] = [];
  private publishedDestinations: Map<string, PublishedDestinationRecord> = new Map();
  private isLoaded = false;

  private ensureLoaded(): void {
    if (this.isLoaded) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // Load Submissions, Reviews, and History
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const data: StoredData = JSON.parse(raw);
        if (data.submissions && Array.isArray(data.submissions)) {
          data.submissions.forEach((s) => this.cache.set(s.id, s));
        }
        if (data.reviews && Array.isArray(data.reviews)) {
          this.reviews = data.reviews;
        }
        if (data.history && Array.isArray(data.history)) {
          this.history = data.history;
        }
      }

      // Load Published Community Destinations
      if (fs.existsSync(PUBLISHED_FILE)) {
        const rawPub = fs.readFileSync(PUBLISHED_FILE, 'utf8');
        const list: PublishedDestinationRecord[] = JSON.parse(rawPub);
        if (Array.isArray(list)) {
          list.forEach((p) => this.publishedDestinations.set(p.id, p));
        }
      }
    } catch (err) {
      console.warn('[ContributionService] Load warning (starting fresh cache):', err);
    }
    this.isLoaded = true;
  }

  private persist(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      const payload: StoredData = {
        submissions: Array.from(this.cache.values()),
        reviews: this.reviews,
        history: this.history,
      };

      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');
      fs.writeFileSync(
        PUBLISHED_FILE,
        JSON.stringify(Array.from(this.publishedDestinations.values()), null, 2),
        'utf8'
      );
    } catch (err) {
      console.warn('[ContributionService] Persist error:', err);
    }
  }

  // ==========================================================================
  // USER METHODS
  // ==========================================================================

  public async submitPlace(
    input: PlaceSubmissionInput,
    user: { id: string; email?: string; fullName?: string; name?: string }
  ): Promise<PlaceSubmission> {
    this.ensureLoaded();

    // 1. Mandatory server-side validations
    if (!input.placeName || input.placeName.trim().length < 3) {
      throw new Error('Destination name must be at least 3 characters.');
    }
    if (!input.category) {
      throw new Error('Destination category is required.');
    }
    if (!input.state || input.state.trim().length < 2) {
      throw new Error('State is required.');
    }
    if (!input.address || input.address.trim().length < 5) {
      throw new Error('Full street address or landmark location is required.');
    }
    if (typeof input.latitude !== 'number' || typeof input.longitude !== 'number') {
      throw new Error('Valid GPS coordinates (latitude and longitude) are required.');
    }
    if (!input.shortDescription || input.shortDescription.trim().length < 20) {
      throw new Error('Short summary must be at least 20 characters.');
    }
    if (!input.detailedDescription || input.detailedDescription.trim().length < 50) {
      throw new Error('Detailed description must be at least 50 characters.');
    }
    if (!input.photos || input.photos.length === 0) {
      throw new Error('At least one authentic destination photograph is required.');
    }

    // 2. Run AI Verification Pipeline
    const aiVerification = runAiDestinationVerification(input);

    // 3. Build Submission Entity
    const submissionId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const submission: PlaceSubmission = {
      id: submissionId,
      contributorId: user.id,
      contributorName: user.fullName || user.name || user.email?.split('@')[0] || 'BharatYatra Explorer',
      contributorEmail: user.email,
      placeName: input.placeName.trim(),
      category: input.category,
      country: input.country || 'India',
      state: input.state.trim(),
      district: input.district?.trim(),
      city: input.city?.trim(),
      address: input.address.trim(),
      latitude: Number(input.latitude),
      longitude: Number(input.longitude),
      shortDescription: input.shortDescription.trim(),
      detailedDescription: input.detailedDescription.trim(),
      photos: input.photos,
      bestTimeToVisit: input.bestTimeToVisit?.trim(),
      estimatedVisitDuration: input.estimatedVisitDuration?.trim(),
      entryFee: input.entryFee?.trim(),
      openingHours: input.openingHours?.trim(),
      contactInfo: input.contactInfo?.trim(),
      website: input.website?.trim(),
      accessibility: input.accessibility?.trim(),
      parkingAvailable: Boolean(input.parkingAvailable),
      facilities: input.facilities || [],
      travelTips: input.travelTips || [],
      nearbyAttractions: input.nearbyAttractions || [],
      suitableFor: input.suitableFor || [],
      status: 'PENDING',
      aiVerification,
      createdAt: nowIso,
      updatedAt: nowIso,
      submittedAt: nowIso,
    };

    // 4. Record Initial History Entry
    const historyEntry: ContributionHistoryRecord = {
      id: crypto.randomUUID(),
      contributorId: user.id,
      submissionId,
      eventType: 'SUBMITTED',
      description: `Submitted new place "${submission.placeName}" in ${submission.state} for verification.`,
      createdAt: nowIso,
    };

    this.cache.set(submissionId, submission);
    this.history.unshift(historyEntry);
    this.persist();

    // 4.5. Attempt persistent Supabase PostgreSQL write
    try {
      const supabase = getSupabaseServerClient();
      await supabase.from('place_submissions').insert({
        id: submission.id,
        contributor_id: submission.contributorId,
        contributor_name: submission.contributorName,
        contributor_email: submission.contributorEmail || '',
        place_name: submission.placeName,
        category: submission.category,
        country: submission.country || 'India',
        state: submission.state,
        district: submission.district,
        city: submission.city || '',
        address: submission.address,
        latitude: submission.latitude,
        longitude: submission.longitude,
        short_description: submission.shortDescription,
        detailed_description: submission.detailedDescription,
        photos: submission.photos || [],
        best_time_to_visit: submission.bestTimeToVisit,
        estimated_visit_duration: submission.estimatedVisitDuration,
        entry_fee: submission.entryFee,
        opening_hours: submission.openingHours,
        parking_available: submission.parkingAvailable,
        facilities: submission.facilities || [],
        travel_tips: submission.travelTips || [],
        nearby_attractions: submission.nearbyAttractions || [],
        suitable_for: submission.suitableFor || [],
        status: submission.status,
        ai_verification: submission.aiVerification,
        created_at: submission.createdAt,
        updated_at: submission.updatedAt,
        submitted_at: submission.submittedAt,
      });
    } catch (dbErr: any) {
      console.warn('[ContributionService] Supabase persistence notice:', dbErr?.message || dbErr);
    }

    // 5. Send In-App Confirmation Notification
    try {
      await notificationStore.createNotification({
        userId: user.id,
        recipientEmail: user.email,
        type: 'CONTRIBUTION_SUBMITTED',
        category: 'COMMUNITY',
        title: '📍 Destination Submission Received!',
        message: `Thank you for contributing "${submission.placeName}"! Our curation team has received your submission and will review it shortly.`,
        deepLink: `/profile/contributions`,
        metadata: { submissionId, placeName: submission.placeName },
      });
    } catch (err) {
      console.warn('[ContributionService] User notification dispatch failed (non-fatal):', err);
    }

    return submission;
  }

  public async getUserContributions(
    userId: string,
    statusFilter?: ContributionStatus
  ): Promise<PlaceSubmission[]> {
    this.ensureLoaded();
    let list = Array.from(this.cache.values()).filter((s) => s.contributorId === userId);
    if (statusFilter) {
      list = list.filter((s) => s.status === statusFilter);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getContributionById(
    id: string,
    user?: { id: string; role?: string }
  ): Promise<PlaceSubmission | null> {
    this.ensureLoaded();
    const submission = this.cache.get(id);
    if (!submission) return null;

    // Security check: Only owner or admin can view complete draft
    if (user && user.role !== 'ADMIN' && submission.contributorId !== user.id) {
      throw new Error('Unauthorized access: You do not have permission to view this submission.');
    }

    return submission;
  }

  public async updateContribution(
    id: string,
    updates: Partial<PlaceSubmissionInput>,
    user: { id: string; email?: string }
  ): Promise<PlaceSubmission> {
    this.ensureLoaded();
    const submission = this.cache.get(id);
    if (!submission) {
      throw new Error('Submission not found.');
    }

    // Security: Only owner can update
    if (submission.contributorId !== user.id) {
      throw new Error('Unauthorized: You can only edit your own submissions.');
    }

    // Status check: Can only update if PENDING or CHANGES_REQUESTED
    if (submission.status !== 'PENDING' && submission.status !== 'CHANGES_REQUESTED') {
      throw new Error(`Cannot modify submission with status "${submission.status}".`);
    }

    const wasChangesRequested = submission.status === 'CHANGES_REQUESTED';
    const nowIso = new Date().toISOString();

    // Merge updates
    if (updates.placeName) submission.placeName = updates.placeName.trim();
    if (updates.category) submission.category = updates.category;
    if (updates.country) submission.country = updates.country.trim();
    if (updates.state) submission.state = updates.state.trim();
    if (updates.district !== undefined) submission.district = updates.district?.trim();
    if (updates.city !== undefined) submission.city = updates.city?.trim();
    if (updates.address) submission.address = updates.address.trim();
    if (typeof updates.latitude === 'number') submission.latitude = Number(updates.latitude);
    if (typeof updates.longitude === 'number') submission.longitude = Number(updates.longitude);
    if (updates.shortDescription) submission.shortDescription = updates.shortDescription.trim();
    if (updates.detailedDescription) submission.detailedDescription = updates.detailedDescription.trim();
    if (updates.photos && updates.photos.length > 0) submission.photos = updates.photos;
    if (updates.bestTimeToVisit !== undefined) submission.bestTimeToVisit = updates.bestTimeToVisit?.trim();
    if (updates.estimatedVisitDuration !== undefined) submission.estimatedVisitDuration = updates.estimatedVisitDuration?.trim();
    if (updates.entryFee !== undefined) submission.entryFee = updates.entryFee?.trim();
    if (updates.openingHours !== undefined) submission.openingHours = updates.openingHours?.trim();
    if (updates.contactInfo !== undefined) submission.contactInfo = updates.contactInfo?.trim();
    if (updates.website !== undefined) submission.website = updates.website?.trim();
    if (updates.accessibility !== undefined) submission.accessibility = updates.accessibility?.trim();
    if (updates.parkingAvailable !== undefined) submission.parkingAvailable = Boolean(updates.parkingAvailable);
    if (updates.facilities) submission.facilities = updates.facilities;
    if (updates.travelTips) submission.travelTips = updates.travelTips;
    if (updates.nearbyAttractions) submission.nearbyAttractions = updates.nearbyAttractions;
    if (updates.suitableFor) submission.suitableFor = updates.suitableFor;

    // Reset status to PENDING upon resubmission
    if (wasChangesRequested) {
      submission.status = 'PENDING';
      submission.adminFeedback = undefined;
    }

    submission.updatedAt = nowIso;

    // Re-run AI verification
    submission.aiVerification = runAiDestinationVerification(submission);

    // Record history
    this.history.unshift({
      id: crypto.randomUUID(),
      contributorId: user.id,
      submissionId: id,
      eventType: wasChangesRequested ? 'RESUBMITTED' : 'UPDATED',
      description: wasChangesRequested
        ? `Resubmitted destination "${submission.placeName}" with addressed revisions.`
        : `Updated information for destination "${submission.placeName}".`,
      createdAt: nowIso,
    });

    this.cache.set(id, submission);
    this.persist();

    // Attempt persistent Supabase PostgreSQL update
    try {
      const supabase = getSupabaseServerClient();
      void supabase.from('place_submissions').update({
        status: submission.status,
        rejection_reason: submission.rejectionReason,
        admin_feedback: submission.adminFeedback,
        reviewed_by: submission.reviewedBy,
        reviewed_at: submission.reviewedAt,
        approved_at: submission.approvedAt,
        destination_id: submission.approvedPlaceId,
        reward_coupon_code: submission.rewardCouponCode,
        updated_at: submission.updatedAt,
      }).eq('id', submission.id);
    } catch (e: any) {
      console.warn('[ContributionService] Supabase update exception:', e?.message || e);
    }

    return submission;
  }

  public async withdrawContribution(
    id: string,
    user: { id: string }
  ): Promise<PlaceSubmission> {
    this.ensureLoaded();
    const submission = this.cache.get(id);
    if (!submission) {
      throw new Error('Submission not found.');
    }

    if (submission.contributorId !== user.id) {
      throw new Error('Unauthorized: You can only withdraw your own submissions.');
    }

    if (submission.status === 'APPROVED') {
      throw new Error('Approved destinations cannot be withdrawn directly. Please contact operations admin.');
    }

    const nowIso = new Date().toISOString();
    submission.status = 'WITHDRAWN';
    submission.updatedAt = nowIso;

    this.history.unshift({
      id: crypto.randomUUID(),
      contributorId: user.id,
      submissionId: id,
      eventType: 'WITHDRAWN',
      description: `Withdrew destination submission for "${submission.placeName}".`,
      createdAt: nowIso,
    });

    this.cache.set(id, submission);
    this.persist();

    // Attempt persistent Supabase PostgreSQL update
    try {
      const supabase = getSupabaseServerClient();
      void supabase.from('place_submissions').update({
        status: submission.status,
        rejection_reason: submission.rejectionReason,
        admin_feedback: submission.adminFeedback,
        reviewed_by: submission.reviewedBy,
        reviewed_at: submission.reviewedAt,
        approved_at: submission.approvedAt,
        destination_id: submission.approvedPlaceId,
        reward_coupon_code: submission.rewardCouponCode,
        updated_at: submission.updatedAt,
      }).eq('id', submission.id);
    } catch (e: any) {
      console.warn('[ContributionService] Supabase update exception:', e?.message || e);
    }

    return submission;
  }

  // ==========================================================================
  // ADMIN METHODS
  // ==========================================================================

  public async getAdminContributions(filters?: {
    search?: string;
    category?: string;
    state?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    submissions: PlaceSubmission[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    this.ensureLoaded();

    let list = Array.from(this.cache.values());

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.placeName.toLowerCase().includes(q) ||
          s.state.toLowerCase().includes(q) ||
          (s.city && s.city.toLowerCase().includes(q)) ||
          s.contributorName.toLowerCase().includes(q)
      );
    }

    if (filters?.category && filters.category !== 'ALL') {
      list = list.filter((s) => s.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters?.state && filters.state !== 'ALL') {
      list = list.filter((s) => s.state.toLowerCase() === filters.state!.toLowerCase());
    }

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((s) => s.status === filters.status);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, Math.min(100, filters?.limit || 20));
    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      submissions: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  public async getAdminStats(): Promise<ContributionStats> {
    this.ensureLoaded();
    const all = Array.from(this.cache.values());

    let pending = 0;
    let underReview = 0;
    let changesRequested = 0;
    let approved = 0;
    let rejected = 0;

    let totalReviewTimeHours = 0;
    let reviewedCount = 0;

    for (const s of all) {
      if (s.status === 'PENDING') pending++;
      else if (s.status === 'UNDER_REVIEW') underReview++;
      else if (s.status === 'CHANGES_REQUESTED') changesRequested++;
      else if (s.status === 'APPROVED') approved++;
      else if (s.status === 'REJECTED') rejected++;

      if (s.reviewedAt && s.submittedAt) {
        const diffMs = new Date(s.reviewedAt).getTime() - new Date(s.submittedAt).getTime();
        if (diffMs > 0) {
          totalReviewTimeHours += diffMs / (1000 * 60 * 60);
          reviewedCount++;
        }
      }
    }

    const averageReviewTimeHours =
      reviewedCount > 0 ? Math.round((totalReviewTimeHours / reviewedCount) * 10) / 10 : 2.4;

    return {
      total: all.length,
      pending,
      underReview,
      changesRequested,
      approved,
      rejected,
      averageReviewTimeHours,
    };
  }

  public async getReviewHistory(submissionId: string): Promise<PlaceReviewRecord[]> {
    this.ensureLoaded();
    return this.reviews.filter((r) => r.submissionId === submissionId);
  }

  public async executeAdminAction(
    id: string,
    action: AdminReviewAction,
    adminUser: { id: string; email: string; fullName?: string },
    notes?: string,
    modifications?: Partial<PlaceSubmission>
  ): Promise<{
    submission: PlaceSubmission;
    reviewRecord: PlaceReviewRecord;
    publishedDestination?: PublishedDestinationRecord;
  }> {
    this.ensureLoaded();
    const submission = this.cache.get(id);
    if (!submission) {
      throw new Error(`Submission with id "${id}" not found.`);
    }

    const prevStatus = submission.status;
    const nowIso = new Date().toISOString();

    let newStatus: ContributionStatus = prevStatus;
    let publishedDestination: PublishedDestinationRecord | undefined;

    switch (action) {
      case 'CLAIM_REVIEW':
        newStatus = 'UNDER_REVIEW';
        submission.status = newStatus;
        submission.reviewedBy = adminUser.email;
        submission.reviewedAt = nowIso;
        submission.updatedAt = nowIso;
        break;

      case 'REQUEST_CHANGES':
        if (!notes || notes.trim().length < 5) {
          throw new Error('Revisions explanation note is required when requesting changes.');
        }
        newStatus = 'CHANGES_REQUESTED';
        submission.status = newStatus;
        submission.adminFeedback = notes.trim();
        submission.reviewedBy = adminUser.email;
        submission.reviewedAt = nowIso;
        submission.updatedAt = nowIso;

        // In-app notification to contributor
        try {
          await notificationStore.createNotification({
            userId: submission.contributorId,
            recipientEmail: submission.contributorEmail,
            type: 'CONTRIBUTION_CHANGES_REQUESTED',
            category: 'COMMUNITY',
            title: '⚠️ Revisions Requested for Your Destination',
            message: `Our review team has requested revisions for "${submission.placeName}": ${notes.trim()}`,
            deepLink: `/profile/contributions`,
            metadata: { submissionId: submission.id, feedback: notes.trim() },
          });
        } catch (e) {
          console.warn('[ContributionService] Notification warning:', e);
        }
        break;

      case 'REJECT':
        if (!notes || notes.trim().length < 5) {
          throw new Error('Rejection reason is required.');
        }
        newStatus = 'REJECTED';
        submission.status = newStatus;
        submission.rejectionReason = notes.trim();
        submission.reviewedBy = adminUser.email;
        submission.reviewedAt = nowIso;
        submission.updatedAt = nowIso;

        // In-app notification to contributor
        try {
          await notificationStore.createNotification({
            userId: submission.contributorId,
            recipientEmail: submission.contributorEmail,
            type: 'CONTRIBUTION_REJECTED',
            category: 'COMMUNITY',
            title: 'Submission Status Update',
            message: `Your submission for "${submission.placeName}" could not be approved at this time: ${notes.trim()}`,
            deepLink: `/profile/contributions`,
            metadata: { submissionId: submission.id, reason: notes.trim() },
          });
        } catch (e) {
          console.warn('[ContributionService] Notification warning:', e);
        }
        break;

      case 'EDIT':
        // Apply admin modifications
        if (modifications) {
          if (modifications.placeName) submission.placeName = modifications.placeName.trim();
          if (modifications.category) submission.category = modifications.category;
          if (modifications.state) submission.state = modifications.state.trim();
          if (modifications.district !== undefined) submission.district = modifications.district?.trim();
          if (modifications.city !== undefined) submission.city = modifications.city?.trim();
          if (modifications.address) submission.address = modifications.address.trim();
          if (typeof modifications.latitude === 'number') submission.latitude = modifications.latitude;
          if (typeof modifications.longitude === 'number') submission.longitude = modifications.longitude;
          if (modifications.shortDescription) submission.shortDescription = modifications.shortDescription.trim();
          if (modifications.detailedDescription) submission.detailedDescription = modifications.detailedDescription.trim();
          if (modifications.bestTimeToVisit) submission.bestTimeToVisit = modifications.bestTimeToVisit.trim();
          if (modifications.estimatedVisitDuration) submission.estimatedVisitDuration = modifications.estimatedVisitDuration.trim();
          if (modifications.entryFee) submission.entryFee = modifications.entryFee.trim();
          if (modifications.openingHours) submission.openingHours = modifications.openingHours.trim();
          if (modifications.accessibility) submission.accessibility = modifications.accessibility.trim();
        }
        submission.updatedAt = nowIso;
        newStatus = submission.status;
        break;

      case 'APPROVE':
        newStatus = 'APPROVED';
        // Execute atomic publishing pipeline
        const publishResult = await destinationPublishingEngine.publishApprovedDestination(
          submission,
          adminUser,
          notes
        );

        publishedDestination = publishResult.destination;
        submission.status = 'APPROVED';
        submission.approvedPlaceId = publishedDestination.id;
        submission.approvedAt = nowIso;
        submission.reviewedBy = adminUser.email;
        submission.reviewedAt = nowIso;
        submission.updatedAt = nowIso;

        // Store published community destination in approved registry
        this.publishedDestinations.set(publishedDestination.id, publishedDestination);
        break;

      default:
        throw new Error(`Unsupported admin review action: ${action}`);
    }

    // Record review audit log
    const reviewRecord: PlaceReviewRecord = {
      id: crypto.randomUUID(),
      submissionId: submission.id,
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      action,
      previousStatus: prevStatus,
      newStatus,
      reviewNotes: notes,
      modifications,
      createdAt: nowIso,
    };
    this.reviews.unshift(reviewRecord);

    // Record contribution history log
    this.history.unshift({
      id: crypto.randomUUID(),
      contributorId: submission.contributorId,
      submissionId: submission.id,
      eventType: action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'UPDATED',
      description: `Administrator ${adminUser.email} performed action ${action}${notes ? `: "${notes}"` : ''}.`,
      createdAt: nowIso,
    });

    this.cache.set(id, submission);
    this.persist();

    // Attempt persistent Supabase PostgreSQL update
    try {
      const supabase = getSupabaseServerClient();
      void supabase.from('place_submissions').update({
        status: submission.status,
        rejection_reason: submission.rejectionReason,
        admin_feedback: submission.adminFeedback,
        reviewed_by: submission.reviewedBy,
        reviewed_at: submission.reviewedAt,
        approved_at: submission.approvedAt,
        destination_id: submission.approvedPlaceId,
        reward_coupon_code: submission.rewardCouponCode,
        updated_at: submission.updatedAt,
      }).eq('id', submission.id);
    } catch (e: any) {
      console.warn('[ContributionService] Supabase update exception:', e?.message || e);
    }

    return {
      submission,
      reviewRecord,
      publishedDestination,
    };
  }

  // ==========================================================================
  // PUBLIC INTEGRATION METHODS (Explore, Search, Maps, AI Trip Planner)
  // ==========================================================================

  /**
   * Returns ONLY officially approved destinations.
   * Pending, rejected, or changes_requested submissions are strictly filtered out.
   */
  public getApprovedCommunityDestinations(): PublishedDestinationRecord[] {
    this.ensureLoaded();
    return Array.from(this.publishedDestinations.values()).filter((p) => p.isPublished === true);
  }
}

export const contributionService = new ContributionService();
