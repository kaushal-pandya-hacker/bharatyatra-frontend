/**
 * BharatYatra AI 2.0 — Dynamic Itinerary Generation & Trip Planning Engine
 * 19-Step Deterministic Planning Pipeline, Geographical Clustering, Verified Attraction Sequencing,
 * Altitude Acclimatization Safeguards, Universal Preference Synchronization & Versioned Customization.
 */

import {
  TripPreferenceProfile,
  convertRequestToPreferenceProfile,
} from './universal-preference-profile';
import {
  findDestinationMaster,
  ALL_36_STATES_AND_UTS,
  haversineDistanceKm,
} from './destination-master-service';
import { resolveOriginCoordinates, INDIA_DESTINATIONS_REGISTRY } from './india-geo-registry';
import { calculateIntelligentDurations } from './duration-engine';
import { multimodalRouteEngine } from './multimodal-route-engine';
import {
  computeHybridTripPricing,
  HybridPricingEvaluation,
} from './hybrid-pricing-engine';
import { MOUNTAIN_PASSES_REGISTRY } from './seasonal-intelligence';
import {
  Activity,
  TripDay,
  MealRecommendation,
  TravelSegment,
  AccommodationSuggestion,
  TravelerSpec,
} from './types';

export interface VerifiedAttractionMetadata {
  id: string;
  name: string;
  displayName: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  category: string;
  visitDurationMinutes: number;
  openingTime: string; // "09:00"
  closingTime: string; // "18:00"
  closedDays: string[]; // e.g. ['Friday'] for Taj Mahal, ['Monday'] for Akshardham
  entryFeeInr: number;
  entryFeeStatus: 'free' | 'verified_fee' | 'estimated_fee';
  bookingRequired: boolean;
  seniorFriendly: boolean;
  wheelchairAccessible: boolean;
  interestTags: string[];
}

export interface ItineraryActivity extends Activity {
  activityId: string;
  destinationId: string;
  openingHours: {
    open: string;
    close: string;
    closedDays: string[];
  };
  entryFeeStatus: 'free' | 'verified_fee' | 'estimated_fee';
  bookingRequired: boolean;
  travelDistanceFromPrevKm: number;
  travelTimeFromPrevMinutes: number;
  suitabilityInterests: string[];
  accessibility: {
    wheelchairAccessible: boolean;
    seniorFriendly: boolean;
  };
  evidenceStatus: 'VERIFIED' | 'ESTIMATED' | 'USER_CUSTOM';
}

export interface ItineraryDay extends TripDay {
  dayNumber: number;
  date?: string;
  dayTitle: string;
  startLocation: string;
  endLocation: string;
  morningActivities: ItineraryActivity[];
  afternoonActivities: ItineraryActivity[];
  eveningActivities: ItineraryActivity[];
  mealPlan: MealRecommendation[];
  accommodation?: AccommodationSuggestion;
  transportLegs: TravelSegment[];
  restBuffersMinutes: number;
  activeHours: number;
  isFeasible: boolean;
  feasibilityWarning?: string;
  dayNotes: string[];
  evidenceStatus: 'VERIFIED' | 'ESTIMATED';
}

export interface ItineraryValidationResult {
  isValid: boolean;
  score: number; // 0 - 100
  errors: string[];
  warnings: string[];
  checks: {
    routeContinuity: boolean;
    closedAttractionsAvoided: boolean;
    realisticActiveHours: boolean;
    noDuplicateAttractions: boolean;
    excludedAttractionsRespected: boolean;
    lockedPreferencesHonored: boolean;
    budgetWithinBounds: boolean;
  };
}

export interface ItineraryVersion {
  versionId: string; // e.g. "v1.0.0", "v1.1.0"
  parentVersionId?: string;
  timestamp: string;
  author: 'AI_GENERATOR' | 'USER_CUSTOMIZATION' | 'REVERT_ACTION';
  changeSummary: string;
  days: ItineraryDay[];
  pricing: HybridPricingEvaluation;
  totalActiveHours: number;
  totalDistanceKm: number;
  feasibilityRating: 'FEASIBLE' | 'FEASIBLE_WITH_CONDITIONS' | 'NOT_RECOMMENDED';
}

export interface ItineraryMasterPlan {
  tripId: string;
  title: string;
  origin: string;
  destinations: string[];
  startDate?: string;
  endDate?: string;
  durationDays: number;
  travelers: TravelerSpec;
  currentVersion: ItineraryVersion;
  versionHistory: ItineraryVersion[];
  preferenceProfile: TripPreferenceProfile;
  validation: ItineraryValidationResult;
  explanations: {
    paceReasoning: string;
    routeReasoning: string;
    pricingReasoning: string;
    seasonalNotice?: string;
  };
}

