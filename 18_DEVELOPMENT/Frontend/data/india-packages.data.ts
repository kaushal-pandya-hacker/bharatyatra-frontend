const rawMasterPackages = require('./tourism/packages-master.json');
const masterPackagesData: any[] = Array.isArray(rawMasterPackages)
  ? rawMasterPackages
  : (rawMasterPackages && Array.isArray(rawMasterPackages.default))
  ? rawMasterPackages.default
  : [];

export interface PackageHighlight {
  title: string;
  description?: string;
  icon?: string;
}

export interface PackageItineraryDay {
  dayNumber: number;
  title: string;
  description: string;
  activities?: string[];
  meals?: string[];
  hotel?: string;
  transport?: string;
  estimatedTravelTime?: string;
  optionalActivities?: string[];
  overnightCity?: string;
}

export interface PackageInclusion {
  title: string;
  description?: string;
  icon?: string;
  included: boolean;
}

export interface PackageHotelOption {
  hotelName: string;
  hotelCategory: string; // e.g. '3 Star', '4 Star', '5 Star Resort'
  roomType: string;
  nights: number;
  upgradePricePerNightInr: number;
  isDefault?: boolean;
}

export interface PackageTransportOption {
  transportType: string; // 'CAB' | 'BUS' | 'FLIGHT' | 'TRAIN'
  title: string;
  description?: string;
  isIncluded: boolean;
  upgradePriceInr: number;
}

export interface IndiaPackage {
  id: string;
  packageId: string;
  title: string;
  packageName: string;
  slug: string;
  country: string;
  stateOrRegion: string;
  region: string;
  state: string;
  tourismType: string;
  durationDays: number;
  durationNights: number;
  startingPoint: string;
  endingPoint: string;
  startingCity: string;
  endingCity: string;
  route: string;
  destinations: string[];
  includedDestinationIds: string[];
  dailyItinerary: Array<{
    day: number;
    start: string;
    places: string[];
    overnight: string;
  }>;
  itinerary: PackageItineraryDay[];
  majorAttractions: string[];
  bestSeason: string;
  bestMonths: string;
  recommendedTravelModes: string[];
  nearestAirport: string;
  nearestRailwayStation: string;
  stayBases: string[];
  description: string;
  packageType?: string;
  domesticOrInternational?: string;
  difficulty?: string;
  priceType?: string;
  currency?: string;
  minimumTravellers?: number;
  maximumTravellers?: number;
  active?: boolean;
  shortDescription: string;
  highlights: any[];
  estimatedPriceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  startingPriceInr: number;
  startingPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  image: string;
  coverImage: string;
  primaryImageUrl: string;
  heroImageUrl: string;
  galleryImages: string[];
  imageSearchKeywords?: string[];
  verificationStatus: string;
  catalogStatus: string;
  isFeatured?: boolean;
  featured: boolean;
  tags: string[];
  inclusions: PackageInclusion[];
  exclusions: any[];
  hotelOptions: PackageHotelOption[];
  transportOptions: PackageTransportOption[];
  destinationName: string;
  category: string;
  city: string;
  rating: number;
  totalReviews: number;
  suitableFor: string[];
  itineraryDays: any[];
  hotels: any[];
  transports: any[];
  activities: any[];
  faqs: any[];
  importantNotes: any[];
}

export type PackageItem = IndiaPackage;

