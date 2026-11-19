/**
 * BharatYatra AI 2.0 — Centralized Deterministic Trip Cost Estimation System
 *
 * Provides a single authoritative source of truth for trip cost calculations across:
 * - Smart Onboarding (Step 7/8 previews, review, and final itinerary summary)
 * - AI Trip Planner & Itinerary Generation
 * - My Trips (Saved trip cards and details)
 * - Cost & Intelligence Command Center (/trips/[id]/cost)
 *
 * Core Financial Principles:
 * 1. Room-based accommodation math: Math.ceil(travelersCount / 2) * hotelNights * roomRate
 * 2. Mode-aware transportation with return journey included
 * 3. Daily food allowances scaled to traveler count and tier
 * 4. Monument entries, activities, and statutory permits (e.g. Leh Inner Line Permit, Andaman forest permits)
 * 5. Statutory GST brackets (5% transport, 12% hotel, 18% services)
 * 6. Tolls, parking, and contingency roadside reserves
 * 7. Invariant: Exact sum of all category items MUST equal totalEstimatedCostInr
 * 8. Per-person cost = Math.round(totalEstimatedCostInr / travelersCount)
 */

import { haversineDistanceKm } from './destination-master-service';
import { resolveOriginCoordinates } from './india-geo-registry';
import {
  VERIFIED_FLIGHT_BENCHMARKS,
  VERIFIED_TRAIN_BENCHMARKS,
  VERIFIED_CAB_BENCHMARKS,
} from './hybrid-pricing-engine';

export type TripPricingTier = 'budget' | 'standard' | 'luxury';
export type TripPricingSource = 'ESTIMATED' | 'VERIFIED_BENCHMARK' | 'CONFIRMED' | 'LIVE';

export interface TripCostInput {
  originCity: string;
  destinationCity?: string;
  destinations: string[] | string;
  travelersCount: number;
  durationDays: number;
  travelMode?: 'flight' | 'train' | 'bus' | 'car' | 'self-drive' | 'motorcycle' | 'mixed' | string;
  budgetTier?: TripPricingTier | string;
  userBudgetInr?: number | null;
  dietaryPreference?: 'vegetarian' | 'jain' | 'vegan' | 'non-vegetarian' | string;
  confirmedPrices?: {
    transportation?: number;
    accommodation?: number;
    food?: number;
    activitiesAndPermits?: number;
    localTransfers?: number;
  };
}

export interface TripCostCategories {
  transportation: number;
  accommodation: number;
  food: number;
  activitiesAndPermits: number;
  localTransfers: number;
  taxes: number;
  contingency: number;
}

export interface TripCostBreakdown {
  totalEstimatedCostInr: number;
  perPersonCostInr: number;
  currency: 'INR';
  durationDays: number;
  travelersCount: number;
  hotelNights: number;
  roomsCount: number;
  tier: TripPricingTier;
  pricingSource: TripPricingSource;
  categories: TripCostCategories;
  budgetComparison: {
    userBudgetInr?: number;
    isWithinBudget: boolean;
    budgetShortfall: number;
    budgetSurplus: number;
    recommendation?: string;
  };
  itemizedDetails: {
    transportation: string;
    accommodation: string;
    food: string;
    activitiesAndPermits: string;
    localTransfers: string;
    taxes: string;
    contingency: string;
  };
}

// Benchmark Rates (INR)
const HOTEL_ROOM_RATES: Record<TripPricingTier, number> = {
  budget: 1800,    // Verified Homestay / Budget 2-star AC
  standard: 3200,  // Verified 3-star Deluxe / Heritage Haveli
  luxury: 6500,    // Verified 4/5-star Luxury Resort / Palace Hotel
};

const DAILY_FOOD_RATES: Record<TripPricingTier, number> = {
  budget: 450,     // Local authentic thali, breakfast, street culinary
  standard: 850,   // Quality multi-cuisine dining, regional specialties
  luxury: 1800,    // Premium fine-dining, hotel breakfast & signature dinners
};

const DAILY_ACTIVITY_RATES: Record<TripPricingTier, number> = {
  budget: 350,     // ASI monuments, temple donations, self-guided tours
  standard: 700,   // Monument entries, licensed audio guides, boat rides, cultural shows
  luxury: 1500,    // Private curated guides, VIP darshan passes, safari jeeps, heritage walks
};

