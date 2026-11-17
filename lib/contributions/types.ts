/**
 * BharatYatra — Community-Driven Destination Contribution System
 * Core Data Models & TypeScript Interfaces
 */

export type ContributionStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN';

export const CONTRIBUTION_CATEGORIES = [
  'Nature and Landscapes',
  'Historical Places',
  'Religious Places',
  'Adventure',
  'Beaches',
  'Mountains',
  'Waterfalls',
  'Lakes',
  'Wildlife and National Parks',
  'Museums',
  'Cultural Destinations',
  'Food and Restaurants',
  'Hidden Gems',
  'Other Attractions',
] as const;

export type ContributionCategory = (typeof CONTRIBUTION_CATEGORIES)[number];

export interface PlaceSubmissionPhoto {
  id: string;
  submissionId: string;
  storagePath: string;
  imageUrl: string;
  isPrimary?: boolean;
  uploadedAt: string;
}

export interface AiVerificationReport {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceScore: number; // 0 - 100
  completenessScore: number; // 0 - 100
  detectedIssues: string[];
  suggestedCorrections: string[];
  duplicateCandidates: Array<{
    name: string;
    state: string;
    distanceKm?: number;
    similarityScore: number; // 0 - 1
  }>;
  locationSanity: {
    withinIndiaBounds: boolean;
    stateCoordinatesMatch: boolean;
    flaggedNotes?: string;
  };
  imageSanity: {
    validCount: number;
    passedFormatCheck: boolean;
    notes?: string;
  };
  generatedAt: string;
}

export interface PlaceSubmission {
  id: string;
  contributorId: string;
  contributorName: string;
  contributorEmail?: string;
  contributorPhone?: string;
  placeName: string;
  category: ContributionCategory;
  country: string;
  state: string;
  district?: string;
  city?: string;
  address: string;
  latitude: number;
  longitude: number;
  shortDescription: string;
  detailedDescription: string;
  photos: string[]; // array of image URLs
  bestTimeToVisit?: string;
  estimatedVisitDuration?: string;
  entryFee?: string;
  openingHours?: string;
  contactInfo?: string;
  website?: string;
  accessibility?: string;
  parkingAvailable?: boolean;
  facilities?: string[];
  travelTips?: string[];
  nearbyAttractions?: string[];
  suitableFor?: string[];
  status: ContributionStatus;
  adminFeedback?: string;
  rejectionReason?: string;
  approvedPlaceId?: string;
  rewardCouponCode?: string;
  reviewedBy?: string;
  aiVerification?: AiVerificationReport;
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
}

export interface PlaceSubmissionInput {
  placeName: string;
  category: ContributionCategory;
  country?: string;
  state: string;
  district?: string;
  city?: string;
  address: string;
  latitude: number;
  longitude: number;
  shortDescription: string;
  detailedDescription: string;
  photos: string[];
  bestTimeToVisit?: string;
  estimatedVisitDuration?: string;
  entryFee?: string;
  openingHours?: string;
  contactInfo?: string;
  website?: string;
  accessibility?: string;
  parkingAvailable?: boolean;
  facilities?: string[];
  travelTips?: string[];
  nearbyAttractions?: string[];
  suitableFor?: string[];
}

export type AdminReviewAction =
  | 'CLAIM_REVIEW'
  | 'REQUEST_CHANGES'
  | 'REJECT'
  | 'APPROVE'
  | 'EDIT';

export interface PlaceReviewRecord {
  id: string;
  submissionId: string;
  adminId: string;
  adminEmail: string;
  action: AdminReviewAction;
  previousStatus: ContributionStatus;
  newStatus: ContributionStatus;
  reviewNotes?: string;
  modifications?: Partial<PlaceSubmission>;
  createdAt: string;
}

export interface ContributionHistoryRecord {
  id: string;
  contributorId: string;
  submissionId: string;
  eventType: 'SUBMITTED' | 'UPDATED' | 'CHANGES_REQUESTED' | 'RESUBMITTED' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  description: string;
  createdAt: string;
}

export interface ContributionStats {
  total: number;
  pending: number;
  underReview: number;
  changesRequested: number;
  approved: number;
  rejected: number;
  averageReviewTimeHours: number;
}

// Aliases and UI helpers
export type SubmissionStatus = ContributionStatus;
export type PlaceCategory = ContributionCategory;

export const PLACE_CATEGORIES: Record<ContributionCategory, { label: string; icon: string }> = {
  'Nature and Landscapes': { label: 'Nature & Landscapes', icon: '🌿' },
  'Historical Places': { label: 'Historical Places & Forts', icon: '🏰' },
  'Religious Places': { label: 'Temples & Spiritual Shrines', icon: '🛕' },
  'Adventure': { label: 'Adventure & Trekking', icon: '🧗' },
  'Beaches': { label: 'Beaches & Coastal', icon: '🏖️' },
  'Mountains': { label: 'Mountains & Hill Stations', icon: '⛰️' },
  'Waterfalls': { label: 'Waterfalls', icon: '🌊' },
  'Lakes': { label: 'Lakes & Water Bodies', icon: '⛵' },
  'Wildlife and National Parks': { label: 'Wildlife & Sanctuaries', icon: '🐅' },
  'Museums': { label: 'Museums & Galleries', icon: '🏛️' },
  'Cultural Destinations': { label: 'Cultural & Heritage Sites', icon: '🎭' },
  'Food and Restaurants': { label: 'Food, Dining & Cafes', icon: '🍛' },
  'Hidden Gems': { label: 'Hidden Gems & Offbeat', icon: '💎' },
  'Other Attractions': { label: 'Other Attractions', icon: '📍' },
};

export interface PlaceSubmissionSummary {
  id: string;
  name: string;
  category: ContributionCategory | string;
  state: string;
  district?: string;
  city?: string;
  contributor_name: string;
  contributor_email?: string;
  submitted_at: string;
  status: ContributionStatus;
  primary_photo_url?: string;
  photo_count: number;
  is_hidden_gem?: boolean;
  rejection_reason?: string;
  approved_place_id?: string;
  reward_coupon_code?: string;
  approved_at?: string;
}

export interface PlaceSubmissionDossier {
  submission: {
    id: string;
    contributor_id: string;
    contributor_name: string;
    contributor_email: string;
    contributor_type?: string;
    name: string;
    category: ContributionCategory;
    state: string;
    district?: string;
    city?: string;
    address: string;
    latitude: number;
    longitude: number;
    description: string;
    historical_significance?: string;
    travel_tips?: string;
    entry_fee?: string;
    timings?: string;
    ideal_duration?: string;
    best_season?: string;
    status: ContributionStatus;
    approved_place_id?: string;
  };
  photos: Array<{
    id: string;
    photo_url: string;
    caption?: string;
    is_primary?: boolean;
  }>;
  ai_report?: {
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    risk_score: number;
    gps_within_india: boolean;
    is_potential_duplicate: boolean;
    text_quality_score: number;
    image_sanity_passed: boolean;
    flagged_issues: string[];
  };
  duplicate_candidates?: Array<{
    existing_name: string;
    existing_state: string;
    similarity_score: number;
  }>;
  reviews: Array<{
    id: string;
    reviewer_name: string;
    action: string;
    feedback_to_user?: string;
    internal_notes?: string;
    created_at: string;
  }>;
}