// Convert raw master packages into IndiaPackage format
export const ALL_INDIA_PACKAGES: IndiaPackage[] = (masterPackagesData as any[]).map((pkg, idx) => {
  const minPrice = pkg.startingPriceInr || pkg.totalPriceINR || (pkg.estimatedPriceRange ? pkg.estimatedPriceRange.min : 15000);
  const coverImg = pkg.coverImage || pkg.image || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80';
  const gallery = pkg.galleryImages && pkg.galleryImages.length > 0 ? pkg.galleryImages : [coverImg];

  const rawItinerary = pkg.dailyItinerary || pkg.itinerary || [];
  const itineraryMapped = rawItinerary.map((d: any) => ({
    dayNumber: d.day || d.dayNumber || 1,
    title: d.title || `Day ${d.day || 1}: Sightseeing`,
    description: d.description || 'Enjoy sightseeing and local travel.',
    activities: d.activities || (Array.isArray(d.places) ? d.places.map((p: string) => `Visit ${p}`) : []),
    meals: d.meals || ['Breakfast'],
    overnightCity: d.overnight || d.overnightCity || 'Hotel Stay',
    estimatedTravelTime: d.travelDistanceTime || 'Local sightseeing'
  }));

  const inclusionsMapped = Array.isArray(pkg.inclusions)
    ? pkg.inclusions.map((inc: any) => typeof inc === 'string' ? { title: inc, included: true } : inc)
    : [
        { title: 'Accommodation in handpicked hotels', included: true },
        { title: 'Daily breakfast', included: true },
        { title: 'Private AC vehicle for all transfers & sightseeing', included: true },
        { title: 'Toll taxes, parking, driver allowance', included: true }
      ];

  const exclusionsMapped = Array.isArray(pkg.exclusions)
    ? pkg.exclusions.map((exc: any) => typeof exc === 'string' ? { title: exc, included: false } : exc)
    : [
        { title: 'Airfare / Train fare', included: false },
        { title: 'Entry tickets to monuments & safari fees', included: false }
      ];

  return {
    id: pkg.packageId || pkg.id || `PKG-${idx + 1}`,
    packageId: pkg.packageId || pkg.id || `PKG-${idx + 1}`,
    title: pkg.packageName || pkg.title || 'India Package',
    packageName: pkg.packageName || pkg.title || 'India Package',
    slug: pkg.slug,
    country: pkg.country || 'India',
    stateOrRegion: pkg.stateOrRegion || pkg.state || 'India',
    state: pkg.stateOrRegion || pkg.state || 'India',
    region: pkg.region || pkg.stateOrRegion || 'India',
    tourismType: pkg.tourismType || pkg.category || 'Sightseeing',
    durationDays: pkg.durationDays || 3,
    durationNights: pkg.durationNights || Math.max(1, (pkg.durationDays || 3) - 1),
    startingPoint: pkg.startingPoint || pkg.startingCity || 'Major City',
    endingPoint: pkg.endingPoint || pkg.endingCity || 'Major City',
    startingCity: pkg.startingCity || pkg.startingPoint || 'Major City',
    endingCity: pkg.endingCity || pkg.endingPoint || 'Major City',
    route: pkg.route || (Array.isArray(pkg.destinations) ? pkg.destinations.join(' → ') : ''),
    destinations: Array.isArray(pkg.destinations) ? pkg.destinations : [],
    includedDestinationIds: Array.isArray(pkg.includedDestinationIds) ? pkg.includedDestinationIds : [],
    dailyItinerary: rawItinerary,
    itinerary: itineraryMapped,
    itineraryDays: itineraryMapped,
    majorAttractions: Array.isArray(pkg.attractions) ? pkg.attractions : (Array.isArray(pkg.majorAttractions) ? pkg.majorAttractions : []),
    bestSeason: pkg.bestSeason || 'October to March',
    bestMonths: pkg.bestSeason || 'October to March',
    recommendedTravelModes: ['Private AC Cab', 'Rail', 'Flight'],
    nearestAirport: pkg.nearestAirport || 'Local Airport',
    nearestRailwayStation: pkg.nearestRailwayStation || 'Local Station',
    stayBases: Array.isArray(pkg.destinations) ? pkg.destinations.slice(0, 3) : [],
    description: pkg.description || 'Verified India Travel Package with detailed daily itinerary.',
    shortDescription: pkg.subtitle || pkg.description || 'Verified India Travel Package.',
    highlights: Array.isArray(pkg.highlights) ? pkg.highlights : [],
    estimatedPriceRange: {
      min: minPrice,
      max: Math.round(minPrice * 1.3),
      currency: 'INR'
    },
    startingPriceInr: minPrice,
    startingPrice: minPrice,
    discountedPrice: minPrice,
    discountPercentage: 10,
    image: coverImg,
    coverImage: coverImg,
    primaryImageUrl: coverImg,
    heroImageUrl: coverImg,
    galleryImages: gallery,
    imageSearchKeywords: pkg.searchTags || [],
    verificationStatus: pkg.verificationStatus || 'VERIFIED',
    catalogStatus: pkg.catalogStatus || 'PUBLISHED',
    isFeatured: idx < 8,
    featured: idx < 8,
    category: pkg.tourismType || pkg.category || 'Tour Package',
    destinationName: Array.isArray(pkg.destinations) ? pkg.destinations.join(', ') : '',
    city: pkg.startingPoint || 'Major City',
    rating: 4.8 + (idx % 3) * 0.08,
    totalReviews: 85 + idx * 12,
    tags: Array.isArray(pkg.searchTags) ? pkg.searchTags : [pkg.stateOrRegion, pkg.tourismType, 'Verified Package'],
    suitableFor: Array.isArray(pkg.recommendedTravellerTypes) ? pkg.recommendedTravellerTypes : ['Families', 'Couples', 'Solo Travellers'],
    inclusions: inclusionsMapped,
    exclusions: exclusionsMapped,
    hotelOptions: [
      { hotelName: 'Standard Comfort Hotel', hotelCategory: '3 Star', roomType: 'Deluxe Room', nights: pkg.durationDays, upgradePricePerNightInr: 0, isDefault: true },
      { hotelName: 'Premium Heritage Resort', hotelCategory: '4 Star Resort', roomType: 'Luxury Room', nights: pkg.durationDays, upgradePricePerNightInr: 1500, isDefault: false }
    ],
    transportOptions: [
      { transportType: 'CAB', title: 'Private AC Sedan', description: 'Dedicated vehicle', isIncluded: true, upgradePriceInr: 0 },
      { transportType: 'CAB', title: 'Private AC SUV', description: 'Spacious 6-seater', isIncluded: false, upgradePriceInr: 3000 }
    ],
    hotels: [
      { hotelName: 'Standard Comfort Hotel', hotelCategory: '3 Star', roomType: 'Deluxe Room', nights: pkg.durationDays, upgradePricePerNightInr: 0, isDefault: true },
      { hotelName: 'Premium Heritage Resort', hotelCategory: '4 Star Resort', roomType: 'Luxury Room', nights: pkg.durationDays, upgradePricePerNightInr: 1500, isDefault: false }
    ],
    transports: [
      { transportType: 'CAB', title: 'Private AC Sedan', description: 'Dedicated vehicle', isIncluded: true, isOptional: false, additionalPriceInr: 0 },
      { transportType: 'CAB', title: 'Private AC SUV', description: 'Spacious 6-seater', isIncluded: false, isOptional: true, additionalPriceInr: 3000 }
    ],
    activities: [
      { id: 'act-1', title: 'Guided Heritage Tour', priceInr: 500 },
      { id: 'act-2', title: 'Local Cultural Evening Show', priceInr: 750 }
    ],
    faqs: Array.isArray(pkg.faq) ? pkg.faq : [
      { question: 'What is the best time to visit?', answer: pkg.bestSeason || 'October to March' },
      { question: 'Is transport included?', answer: 'Yes, private AC vehicle is included for all transfers.' }
    ],
    importantNotes: Array.isArray(pkg.importantNotes) ? pkg.importantNotes : [
      'Carry valid government photo ID for all travelers.',
      'Package prices are estimated and ready for booking integration.'
    ]
  };
});

export function getPackageBySlug(slug: string): IndiaPackage | undefined {
  return ALL_INDIA_PACKAGES.find(p => p.slug === slug);
}

export function getPackagesByState(state: string): IndiaPackage[] {
  return ALL_INDIA_PACKAGES.filter(p => p.stateOrRegion.toLowerCase() === state.toLowerCase());
}

export function searchPackages(query: string): IndiaPackage[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_INDIA_PACKAGES;
  return ALL_INDIA_PACKAGES.filter(p =>
    p.packageName.toLowerCase().includes(q) ||
    p.stateOrRegion.toLowerCase().includes(q) ||
    p.tourismType.toLowerCase().includes(q) ||
    p.destinations.some(d => d.toLowerCase().includes(q))
  );
}
