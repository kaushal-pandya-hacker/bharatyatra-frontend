/**
 * BharatYatra — Activity Provider Interface
 *
 * Every external activities supplier adapter (e.g. Viator, GetYourGuide, Rezdy,
 * local operators) must implement this contract.  The ActivitiesService only
 * ever speaks through this interface — swapping providers requires no service
 * code changes.
 */

export interface ActivitySearchInput {
  destinationSlug?: string;
  destination?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  date?: string; // YYYY-MM-DD
  adults?: number;
  children?: number;
  category?: string;
  currency?: string;
  page?: number;
  pageSize?: number;
}

export interface ActivitySlot {
  slotId: string;
  date: string;           // YYYY-MM-DD
  time: string;           // HH:MM (24h)
  durationMinutes: number;
  spotsAvailable: number;
  priceAdultInr: number;
  priceChildInr: number;
  currency: string;
  cancellationPolicy: string;
  rawSupplierData?: any;
}

export interface ActivitySearchItem {
  activityId: string;
  title: string;
  slug: string;
  category: string;
  destination: string;
  destinationSlug: string;
  description: string;
  shortDescription?: string;
  images: string[];
  latitude: number;
  longitude: number;
  durationMinutes: number;
  minPrice: number;
  maxPrice?: number;
  currency: string;
  rating?: number;
  reviewCount?: number;
  tags: string[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: string;
  instantConfirmation: boolean;
  meetingPoint?: string;
  provider: string;
  isVerified: boolean;
}

export interface ActivityDetail extends ActivitySearchItem {
  fullDescription: string;
  itinerary?: string;
  requirements?: string;
  ageRestriction?: string;
  groupSizeMin?: number;
  groupSizeMax?: number;
  languages?: string[];
  accessibility?: string;
  importantInfo?: string;
  slots?: ActivitySlot[];
}

export interface CheckActivityAvailabilityInput {
  activityId: string;
  slotId?: string;
  date: string;
  adults: number;
  children?: number;
}

export interface CheckActivityAvailabilityResult {
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'PRICE_CHANGED';
  activityId: string;
  slotId?: string;
  date: string;
  spotsAvailable?: number;
  priceAdultInr: number;
  priceChildInr?: number;
  totalPrice: number;
  currency: string;
  cancellationPolicy: string;
  message?: string;
}

export interface CreateActivityBookingInput {
  activityId: string;
  activityTitle: string;
  slotId?: string;
  date: string;
  time?: string;
  adults: number;
  children: number;
  totalPrice: number;
  currency: string;
  clientReference: string;
  holder: {
    name: string;
    surname: string;
    email: string;
    phone: string;
  };
  participants?: Array<{
    type: 'ADULT' | 'CHILD';
    name: string;
    surname: string;
    age?: number;
  }>;
  specialRequests?: string;
}

export interface ActivityBookingResponse {
  supplierReference: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED' | 'TEST_ONLY';
  voucherUrl?: string;
  meetingPoint?: string;
  confirmationNotes?: string;
  cancellationPolicy?: string;
  cancellationDeadline?: string;
}

export interface CancelActivityBookingInput {
  supplierReference: string;
  clientReference: string;
  simulation?: boolean;
}

export interface CancelActivityBookingResult {
  status: 'CANCELLED' | 'CANCEL_REQUESTED' | 'FAILED';
  cancellationFee: number;
  currency: string;
  message: string;
}

export interface IActivityProvider {
  readonly providerId: string;
  readonly providerName: string;
  readonly isLive: boolean;  // false = sandbox / fixture mode

  searchActivities(input: ActivitySearchInput): Promise<ActivitySearchItem[]>;
  getActivityDetail(activityId: string): Promise<ActivityDetail | null>;
  checkAvailability(input: CheckActivityAvailabilityInput): Promise<CheckActivityAvailabilityResult>;
  createBooking(input: CreateActivityBookingInput): Promise<ActivityBookingResponse>;
  cancelBooking(input: CancelActivityBookingInput): Promise<CancelActivityBookingResult>;
  healthCheck(): Promise<{ status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY'; latencyMs: number; message?: string }>;
}
