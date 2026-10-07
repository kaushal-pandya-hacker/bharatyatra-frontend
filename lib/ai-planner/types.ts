/**
 * BharatYatra Production AI Trip Planner — Strong Type Definitions
 */

export interface LocationSpec {
  city: string;
  state?: string;
  country: string;
  placeName?: string;
}

export interface TravelerSpec {
  adults: number;
  children?: number;
  infants?: number;
  seniors?: number;
}

export interface BudgetSpec {
  total?: number;
  currency: string; // 'INR'
  flexibility?: 'strict' | 'moderate' | 'flexible';
}

export interface TripPlanningRequest {
  naturalPrompt?: string; // Natural language input (English, Gujarati, Hinglish, Conversational)
  origin?: LocationSpec;
  destinations?: Array<{
    city?: string;
    place?: string;
    state?: string;
  }>;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  travelers?: TravelerSpec;
  budget?: BudgetSpec;
  interests?: string[];
  travelStyle?: 'budget' | 'balanced' | 'premium' | 'luxury';
  transportPreference?: string[];
  accommodationPreference?: string[];
  foodPreference?: string[];
  activityPreferences?: string[];
  pace?: 'relaxed' | 'balanced' | 'fast';
  accessibilityRequirements?: string[];
  mustVisit?: string[];
  avoid?: string[];
  specialRequirements?: string[];
  bookingRequired?: boolean;
}

export interface ParsedIntent {
  rawPrompt?: string;
  languageDetected: 'en' | 'gu' | 'hinglish' | 'unknown';
  originCity: string;
  originState?: string;
  targetDestinations: string[];
  durationDays: number;
  travelersCount: number;
  seniorCount: number;
  childCount: number;
  budgetInr?: number;
  travelStyle: 'budget' | 'balanced' | 'premium' | 'luxury';
  pace: 'relaxed' | 'balanced' | 'fast';
  interests: string[];
  mustVisit: string[];
  avoid: string[];
  isImpossibleRequest: boolean;
  impossibleReason?: string;
  clarificationRequired?: string[];
}

export interface DestinationNode {
  id: string;
  name: string;
  displayName: string;
  city?: string;
  district?: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  categories: string[];
  averageVisitDurationMinutes: number;
  openingTime: string; // "08:00"
  closingTime: string; // "19:00"
  bestMonths: string[];
  seasonalRestrictions: string[];
  estimatedEntryFeeInr: number;
  popularityScore: number; // 0 - 100
  familyFriendly: boolean;
  seniorFriendly: boolean;
  accessibilityScore: number; // 0 - 100
  estimatedDailyCostInr: number;
  imageUrl?: string;
}

export interface Activity {
  id: string;
  name: string;
  displayName: string;
  location: string;
  city?: string;
  state: string;
  latitude?: number;
  longitude?: number;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  category: string;
  estimatedCostInr: number;
  priority: 'must-do' | 'recommended' | 'optional';
  reason?: string;
  imageUrl?: string;
}

export interface MealRecommendation {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  recommendedCuisine: string;
  suggestedVenue?: string;
  estimatedCostInr: number;
}

export interface TravelSegment {
  from: string;
  to: string;
  mode: 'flight' | 'train' | 'bus' | 'cab' | 'walking' | 'ropeway';
  estimatedDurationMinutes: number;
  distanceKm: number;
  estimatedCostInr: number;
  departureTime?: string;
  arrivalTime?: string;
  notes?: string;
}

export interface AccommodationSuggestion {
  hotelName: string;
  city: string;
  category: string;
  starRating: number;
  checkInDate?: string;
  checkOutDate?: string;
  nights: number;
  estimatedCostPerNightInr: number;
  totalCostInr: number;
  reason?: string;
}

export interface TripDay {
  day: number;
  date?: string;
  location: string;
  state: string;
  dayType: 'Arrival Day' | 'Full Exploration Day' | 'Travel Day' | 'Mixed Travel + Exploration Day' | 'Rest Day' | 'Departure Day';
  morning: Activity[];
  afternoon: Activity[];
  evening: Activity[];
  meals: MealRecommendation[];
  travelSegments: TravelSegment[];
  accommodation?: AccommodationSuggestion;
  estimatedDailyCostInr: number;
  daySummary: string;
  decisionExplanation?: string;
}

export interface TripBudget {
  transportation: number;
  accommodation: number;
  food: number;
  activities: number;
  localTransport: number;
  miscellaneous: number;
  totalEstimatedInr: number;
  userBudgetInr?: number;
  isWithinBudget: boolean;
  tradeoffSuggestions?: string[];
}

export interface BookingRequirement {
  type: 'flight' | 'train' | 'hotel' | 'cab' | 'activity';
  title: string;
  details: string;
  originLocation?: string;
  destinationLocation?: string;
  date?: string;
  quantity: number;
  estimatedCostInr: number;
  isConfirmedLive: boolean; // Always false unless confirmed by live API
}

export interface PlanQuality {
  geographicScore: number;       // 0 - 100
  timeFeasibilityScore: number;  // 0 - 100
  budgetScore: number;           // 0 - 100
  personalizationScore: number;   // 0 - 100
  seasonalScore: number;         // 0 - 100
  transportScore: number;        // 0 - 100
  bookingReadinessScore: number; // 0 - 100
  overallScore: number;          // 0 - 100
  passesQualityBar: boolean;     // overallScore >= 85
}

export interface TripValidationResult {
  valid: boolean;
  criticalErrors: string[];
  warnings: string[];
}

export interface TripPlanningResponse {
  success: boolean;
  message?: string;
  requestIntent: ParsedIntent;
  trip: {
    title: string;
    origin: string;
    destinations: string[];
    durationDays: number;
    travelersCount: number;
    startDate?: string;
    endDate?: string;
    days: TripDay[];
    routeOverview: string[];
    totalDistanceKm: number;
  };
  budget: TripBudget;
  quality: PlanQuality;
  warnings: string[];
  bookingRequirements: BookingRequirement[];
  isEstimateOnly: boolean;
}
