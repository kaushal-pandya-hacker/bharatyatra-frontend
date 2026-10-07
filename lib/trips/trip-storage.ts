export interface TripNode {
  day: string;
  title: string;
  badge: string;
  detail: string;
}

export interface TripItem {
  tripId: string;
  title: string;
  destination: string;
  startDate: string;
  durationDays: number;
  travellerCount: number;
  crewType?: string;
  selectedTier?: 'budget' | 'balanced' | 'luxury';
  budgetInr: number;
  status: 'ACTIVE' | 'PLANNING' | 'BOOKED' | 'COMPLETED';
  version?: number;
  image?: string;
  nodes?: TripNode[];
  createdAt?: string;
}

export const STORAGE_KEY = 'chalo_farva_saved_trips';

export const DEFAULT_MOCK_TRIPS: TripItem[] = [
  {
    tripId: 'demo-trip-kutch-456',
    title: 'Kutch Rann Utsav & White Desert Expedition',
    destination: 'Bhuj & Kutch',
    startDate: 'Dec 15, 2026',
    durationDays: 4,
    travellerCount: 4,
    crewType: 'Family Crew (4 Pax)',
    selectedTier: 'luxury',
    budgetInr: 59996,
    status: 'ACTIVE',
    version: 1,
    image: '/places/aina-mahal.jpg',
    createdAt: new Date().toISOString(),
    nodes: [
      { day: 'Day 1', title: 'Arrival & Ahmedabad Heritage Transit', badge: '18:00 CHECK-IN', detail: 'Chauffeur Innova Crysta arrival • Royal tent check-in' },
      { day: 'Day 2', title: 'Full Moon Salt Flat Walk & Rogan Art', badge: 'CULTURAL FOCUS', detail: 'Early walk on glistening salt flats • Nirona bell masterclass' },
      { day: 'Day 3', title: 'Kala Dungar & Mandvi Beach', badge: 'EXPEDITION', detail: 'Kala Dungar jackal feeding & 360 degree panoramic view' },
      { day: 'Day 4', title: 'Heritage Farewell', badge: 'COMPLETION', detail: 'Return transfer to airport/railway station' },
    ],
  },
  {
    tripId: 'demo-trip-id-123',
    title: 'Somnath & Dwarka Sacred Coastal Circuit',
    destination: 'Dwarka & Somnath',
    startDate: 'Nov 10, 2026',
    durationDays: 4,
    travellerCount: 2,
    crewType: 'Couple (2 Pax)',
    selectedTier: 'balanced',
    budgetInr: 25000,
    status: 'BOOKED',
    version: 2,
    image: '/places/somnath-temple.jpg',
    createdAt: new Date().toISOString(),
  },
];

export function getSavedTrips(): TripItem[] {
  if (typeof window === 'undefined') return DEFAULT_MOCK_TRIPS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_TRIPS));
    return DEFAULT_MOCK_TRIPS;
  } catch {
    return DEFAULT_MOCK_TRIPS;
  }
}

export function saveTrip(trip: TripItem): TripItem[] {
  if (typeof window === 'undefined') return [trip];
  try {
    const current = getSavedTrips();
    const updated = [trip, ...current.filter((t) => t.tripId !== trip.tripId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving trip to localStorage', err);
    return [trip];
  }
}

export function deleteSavedTrip(tripId: string): TripItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSavedTrips();
    const updated = current.filter((t) => t.tripId !== tripId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