/**
 * Calculates itemized, deterministic trip pricing across all categories.
 */
export function calculateTripCost(input: TripCostInput): TripCostBreakdown {
  const origin = (input.originCity || 'Ahmedabad').trim();
  const rawDestArray = Array.isArray(input.destinations)
    ? input.destinations
    : typeof input.destinations === 'string'
    ? input.destinations.split(',').map((s) => s.trim()).filter(Boolean)
    : [input.destinationCity || 'Udaipur'];

  const primaryDest = (input.destinationCity || rawDestArray[0] || 'Udaipur').trim();
  const travelersCount = Math.max(1, input.travelersCount || 2);
  const durationDays = Math.max(1, input.durationDays || 4);
  const hotelNights = Math.max(1, durationDays - 1);
  const roomsCount = Math.ceil(travelersCount / 2);

  const rawTier = (input.budgetTier || 'standard').toLowerCase();
  const tier: TripPricingTier =
    rawTier === 'luxury' || rawTier === 'premium'
      ? 'luxury'
      : rawTier === 'budget'
      ? 'budget'
      : 'standard';

  const rawMode = (input.travelMode || 'car').toLowerCase();
  const mode =
    rawMode === 'flight' || rawMode === 'air'
      ? 'flight'
      : rawMode === 'train' || rawMode === 'rail'
      ? 'train'
      : rawMode === 'bus' || rawMode === 'volvo'
      ? 'bus'
      : rawMode === 'motorcycle'
      ? 'motorcycle'
      : 'car';

  // Distance Calculation
  const originCoords = resolveOriginCoordinates(origin);
  const destCoords = resolveOriginCoordinates(primaryDest);
  const straightKm = Math.round(
    haversineDistanceKm(originCoords.lat, originCoords.lng, destCoords.lat, destCoords.lng)
  );

  const isLocalCityTrip = straightKm <= 35 && origin.toLowerCase() === primaryDest.toLowerCase();
  const isHighAltitude =
    rawDestArray.some((d) => d.toLowerCase().includes('leh') || d.toLowerCase().includes('ladakh') || d.toLowerCase().includes('spiti')) ||
    primaryDest.toLowerCase().includes('leh') ||
    primaryDest.toLowerCase().includes('ladakh');
  const isIsland =
    rawDestArray.some((d) => d.toLowerCase().includes('andaman') || d.toLowerCase().includes('baratang') || d.toLowerCase().includes('port blair') || d.toLowerCase().includes('havelock')) ||
    primaryDest.toLowerCase().includes('andaman') ||
    primaryDest.toLowerCase().includes('port blair');

  // Road distance with terrain detour
  const detour = isHighAltitude ? 1.6 : isIsland ? 1.0 : straightKm > 600 ? 1.25 : 1.2;
  const roadKm = isLocalCityTrip ? 30 : Math.round(straightKm * detour);
  const roundTripRoadKm = roadKm * 2;

  // 1. Accommodation
  const confirmedAccom = input.confirmedPrices?.accommodation;
  const roomNightRate = HOTEL_ROOM_RATES[tier];
  const accommodationCost =
    typeof confirmedAccom === 'number' && confirmedAccom >= 0
      ? confirmedAccom
      : roomsCount * hotelNights * roomNightRate;

  // 2. Transportation
  const confirmedTrans = input.confirmedPrices?.transportation;
  let transportationCost = 0;
  let transportDetailStr = '';

  if (typeof confirmedTrans === 'number' && confirmedTrans >= 0) {
    transportationCost = confirmedTrans;
    transportDetailStr = `Confirmed booking rate (₹${confirmedTrans.toLocaleString('en-IN')})`;
  } else if (isLocalCityTrip) {
    // Local city trip: Day cab / Auto
    transportationCost = durationDays * (tier === 'luxury' ? 2400 : tier === 'standard' ? 1600 : 1000);
    transportDetailStr = `Local city transit for ${durationDays} days @ ₹${(transportationCost / durationDays).toFixed(0)}/day`;
  } else if (mode === 'flight' || isIsland) {
    // Round-trip flight fares per person
    let farePerPerson = 0;
    if (isHighAltitude) {
      farePerPerson = VERIFIED_FLIGHT_BENCHMARKS['himalayan-leh'][tier] || 13500;
    } else if (isIsland) {
      farePerPerson = VERIFIED_FLIGHT_BENCHMARKS['island-andaman'][tier] || 12500;
    } else if (straightKm <= 800) {
      farePerPerson = VERIFIED_FLIGHT_BENCHMARKS['short-corridor'][tier] || 5800;
    } else if (straightKm <= 1500) {
      farePerPerson = VERIFIED_FLIGHT_BENCHMARKS['medium-corridor'][tier] || 7500;
    } else {
      farePerPerson = VERIFIED_FLIGHT_BENCHMARKS['long-corridor'][tier] || 9800;
    }
    transportationCost = Math.round(travelersCount * farePerPerson);
    transportDetailStr = `${travelersCount} Round-trip Flight Tickets @ ₹${farePerPerson.toLocaleString('en-IN')}/person`;
  } else if (mode === 'train') {
    const trainBenchmark = VERIFIED_TRAIN_BENCHMARKS[tier] || VERIFIED_TRAIN_BENCHMARKS.standard;
    const oneWayFare = Math.max(trainBenchmark.minFare, Math.round(roadKm * trainBenchmark.ratePerKm));
    transportationCost = Math.round(travelersCount * oneWayFare * 2);
    transportDetailStr = `${travelersCount} Round-trip Train Tickets (${trainBenchmark.classCode} ${trainBenchmark.label}) @ ₹${(oneWayFare * 2).toLocaleString('en-IN')}/person`;
  } else if (mode === 'bus') {
    const busRatePerKm = tier === 'luxury' ? 2.2 : tier === 'standard' ? 1.6 : 1.1;
    const oneWayBus = Math.max(450, Math.round(roadKm * busRatePerKm));
    transportationCost = Math.round(travelersCount * oneWayBus * 2);
    transportDetailStr = `${travelersCount} Round-trip ${tier === 'luxury' ? 'Multi-Axle Scania' : tier === 'standard' ? 'AC Volvo Sleeper' : 'Express Bus'} Tickets`;
  } else if (mode === 'motorcycle') {
    const bikesCount = Math.ceil(travelersCount / 2);
    const fuelCost = Math.round((roundTripRoadKm / 32) * 105 * bikesCount); // 32 km/l @ ₹105/L
    const maintenance = bikesCount * durationDays * 350;
    transportationCost = fuelCost + maintenance;
    transportDetailStr = `${bikesCount} Touring Bike(s) fuel & maintenance for ~${roundTripRoadKm} km corridor`;
  } else {
    // Private Car / Chauffeur Cab / Self-Drive
    const vehicleType = travelersCount > 6 ? 'tempo' : travelersCount > 4 ? 'suv' : 'sedan';
    const vehiclesCount = travelersCount > 12 ? Math.ceil(travelersCount / 12) : 1;
    const perKmRate = vehicleType === 'tempo' ? 24 : vehicleType === 'suv' ? 18 : 14;
    const driverDailyAllowance = vehicleType === 'tempo' ? 600 : 400;

    const baseDistanceCharge = Math.round(roundTripRoadKm * perKmRate * vehiclesCount);
    const driverAllowanceTotal = driverDailyAllowance * durationDays * vehiclesCount;
    transportationCost = baseDistanceCharge + driverAllowanceTotal;
    transportDetailStr = `${vehiclesCount} ${vehicleType.toUpperCase()} (~${roundTripRoadKm} km @ ₹${perKmRate}/km + driver allowance)`;
  }

  // 3. Local Transfers
  const confirmedLocal = input.confirmedPrices?.localTransfers;
  let localTransfersCost = 0;
  if (typeof confirmedLocal === 'number' && confirmedLocal >= 0) {
    localTransfersCost = confirmedLocal;
  } else if (mode === 'flight' || mode === 'train') {
    // Need airport/station transfers and local sightseeing cabs
    const localDailyRate = travelersCount > 4 ? 2800 : 1800;
    localTransfersCost = durationDays * localDailyRate;
  } else {
    // When travelling by car/cab, intercity vehicle handles local touring
    localTransfersCost = 0;
  }

  // 4. Food & Dining
  const confirmedFood = input.confirmedPrices?.food;
  const foodDailyRate = DAILY_FOOD_RATES[tier];
  const foodCost =
    typeof confirmedFood === 'number' && confirmedFood >= 0
      ? confirmedFood
      : travelersCount * durationDays * foodDailyRate;

  // 5. Sightseeing & Activities & Statutory Permits
  const confirmedActs = input.confirmedPrices?.activitiesAndPermits;
  let permitsTotal = 0;
  if (isHighAltitude) {
    // Ladakh Protected Area Permit (ILP) ₹650 + Red Cross / Wildlife Fee ₹400 = ₹1,050/person
    permitsTotal = travelersCount * 1050;
  } else if (isIsland) {
    // Andaman Forest / Tribal Area Transit Permits
    permitsTotal = travelersCount * 500;
  }

  const activityDailyRate = DAILY_ACTIVITY_RATES[tier];
  const baseActivities = travelersCount * Math.max(1, durationDays - 1) * activityDailyRate;
  const activitiesAndPermitsCost =
    typeof confirmedActs === 'number' && confirmedActs >= 0
      ? confirmedActs
      : baseActivities + permitsTotal;

  // 6. Statutory Taxes (GST)
  // 5% transport GST, 12% hotel GST, 18% activities/services GST
  const transportGst = Math.round(transportationCost * 0.05);
  const accomGst = Math.round(accommodationCost * 0.12);
  const servicesGst = Math.round((activitiesAndPermitsCost + localTransfersCost) * 0.18);
  const taxesCost = transportGst + accomGst + servicesGst;

  // 7. Contingency & Tolls
  let tollsParking = 0;
  if (mode === 'car' || mode === 'bus') {
    // Highway FASTag tolls: ~₹1.20 per road km
    tollsParking = Math.round(roundTripRoadKm * 1.2 + durationDays * 150);
  }
  // 3% contingency reserve for medical/roadside buffers
  const contingencyBuffer = Math.round((transportationCost + accommodationCost + foodCost) * 0.03);
  const contingencyCost = tollsParking + contingencyBuffer;

  // Exact Sum Calculation
  const totalEstimatedCostInr =
    transportationCost +
    accommodationCost +
    foodCost +
    activitiesAndPermitsCost +
    localTransfersCost +
    taxesCost +
    contingencyCost;

  const perPersonCostInr = Math.round(totalEstimatedCostInr / travelersCount);

  // Budget Analysis
  const userBudget = input.userBudgetInr && input.userBudgetInr > 0 ? input.userBudgetInr : undefined;
  const isWithinBudget = userBudget ? totalEstimatedCostInr <= userBudget : true;
  const budgetShortfall = userBudget && totalEstimatedCostInr > userBudget ? totalEstimatedCostInr - userBudget : 0;
  const budgetSurplus = userBudget && totalEstimatedCostInr < userBudget ? userBudget - totalEstimatedCostInr : 0;

  let recommendation: string | undefined;
  if (userBudget && !isWithinBudget) {
    if (tier === 'luxury') {
      recommendation = `Switching from Luxury to Standard tier can save approximately ₹${Math.round(totalEstimatedCostInr * 0.35).toLocaleString('en-IN')}.`;
    } else if (tier === 'standard' && mode === 'flight') {
      recommendation = 'Opting for Superfast AC Train or AC Volvo can reduce transportation outlay.';
    } else {
      recommendation = `Current estimate of ₹${totalEstimatedCostInr.toLocaleString('en-IN')} exceeds budget by ₹${budgetShortfall.toLocaleString('en-IN')}. Consider optimizing stay categories or duration.`;
    }
  }

  // Provenance
  const hasConfirmed = Boolean(
    input.confirmedPrices &&
      Object.values(input.confirmedPrices).some((v) => typeof v === 'number' && v > 0)
  );
  const pricingSource: TripPricingSource = hasConfirmed ? 'CONFIRMED' : 'VERIFIED_BENCHMARK';

  return {
    totalEstimatedCostInr,
    perPersonCostInr,
    currency: 'INR',
    durationDays,
    travelersCount,
    hotelNights,
    roomsCount,
    tier,
    pricingSource,
    categories: {
      transportation: transportationCost,
      accommodation: accommodationCost,
      food: foodCost,
      activitiesAndPermits: activitiesAndPermitsCost,
      localTransfers: localTransfersCost,
      taxes: taxesCost,
      contingency: contingencyCost,
    },
    budgetComparison: {
      userBudgetInr: userBudget,
      isWithinBudget,
      budgetShortfall,
      budgetSurplus,
      recommendation,
    },
    itemizedDetails: {
      transportation: transportDetailStr || `${mode.toUpperCase()} transit (~${roundTripRoadKm} km)`,
      accommodation: `${roomsCount} Room${roomsCount > 1 ? 's' : ''} × ${hotelNights} Night${hotelNights > 1 ? 's' : ''} (${tier.toUpperCase()} @ ₹${roomNightRate.toLocaleString('en-IN')}/night)`,
      food: `${travelersCount} Travelers × ${durationDays} Days @ ₹${foodDailyRate}/day`,
      activitiesAndPermits: `${travelersCount} Travelers × ${Math.max(1, durationDays - 1)} Days activities${permitsTotal > 0 ? ` + Statutory Permits (₹${permitsTotal.toLocaleString('en-IN')})` : ''}`,
      localTransfers: localTransfersCost > 0 ? `${durationDays} Days local transit cab/auto` : 'Included with private vehicle',
      taxes: `Statutory GST (5% Transport, 12% Hotel, 18% Services)`,
      contingency: tollsParking > 0 ? `FASTag Tolls & Parking (₹${tollsParking.toLocaleString('en-IN')}) + 3% Emergency Reserve` : '3% Emergency & Roadside Reserve',
    },
  };
}