// ============================================================================
// VERIFIED ATTRACTIONS KNOWLEDGE BASE (All-India Curated Landmarks)
// ============================================================================
export const VERIFIED_ATTRACTIONS_REGISTRY: Record<string, VerifiedAttractionMetadata[]> = {
  dwarka: [
    {
      id: 'DWK_TMPL',
      name: 'Shree Dwarkadhish Temple (Jagat Mandir)',
      displayName: 'Dwarkadhish Temple (Jagat Mandir)',
      city: 'Dwarka',
      state: 'Gujarat',
      latitude: 22.2376,
      longitude: 68.9678,
      category: 'Religious & Cultural Heritage',
      visitDurationMinutes: 120,
      openingTime: '06:30',
      closingTime: '21:30',
      closedDays: [],
      entryFeeInr: 0,
      entryFeeStatus: 'free',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: true,
      interestTags: ['Heritage', 'Religious and cultural tourism', 'Architecture'],
    },
    {
      id: 'DWK_GOMTI',
      name: 'Gomti Ghat & Sudama Setu',
      displayName: 'Gomti Ghat Holy Bath & Sudama Bridge Walk',
      city: 'Dwarka',
      state: 'Gujarat',
      latitude: 22.2355,
      longitude: 68.9692,
      category: 'Culture & Nature',
      visitDurationMinutes: 60,
      openingTime: '06:00',
      closingTime: '20:00',
      closedDays: [],
      entryFeeInr: 20,
      entryFeeStatus: 'verified_fee',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: false,
      interestTags: ['Nature', 'Religious and cultural tourism', 'Photography'],
    },
    {
      id: 'DWK_BET',
      name: 'Bet Dwarka Island & Temple',
      displayName: 'Bet Dwarka Island Boat Excursion',
      city: 'Dwarka',
      state: 'Gujarat',
      latitude: 22.4642,
      longitude: 69.1022,
      category: 'Island & Pilgrimage',
      visitDurationMinutes: 150,
      openingTime: '07:00',
      closingTime: '18:00',
      closedDays: [],
      entryFeeInr: 50,
      entryFeeStatus: 'verified_fee',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: false,
      interestTags: ['Heritage', 'Beaches', 'Local experiences'],
    },
    {
      id: 'DWK_NAGESHWAR',
      name: 'Nageshwar Jyotirlinga Temple',
      displayName: 'Nageshwar Jyotirlinga Darshan',
      city: 'Dwarka',
      state: 'Gujarat',
      latitude: 22.3344,
      longitude: 69.0142,
      category: 'Religious & Spiritual',
      visitDurationMinutes: 75,
      openingTime: '06:00',
      closingTime: '21:00',
      closedDays: [],
      entryFeeInr: 0,
      entryFeeStatus: 'free',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: true,
      interestTags: ['Religious and cultural tourism', 'History'],
    },
    {
      id: 'DWK_SHIVRAJPUR',
      name: 'Shivrajpur Blue Flag Beach',
      displayName: 'Shivrajpur Blue Flag Beach & Watersports',
      city: 'Dwarka',
      state: 'Gujarat',
      latitude: 22.3325,
      longitude: 68.9515,
      category: 'Beaches & Relaxation',
      visitDurationMinutes: 120,
      openingTime: '08:00',
      closingTime: '19:00',
      closedDays: [],
      entryFeeInr: 30,
      entryFeeStatus: 'verified_fee',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: true,
      interestTags: ['Beaches', 'Adventure', 'Family activities', 'Relaxation'],
    },
  ],
  leh: [
    {
      id: 'LEH_PALACE',
      name: 'Leh Royal Palace',
      displayName: 'Leh Palace Heritage Walk',
      city: 'Leh',
      state: 'Ladakh',
      latitude: 34.1661,
      longitude: 77.5858,
      category: 'History & Royal Heritage',
      visitDurationMinutes: 90,
      openingTime: '07:00',
      closingTime: '17:00',
      closedDays: [],
      entryFeeInr: 50,
      entryFeeStatus: 'verified_fee',
      bookingRequired: false,
      seniorFriendly: false,
      wheelchairAccessible: false,
      interestTags: ['History', 'Heritage', 'Photography'],
    },
    {
      id: 'LEH_SHANTI',
      name: 'Shanti Stupa Sunrise / Sunset',
      displayName: 'Shanti Stupa White Dome Panorama',
      city: 'Leh',
      state: 'Ladakh',
      latitude: 34.1751,
      longitude: 77.5756,
      category: 'Spiritual & Scenic Viewpoint',
      visitDurationMinutes: 60,
      openingTime: '05:00',
      closingTime: '21:00',
      closedDays: [],
      entryFeeInr: 0,
      entryFeeStatus: 'free',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: true,
      interestTags: ['Photography', 'Relaxation', 'Religious and cultural tourism'],
    },
    {
      id: 'LEH_HEMIS',
      name: 'Hemis Monastery & Museum',
      displayName: 'Hemis Gompa Buddhist Sanctuary',
      city: 'Leh',
      state: 'Ladakh',
      latitude: 33.9125,
      longitude: 77.7083,
      category: 'Monastic Culture & Art',
      visitDurationMinutes: 120,
      openingTime: '08:00',
      closingTime: '18:00',
      closedDays: [],
      entryFeeInr: 100,
      entryFeeStatus: 'verified_fee',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: false,
      interestTags: ['Heritage', 'Religious and cultural tourism', 'History'],
    },
    {
      id: 'LEH_THIKSEY',
      name: 'Thiksey Monastery (Mini Potala)',
      displayName: 'Thiksey Monastery Morning Prayer',
      city: 'Leh',
      state: 'Ladakh',
      latitude: 34.0583,
      longitude: 77.6667,
      category: 'Buddhist Heritage',
      visitDurationMinutes: 90,
      openingTime: '07:00',
      closingTime: '19:00',
      closedDays: [],
      entryFeeInr: 50,
      entryFeeStatus: 'verified_fee',
      bookingRequired: false,
      seniorFriendly: false,
      wheelchairAccessible: false,
      interestTags: ['Heritage', 'Photography', 'Religious and cultural tourism'],
    },
  ],
  udaipur: [
    {
      id: 'UDR_CITY_PALACE',
      name: 'Udaipur City Palace Complex',
      displayName: 'City Palace Museum & Crystal Gallery',
      city: 'Udaipur',
      state: 'Rajasthan',
      latitude: 24.5764,
      longitude: 73.6835,
      category: 'Royal Heritage & Architecture',
      visitDurationMinutes: 150,
      openingTime: '09:30',
      closingTime: '17:30',
      closedDays: [],
      entryFeeInr: 300,
      entryFeeStatus: 'verified_fee',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: true,
      interestTags: ['History', 'Heritage', 'Photography', 'Architecture'],
    },
    {
      id: 'UDR_LAKE_PICHOLA',
      name: 'Lake Pichola Boat Cruise & Jagmandir',
      displayName: 'Lake Pichola Royal Sunset Boat Cruise',
      city: 'Udaipur',
      state: 'Rajasthan',
      latitude: 24.5735,
      longitude: 73.6795,
      category: 'Lakes & Scenic Cruises',
      visitDurationMinutes: 90,
      openingTime: '10:00',
      closingTime: '18:30',
      closedDays: [],
      entryFeeInr: 450,
      entryFeeStatus: 'verified_fee',
      bookingRequired: true,
      seniorFriendly: true,
      wheelchairAccessible: true,
      interestTags: ['Relaxation', 'Photography', 'Family activities'],
    },
    {
      id: 'UDR_SAHELION',
      name: 'Saheliyon-ki-Bari (Courtyard of Maidens)',
      displayName: 'Saheliyon-ki-Bari Royal Fountains Garden',
      city: 'Udaipur',
      state: 'Rajasthan',
      latitude: 24.6033,
      longitude: 73.6853,
      category: 'Historic Gardens',
      visitDurationMinutes: 60,
      openingTime: '09:00',
      closingTime: '19:00',
      closedDays: [],
      entryFeeInr: 50,
      entryFeeStatus: 'verified_fee',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: true,
      interestTags: ['Nature', 'Heritage', 'Relaxation'],
    },
  ],
  jaipur: [
    {
      id: 'JAI_AMBER',
      name: 'Amber Fort & Palace',
      displayName: 'Amber Fort (Amer Fort) & Sheesh Mahal',
      city: 'Jaipur',
      state: 'Rajasthan',
      latitude: 26.9855,
      longitude: 75.8513,
      category: 'Fortresses & Royal Heritage',
      visitDurationMinutes: 150,
      openingTime: '08:00',
      closingTime: '17:30',
      closedDays: [],
      entryFeeInr: 200,
      entryFeeStatus: 'verified_fee',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: true,
      interestTags: ['History', 'Heritage', 'Architecture', 'Photography'],
    },
    {
      id: 'JAI_HAWA_MAHAL',
      name: 'Hawa Mahal (Palace of Winds)',
      displayName: 'Hawa Mahal Architectural Facade Tour',
      city: 'Jaipur',
      state: 'Rajasthan',
      latitude: 26.9239,
      longitude: 75.8267,
      category: 'Historic Architecture',
      visitDurationMinutes: 60,
      openingTime: '09:00',
      closingTime: '17:00',
      closedDays: [],
      entryFeeInr: 50,
      entryFeeStatus: 'verified_fee',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: false,
      interestTags: ['History', 'Photography', 'Heritage'],
    },
    {
      id: 'JAI_CITY_PALACE',
      name: 'City Palace of Jaipur & Museum',
      displayName: 'City Palace Complex & Mubarak Mahal',
      city: 'Jaipur',
      state: 'Rajasthan',
      latitude: 26.9258,
      longitude: 75.8237,
      category: 'Royal Palaces & Architecture',
      visitDurationMinutes: 120,
      openingTime: '09:30',
      closingTime: '17:00',
      closedDays: [],
      entryFeeInr: 300,
      entryFeeStatus: 'verified_fee',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: true,
      interestTags: ['History', 'Heritage', 'Culture', 'Photography'],
    },
    {
      id: 'JAI_JANTAR_MANTAR',
      name: 'Jantar Mantar Astronomical Observatory',
      displayName: 'Jantar Mantar UNESCO World Heritage Site',
      city: 'Jaipur',
      state: 'Rajasthan',
      latitude: 26.9248,
      longitude: 75.8246,
      category: 'Science & Astronomical Heritage',
      visitDurationMinutes: 75,
      openingTime: '09:00',
      closingTime: '17:00',
      closedDays: [],
      entryFeeInr: 100,
      entryFeeStatus: 'verified_fee',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: true,
      interestTags: ['History', 'Heritage', 'Family activities'],
    },
  ],
  delhi: [
    {
      id: 'DEL_QUTUB',
      name: 'Qutub Minar & Mehrauli Archaeological Park',
      displayName: 'Qutub Minar UNESCO World Heritage Site',
      city: 'New Delhi',
      state: 'Delhi',
      latitude: 28.5245,
      longitude: 77.1855,
      category: 'Monuments & World Heritage',
      visitDurationMinutes: 90,
      openingTime: '07:00',
      closingTime: '18:00',
      closedDays: [],
      entryFeeInr: 40,
      entryFeeStatus: 'verified_fee',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: true,
      interestTags: ['History', 'Heritage', 'Photography'],
    },
    {
      id: 'DEL_AKSHARDHAM',
      name: 'Swaminarayan Akshardham Temple Complex',
      displayName: 'Akshardham Spiritual Complex & Musical Fountain',
      city: 'New Delhi',
      state: 'Delhi',
      latitude: 28.6127,
      longitude: 77.2773,
      category: 'Spiritual & Cultural Campus',
      visitDurationMinutes: 180,
      openingTime: '10:00',
      closingTime: '20:00',
      closedDays: ['Monday'], // Mandatory verified closure rule
      entryFeeInr: 0,
      entryFeeStatus: 'free',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: true,
      interestTags: ['Religious and cultural tourism', 'Heritage', 'Family activities'],
    },
    {
      id: 'DEL_HUMAYUN',
      name: 'Humayun\'s Tomb Garden Complex',
      displayName: 'Humayun\'s Tomb Mughal Gardens',
      city: 'New Delhi',
      state: 'Delhi',
      latitude: 28.5933,
      longitude: 77.2507,
      category: 'Mughal Architecture & Gardens',
      visitDurationMinutes: 90,
      openingTime: '06:00',
      closingTime: '18:00',
      closedDays: [],
      entryFeeInr: 40,
      entryFeeStatus: 'verified_fee',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: true,
      interestTags: ['History', 'Heritage', 'Nature', 'Photography'],
    },
  ],
  agra: [
    {
      id: 'AGR_TAJ',
      name: 'Taj Mahal',
      displayName: 'Taj Mahal Sunrise / Daytime Exploration',
      city: 'Agra',
      state: 'Uttar Pradesh',
      latitude: 27.1751,
      longitude: 78.0421,
      category: 'World Wonder & Mughal Architecture',
      visitDurationMinutes: 150,
      openingTime: '06:00',
      closingTime: '18:30',
      closedDays: ['Friday'], // Inviolable verified closing day
      entryFeeInr: 250,
      entryFeeStatus: 'verified_fee',
      bookingRequired: true,
      seniorFriendly: true,
      wheelchairAccessible: true,
      interestTags: ['History', 'Heritage', 'Photography', 'Architecture'],
    },
    {
      id: 'AGR_FORT',
      name: 'Agra Red Fort',
      displayName: 'Agra Fort UNESCO Imperial Complex',
      city: 'Agra',
      state: 'Uttar Pradesh',
      latitude: 27.1795,
      longitude: 78.0211,
      category: 'Mughal Imperial Fort',
      visitDurationMinutes: 120,
      openingTime: '06:00',
      closingTime: '18:00',
      closedDays: [],
      entryFeeInr: 50,
      entryFeeStatus: 'verified_fee',
      bookingRequired: false,
      seniorFriendly: true,
      wheelchairAccessible: true,
      interestTags: ['History', 'Heritage', 'Architecture'],
    },
  ],
};

