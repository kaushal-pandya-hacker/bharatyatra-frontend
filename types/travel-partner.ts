// ============================================================================
// BHARAT YATRA TRAVEL PARTNER ECOSYSTEM — TYPE DEFINITIONS
// ============================================================================

export type TravelAgencyType = 
  | 'PROPRIETORSHIP' 
  | 'PARTNERSHIP' 
  | 'PVT_LTD' 
  | 'PUBLIC_LTD' 
  | 'LLP' 
  | 'REGISTERED_OPERATOR';

export type AgencyVerificationStatus = 
  | 'SUBMITTED' 
  | 'PENDING_VERIFICATION' 
  | 'NEEDS_INFORMATION' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'SUSPENDED';

export type PackagePublicationStatus = 
  | 'DRAFT' 
  | 'PENDING_REVIEW' 
  | 'CHANGES_REQUESTED' 
  | 'APPROVED' 
  | 'PUBLISHED' 
  | 'PAUSED' 
  | 'REJECTED';

export interface TravelAgency {
  id: string;
  userId?: string | null;
  referenceNumber: string;
  businessName: string;
  businessSlug: string;
  businessType: TravelAgencyType;
  representativeName: string;
  businessEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  stateCode: string;
  postalCode: string;
  websiteUrl?: string;
  yearsInOperation: number;
  registrationIdentifiers: {
    gstin?: string;
    pan?: string;
    tourismRegNumber?: string;
    udyamNumber?: string;
  };
  businessDescription: string;
  serviceCoverage: {
    primaryRegion?: string;
    statesServed: string[];
    citiesServed: string[];
    packageCategories: string[];
    languagesSupported: string[];
    customerSupportHours?: string;
  };
  commercialPreferences: {
    pricingModel?: string;
    providesGroupTours: boolean;
    providesPrivateTours: boolean;
    monthlyBookingCapacity: number;
    agreedToTerms: boolean;
  };
  verificationStatus: AgencyVerificationStatus;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  rejectionReason?: string | null;
  informationRequestNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgencyVerificationDocument {
  id: string;
  agencyId: string;
  documentType: 'GST_CERTIFICATE' | 'INCORPORATION_PROOF' | 'REP_ID_PROOF' | 'TOURISM_LICENSE' | 'PAN_CARD';
  privateStorageKey: string;
  originalFilename: string;
  fileSizeBytes: number;
  mimeType: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface TravelPackageItineraryDay {
  dayNumber: number;
  title: string;
  description: string;
  places: string[];
  activities: string[];
  meals: string[];
  accommodationDetails?: string;
  transportDetails?: string;
}

export interface TravelPackage {
  id: string;
  agencyId: string;
  agencyName?: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  tourType: 'GROUP' | 'PRIVATE' | 'BOTH';
  origin: string;
  destinationSummary: string;
  destinations: string[];
  stateOrRegion: string;
  durationDays: number;
  durationNights: number;
  currency: string;
  basePrice: number;
  discountedPrice?: number;
  minTravellers: number;
  maxTravellers: number;
  coverImageUrl?: string;
  galleryImageUrls: string[];
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: string;
  bookingNoticeDays: number;
  itinerary: TravelPackageItineraryDay[];
  publicationStatus: PackagePublicationStatus;
  availabilityStatus: 'AVAILABLE' | 'SOLD_OUT' | 'SEASONAL_BREAK';
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  publishedAt?: string | null;
  pausedAt?: string | null;
  adminReviewNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TravelPartnerAgreement {
  id: string;
  agencyId: string;
  agreementVersion: string;
  commissionType: 'PERCENTAGE' | 'FIXED';
  commissionRate: number; // e.g., 10 for 10%
  commissionBasis: 'GROSS_BOOKING' | 'NET_SUBTOTAL';
  effectiveFrom: string;
  effectiveUntil?: string | null;
  agreementStatus: 'ACTIVE' | 'TERMINATED' | 'SUPERSEDED';
  acceptedAt: string;
  approvedBy?: string | null;
  createdAt: string;
}

export interface TravelCommissionLedgerEntry {
  id: string;
  agencyId: string;
  bookingId: string;
  packageId?: string | null;
  packageTitle?: string;
  agreementId?: string | null;
  eventType: 'BOOKING_ACCRUAL' | 'CANCELLATION_REVERSAL' | 'ADJUSTMENT' | 'PAYOUT_SETTLED';
  bookingAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netPayoutAmount: number;
  currency: string;
  status: 'PENDING_SETTLEMENT' | 'SETTLED' | 'REVERSED';
  idempotencyKey: string;
  settlementReference?: string | null;
  settledAt?: string | null;
  createdAt: string;
}

export interface TravelPartnerAuditLog {
  id: string;
  actorUserId?: string | null;
  actorRole: 'ADMIN' | 'PARTNER' | 'SYSTEM';
  agencyId?: string | null;
  entityType: 'AGENCY' | 'PACKAGE' | 'AGREEMENT' | 'COMMISSION';
  entityId: string;
  action: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface TravelPartnerNotification {
  id: string;
  agencyId: string;
  recipientEmail?: string;
  notificationType: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}