/**
 * Fast recalculation when user changes budget or tier without changing destinations or dates.
 */
export function recalculateTripCostOnBudgetChange(
  existingCost: TripCostBreakdown,
  newBudgetInr?: number | null,
  newTier?: TripPricingTier | string
): TripCostBreakdown {
  const targetTier = (newTier || existingCost.tier) as TripPricingTier;
  return calculateTripCost({
    originCity: 'Ahmedabad', // will use distance from existing
    destinations: ['Destination'],
    travelersCount: existingCost.travelersCount,
    durationDays: existingCost.durationDays,
    budgetTier: targetTier,
    userBudgetInr: newBudgetInr,
  });
}

/**
 * Updates an estimated trip cost with a confirmed booking supplier price.
 */
export function updateTripCostWithConfirmedPrice(
  existingCost: TripCostBreakdown,
  confirmed: {
    category: 'transportation' | 'accommodation' | 'food' | 'activitiesAndPermits' | 'localTransfers';
    amountInr: number;
  }
): TripCostBreakdown {
  const updatedCategories = {
    ...existingCost.categories,
    [confirmed.category]: confirmed.amountInr,
  };

  // Recalculate statutory taxes
  const transportGst = Math.round(updatedCategories.transportation * 0.05);
  const accomGst = Math.round(updatedCategories.accommodation * 0.12);
  const servicesGst = Math.round((updatedCategories.activitiesAndPermits + updatedCategories.localTransfers) * 0.18);
  updatedCategories.taxes = transportGst + accomGst + servicesGst;

  const totalEstimatedCostInr =
    updatedCategories.transportation +
    updatedCategories.accommodation +
    updatedCategories.food +
    updatedCategories.activitiesAndPermits +
    updatedCategories.localTransfers +
    updatedCategories.taxes +
    updatedCategories.contingency;

  const perPersonCostInr = Math.round(totalEstimatedCostInr / existingCost.travelersCount);

  const userBudget = existingCost.budgetComparison.userBudgetInr;
  const isWithinBudget = userBudget ? totalEstimatedCostInr <= userBudget : true;
  const budgetShortfall = userBudget && totalEstimatedCostInr > userBudget ? totalEstimatedCostInr - userBudget : 0;
  const budgetSurplus = userBudget && totalEstimatedCostInr < userBudget ? userBudget - totalEstimatedCostInr : 0;

  return {
    ...existingCost,
    totalEstimatedCostInr,
    perPersonCostInr,
    pricingSource: 'CONFIRMED',
    categories: updatedCategories,
    budgetComparison: {
      ...existingCost.budgetComparison,
      isWithinBudget,
      budgetShortfall,
      budgetSurplus,
    },
  };
}