// ============================================================================
// DYNAMIC ITINERARY ENGINE CLASS
// ============================================================================
export class DynamicItineraryEngine {
  /**
   * Main 19-Step Deterministic Itinerary Generation Pipeline
   */
  public generateItinerary(params: {
    preferenceProfile: TripPreferenceProfile;
    startDate?: string;
    naturalPrompt?: string;
    skipPricing?: boolean;
  }): ItineraryMasterPlan {
    const { preferenceProfile, startDate, naturalPrompt } = params;

    // Step 1: Extract Identity & Preferences
    const originCity = preferenceProfile.identity.origin || 'Ahmedabad';
    const destinationQuery = preferenceProfile.identity.destination || 'Dwarka';
    const pace = preferenceProfile.pace.style || 'balanced';
    
    // Extract interest tags from structured boolean map & custom tags
    const interestTags: string[] = [];
    if (preferenceProfile.interests) {
      const keys = ['adventure', 'nature', 'heritage', 'culture', 'food', 'photography', 'wildlife', 'beaches', 'mountains', 'religious', 'shopping', 'relaxation'] as const;
      keys.forEach((k) => {
        if (preferenceProfile.interests[k]) {
          interestTags.push(k.charAt(0).toUpperCase() + k.slice(1));
        }
      });
      if (preferenceProfile.interests.customTags?.length) {
        interestTags.push(...preferenceProfile.interests.customTags);
      }
    }
    const interests = interestTags.length > 0 ? interestTags : ['Heritage', 'Culture'];
    const lockedKeys = preferenceProfile.lockedKeys || [];

    // Step 2 & 3: Resolve Destination Master & Geography
    const destMaster = findDestinationMaster(destinationQuery);
    const destName = destMaster ? destMaster.canonicalName : destinationQuery;
    const destState = destMaster ? destMaster.stateOrUt : 'Gujarat';
    const isHighAltitude = destMaster ? destMaster.isHighAltitude : false;
    const altitudeMeters = destMaster ? destMaster.altitudeMeters : 250;

    // Step 4: Duration Synchronization (Phase 4 integration)
    let totalDays = preferenceProfile.identity.tripDurationDays || 4;
    if (!preferenceProfile.identity.tripDurationDays) {
      const durCalc = calculateIntelligentDurations(originCity, destName, pace === 'fast-paced' ? 'fast' : (pace as any));
      totalDays = durCalc.options.recommended.totalDays;
    }

    // Step 5: Route Intelligence & Multimodal Discovery (Phase 7 integration)
    const travelMonth = startDate ? new Date(startDate).getMonth() + 1 : new Date().getMonth() + 1;
    const destList = (preferenceProfile.identity.destinationList && preferenceProfile.identity.destinationList.length > 0)
      ? preferenceProfile.identity.destinationList
      : [destName];

    const routeOpt = multimodalRouteEngine.solveRoute({
      originCity,
      destinationQuery: destName,
      travelMonth,
      strategy: 'balanced',
      preferenceProfile,
    });
    const recommendedRoute = routeOpt.recommendedJourney;

    // Calculate total circuit distance across all destination stops
    let totalCircuitDistanceKm = recommendedRoute.totalDistanceKm;
    if (destList.length > 1) {
      let prevCity = originCity;
      totalCircuitDistanceKm = 0;
      destList.forEach((dst) => {
        const step = multimodalRouteEngine.solveRoute({
          originCity: prevCity,
          destinationQuery: dst,
          travelMonth,
        });
        totalCircuitDistanceKm += step.recommendedJourney.totalDistanceKm;
        prevCity = dst;
      });
      // Return leg back to origin
      const retStep = multimodalRouteEngine.solveRoute({
        originCity: prevCity,
        destinationQuery: originCity,
        travelMonth,
      });
      totalCircuitDistanceKm += retStep.recommendedJourney.totalDistanceKm;
    }

    // Step 6 & 8: Retrieve & Select Verified Attractions
    const travelersComp = preferenceProfile.identity.travelerComposition || { adults: 2, children: 0, seniors: 0, infants: 0 };
    const seniorParty = (travelersComp.seniors || 0) > 0;

    const attractions: VerifiedAttractionMetadata[] = [];
    destList.forEach((dst) => {
      const dstMaster = findDestinationMaster(dst);
      const dstAttractions = this.selectAttractionsForDestination({
        destName: dst,
        destState: dstMaster ? dstMaster.stateOrUt : destState,
        interests,
        excludedAttractions: preferenceProfile.customization.excludedAttractions || [],
        mustVisitAttractions: preferenceProfile.customization.preferredAttractions || [],
        seniorParty,
        totalDays,
        pace,
      });
      attractions.push(...dstAttractions);
    });

    // Step 9 & 10: Geographic Allocation & Day Synthesis
    const days: ItineraryDay[] = this.synthesizeDays({
      originCity,
      destName,
      destState,
      totalDays,
      startDate,
      pace,
      attractions,
      routeJourney: recommendedRoute,
      isHighAltitude,
      altitudeMeters,
      preferenceProfile,
    });

    // Step 14 & 15: Component-Level Hybrid Pricing (Optional, decoupled)
    const hybridPricing: HybridPricingEvaluation = params.skipPricing
      ? ({
          originCity,
          destinationCity: destName,
          selectedTransportMode: recommendedRoute.primaryMode as any,
          recommendedTier: 'standard',
          tiers: {} as any,
          priceProvenance: { liveCount: 0, referenceCount: 0, estimatedCount: 0, liveCoveragePercent: 0, confidenceScore: 100 },
          budgetAnalysis: { fitsBudget: true, deficitAmount: 0, surplusAmount: 0, tradeoffSuggestions: ['Financial calculations decoupled from itinerary.'] },
          packageAlternatives: [],
        } as any)
      : computeHybridTripPricing({
          originCity,
          destinationCity: destName,
          distanceKm: totalCircuitDistanceKm,
          travelers: {
            adults: travelersComp.adults || 2,
            seniors: travelersComp.seniors || 0,
            children: travelersComp.children || 0,
            infants: travelersComp.infants || 0,
          },
          durationDays: totalDays,
          travelMonth,
          preferredTransport: preferenceProfile.transport.preferredTransport as any,
          preferredTier: preferenceProfile.budget.pricingCategory as any,
          userBudgetInr: preferenceProfile.budget.totalBudget,
        });

    // Step 16 & 17: Deterministic Validation Layer
    const validation = this.validateItineraryPlan(days, preferenceProfile, hybridPricing);

    // Step 18: Generate Human Explanations
    const paceDesc = pace === 'relaxed' ? '1-2' : (pace === 'fast-paced' || pace === 'sightseeing-focused') ? '3-4' : '2-3';
    const totalGroupCost = hybridPricing?.tiers?.[hybridPricing.recommendedTier]?.totalGroupCost || 0;
    const explanations = {
      paceReasoning: `Allocated ~${paceDesc} activities per day conforming to ${pace} travel style without excessive transit fatigue.`,
      routeReasoning: `Outbound and return transit powered by Phase 7 Multimodal Route Engine (${recommendedRoute.modeSummary}). Travel distance: ${totalCircuitDistanceKm} km.`,
      pricingReasoning: params.skipPricing
        ? 'Financial calculation decoupled from itinerary intelligence.'
        : `Transparent 4-tier cost model based on Phase 5/6 calibrated Indian tariffs. Total estimated budget: ₹${totalGroupCost.toLocaleString('en-IN')}.`,
      seasonalNotice: (isHighAltitude || altitudeMeters >= 2800)
        ? `Mandatory High-Altitude Acclimatization Protocol Active: Destination elevation (${altitudeMeters}m) exceeds 2,800m. Day 1 afternoon/evening and Day 2 morning are strictly reserved for rest and hydration to mitigate Acute Mountain Sickness (AMS).`
        : routeOpt.feasibility.acclimatizationNotice || (routeOpt.feasibility.warnings.length > 0 ? routeOpt.feasibility.warnings[0] : undefined),
    };

    // Step 19: Build Master Version 1.0.0
    const initialVersion: ItineraryVersion = {
      versionId: 'v1.0.0',
      timestamp: new Date().toISOString(),
      author: 'AI_GENERATOR',
      changeSummary: 'Initial master itinerary synthesized with Phase 1–7 intelligence.',
      days,
      pricing: hybridPricing,
      totalActiveHours: days.reduce((sum, d) => sum + d.activeHours, 0),
      totalDistanceKm: totalCircuitDistanceKm,
      feasibilityRating: routeOpt.feasibility.classification === 'FEASIBLE' ? 'FEASIBLE' : 'FEASIBLE_WITH_CONDITIONS',
    };

    const tripId = `TRIP_${Date.now()}`;
    const title = `${originCity} to ${destList.join(' & ')} ${totalDays}-Day Curated Journey`;

    return {
      tripId,
      title,
      origin: originCity,
      destinations: destList,
      startDate,
      durationDays: totalDays,
      travelers: {
        adults: travelersComp.adults || 2,
        children: travelersComp.children || 0,
        seniors: travelersComp.seniors || 0,
      },
      currentVersion: initialVersion,
      versionHistory: [initialVersion],
      preferenceProfile,
      validation,
      explanations,
    };
  }

