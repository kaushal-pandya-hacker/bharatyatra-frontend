/**
 * BharatYatra — Sandbox / Fixture Activity Provider Adapter
 *
 * This adapter runs in SANDBOX mode.  It serves curated, verified fixture
 * activity data for Gujarat (and major India) destinations so that the full
 * booking flow can be developed and tested without a live supplier account.
 *
 * PRODUCTION ACTIVATION:
 *   1. Implement a concrete IActivityProvider for your chosen supplier
 *      (e.g. ViatorActivityAdapter, ReszdyActivityAdapter).
 *   2. Register that adapter in ProvidersModule and ActivityProviderFactory.
 *   3. Set ACTIVITY_PROVIDER_MODE=live in .env.
 *   4. Set supplier credentials (ACTIVITY_PROVIDER_API_KEY, etc.).
 *   No ActivitiesService code changes required.
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  IActivityProvider,
  ActivitySearchInput,
  ActivitySearchItem,
  ActivityDetail,
  ActivitySlot,
  CheckActivityAvailabilityInput,
  CheckActivityAvailabilityResult,
  CreateActivityBookingInput,
  ActivityBookingResponse,
  CancelActivityBookingInput,
  CancelActivityBookingResult,
} from './activity-provider.interface';

// ---------------------------------------------------------------------------
// Fixture Data — Curated, verified Gujarat & India activities
// ---------------------------------------------------------------------------

const FIXTURE_ACTIVITIES: ActivityDetail[] = [
  {
    activityId: 'act-gir-safari-trail-3',
    title: 'Gir Forest Lion Safari — Trail 3 (Morning)',
    slug: 'gir-forest-lion-safari-trail-3-morning',
    category: 'Wildlife & Safari',
    destination: 'Gir National Park',
    destinationSlug: 'gir-national-park',
    description:
      'Experience the thrill of spotting Asiatic Lions in their natural habitat on the iconic Trail 3 of Gir National Park. Expert naturalist guide included. Morning safaris offer the highest lion sighting probability.',
    shortDescription: 'Spot Asiatic Lions on Trail 3 — the most productive zone of Gir.',
    fullDescription:
      'Gir Forest National Park is the only wild habitat of the Asiatic Lion outside Africa. Trail 3 passes through dense scrub forest and open grasslands, offering excellent wildlife sightings. Your naturalist guide will help identify pugmarks, explain ecosystem dynamics, and ensure a responsible safari experience. Duration: 3 hours. Vehicle: 6-seater open jeep.',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Lion_waiting_in_Namibia.jpg/1200px-Lion_waiting_in_Namibia.jpg',
    ],
    latitude: 21.1300,
    longitude: 70.8000,
    durationMinutes: 180,
    minPrice: 1200,
    maxPrice: 1500,
    currency: 'INR',
    rating: 4.8,
    reviewCount: 2340,
    tags: ['Wildlife', 'Safari', 'Lions', 'Gujarat', 'Nature'],
    highlights: ['Asiatic Lion sightings', 'Expert naturalist guide', 'Open jeep safari', 'Bird watching'],
    inclusions: ['Forest entry fee', 'Jeep safari (shared)', 'Naturalist guide', 'Water bottle'],
    exclusions: ['Camera fees', 'Personal travel insurance', 'Lunch'],
    cancellationPolicy: 'Full refund if cancelled 48 hours before the activity.',
    instantConfirmation: true,
    meetingPoint: 'Sinh Sadan Forest Lodge, Sasan Gir',
    provider: 'sandbox-fixture',
    isVerified: true,
    itinerary: '05:30 Assembly at Sinh Sadan → 06:00 Enter forest gate → 06:00–09:00 Safari on Trail 3 → 09:00 Return to gate',
    requirements: 'Wear muted earth-tone clothing. No flash photography. Children under 5 not permitted.',
    ageRestriction: 'Minimum age: 5 years',
    groupSizeMin: 1,
    groupSizeMax: 6,
    languages: ['Gujarati', 'Hindi', 'English'],
    slots: [
      { slotId: 'gir-am-slot', date: '', time: '06:00', durationMinutes: 180, spotsAvailable: 6, priceAdultInr: 1200, priceChildInr: 600, currency: 'INR', cancellationPolicy: 'Refundable 48h prior' },
      { slotId: 'gir-pm-slot', date: '', time: '15:00', durationMinutes: 180, spotsAvailable: 6, priceAdultInr: 1200, priceChildInr: 600, currency: 'INR', cancellationPolicy: 'Refundable 48h prior' },
    ],
  },
  {
    activityId: 'act-kutch-rann-cultural',
    title: 'Rann of Kutch Cultural Walk & Craft Workshop',
    slug: 'rann-of-kutch-cultural-walk-craft-workshop',
    category: 'Culture & Crafts',
    destination: 'Rann of Kutch',
    destinationSlug: 'rann-of-kutch',
    description:
      'Walk through the unique white salt desert of the Great Rann and participate in an artisan workshop learning Kutchi embroidery (Khabda) from master craftswomen of the Rabari and Mutwa communities.',
    shortDescription: 'Explore the White Rann and learn Kutchi embroidery from master artisans.',
    fullDescription:
      'The Rann of Kutch is one of India\'s most extraordinary landscapes — a vast white salt flat stretching to the horizon. This curated experience combines a guided cultural walk across the salt crust at sunset with a hands-on workshop in Khabda embroidery. Proceeds support the Kutch Craft Revival Initiative. All materials provided.',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Rann_of_Kutch.jpg/1200px-Rann_of_Kutch.jpg',
    ],
    latitude: 23.7337,
    longitude: 69.8597,
    durationMinutes: 150,
    minPrice: 450,
    maxPrice: 600,
    currency: 'INR',
    rating: 4.9,
    reviewCount: 876,
    tags: ['Culture', 'Crafts', 'Kutch', 'Gujarat', 'Artisan'],
    highlights: ['White salt desert walk', 'Khabda embroidery workshop', 'Meet master craftswomen', 'Sunset views'],
    inclusions: ['Craft materials', 'Expert artisan guide', 'Cultural briefing', 'Chai & snacks'],
    exclusions: ['Transport to Dhordo', 'Photography props'],
    cancellationPolicy: 'Full refund if cancelled 24 hours before the activity.',
    instantConfirmation: true,
    meetingPoint: 'Tent City Dhordo Main Gate, Near Bhirandiyara',
    provider: 'sandbox-fixture',
    isVerified: true,
    languages: ['Gujarati', 'Hindi'],
    groupSizeMin: 1,
    groupSizeMax: 20,
    slots: [
      { slotId: 'kutch-sunset-slot', date: '', time: '16:30', durationMinutes: 150, spotsAvailable: 15, priceAdultInr: 450, priceChildInr: 250, currency: 'INR', cancellationPolicy: 'Refundable 24h prior' },
    ],
  },
  {
    activityId: 'act-statue-unity-kayak',
    title: 'Narmada River Kayaking — Statue of Unity',
    slug: 'narmada-river-kayaking-statue-of-unity',
    category: 'Adventure',
    destination: 'Statue of Unity',
    destinationSlug: 'statue-of-unity',
    description:
      'Paddle on the Narmada River with jaw-dropping views of the world\'s tallest statue — the Statue of Unity (182m). Suitable for beginners. All safety equipment and instruction provided.',
    shortDescription: 'Kayak on the Narmada with views of the world\'s tallest statue.',
    fullDescription:
      'Launch from the Garudeshwar bank and paddle 4 km along the Narmada, with the Statue of Unity towering above you. Certified instructors, life jackets, and helmets provided. Best suited for ages 10+. Group size capped at 10 for safety.',
    images: [],
    latitude: 21.8380,
    longitude: 73.7191,
    durationMinutes: 90,
    minPrice: 750,
    maxPrice: 900,
    currency: 'INR',
    rating: 4.7,
    reviewCount: 512,
    tags: ['Adventure', 'Kayaking', 'Narmada', 'Gujarat', 'Water Sports'],
    highlights: ['Paddle alongside Statue of Unity', 'Certified safety instructors', 'All equipment provided'],
    inclusions: ['Kayak', 'Life jacket', 'Helmet', 'Certified instructor', 'Safety briefing'],
    exclusions: ['Shuttle to launch point', 'Waterproof bag', 'Travel insurance'],
    cancellationPolicy: 'Full refund if cancelled 72 hours before. 50% refund within 72-24h.',
    instantConfirmation: false,
    meetingPoint: 'Garudeshwar Boat Jetty, Kevadia Colony',
    provider: 'sandbox-fixture',
    isVerified: true,
    ageRestriction: 'Minimum age: 10 years',
    groupSizeMin: 2,
    groupSizeMax: 10,
    languages: ['Gujarati', 'Hindi', 'English'],
    slots: [
      { slotId: 'sou-kayak-am', date: '', time: '07:00', durationMinutes: 90, spotsAvailable: 10, priceAdultInr: 750, priceChildInr: 400, currency: 'INR', cancellationPolicy: '72h full refund' },
      { slotId: 'sou-kayak-pm', date: '', time: '14:00', durationMinutes: 90, spotsAvailable: 10, priceAdultInr: 750, priceChildInr: 400, currency: 'INR', cancellationPolicy: '72h full refund' },
    ],
  },
  {
    activityId: 'act-ahmedabad-heritage-walk',
    title: 'Ahmedabad UNESCO Old City Heritage Walk',
    slug: 'ahmedabad-unesco-old-city-heritage-walk',
    category: 'Heritage & History',
    destination: 'Ahmedabad',
    destinationSlug: 'ahmedabad',
    description:
      'Walk through the labyrinthine pols (traditional community clusters) of Ahmedabad\'s UNESCO World Heritage walled city. Expert heritage guide narrates 600 years of history, architecture, and culture.',
    shortDescription: 'UNESCO Old City pols walk — 600 years of Ahmedabad history.',
    fullDescription:
      'Ahmedabad\'s walled city was declared a UNESCO World Heritage Site in 2017. This guided walk takes you through 8 historic pols including Shahi Baug, Manek Chowk, and the Sidi Saiyyed Mosque. Duration 3 hours, 4 km walking distance. Morning walks recommended for cooler temperatures.',
    images: [],
    latitude: 23.0225,
    longitude: 72.5714,
    durationMinutes: 180,
    minPrice: 350,
    maxPrice: 500,
    currency: 'INR',
    rating: 4.9,
    reviewCount: 1834,
    tags: ['Heritage', 'UNESCO', 'History', 'Architecture', 'Gujarat'],
    highlights: ['UNESCO World Heritage Site', 'Pol architecture exploration', 'Sidi Saiyyed Jali', 'Street food stops'],
    inclusions: ['Expert guide', 'Entry to open monuments', 'Street food tasting (2 items)', 'Route map'],
    exclusions: ['Mosque entry donations', 'Additional food & drink', 'Transport'],
    cancellationPolicy: 'Full refund if cancelled 12 hours before the activity.',
    instantConfirmation: true,
    meetingPoint: 'Bhadra Fort Gate (Teen Darwaza), Bhadra, Ahmedabad',
    provider: 'sandbox-fixture',
    isVerified: true,
    groupSizeMin: 1,
    groupSizeMax: 15,
    languages: ['Gujarati', 'Hindi', 'English'],
    slots: [
      { slotId: 'amd-hw-am', date: '', time: '07:30', durationMinutes: 180, spotsAvailable: 15, priceAdultInr: 350, priceChildInr: 200, currency: 'INR', cancellationPolicy: '12h full refund' },
      { slotId: 'amd-hw-ev', date: '', time: '17:00', durationMinutes: 180, spotsAvailable: 15, priceAdultInr: 350, priceChildInr: 200, currency: 'INR', cancellationPolicy: '12h full refund' },
    ],
  },
  {
    activityId: 'act-jamnagar-marine',
    title: 'Jamnagar Marine National Park Snorkeling',
    slug: 'jamnagar-marine-national-park-snorkeling',
    category: 'Nature & Marine',
    destination: 'Jamnagar',
    destinationSlug: 'jamnagar',
    description:
      'Snorkel among vibrant coral reefs at India\'s first Marine National Park. Expert marine biologist guide, all equipment provided. Witness diverse marine life including sea horses, puffer fish, and coral gardens.',
    shortDescription: 'Snorkel India\'s first Marine National Park coral reefs.',
    fullDescription:
      'The Gulf of Kutch Marine National Park contains over 50 islands with coral reefs, mangroves, and rich marine biodiversity. Certified marine biologist guides accompany each group. Equipment includes mask, fins, wetsuit, and buoyancy aid. Boat transfer to Pirotan Island included.',
    images: [],
    latitude: 22.4707,
    longitude: 70.0577,
    durationMinutes: 240,
    minPrice: 1800,
    maxPrice: 2200,
    currency: 'INR',
    rating: 4.6,
    reviewCount: 341,
    tags: ['Marine', 'Snorkeling', 'Coral', 'Gujarat', 'Jamnagar'],
    highlights: ['India\'s first Marine National Park', 'Coral reef snorkeling', 'Marine biologist guide', 'Boat to Pirotan Island'],
    inclusions: ['Boat transfer', 'Snorkeling equipment', 'Marine biologist guide', 'Forest entry permit', 'Lunch'],
    exclusions: ['Underwater camera rental', 'Personal travel insurance'],
    cancellationPolicy: 'Full refund if cancelled 72 hours before. No refund within 24h.',
    instantConfirmation: false,
    meetingPoint: 'Bedi Port, Jamnagar (Approach via SH-25)',
    provider: 'sandbox-fixture',
    isVerified: true,
    ageRestriction: 'Must be able to swim. Minimum age 12.',
    groupSizeMin: 2,
    groupSizeMax: 8,
    languages: ['Hindi', 'English'],
    slots: [
      { slotId: 'jmn-marine-am', date: '', time: '06:30', durationMinutes: 240, spotsAvailable: 8, priceAdultInr: 1800, priceChildInr: 1000, currency: 'INR', cancellationPolicy: '72h full refund' },
    ],
  },
  {
    activityId: 'act-dwarka-boat-temple',
    title: 'Dwarka Sacred Temple Boat Darshan',
    slug: 'dwarka-sacred-temple-boat-darshan',
    category: 'Spiritual & Pilgrimage',
    destination: 'Dwarka',
    destinationSlug: 'dwarka',
    description:
      'Experience the divine atmosphere of Dwarkadhish Temple via a guided boat darshan across the Gomti Creek, followed by a curated pilgrimage route through Bet Dwarka and Nageshwar Jyotirlinga.',
    shortDescription: 'Sacred boat darshan to Dwarkadhish & Bet Dwarka pilgrimage.',
    fullDescription:
      'Begin at Dwarkadhish Temple for morning aarti (optional VIP darshan available), then board a traditional boat to Bet Dwarka island. Visit Nageshwar Jyotirlinga en route. Expert pilgrimage guide navigates queues and ritual protocols. All entry tickets included.',
    images: [],
    latitude: 22.2442,
    longitude: 68.9685,
    durationMinutes: 300,
    minPrice: 600,
    maxPrice: 900,
    currency: 'INR',
    rating: 4.8,
    reviewCount: 2105,
    tags: ['Spiritual', 'Pilgrimage', 'Dwarka', 'Jyotirlinga', 'Gujarat'],
    highlights: ['Dwarkadhish morning aarti', 'Boat to Bet Dwarka', 'Nageshwar Jyotirlinga', 'Pilgrimage guide'],
    inclusions: ['Boat fare', 'All temple entry tickets', 'Pilgrimage guide', 'Prasad'],
    exclusions: ['VIP darshan pass (optional ₹200)', 'Personal offerings'],
    cancellationPolicy: 'Full refund if cancelled 24 hours before.',
    instantConfirmation: true,
    meetingPoint: 'Dwarka Bus Stand, near Dwarkadhish Temple Main Gate',
    provider: 'sandbox-fixture',
    isVerified: true,
    groupSizeMin: 1,
    groupSizeMax: 20,
    languages: ['Gujarati', 'Hindi', 'Sanskrit'],
    slots: [
      { slotId: 'dwk-boat-am', date: '', time: '05:30', durationMinutes: 300, spotsAvailable: 20, priceAdultInr: 600, priceChildInr: 300, currency: 'INR', cancellationPolicy: '24h full refund' },
    ],
  },
];

const DESTINATION_SLUG_MAP: Record<string, string[]> = {
  'gir-national-park': ['act-gir-safari-trail-3'],
  'gir': ['act-gir-safari-trail-3'],
  'rann-of-kutch': ['act-kutch-rann-cultural'],
  'kutch': ['act-kutch-rann-cultural'],
  'bhuj': ['act-kutch-rann-cultural'],
  'statue-of-unity': ['act-statue-unity-kayak'],
  'kevadia': ['act-statue-unity-kayak'],
  'ahmedabad': ['act-ahmedabad-heritage-walk'],
  'jamnagar': ['act-jamnagar-marine'],
  'dwarka': ['act-dwarka-boat-temple'],
};

// ---------------------------------------------------------------------------
// Adapter Implementation
// ---------------------------------------------------------------------------

@Injectable()
export class SandboxActivityProviderAdapter implements IActivityProvider {
  readonly providerId = 'sandbox-activity-fixture';
  readonly providerName = 'BharatYatra Sandbox Activity Provider';
  readonly isLive = false;

  private readonly logger = new Logger(SandboxActivityProviderAdapter.name);

  async searchActivities(input: ActivitySearchInput): Promise<ActivitySearchItem[]> {
    this.logger.log(`[SANDBOX] searchActivities slug=${input.destinationSlug} category=${input.category}`);

    let results = [...FIXTURE_ACTIVITIES];

    // Filter by destination
    if (input.destinationSlug) {
      const slug = input.destinationSlug.toLowerCase();
      const ids = DESTINATION_SLUG_MAP[slug];
      if (ids) {
        results = results.filter((a) => ids.includes(a.activityId));
      } else {
        // fuzzy match destination name
        results = results.filter((a) =>
          a.destinationSlug.toLowerCase().includes(slug) ||
          a.destination.toLowerCase().includes(slug),
        );
      }
    } else if (input.destination) {
      const dest = input.destination.toLowerCase();
      results = results.filter(
        (a) =>
          a.destination.toLowerCase().includes(dest) ||
          a.destinationSlug.toLowerCase().includes(dest),
      );
    }

    // Filter by category
    if (input.category) {
      const cat = input.category.toLowerCase();
      results = results.filter((a) => a.category.toLowerCase().includes(cat));
    }

    // Pagination
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;
    const offset = (page - 1) * pageSize;
    results = results.slice(offset, offset + pageSize);

    // Return as ActivitySearchItem (strip slot detail)
    return results.map(({ slots: _slots, fullDescription: _fd, itinerary: _it, requirements: _req, ...item }) => item as ActivitySearchItem);
  }

  async getActivityDetail(activityId: string): Promise<ActivityDetail | null> {
    this.logger.log(`[SANDBOX] getActivityDetail activityId=${activityId}`);
    const today = new Date().toISOString().split('T')[0];
    const activity = FIXTURE_ACTIVITIES.find((a) => a.activityId === activityId);
    if (!activity) return null;

    // Hydrate slot dates with a 7-day window from today
    const hydratedSlots: ActivitySlot[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(Date.now() + d * 86400000).toISOString().split('T')[0];
      (activity.slots || []).forEach((slot) => {
        hydratedSlots.push({ ...slot, date });
      });
    }

    return { ...activity, slots: hydratedSlots };
  }

  async checkAvailability(input: CheckActivityAvailabilityInput): Promise<CheckActivityAvailabilityResult> {
    this.logger.log(`[SANDBOX] checkAvailability activityId=${input.activityId} date=${input.date}`);
    const activity = FIXTURE_ACTIVITIES.find((a) => a.activityId === input.activityId);
    if (!activity) {
      return {
        status: 'UNAVAILABLE',
        activityId: input.activityId,
        date: input.date,
        priceAdultInr: 0,
        totalPrice: 0,
        currency: 'INR',
        cancellationPolicy: '',
        message: 'Activity not found.',
      };
    }

    const slot = (activity.slots || [])[0];
    const adults = input.adults ?? 1;
    const children = input.children ?? 0;
    const adultPrice = slot?.priceAdultInr ?? activity.minPrice;
    const childPrice = slot?.priceChildInr ?? Math.round(activity.minPrice * 0.5);
    const total = adults * adultPrice + children * childPrice;

    return {
      status: 'AVAILABLE',
      activityId: input.activityId,
      slotId: input.slotId || slot?.slotId,
      date: input.date,
      spotsAvailable: slot?.spotsAvailable ?? 10,
      priceAdultInr: adultPrice,
      priceChildInr: childPrice,
      totalPrice: total,
      currency: 'INR',
      cancellationPolicy: activity.cancellationPolicy,
    };
  }

  async createBooking(input: CreateActivityBookingInput): Promise<ActivityBookingResponse> {
    this.logger.log(`[SANDBOX] createBooking activityId=${input.activityId} ref=${input.clientReference}`);
    const supplierRef = `SANDBOX-ACT-${input.clientReference}`;
    return {
      supplierReference: supplierRef,
      status: 'TEST_ONLY',
      confirmationNotes:
        'SANDBOX MODE — No real booking created. ' +
        'To activate live booking, configure ACTIVITY_PROVIDER_MODE=live and set provider credentials.',
      cancellationPolicy: 'SANDBOX — no real booking, no charges.',
    };
  }

  async cancelBooking(input: CancelActivityBookingInput): Promise<CancelActivityBookingResult> {
    this.logger.log(`[SANDBOX] cancelBooking supplierRef=${input.supplierReference}`);
    return {
      status: 'CANCELLED',
      cancellationFee: 0,
      currency: 'INR',
      message: 'SANDBOX — Booking cancelled (no real booking existed).',
    };
  }

  async healthCheck() {
    return { status: 'HEALTHY' as const, latencyMs: 1, message: 'Sandbox fixture provider — always healthy.' };
  }
}
