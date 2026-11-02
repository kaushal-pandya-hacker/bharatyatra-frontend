/**
 * BharatYatra — Complete Review, Rating & Trip Completion Data Store
 * Handles genuine customer reviews, multi-category ratings, photos,
 * administrative replies, two-way conversation threads, and public moderation.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import { notificationStore } from '@/lib/notifications/notification-store';

export type StarRating = 1 | 2 | 3 | 4 | 5;

export type ReviewStatus = 'PENDING_MODERATION' | 'PUBLISHED' | 'HIDDEN' | 'SPAM';

export interface CategoryRatings {
  tripPlanning?: number;
  transportation?: number;
  accommodation?: number;
  destinationRecommendations?: number;
  itineraryQuality?: number;
  bookingExperience?: number;
  customerSupport?: number;
  valueForMoney?: number;
}

export interface ReviewPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface OfficialReply {
  responderName: string;
  responderRole: string;
  message: string;
  timestamp: string;
}

export interface ReviewMessageThread {
  id: string;
  sender: 'CUSTOMER' | 'ADMIN';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface TripReview {
  id: string;
  tripId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  destination: string;
  tripDates: {
    startDate: string;
    endDate?: string;
    durationDays: number;
  };
  travellerCount: number;
  overallRating: StarRating;
  categoryRatings: CategoryRatings;
  positiveHighlights: string[];
  improvementSuggestions: string[];
  customPositiveNote?: string;
  customImprovementNote?: string;
  writtenReview: string;
  photos: ReviewPhoto[];
  publicConsent: boolean;
  status: ReviewStatus;
  moderationNotes?: string;
  isResolved: boolean;
  officialReply?: OfficialReply;
  repliesThread: ReviewMessageThread[];
  createdAt: string;
  updatedAt: string;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'trip_reviews.json');

class ReviewStore {
  private cache: Map<string, TripReview> = new Map();
  private isLoaded = false;

  private ensureLoaded(): void {
    if (this.isLoaded) return;
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const list: TripReview[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((r) => {
            if (r.id) this.cache.set(r.id, r);
          });
        }
      }
    } catch (err) {
      console.error('[ReviewStore] Error loading reviews:', err);
    }
    this.isLoaded = true;
  }

  private persist(): void {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(this.cache.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('[ReviewStore] Error persisting reviews:', err);
    }
  }

  /**
   * Submit or update a review for a completed trip.
   * Guarantees 1 review per trip per user (edits existing if already submitted).
   */
  public async submitTripReview(input: {
    tripId: string;
    userId: string;
    customerName: string;
    customerEmail: string;
    destination: string;
    tripDates: { startDate: string; endDate?: string; durationDays: number };
    travellerCount?: number;
    overallRating: StarRating;
    categoryRatings?: CategoryRatings;
    positiveHighlights?: string[];
    improvementSuggestions?: string[];
    customPositiveNote?: string;
    customImprovementNote?: string;
    writtenReview: string;
    photos?: ReviewPhoto[];
    publicConsent?: boolean;
  }): Promise<{ review: TripReview; isNew: boolean }> {
    this.ensureLoaded();

    if (!input.tripId || !input.userId) {
      throw new Error('Trip ID and User ID are required to submit a review.');
    }
    if (!input.overallRating || input.overallRating < 1 || input.overallRating > 5) {
      throw new Error('Overall rating must be between 1 and 5 stars.');
    }
    if (!input.writtenReview || input.writtenReview.trim().length === 0) {
      throw new Error('Please share a few words about your journey experience.');
    }

    // Check for existing review for this trip
    const existing = Array.from(this.cache.values()).find(
      (r) => r.tripId === input.tripId && r.userId === input.userId
    );

    const now = new Date().toISOString();

    if (existing) {
      // Edit existing review
      existing.overallRating = input.overallRating;
      existing.categoryRatings = input.categoryRatings || existing.categoryRatings;
      existing.positiveHighlights = input.positiveHighlights || existing.positiveHighlights;
      existing.improvementSuggestions = input.improvementSuggestions || existing.improvementSuggestions;
      existing.customPositiveNote = input.customPositiveNote ?? existing.customPositiveNote;
      existing.customImprovementNote = input.customImprovementNote ?? existing.customImprovementNote;
      existing.writtenReview = input.writtenReview.trim();
      existing.photos = input.photos || existing.photos;
      existing.publicConsent = input.publicConsent !== undefined ? input.publicConsent : existing.publicConsent;
      existing.updatedAt = now;

      this.persist();
      return { review: existing, isNew: false };
    }

    // Create new review
    const id = `rev_${crypto.randomUUID().substring(0, 12)}`;
    const newReview: TripReview = {
      id,
      tripId: input.tripId,
      userId: input.userId,
      customerName: input.customerName || 'BharatYatra Traveller',
      customerEmail: input.customerEmail || '',
      destination: input.destination || 'Indian Voyage',
      tripDates: input.tripDates || {
        startDate: now.split('T')[0],
        durationDays: 3,
      },
      travellerCount: input.travellerCount || 2,
      overallRating: input.overallRating,
      categoryRatings: input.categoryRatings || {},
      positiveHighlights: input.positiveHighlights || [],
      improvementSuggestions: input.improvementSuggestions || [],
      customPositiveNote: input.customPositiveNote,
      customImprovementNote: input.customImprovementNote,
      writtenReview: input.writtenReview.trim(),
      photos: input.photos || [],
      publicConsent: Boolean(input.publicConsent),
      status: 'PENDING_MODERATION', // Awaits admin check before public listing
      isResolved: input.overallRating >= 4, // 4-5 stars default resolved; 1-3 flagged for operations check
      repliesThread: [],
      createdAt: now,
      updatedAt: now,
    };

    this.cache.set(id, newReview);
    this.persist();

    // Create confirmation in-app notification for the customer
    try {
      await notificationStore.createNotification({
        userId: input.userId,
        recipientEmail: input.customerEmail,
        title: 'Thank you for reviewing your journey! ❤️',
        message: `Your feedback for ${newReview.destination} has been received. Thank you for helping us improve BharatYatra!`,
        category: 'TRIP_REVIEW',
        type: 'REVIEW_SUBMITTED',
        deepLink: `/dashboard#reviews`,
        metadata: { reviewId: id, tripId: input.tripId },
      });
    } catch (err) {
      console.warn('[ReviewStore] Notification notice:', err);
    }

    return { review: newReview, isNew: true };
  }

  /**
   * Get review by ID.
   */
  public getReviewById(id: string): TripReview | null {
    this.ensureLoaded();
    return this.cache.get(id) || null;
  }

  /**
   * Get all reviews for a specific user.
   */
  public getUserReviews(userId: string): TripReview[] {
    this.ensureLoaded();
    return Array.from(this.cache.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get review for a specific trip by user.
   */
  public getTripReview(tripId: string, userId: string): TripReview | null {
    this.ensureLoaded();
    return (
      Array.from(this.cache.values()).find(
        (r) => r.tripId === tripId && r.userId === userId
      ) || null
    );
  }

  /**
   * Get public verified reviews (strictly status: PUBLISHED and publicConsent: true).
   */
  public getPublicReviews(filters?: {
    destination?: string;
    rating?: number;
    limit?: number;
  }): TripReview[] {
    this.ensureLoaded();
    let list = Array.from(this.cache.values()).filter(
      (r) => r.status === 'PUBLISHED' && r.publicConsent === true
    );

    if (filters?.destination) {
      const q = filters.destination.toLowerCase();
      list = list.filter((r) => r.destination.toLowerCase().includes(q));
    }

    if (filters?.rating && filters.rating > 0) {
      list = list.filter((r) => r.overallRating === filters.rating);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filters?.limit && filters.limit > 0) {
      return list.slice(0, filters.limit);
    }

    return list;
  }

  /**
   * Get administrative reviews with filtering and aggregate metrics.
   */
  public getAdminReviews(filters?: {
    search?: string;
    rating?: number;
    status?: string;
    destination?: string;
    responseStatus?: 'ALL' | 'AWAITING_REPLY' | 'REPLIED' | 'RESOLVED' | 'UNRESOLVED';
  }): {
    reviews: TripReview[];
    metrics: {
      totalReviews: number;
      averageRating: number;
      starDistribution: Record<StarRating, number>;
      pendingResponsesCount: number;
      resolvedCount: number;
      publishedCount: number;
    };
  } {
    this.ensureLoaded();
    let all = Array.from(this.cache.values());

    // Compute platform metrics across all real reviews
    const total = all.length;
    const starDist: Record<StarRating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    let pendingReplies = 0;
    let resolved = 0;
    let published = 0;

    all.forEach((r) => {
      if (r.overallRating >= 1 && r.overallRating <= 5) {
        starDist[r.overallRating]++;
        ratingSum += r.overallRating;
      }
      if (!r.officialReply) pendingReplies++;
      if (r.isResolved) resolved++;
      if (r.status === 'PUBLISHED') published++;
    });

    const avg = total > 0 ? Number((ratingSum / total).toFixed(1)) : 5.0;

    // Apply administrative filters
    let filtered = [...all];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          r.customerEmail.toLowerCase().includes(q) ||
          r.destination.toLowerCase().includes(q) ||
          r.writtenReview.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.tripId.toLowerCase().includes(q)
      );
    }

    if (filters?.rating && filters.rating >= 1 && filters.rating <= 5) {
      filtered = filtered.filter((r) => r.overallRating === filters.rating);
    }

    if (filters?.status && filters.status !== 'ALL') {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    if (filters?.destination) {
      const dest = filters.destination.toLowerCase();
      filtered = filtered.filter((r) => r.destination.toLowerCase().includes(dest));
    }

    if (filters?.responseStatus && filters.responseStatus !== 'ALL') {
      if (filters.responseStatus === 'AWAITING_REPLY') {
        filtered = filtered.filter((r) => !r.officialReply);
      } else if (filters.responseStatus === 'REPLIED') {
        filtered = filtered.filter((r) => Boolean(r.officialReply));
      } else if (filters.responseStatus === 'RESOLVED') {
        filtered = filtered.filter((r) => r.isResolved);
      } else if (filters.responseStatus === 'UNRESOLVED') {
        filtered = filtered.filter((r) => !r.isResolved);
      }
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      reviews: filtered,
      metrics: {
        totalReviews: total,
        averageRating: avg,
        starDistribution: starDist,
        pendingResponsesCount: pendingReplies,
        resolvedCount: resolved,
        publishedCount: published,
      },
    };
  }

  /**
   * Admin posts an official reply to a customer's review.
   */
  public async addAdminReply(
    reviewId: string,
    message: string,
    adminName: string,
    markResolved: boolean = true
  ): Promise<TripReview> {
    this.ensureLoaded();
    const review = this.cache.get(reviewId);
    if (!review) throw new Error('Review not found.');

    const cleanMsg = message.trim();
    if (!cleanMsg) throw new Error('Reply message cannot be empty.');

    const now = new Date().toISOString();

    const officialReply: OfficialReply = {
      responderName: adminName || 'BharatYatra Operations Lead',
      responderRole: 'OFFICIAL_SUPPORT',
      message: cleanMsg,
      timestamp: now,
    };

    review.officialReply = officialReply;
    review.repliesThread.push({
      id: `th_${crypto.randomUUID().substring(0, 8)}`,
      sender: 'ADMIN',
      senderName: officialReply.responderName,
      message: cleanMsg,
      timestamp: now,
    });

    if (markResolved) {
      review.isResolved = true;
    }
    review.updatedAt = now;

    this.persist();

    // Notify customer in-app
    try {
      await notificationStore.createNotification({
        userId: review.userId,
        recipientEmail: review.customerEmail,
        title: `Response to your ${review.destination} review`,
        message: `${officialReply.responderName} from BharatYatra replied: "${cleanMsg.slice(0, 100)}${cleanMsg.length > 100 ? '...' : ''}"`,
        category: 'TRIP_REVIEW',
        type: 'ADMIN_REPLIED_TO_REVIEW',
        deepLink: `/dashboard#reviews`,
        metadata: { reviewId: review.id, tripId: review.tripId },
      });
    } catch (err) {
      console.warn('[ReviewStore] Customer notification notice:', err);
    }

    return review;
  }

  /**
   * Customer replies back to an official BharatYatra response in the thread.
   */
  public async addCustomerReply(
    reviewId: string,
    userId: string,
    message: string
  ): Promise<TripReview> {
    this.ensureLoaded();
    const review = this.cache.get(reviewId);
    if (!review) throw new Error('Review not found.');
    if (review.userId !== userId) throw new Error('Unauthorized review access.');

    const cleanMsg = message.trim();
    if (!cleanMsg) throw new Error('Message cannot be empty.');

    const now = new Date().toISOString();

    review.repliesThread.push({
      id: `th_${crypto.randomUUID().substring(0, 8)}`,
      sender: 'CUSTOMER',
      senderName: review.customerName,
      message: cleanMsg,
      timestamp: now,
    });

    // If customer replies back, reopen resolution state for operations attention
    review.isResolved = false;
    review.updatedAt = now;

    this.persist();
    return review;
  }

  /**
   * Administrative status moderation (PUBLISH, HIDE, SPAM).
   */
  public moderateReview(
    reviewId: string,
    status: ReviewStatus,
    notes?: string
  ): TripReview {
    this.ensureLoaded();
    const review = this.cache.get(reviewId);
    if (!review) throw new Error('Review not found.');

    review.status = status;
    if (notes) review.moderationNotes = notes;
    review.updatedAt = new Date().toISOString();

    this.persist();
    return review;
  }
}

export const reviewStore = new ReviewStore();