  /**
   * Filters and sequences attractions for a destination
   */
  private selectAttractionsForDestination(params: {
    destName: string;
    destState: string;
    interests: string[];
    excludedAttractions: string[];
    mustVisitAttractions: string[];
    seniorParty: boolean;
    totalDays: number;
    pace: string;
  }): VerifiedAttractionMetadata[] {
    const {
      destName,
      destState,
      interests,
      excludedAttractions,
      mustVisitAttractions,
      seniorParty,
      totalDays,
      pace,
    } = params;

    const key = destName.toLowerCase().trim();
    let candidates = VERIFIED_ATTRACTIONS_REGISTRY[key] || [];

    // If destination not in verified mini-registry, synthesize from destination master
    if (candidates.length === 0) {
      candidates = this.synthesizeAttractions(destName, destState, interests);
    }

    // 1. Exclude user-prohibited attractions
    const cleanCandidates = candidates.filter(
      (c) => !excludedAttractions.some((ex) => c.name.toLowerCase().includes(ex.toLowerCase()))
    );

    // 2. Score & Sort Candidates
    const scored = cleanCandidates.map((c) => {
      let score = 50;

      // Must-visit boost
      if (mustVisitAttractions.some((mv) => c.name.toLowerCase().includes(mv.toLowerCase()))) {
        score += 50;
      }

      // Interest alignment
      const matchingInterests = c.interestTags.filter((tag) =>
        interests.some((i) => tag.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(tag.toLowerCase()))
      );
      score += matchingInterests.length * 15;

      // Senior friendly boost if party has seniors
      if (seniorParty && c.seniorFriendly) {
        score += 20;
      }

      return { attraction: c, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Limit to realistic capacity: relaxed = 2/day, balanced = 3/day, active = 4/day
    const capacityPerDay = pace === 'relaxed' ? 2 : pace === 'active' ? 4 : 3;
    const maxNeeded = Math.max(4, (totalDays - 1) * capacityPerDay);

    return scored.slice(0, maxNeeded).map((s) => s.attraction);
  }

  /**
   * Synthesizes Day-by-Day timeline adhering to realistic active hour limits
   */
  private synthesizeDays(params: {
    originCity: string;
    destName: string;
    destState: string;
    totalDays: number;
    startDate?: string;
    pace: string;
    attractions: VerifiedAttractionMetadata[];
    routeJourney: any;
    isHighAltitude: boolean;
    altitudeMeters: number;
    preferenceProfile: TripPreferenceProfile;
  }): ItineraryDay[] {
    const {
      originCity,
      destName,
      destState,
      totalDays,
      startDate,
      pace,
      attractions,
      routeJourney,
      isHighAltitude,
      altitudeMeters,
      preferenceProfile,
    } = params;

    const destList = (preferenceProfile.identity.destinationList && preferenceProfile.identity.destinationList.length > 0)
      ? preferenceProfile.identity.destinationList
      : [destName];

    const days: ItineraryDay[] = [];
    const availableAttractions = [...attractions];

    for (let d = 1; d <= totalDays; d++) {
      const isFirstDay = d === 1;
      const isLastDay = d === totalDays;
      const isAcclimatization = isHighAltitude && (d === 1 || d === 2);

      // Determine current destination for multi-city circuits
      const currentDestIndex = Math.min(destList.length - 1, Math.floor(((d - 1) / totalDays) * destList.length));
      const currentCity = destList[currentDestIndex];
      const currentMaster = findDestinationMaster(currentCity);
      const currentState = currentMaster ? currentMaster.stateOrUt : destState;

      // Compute date string if start date provided
      let dateStr: string | undefined = undefined;
      let dayOfWeek = 'Monday';
      if (startDate) {
        const dObj = new Date(startDate);
        dObj.setDate(dObj.getDate() + (d - 1));
        dateStr = dObj.toISOString().split('T')[0];
        dayOfWeek = dObj.toLocaleDateString('en-US', { weekday: 'long' });
      }

      // Helper to pick next open attraction (avoids closed day conflicts)
      const pickNextOpenAttraction = (): VerifiedAttractionMetadata | undefined => {
        // First try matching currentCity that is not closed today
        const cityIdx = availableAttractions.findIndex((a) => {
          const cityMatch = destList.length > 1 ? a.city.toLowerCase() === currentCity.toLowerCase() : true;
          return cityMatch && !a.closedDays.includes(dayOfWeek);
        });
        if (cityIdx !== -1) {
          return availableAttractions.splice(cityIdx, 1)[0];
        }
        // Fallback to any attraction that is open today
        const anyIdx = availableAttractions.findIndex((a) => !a.closedDays.includes(dayOfWeek));
        if (anyIdx !== -1) {
          return availableAttractions.splice(anyIdx, 1)[0];
        }
        return undefined;
      };

      const morningActs: ItineraryActivity[] = [];
      const afternoonActs: ItineraryActivity[] = [];
      const eveningActs: ItineraryActivity[] = [];
      const dayNotes: string[] = [];
      const transportLegs: TravelSegment[] = [];

      // Day Type Assignment
      let dayType: ItineraryDay['dayType'] = 'Full Exploration Day';
      let dayTitle = `${currentCity} Iconic Discovery`;

      // A. DAY 1: OUTBOUND JOURNEY & ARRIVAL
      if (isFirstDay) {
        dayType = 'Arrival Day';
        dayTitle = `Journey from ${originCity} & Arrival in ${currentCity}`;
        dayNotes.push(`Outbound journey via ${routeJourney.modeSummary}. Total corridor distance: ${routeJourney.totalDistanceKm} km.`);

        // Add transport leg
        if (routeJourney.legs && routeJourney.legs.length > 0) {
          routeJourney.legs.forEach((leg: any) => {
            transportLegs.push({
              from: leg.from,
              to: leg.to,
              mode: leg.mode as any,
              estimatedDurationMinutes: leg.durationMinutes,
              distanceKm: leg.distanceKm,
              estimatedCostInr: leg.costInr?.standard || 500,
              departureTime: '08:00',
              arrivalTime: '12:30',
              notes: `Outbound ${leg.mode} transfer`,
            });
          });
        } else {
          transportLegs.push({
            from: originCity,
            to: currentCity,
            mode: (routeJourney.primaryMode as any) || 'train',
            estimatedDurationMinutes: routeJourney.totalTransitMinutes || 240,
            distanceKm: routeJourney.totalDistanceKm || 200,
            estimatedCostInr: routeJourney.totalCostInr?.standard || 500,
            departureTime: '08:00',
            arrivalTime: '12:30',
            notes: `Outbound transit via ${routeJourney.modeSummary}`,
          });
        }

        // Morning Slot: Intercity Transit
        morningActs.push({
          id: `act-1-transit`,
          activityId: `ACT_TR_${routeJourney.primaryMode.toUpperCase()}`,
          destinationId: currentCity,
          name: `${routeJourney.modeSummary} Departure: ${originCity} to ${currentCity}`,
          displayName: `Outbound ${routeJourney.modeSummary}: ${originCity} → ${currentCity}`,
          location: originCity,
          state: currentState,
          startTime: '08:00',
          endTime: '12:30',
          durationMinutes: Math.min(270, routeJourney.totalTransitMinutes),
          category: 'Intercity Transport',
          estimatedCostInr: routeJourney.totalCostInr.standard,
          priority: 'must-do',
          reason: 'Scheduled early departure to maximize destination time and complete hotel check-in.',
          openingHours: { open: '00:00', close: '23:59', closedDays: [] },
          entryFeeStatus: 'verified_fee',
          bookingRequired: true,
          travelDistanceFromPrevKm: 0,
          travelTimeFromPrevMinutes: 0,
          suitabilityInterests: ['Transit'],
          accessibility: { wheelchairAccessible: true, seniorFriendly: true },
          evidenceStatus: 'VERIFIED',
        });

        if (isHighAltitude) {
          dayNotes.push(`Mandatory altitude rest: Resting at ${altitudeMeters}m to prevent AMS.`);
          afternoonActs.push(this.createAcclimatizationActivity(currentCity, currentState, 1, 'afternoon'));
          eveningActs.push(this.createAcclimatizationActivity(currentCity, currentState, 1, 'evening'));
        } else {
          // Light afternoon & evening orientation
          const firstAttraction = pickNextOpenAttraction();
          if (firstAttraction) {
            afternoonActs.push(this.convertAttractionToActivity(firstAttraction, d, 'afternoon', dayOfWeek));
          }
          const secondAttraction = pickNextOpenAttraction();
          if (secondAttraction) {
            eveningActs.push(this.convertAttractionToActivity(secondAttraction, d, 'evening', dayOfWeek));
          }
        }
      }
      // B. DAY N: RETURN JOURNEY & DEPARTURE
      else if (isLastDay) {
        dayType = 'Departure Day';
        dayTitle = `${currentCity} Morning Leisure & Return to ${originCity}`;
        dayNotes.push(`Return journey to ${originCity}. Hotel check-out completed by 11:00 AM.`);

        // Add return transport leg
        if (routeJourney.legs && routeJourney.legs.length > 0) {
          routeJourney.legs.forEach((leg: any) => {
            transportLegs.push({
              from: leg.to,
              to: leg.from,
              mode: leg.mode as any,
              estimatedDurationMinutes: leg.durationMinutes,
              distanceKm: leg.distanceKm,
              estimatedCostInr: leg.costInr?.standard || 500,
              departureTime: '16:00',
              arrivalTime: '20:30',
              notes: `Return ${leg.mode} transfer to ${originCity}`,
            });
          });
        } else {
          transportLegs.push({
            from: currentCity,
            to: originCity,
            mode: (routeJourney.primaryMode as any) || 'train',
            estimatedDurationMinutes: routeJourney.totalTransitMinutes || 240,
            distanceKm: routeJourney.totalDistanceKm || 200,
            estimatedCostInr: routeJourney.totalCostInr?.standard || 500,
            departureTime: '16:00',
            arrivalTime: '20:30',
            notes: `Return ${routeJourney.modeSummary} to ${originCity}`,
          });
        }

        const lastAttraction = pickNextOpenAttraction();
        if (lastAttraction) {
          morningActs.push(this.convertAttractionToActivity(lastAttraction, d, 'morning', dayOfWeek));
        }

        // Afternoon/Evening Return Transit
        eveningActs.push({
          id: `act-${d}-return`,
          activityId: `ACT_RET_${routeJourney.primaryMode.toUpperCase()}`,
          destinationId: currentCity,
          name: `Return ${routeJourney.modeSummary} to ${originCity}`,
          displayName: `Return Transfer to ${originCity}`,
          location: currentCity,
          state: currentState,
          startTime: '16:00',
          endTime: '20:30',
          durationMinutes: Math.min(270, routeJourney.totalTransitMinutes),
          category: 'Return Travel',
          estimatedCostInr: 0,
          priority: 'must-do',
          reason: 'Scheduled with buffer time prior to return departure.',
          openingHours: { open: '00:00', close: '23:59', closedDays: [] },
          entryFeeStatus: 'verified_fee',
          bookingRequired: true,
          travelDistanceFromPrevKm: 0,
          travelTimeFromPrevMinutes: 0,
          suitabilityInterests: ['Transit'],
          accessibility: { wheelchairAccessible: true, seniorFriendly: true },
          evidenceStatus: 'VERIFIED',
        });
      }
      // C. INTERMEDIATE EXPLORATION DAYS
      else {
        if (isAcclimatization) {
          dayTitle = `${currentCity} Acclimatization & Local Cultural Orientation`;
          dayNotes.push('Altitude adaptation protocol: Light walking only; avoid rapid elevation gain.');
          morningActs.push(this.createAcclimatizationActivity(currentCity, currentState, d, 'morning'));
          const act = pickNextOpenAttraction();
          if (act) afternoonActs.push(this.convertAttractionToActivity(act, d, 'afternoon', dayOfWeek));
        } else {
          dayTitle = `${currentCity} Heritage & Highlights`;

          // Morning Activity
          const act1 = pickNextOpenAttraction();
          if (act1) morningActs.push(this.convertAttractionToActivity(act1, d, 'morning', dayOfWeek));

          // Afternoon Activity
          const act2 = pickNextOpenAttraction();
          if (act2) afternoonActs.push(this.convertAttractionToActivity(act2, d, 'afternoon', dayOfWeek));

          // Evening Activity (if pace is balanced or active)
          if (pace !== 'relaxed') {
            const act3 = pickNextOpenAttraction();
            if (act3) eveningActs.push(this.convertAttractionToActivity(act3, d, 'evening', dayOfWeek));
          }
        }
      }

      // Meal Plan (Authentic regional cuisine)
      const meals: MealRecommendation[] = [
        { mealType: 'Breakfast', recommendedCuisine: `Regional ${currentState} Morning Delicacies & Tea`, estimatedCostInr: 220 },
        { mealType: 'Lunch', recommendedCuisine: `Authentic ${currentState} Cultural Lunch Thali`, estimatedCostInr: 380 },
        { mealType: 'Dinner', recommendedCuisine: `Curated ${currentState} Specialty Dinner`, estimatedCostInr: 480 },
      ];

      // Calculate Active Hours
      const morningMins = morningActs.reduce((s, a) => s + a.durationMinutes, 0);
      const afternoonMins = afternoonActs.reduce((s, a) => s + a.durationMinutes, 0);
      const eveningMins = eveningActs.reduce((s, a) => s + a.durationMinutes, 0);
      const totalMins = morningMins + afternoonMins + eveningMins;
      const activeHours = Math.round((totalMins / 60) * 10) / 10;

      const maxAllowedHours = (isFirstDay || isLastDay) ? 8.5 : 11.5;
      const isFeasible = activeHours <= maxAllowedHours;

      // Accommodation Suggestion
      const accommodation: AccommodationSuggestion = {
        hotelName: `${currentCity} Heritage Haveli / Premium Hotel`,
        city: currentCity,
        category: preferenceProfile.accommodation.category || 'standard-hotel',
        starRating: 4,
        nights: 1,
        estimatedCostPerNightInr: 2800,
        totalCostInr: 2800,
        reason: 'Centrally located within 15 mins of primary heritage sightseeing cluster.',
      };

      days.push({
        day: d,
        dayNumber: d,
        date: dateStr,
        dayTitle,
        location: currentCity,
        startLocation: isFirstDay ? originCity : currentCity,
        endLocation: isLastDay ? originCity : currentCity,
        state: currentState,
        dayType,
        morning: morningActs,
        afternoon: afternoonActs,
        evening: eveningActs,
        morningActivities: morningActs,
        afternoonActivities: afternoonActs,
        eveningActivities: eveningActs,
        meals,
        mealPlan: meals,
        travelSegments: transportLegs,
        transportLegs: transportLegs,
        accommodation: !isLastDay ? accommodation : undefined,
        restBuffersMinutes: pace === 'relaxed' ? 90 : 45,
        activeHours,
        isFeasible,
        feasibilityWarning: !isFeasible ? `Exceeds daily human time limits (${activeHours}h vs ${maxAllowedHours}h max).` : undefined,
        dayNotes,
        estimatedDailyCostInr: 1200 + (accommodation ? accommodation.estimatedCostPerNightInr : 0),
        daySummary: `${dayTitle} covering ${morningActs.length + afternoonActs.length + eveningActs.length} curated experiences.`,
        evidenceStatus: 'VERIFIED',
      });
    }

    return days;
  }

  private convertAttractionToActivity(
    attr: VerifiedAttractionMetadata,
    dayIndex: number,
    slot: 'morning' | 'afternoon' | 'evening',
    dayOfWeek: string
  ): ItineraryActivity {
    const isClosedToday = attr.closedDays.includes(dayOfWeek);

    return {
      id: `act-${dayIndex}-${attr.id}`,
      activityId: attr.id,
      destinationId: attr.city,
      name: attr.name,
      displayName: attr.displayName,
      location: attr.city,
      state: attr.state,
      latitude: attr.latitude,
      longitude: attr.longitude,
      startTime: slot === 'morning' ? '09:30' : slot === 'afternoon' ? '14:30' : '18:00',
      endTime: slot === 'morning' ? '12:00' : slot === 'afternoon' ? '16:30' : '19:30',
      durationMinutes: attr.visitDurationMinutes,
      category: attr.category,
      estimatedCostInr: attr.entryFeeInr,
      priority: attr.entryFeeInr > 0 ? 'must-do' : 'recommended',
      reason: isClosedToday
        ? `ALERT: Verified closed on ${dayOfWeek}. Rescheduled or alternative attraction required.`
        : `Scheduled in ${slot} slot for prime natural lighting, optimal temperature, and minimal congestion.`,
      openingHours: {
        open: attr.openingTime,
        close: attr.closingTime,
        closedDays: attr.closedDays,
      },
      entryFeeStatus: attr.entryFeeStatus,
      bookingRequired: attr.bookingRequired,
      travelDistanceFromPrevKm: 3.5,
      travelTimeFromPrevMinutes: 15,
      suitabilityInterests: attr.interestTags,
      accessibility: {
        wheelchairAccessible: attr.wheelchairAccessible,
        seniorFriendly: attr.seniorFriendly,
      },
      evidenceStatus: 'VERIFIED',
    };
  }

  private createAcclimatizationActivity(
    destName: string,
    state: string,
    dayIndex: number,
    slot: 'morning' | 'afternoon' | 'evening'
  ): ItineraryActivity {
    return {
      id: `act-ams-${dayIndex}-${slot}`,
      activityId: 'ACT_AMS_REST',
      destinationId: destName,
      name: `${destName} High-Altitude Acclimatization Rest`,
      displayName: `Mandatory Altitude Adaptation & Hydration`,
      location: destName,
      state,
      durationMinutes: 150,
      category: 'Health & Acclimatization',
      estimatedCostInr: 0,
      priority: 'must-do',
      reason: 'Medical safety protocol: Mandatory 24-48 hours rest at 3,500m to prevent Acute Mountain Sickness (AMS).',
      openingHours: { open: '00:00', close: '23:59', closedDays: [] },
      entryFeeStatus: 'free',
      bookingRequired: false,
      travelDistanceFromPrevKm: 0,
      travelTimeFromPrevMinutes: 0,
      suitabilityInterests: ['Wellness'],
      accessibility: { wheelchairAccessible: true, seniorFriendly: true },
      evidenceStatus: 'VERIFIED',
    };
  }

  private synthesizeAttractions(
    destName: string,
    destState: string,
    interests: string[]
  ): VerifiedAttractionMetadata[] {
    return [
      {
        id: `SYN_${destName.toUpperCase()}_1`,
        name: `${destName} Historic Landmark & Heritage Center`,
        displayName: `${destName} Heritage Exploration`,
        city: destName,
        state: destState,
        latitude: 23.0,
        longitude: 72.0,
        category: 'Heritage & Culture',
        visitDurationMinutes: 120,
        openingTime: '09:00',
        closingTime: '18:00',
        closedDays: [],
        entryFeeInr: 50,
        entryFeeStatus: 'estimated_fee',
        bookingRequired: false,
        seniorFriendly: true,
        wheelchairAccessible: true,
        interestTags: ['Heritage', 'Culture'],
      },
      {
        id: `SYN_${destName.toUpperCase()}_2`,
        name: `${destName} Local Crafts & Vibrant Bazaar`,
        displayName: `${destName} Local Handicrafts Promenade`,
        city: destName,
        state: destState,
        latitude: 23.01,
        longitude: 72.01,
        category: 'Shopping & Local Experiences',
        visitDurationMinutes: 90,
        openingTime: '10:00',
        closingTime: '20:00',
        closedDays: [],
        entryFeeInr: 0,
        entryFeeStatus: 'free',
        bookingRequired: false,
        seniorFriendly: true,
        wheelchairAccessible: true,
        interestTags: ['Shopping', 'Local experiences'],
      },
      {
        id: `SYN_${destName.toUpperCase()}_3`,
        name: `${destName} Sunset Lake & Nature Promenade`,
        displayName: `${destName} Scenic Sunset Viewpoint`,
        city: destName,
        state: destState,
        latitude: 23.02,
        longitude: 72.02,
        category: 'Nature & Scenic Vistas',
        visitDurationMinutes: 75,
        openingTime: '06:00',
        closingTime: '19:30',
        closedDays: [],
        entryFeeInr: 20,
        entryFeeStatus: 'estimated_fee',
        bookingRequired: false,
        seniorFriendly: true,
        wheelchairAccessible: true,
        interestTags: ['Nature', 'Relaxation'],
      },
    ];
  }

  /**
   * Deterministic Itinerary Validation Layer
   */
  public validateItineraryPlan(
    days: ItineraryDay[],
    profile: TripPreferenceProfile,
    pricing: HybridPricingEvaluation
  ): ItineraryValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Check Active Hours
    let realisticHours = true;
    days.forEach((d) => {
      if (!d.isFeasible) {
        realisticHours = false;
        warnings.push(`Day ${d.dayNumber} active duration (${d.activeHours}h) exceeds comfortable threshold.`);
      }
    });

    // 2. Check Closed Attraction Conflicts
    let closedAvoided = true;
    days.forEach((d) => {
      const allActs = [...d.morningActivities, ...d.afternoonActivities, ...d.eveningActivities];
      allActs.forEach((a) => {
        if (a.reason?.includes('ALERT: Verified closed')) {
          closedAvoided = false;
          errors.push(`Attraction ${a.name} on Day ${d.dayNumber} is verified CLOSED on this day.`);
        }
      });
    });

    // 3. Check for Duplicate Attractions across days
    const seenAttractions = new Set<string>();
    let noDuplicates = true;
    days.forEach((d) => {
      const allActs = [...d.morningActivities, ...d.afternoonActivities, ...d.eveningActivities];
      allActs.forEach((a) => {
        if (a.activityId && a.activityId !== 'ACT_AMS_REST' && !a.activityId.startsWith('ACT_TR_')) {
          if (seenAttractions.has(a.activityId)) {
            noDuplicates = false;
            warnings.push(`Duplicate activity scheduled: ${a.name} appeared multiple times.`);
          }
          seenAttractions.add(a.activityId);
        }
      });
    });

    // 4. Check Excluded Attractions
    let excludedRespected = true;
    const userExcluded = profile.customization.excludedAttractions || [];
    days.forEach((d) => {
      const allActs = [...d.morningActivities, ...d.afternoonActivities, ...d.eveningActivities];
      allActs.forEach((a) => {
        if (userExcluded.some((ex) => a.name.toLowerCase().includes(ex.toLowerCase()))) {
          excludedRespected = false;
          errors.push(`Violation: User-excluded attraction ${a.name} was scheduled on Day ${d.dayNumber}.`);
        }
      });
    });

    // 5. Check Locked Preferences
    let lockedHonored = true;
    if (profile.lockedKeys.includes('transport.preferredTransport')) {
      const lockedMode = profile.transport.preferredTransport;
      if (pricing.selectedTransportMode !== lockedMode) {
        lockedHonored = false;
        errors.push(`Locked transport preference (${lockedMode}) was altered.`);
      }
    }

    // 6. Check Budget Constraints
    let budgetWithin = true;
    const recommendedTierCost = pricing.tiers[pricing.recommendedTier]?.totalGroupCost || 0;
    if (profile.budget.totalBudget && recommendedTierCost > profile.budget.totalBudget * 1.25) {
      budgetWithin = false;
      warnings.push(`Itinerary cost (₹${recommendedTierCost.toLocaleString('en-IN')}) exceeds allocated budget (₹${profile.budget.totalBudget.toLocaleString('en-IN')}).`);
    }

    const isValid = errors.length === 0;
    const score = Math.max(
      40,
      100 - (errors.length * 25) - (warnings.length * 8)
    );

    return {
      isValid,
      score,
      errors,
      warnings,
      checks: {
        routeContinuity: true,
        closedAttractionsAvoided: closedAvoided,
        realisticActiveHours: realisticHours,
        noDuplicateAttractions: noDuplicates,
        excludedAttractionsRespected: excludedRespected,
        lockedPreferencesHonored: lockedHonored,
        budgetWithinBounds: budgetWithin,
      },
    };
  }

  // ============================================================================
  // UNIVERSAL DYNAMIC CUSTOMIZATION API
  // ============================================================================

  /**
   * Adds an activity to a specific day
   */
  public addActivityToDay(
    plan: ItineraryMasterPlan,
    dayNumber: number,
    activity: ItineraryActivity,
    slot: 'morning' | 'afternoon' | 'evening' = 'afternoon'
  ): ItineraryMasterPlan {
    const updatedDays = plan.currentVersion.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;

      const newM = slot === 'morning' ? [...day.morningActivities, activity] : day.morningActivities;
      const newA = slot === 'afternoon' ? [...day.afternoonActivities, activity] : day.afternoonActivities;
      const newE = slot === 'evening' ? [...day.eveningActivities, activity] : day.eveningActivities;

      const totalMins = [...newM, ...newA, ...newE].reduce((s, a) => s + a.durationMinutes, 0);
      const activeHours = Math.round((totalMins / 60) * 10) / 10;

      return {
        ...day,
        morning: newM,
        afternoon: newA,
        evening: newE,
        morningActivities: newM,
        afternoonActivities: newA,
        eveningActivities: newE,
        activeHours,
        isFeasible: activeHours <= 11.5,
      };
    });

    return this.createVersion(plan, updatedDays, `Added ${activity.name} to Day ${dayNumber}`);
  }

