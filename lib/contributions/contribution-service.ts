/**
 * BharatYatra — Community Contribution Master Data Service
 * Implements end-to-end contribution lifecycle, admin actions, and dual-persistence storage.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
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

const TMP_DATA_FILE = path.join(os.tmpdir(), 'bharatyatra_community_contributions.json');
const TMP_PUBLISHED_FILE = path.join(os.tmpdir(), 'bharatyatra_published_destinations.json');

interface StoredData {
  submissions: PlaceSubmission[];
  reviews: PlaceReviewRecord[];
  history: ContributionHistoryRecord[];
}

function sanitizeText(str?: string): string {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

function mapDbRowToSubmission(row: any): PlaceSubmission {
  return {
    id: row.id,
    contributorId: row.contributor_id,
    contributorName: row.contributor_name,
    contributorEmail: row.contributor_email || undefined,
    contributorPhone: row.contributor_phone || undefined,
    placeName: row.place_name,
    category: row.category,
    country: row.country || 'India',
    state: row.state,
    district: row.district || undefined,
    city: row.city || undefined,
    address: row.address,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    shortDescription: row.short_description,
    detailedDescription: row.detailed_description,
    photos: Array.isArray(row.photos) ? row.photos : [],
    bestTimeToVisit: row.best_time_to_visit || undefined,
    estimatedVisitDuration: row.estimated_visit_duration || undefined,
    entryFee: row.entry_fee || undefined,
    openingHours: row.opening_hours || undefined,
    contactInfo: row.contact_info || undefined,
    website: row.website || undefined,
    accessibility: row.accessibility || undefined,
    parkingAvailable: Boolean(row.parking_available),
    facilities: Array.isArray(row.facilities) ? row.facilities : [],
    travelTips: Array.isArray(row.travel_tips) ? row.travel_tips : [],
    nearbyAttractions: Array.isArray(row.nearby_attractions) ? row.nearby_attractions : [],
    suitableFor: Array.isArray(row.suitable_for) ? row.suitable_for : [],
    status: row.status,
    adminFeedback: row.admin_feedback || undefined,
    rejectionReason: row.rejection_reason || undefined,
    approvedPlaceId: row.approved_place_id || undefined,
    rewardCouponCode: row.reward_coupon_code || undefined,
    reviewedBy: row.reviewed_by || undefined,
    aiVerification: row.ai_verification || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    submittedAt: row.submitted_at || row.created_at || new Date().toISOString(),
    reviewedAt: row.reviewed_at || undefined,
    approvedAt: row.approved_at || undefined,
  };
}

function mapSubmissionToDbRow(submission: PlaceSubmission): any {
  return {
    id: submission.id,
    contributor_id: submission.contributorId,
    contributor_name: submission.contributorName,
    contributor_email: submission.contributorEmail || '',
    contributor_phone: submission.contributorPhone || null,
    place_name: submission.placeName,
    category: submission.category,
    country: submission.country || 'India',
    state: submission.state,
    district: submission.district || null,
    city: submission.city || '',
    address: submission.address,
    latitude: submission.latitude,
    longitude: submission.longitude,
    short_description: submission.shortDescription,
    detailed_description: submission.detailedDescription,
    photos: submission.photos || [],
    best_time_to_visit: submission.bestTimeToVisit || null,
    estimated_visit_duration: submission.estimatedVisitDuration || null,
    entry_fee: submission.entryFee || null,
    opening_hours: submission.openingHours || null,
    contact_info: submission.contactInfo || null,
    website: submission.website || null,
    accessibility: submission.accessibility || null,
    parking_available: submission.parkingAvailable ?? false,
    facilities: submission.facilities || [],
    travel_tips: submission.travelTips || [],
    nearby_attractions: submission.nearbyAttractions || [],
    suitable_for: submission.suitableFor || [],
    status: submission.status,
    admin_feedback: submission.adminFeedback || null,
    rejection_reason: submission.rejectionReason || null,
    approved_place_id: submission.approvedPlaceId || null,
    reward_coupon_code: submission.rewardCouponCode || null,
    reviewed_by: submission.reviewedBy || null,
    ai_verification: submission.aiVerification || {},
    created_at: submission.createdAt,
    updated_at: submission.updatedAt,
    submitted_at: submission.submittedAt,
    reviewed_at: submission.reviewedAt || null,
    approved_at: submission.approvedAt || null,
  };
}

class ContributionService {
  private cache: Map<string, PlaceSubmission> = new Map();
  private reviews: PlaceReviewRecord[] = [];
  private history: ContributionHistoryRecord[] = [];
  private publishedDestinations: Map<string, PublishedDestinationRecord> = new Map();
  private isLoaded = false;

  public clearForTesting(): void {
    this.cache.clear();
    this.reviews = [];
    this.history = [];
    this.publishedDestinations.clear();
    this.isLoaded = false;
  }

  private ensureLoaded(): void {
    if (this.isLoaded) return;
    this.loadFromFiles();
    this.isLoaded = true;
  }

  private loadFromFiles(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        try {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        } catch {}
      }

      // 1. Primary: Load Submissions, Reviews, and History from data/
      if (fs.existsSync(DATA_FILE)) {
        try {
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
        } catch (e) {
          console.warn('[ContributionService] Load warning from primary file:', e);
        }
      }

      // 2. Secondary: Load from os.tmpdir() if running in serverless and tmp file exists
      if (fs.existsSync(TMP_DATA_FILE)) {
        try {
          const rawTmp = fs.readFileSync(TMP_DATA_FILE, 'utf8');
          const tmpData: StoredData = JSON.parse(rawTmp);
          if (tmpData.submissions && Array.isArray(tmpData.submissions)) {
            tmpData.submissions.forEach((s) => {
              const existing = this.cache.get(s.id);
              if (!existing || new Date(s.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
                this.cache.set(s.id, s);
              }
            });
          }
          if (tmpData.reviews && Array.isArray(tmpData.reviews) && this.reviews.length === 0) {
            this.reviews = tmpData.reviews;
          }
          if (tmpData.history && Array.isArray(tmpData.history) && this.history.length === 0) {
            this.history = tmpData.history;
          }
        } catch (e) {
          // ignore
        }
      }

      // 3. Load Published Community Destinations
      if (fs.existsSync(PUBLISHED_FILE)) {
        try {
          const rawPub = fs.readFileSync(PUBLISHED_FILE, 'utf8');
          const list: PublishedDestinationRecord[] = JSON.parse(rawPub);
          if (Array.isArray(list)) {
            list.forEach((p) => this.publishedDestinations.set(p.id, p));
          }
        } catch (e) {}
      }

      if (fs.existsSync(TMP_PUBLISHED_FILE)) {
        try {
          const rawPubTmp = fs.readFileSync(TMP_PUBLISHED_FILE, 'utf8');
          const listTmp: PublishedDestinationRecord[] = JSON.parse(rawPubTmp);
          if (Array.isArray(listTmp)) {
            listTmp.forEach((p) => this.publishedDestinations.set(p.id, p));
          }
        } catch (e) {}
      }
    } catch (err) {
      console.warn('[ContributionService] Load error (starting fresh cache):', err);
    }
  }

  private persist(): void {
    const payload: StoredData = {
      submissions: Array.from(this.cache.values()),
      reviews: this.reviews,
      history: this.history,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const pubJsonStr = JSON.stringify(Array.from(this.publishedDestinations.values()), null, 2);

    // 1. Primary write to data/
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpData = `${DATA_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpData, jsonStr, 'utf8');
      fs.renameSync(tmpData, DATA_FILE);

      const tmpPub = `${PUBLISHED_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpPub, pubJsonStr, 'utf8');
      fs.renameSync(tmpPub, PUBLISHED_FILE);
    } catch (err) {
      // Handled gracefully if EROFS on serverless Vercel /var/task
    }

    // 2. Secondary write to os.tmpdir() (always writable in serverless)
    try {
      const tmp1 = `${TMP_DATA_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmp1, jsonStr, 'utf8');
      fs.renameSync(tmp1, TMP_DATA_FILE);

      const tmp2 = `${TMP_PUBLISHED_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmp2, pubJsonStr, 'utf8');
      fs.renameSync(tmp2, TMP_PUBLISHED_FILE);
    } catch (err) {
      // Non-fatal
    }
  }

  // ==========================================================================
  // USER METHODS
  // ==========================================================================

  public async submitPlace(
    input: PlaceSubmissionInput,
    user: { id: string; email?: string; fullName?: string; name?: string },
    options?: { skipRateLimit?: boolean }
  ): Promise<PlaceSubmission> {
    this.ensureLoaded();

    // 1. Mandatory server-side validations & input sanitization
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
    if (typeof input.latitude !== 'number' || typeof input.longitude !== 'number' || isNaN(input.latitude) || isNaN(input.longitude)) {
      throw new Error('Valid GPS coordinates (latitude and longitude) are required.');
    }
    if (input.latitude < 6.5 || input.latitude > 37.6 || input.longitude < 68.1 || input.longitude > 97.4) {
      throw new Error('GPS coordinates must fall within Indian geographical boundaries (Lat: 6.5°N - 37.6°N, Long: 68.1°E - 97.4°E).');
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
    for (const photo of input.photos) {
      if (typeof photo !== 'string' || (!photo.startsWith('http') && !photo.startsWith('/') && !photo.startsWith('data:image/'))) {
        throw new Error('Invalid photo format. Photos must be valid URLs or images.');
      }
    }

    // 1.5 Rate limiting: max 5 submissions per user per 24 hours
    if (!options?.skipRateLimit) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const userDailySubmissions = Array.from(this.cache.values()).filter(
        (s) => s.contributorId === user.id && s.createdAt >= oneDayAgo
      );
      if (userDailySubmissions.length >= 5) {
        throw new Error('Daily destination contribution limit reached (maximum 5 submissions per 24 hours).');
      }
    }

    // 2. Run AI Verification Pipeline
    const aiVerification = runAiDestinationVerification(input);

    // 3. Build Submission Entity with Sanitized Text
    const submissionId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const submission: PlaceSubmission = {
      id: submissionId,
      contributorId: user.id,
      contributorName: sanitizeText(user.fullName || user.name || user.email?.split('@')[0]) || 'BharatYatra Explorer',
      contributorEmail: user.email,
      placeName: sanitizeText(input.placeName),
      category: input.category,
      country: input.country || 'India',
      state: sanitizeText(input.state),
      district: input.district ? sanitizeText(input.district) : undefined,
      city: input.city ? sanitizeText(input.city) : undefined,
      address: sanitizeText(input.address),
      latitude: Number(input.latitude),
      longitude: Number(input.longitude),
      shortDescription: sanitizeText(input.shortDescription),
      detailedDescription: sanitizeText(input.detailedDescription),
      photos: input.photos,
      bestTimeToVisit: input.bestTimeToVisit ? sanitizeText(input.bestTimeToVisit) : undefined,
      estimatedVisitDuration: input.estimatedVisitDuration ? sanitizeText(input.estimatedVisitDuration) : undefined,
      entryFee: input.entryFee ? sanitizeText(input.entryFee) : undefined,
      openingHours: input.openingHours ? sanitizeText(input.openingHours) : undefined,
      contactInfo: input.contactInfo ? sanitizeText(input.contactInfo) : undefined,
      website: input.website ? sanitizeText(input.website) : undefined,
      accessibility: input.accessibility ? sanitizeText(input.accessibility) : undefined,
      parkingAvailable: Boolean(input.parkingAvailable),
      facilities: (input.facilities || []).map((f) => sanitizeText(f)),
      travelTips: (input.travelTips || []).map((t) => sanitizeText(t)),
      nearbyAttractions: (input.nearbyAttractions || []).map((a) => sanitizeText(a)),
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
      const dbRow = mapSubmissionToDbRow(submission);
      const { data, error } = await supabase.from('place_submissions').insert(dbRow).select().single();
      if (error) {
        console.warn('[ContributionService] Supabase persistence notice:', error.message || error);
      }
    } catch (dbErr: any) {
      console.warn('[ContributionService] Supabase persistence exception:', dbErr?.message || dbErr);
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
        deepLink: `/dashboard/my-contributions`,
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

    // Try fetching latest user records from Supabase PostgreSQL
    try {
      const supabase = getSupabaseServerClient();
      let query = supabase.from('place_submissions').select('*').eq('contributor_id', userId);
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const sub = mapDbRowToSubmission(row);
          this.cache.set(sub.id, sub);
        }
      }
    } catch (dbErr) {
      // Supabase unavailable; continue with local cache
    }

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
    let submission = this.cache.get(id) || null;

    // Try fetching latest from Supabase if not found or to refresh
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase.from('place_submissions').select('*').eq('id', id).maybeSingle();
      if (!error && data) {
        submission = mapDbRowToSubmission(data);
        this.cache.set(submission.id, submission);
      }
    } catch (dbErr) {
      // fallback
    }

    if (!submission) return null;

    // Security check: Only owner or admin can view draft
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
      const dbRow = mapSubmissionToDbRow(submission);
      await supabase.from('place_submissions').update(dbRow).eq('id', submission.id);
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
      await supabase.from('place_submissions').update({
        status: submission.status,
        updated_at: submission.updatedAt,
      }).eq('id', submission.id);
    } catch (e: any) {
      console.warn('[ContributionService] Supabase withdraw exception:', e?.message || e);
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
    sort?: 'NEWEST' | 'OLDEST' | 'NAME_ASC';
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

    // Try fetching from Supabase to ensure fresh records across serverless instances
    try {
      const supabase = getSupabaseServerClient();
      let query = supabase.from('place_submissions').select('*');
      if (filters?.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }
      if (filters?.category && filters.category !== 'ALL') {
        query = query.eq('category', filters.category);
      }
      if (filters?.state && filters.state !== 'ALL') {
        query = query.eq('state', filters.state);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const sub = mapDbRowToSubmission(row);
          this.cache.set(sub.id, sub);
        }
      }
    } catch (e) {
      // Fallback to cache
    }

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

    if (filters?.sort === 'OLDEST') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (filters?.sort === 'NAME_ASC') {
      list.sort((a, b) => a.placeName.localeCompare(b.placeName));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

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

    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase.from('place_submissions').select('*');
      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const sub = mapDbRowToSubmission(row);
          this.cache.set(sub.id, sub);
        }
      }
    } catch (e) {}

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
          throw new Error('Revisions explanation note is required when requesting changes (minimum 5 characters).');
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
            deepLink: `/dashboard/my-contributions`,
            metadata: { submissionId: submission.id, feedback: notes.trim() },
          });
        } catch (e) {
          console.warn('[ContributionService] Notification warning:', e);
        }
        break;

      case 'REJECT':
        if (!notes || notes.trim().length < 5) {
          throw new Error('Rejection reason is required (minimum 5 characters).');
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
            deepLink: `/dashboard/my-contributions`,
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

      case 'DUPLICATE':
        // Mark as duplicate of an existing approved destination and preserve audit trail
        newStatus = 'REJECTED';
        submission.status = 'REJECTED';
        submission.rejectionReason = notes || 'Marked as duplicate of an existing verified destination.';
        submission.adminFeedback = notes || 'Marked as duplicate of an existing verified destination.';
        submission.approvedPlaceId = modifications?.approvedPlaceId || undefined;
        submission.reviewedBy = adminUser.email;
        submission.reviewedAt = nowIso;
        submission.updatedAt = nowIso;
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
    const historyEntry: ContributionHistoryRecord = {
      id: crypto.randomUUID(),
      contributorId: submission.contributorId,
      submissionId: submission.id,
      eventType: action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'UPDATED',
      description: `Administrator ${adminUser.email} performed action ${action}${notes ? `: "${notes}"` : ''}.`,
      createdAt: nowIso,
    };
    this.history.unshift(historyEntry);

    this.cache.set(id, submission);
    this.persist();

    // Attempt persistent Supabase PostgreSQL updates
    try {
      const supabase = getSupabaseServerClient();
      await supabase.from('place_submissions').update({
        status: submission.status,
        rejection_reason: submission.rejectionReason || null,
        admin_feedback: submission.adminFeedback || null,
        reviewed_by: submission.reviewedBy,
        reviewed_at: submission.reviewedAt,
        approved_at: submission.approvedAt || null,
        approved_place_id: submission.approvedPlaceId || null,
        updated_at: submission.updatedAt,
      }).eq('id', submission.id);

      await supabase.from('place_submission_reviews').insert({
        id: reviewRecord.id,
        submission_id: reviewRecord.submissionId,
        admin_id: reviewRecord.adminId,
        admin_email: reviewRecord.adminEmail,
        action: reviewRecord.action,
        previous_status: reviewRecord.previousStatus,
        new_status: reviewRecord.newStatus,
        review_notes: reviewRecord.reviewNotes || null,
        modifications: reviewRecord.modifications || {},
        created_at: reviewRecord.createdAt,
      });

      await supabase.from('contribution_history').insert({
        id: historyEntry.id,
        contributor_id: historyEntry.contributorId,
        submission_id: historyEntry.submissionId,
        event_type: historyEntry.eventType,
        description: historyEntry.description,
        created_at: historyEntry.createdAt,
      });
    } catch (e: any) {
      console.warn('[ContributionService] Supabase admin action audit warning:', e?.message || e);
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