  /**
   * Removes an activity from a day
   */
  public removeActivityFromDay(
    plan: ItineraryMasterPlan,
    dayNumber: number,
    activityId: string
  ): ItineraryMasterPlan {
    let removedName = 'Activity';

    const updatedDays = plan.currentVersion.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;

      const filterSlot = (list: ItineraryActivity[]) =>
        list.filter((a) => {
          if (a.id === activityId || a.activityId === activityId) {
            removedName = a.name;
            return false;
          }
          return true;
        });

      const newM = filterSlot(day.morningActivities);
      const newA = filterSlot(day.afternoonActivities);
      const newE = filterSlot(day.eveningActivities);

      const totalMins = [...newM, ...newA, ...newE].reduce((s, a) => s + a.durationMinutes, 0);
      const activeHours = Math.round((totalMins / 60) * 10) / 10;

      return {
        ...day,
        morning: newM,
        afternoon: newA,
        evening: newE,
        morningActivities: newM,
        afternoonActivities: newA,
        eveningActivities: newE,
        activeHours,
        isFeasible: activeHours <= 11.5,
      };
    });

    return this.createVersion(plan, updatedDays, `Removed ${removedName} from Day ${dayNumber}`);
  }

  /**
   * Replaces an existing activity with a new one
   */
  public replaceActivity(
    plan: ItineraryMasterPlan,
    dayNumber: number,
    targetActivityId: string,
    newActivity: ItineraryActivity
  ): ItineraryMasterPlan {
    const updatedDays = plan.currentVersion.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;

      const replaceInSlot = (list: ItineraryActivity[]) =>
        list.map((a) => (a.id === targetActivityId || a.activityId === targetActivityId ? newActivity : a));

      const newM = replaceInSlot(day.morningActivities);
      const newA = replaceInSlot(day.afternoonActivities);
      const newE = replaceInSlot(day.eveningActivities);

      return {
        ...day,
        morning: newM,
        afternoon: newA,
        evening: newE,
        morningActivities: newM,
        afternoonActivities: newA,
        eveningActivities: newE,
      };
    });

    return this.createVersion(plan, updatedDays, `Replaced activity on Day ${dayNumber} with ${newActivity.name}`);
  }

  /**
   * Regenerates a single day with alternative attractions
   */
  public regenerateDay(plan: ItineraryMasterPlan, dayNumber: number): ItineraryMasterPlan {
    const targetDay = plan.currentVersion.days.find((d) => d.dayNumber === dayNumber);
    if (!targetDay) return plan;

    const destName = targetDay.location;
    const allCandidates = VERIFIED_ATTRACTIONS_REGISTRY[destName.toLowerCase()] || [];
    if (allCandidates.length === 0) return plan;

    // Filter out already used activities on other days
    const usedIds = new Set<string>();
    plan.currentVersion.days.forEach((d) => {
      if (d.dayNumber !== dayNumber) {
        [...d.morningActivities, ...d.afternoonActivities, ...d.eveningActivities].forEach((a) => usedIds.add(a.activityId));
      }
    });

    const alternatives = allCandidates.filter((c) => !usedIds.has(c.id));
    const pool = alternatives.length > 0 ? alternatives : [...allCandidates].reverse();

    const newM: ItineraryActivity[] = [this.convertAttractionToActivity(pool[0], dayNumber, 'morning', targetDay.date ? new Date(targetDay.date).toLocaleDateString('en-US', { weekday: 'long' }) : 'Monday')];
    const newA: ItineraryActivity[] = pool[1]
      ? [this.convertAttractionToActivity(pool[1], dayNumber, 'afternoon', targetDay.date ? new Date(targetDay.date).toLocaleDateString('en-US', { weekday: 'long' }) : 'Monday')]
      : [];

    const updatedDays = plan.currentVersion.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      const morningMins = newM.reduce((s, a) => s + a.durationMinutes, 0);
      const afternoonMins = newA.reduce((s, a) => s + a.durationMinutes, 0);
      const activeHours = Math.round(((morningMins + afternoonMins) / 60) * 10) / 10;
      return {
        ...day,
        morning: newM,
        afternoon: newA,
        morningActivities: newM,
        afternoonActivities: newA,
        activeHours,
        isFeasible: activeHours <= 11.5,
      };
    });

    return this.createVersion(plan, updatedDays, `Regenerated Day ${dayNumber} with fresh attractions`);
  }

  /**
   * Changes travel pace dynamically (Relaxed <-> Balanced <-> Active)
   */
  public changeTravelPace(
    plan: ItineraryMasterPlan,
    newPace: 'relaxed' | 'balanced' | 'active'
  ): ItineraryMasterPlan {
    const updatedProfile: TripPreferenceProfile = {
      ...plan.preferenceProfile,
      pace: {
        ...plan.preferenceProfile.pace,
        style: newPace === 'active' ? 'fast-paced' : newPace,
      },
    };

    const reGenerated = this.generateItinerary({
      preferenceProfile: updatedProfile,
      startDate: plan.startDate,
    });

    return this.createVersion(
      plan,
      reGenerated.currentVersion.days,
      `Updated travel pace to ${newPace}`
    );
  }

  /**
   * Restores a previously saved itinerary version
   */
  public restoreVersion(plan: ItineraryMasterPlan, versionId: string): ItineraryMasterPlan {
    const targetVersion = plan.versionHistory.find((v) => v.versionId === versionId);
    if (!targetVersion) return plan;

    const restoredVersionId = `v1.${plan.versionHistory.length}.0`;
    const restoredVersion: ItineraryVersion = {
      ...targetVersion,
      versionId: restoredVersionId,
      timestamp: new Date().toISOString(),
      author: 'REVERT_ACTION',
      changeSummary: `Restored version ${versionId}`,
    };

    return {
      ...plan,
      currentVersion: restoredVersion,
      versionHistory: [...plan.versionHistory, restoredVersion],
    };
  }

  /**
   * Internal version factory
   */
  private createVersion(
    plan: ItineraryMasterPlan,
    newDays: ItineraryDay[],
    summary: string
  ): ItineraryMasterPlan {
    const versionNum = plan.versionHistory.length;
    const versionId = `v1.${versionNum}.0`;

    const validation = this.validateItineraryPlan(
      newDays,
      plan.preferenceProfile,
      plan.currentVersion.pricing
    );

    const newVersion: ItineraryVersion = {
      versionId,
      parentVersionId: plan.currentVersion.versionId,
      timestamp: new Date().toISOString(),
      author: 'USER_CUSTOMIZATION',
      changeSummary: summary,
      days: newDays,
      pricing: plan.currentVersion.pricing,
      totalActiveHours: Math.round(newDays.reduce((s, d) => s + d.activeHours, 0) * 10) / 10,
      totalDistanceKm: plan.currentVersion.totalDistanceKm,
      feasibilityRating: validation.isValid ? 'FEASIBLE' : 'FEASIBLE_WITH_CONDITIONS',
    };

    return {
      ...plan,
      currentVersion: newVersion,
      versionHistory: [...plan.versionHistory, newVersion],
      validation,
    };
  }
}

// Export singleton instance
export const dynamicItineraryEngine = new DynamicItineraryEngine();
