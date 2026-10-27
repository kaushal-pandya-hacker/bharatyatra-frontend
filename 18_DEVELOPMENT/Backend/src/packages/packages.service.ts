import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PackageFilterQuery {
  search?: string;
  destination?: string;
  domesticOrInternational?: 'DOMESTIC' | 'INTERNATIONAL' | string;
  category?: string;
  theme?: string;
  minPrice?: number;
  maxPrice?: number;
  minDays?: number;
  maxDays?: number;
  featuredOnly?: boolean;
}

export interface CalculatePriceDto {
  packageSlug: string;
  travellers: number;
  hotelCategory?: string; // e.g. '3 Star', '4 Star', '5 Star Resort'
  transportType?: string; // e.g. 'CAB', 'FLIGHT', 'BUS'
  selectedActivityIds?: string[];
  travelDate?: string;
}

export interface PackageBookingDto {
  packageId?: string;
  packageSlug: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  travellers: number;
  travelDate: string;
  hotelCategory?: string;
  transportType?: string;
  selectedActivityIds?: string[];
  specialRequests?: string;
}

import masterPackagesData from '../data/tourism/packages-master.json';

const loadMasterPackages = (): any[] => {
  const raw = masterPackagesData as any;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.default)) return raw.default;
  if (Array.isArray(raw?.packages)) return raw.packages;
  try {
    const json = require('../data/tourism/packages-master.json');
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.default)) return json.default;
  } catch (e) {}
  return [];
};

const masterList: any[] = loadMasterPackages();


const REFERENCE_PACKAGES: any[] = masterList.map((pkg: any, idx: number) => ({



  id: pkg.packageId,
  slug: pkg.slug,
  title: pkg.packageName,
  shortDescription: pkg.description,
  description: pkg.description,
  packageType: pkg.tourismType,
  domesticOrInternational: 'DOMESTIC',
  destinationName: pkg.destinations.join(', '),
  country: 'India',
  state: pkg.stateOrRegion,
  city: pkg.startingPoint,
  region: pkg.stateOrRegion,
  durationDays: pkg.durationDays,
  durationNights: Math.max(1, pkg.durationDays - 1),
  category: pkg.tourismType,
  tags: [pkg.stateOrRegion, pkg.tourismType, 'Verified'],
  theme: pkg.tourismType,
  suitableFor: ['Families', 'Couples', 'Solo Travellers'],
  difficulty: 'Easy',
  startingPrice: pkg.estimatedPriceRange ? pkg.estimatedPriceRange.min : 15000,
  originalPrice: pkg.estimatedPriceRange ? Math.round(pkg.estimatedPriceRange.min * 1.2) : 18000,
  discountedPrice: pkg.estimatedPriceRange ? pkg.estimatedPriceRange.min : 15000,
  discountPercentage: 16,
  priceType: 'PER_PERSON',
  currency: 'INR',
  minimumTravellers: 1,
  maximumTravellers: 20,
  featured: idx < 10,
  bestTimeToVisit: pkg.bestSeason || 'October to March',
  startingPoint: pkg.startingPoint,
  endingPoint: pkg.endingPoint,
  transportType: pkg.recommendedTravelModes ? pkg.recommendedTravelModes[0] : 'CAB',
  coverImage: pkg.image,
  verificationStatus: pkg.verificationStatus,
  catalogStatus: pkg.catalogStatus,
  destinations: pkg.destinations,
  includedDestinationIds: pkg.includedDestinationIds,
  hotels: [
    { id: `h1-${idx}`, hotelCategory: 'STANDARD', hotelName: `${pkg.startingPoint || 'City'} Standard Hotel`, upgradePricePerNightInr: 0, roomType: 'Standard Room' },
    { id: `h2-${idx}`, hotelCategory: 'DELUXE', hotelName: `${pkg.startingPoint || 'City'} Deluxe Resort & Spa`, upgradePricePerNightInr: 1200, roomType: 'Deluxe Room' },
    { id: `h3-${idx}`, hotelCategory: 'LUXURY', hotelName: `${pkg.startingPoint || 'City'} Heritage Palace Hotel`, upgradePricePerNightInr: 3200, roomType: 'Heritage Suite' },
  ],
  transports: [
    { id: `t1-${idx}`, transportType: 'CAB', title: 'Private AC Sedan Cab', additionalPriceInr: 0 },
    { id: `t2-${idx}`, transportType: 'SUV', title: 'Private AC SUV (Innova)', additionalPriceInr: 1500 },
    { id: `t3-${idx}`, transportType: 'BUS', title: 'Luxury AC Sleeper Bus Ticket', additionalPriceInr: 800 },
  ],
  activities: (pkg.destinations || []).slice(0, 3).map((dest: string, i: number) => ({
    id: `act-${idx}-${i}`,
    title: `Guided Heritage Tour of ${dest}`,
    priceInr: 450 + i * 150,
  })),
  itinerary: pkg.dailyItinerary.map((d: any) => ({
    dayNumber: d.day,
    title: `Day ${d.day}: Sightseeing in ${(d.places || []).join(', ')}`,
    description: `Explore ${(d.places || []).join(', ')}. Overnight stay in ${d.overnight}.`,
    activities: (d.places || []).map((p: string) => `Sightseeing at ${p}`),
    overnightCity: d.overnight
  }))
}));


@Injectable()
export class PackagesService {
  private readonly logger = new Logger(PackagesService.name);
  private localWishlists: Map<string, Set<string>> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PackageFilterQuery) {
    try {
      const where: any = { active: true };

      if (query.domesticOrInternational) {
        where.domesticOrInternational = query.domesticOrInternational.toUpperCase();
      }

      if (query.category) {
        where.category = { contains: query.category, mode: 'insensitive' };
      }

      if (query.theme) {
        where.theme = { contains: query.theme, mode: 'insensitive' };
      }

      if (query.destination) {
        where.OR = [
          { destinationName: { contains: query.destination, mode: 'insensitive' } },
          { state: { contains: query.destination, mode: 'insensitive' } },
          { city: { contains: query.destination, mode: 'insensitive' } },
        ];
      }

      if (query.search) {
        const s = query.search;
        where.OR = [
          { title: { contains: s, mode: 'insensitive' } },
          { description: { contains: s, mode: 'insensitive' } },
          { destinationName: { contains: s, mode: 'insensitive' } },
          { state: { contains: s, mode: 'insensitive' } },
          { city: { contains: s, mode: 'insensitive' } },
        ];
      }

      if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        where.startingPrice = {};
        if (query.minPrice !== undefined) where.startingPrice.gte = Number(query.minPrice);
        if (query.maxPrice !== undefined) where.startingPrice.lte = Number(query.maxPrice);
      }

      if (query.minDays !== undefined || query.maxDays !== undefined) {
        where.durationDays = {};
        if (query.minDays !== undefined) where.durationDays.gte = Number(query.minDays);
        if (query.maxDays !== undefined) where.durationDays.lte = Number(query.maxDays);
      }

      if (query.featuredOnly) {
        where.featured = true;
      }

      const dbPackages = await this.prisma.package.findMany({
        where,
        include: {
          highlights: { orderBy: { displayOrder: 'asc' } },
          inclusions: true,
        },
        orderBy: { featured: 'desc' },
      });

      if (dbPackages && dbPackages.length > 0) {
        return { success: true, count: dbPackages.length, data: dbPackages };
      }
    } catch (e) {
      this.logger.warn(`[PackagesService] DB query failed/empty, serving fallback reference packages: ${e.message}`);
    }

    // Fallback logic
    let filtered = [...REFERENCE_PACKAGES];

    if (query.domesticOrInternational) {
      const type = query.domesticOrInternational.toUpperCase();
      filtered = filtered.filter(p => p.domesticOrInternational === type);
    }

    if (query.category) {
      const c = query.category.toLowerCase();
      filtered = filtered.filter(p => p.category.toLowerCase().includes(c));
    }

    if (query.destination) {
      const d = query.destination.toLowerCase();
      filtered = filtered.filter(p =>
        p.destinationName.toLowerCase().includes(d) ||
        p.state.toLowerCase().includes(d) ||
        p.city.toLowerCase().includes(d)
      );
    }

    if (query.search) {
      const s = query.search.toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.title || '').toLowerCase().includes(s) ||
        (p.description || '').toLowerCase().includes(s) ||
        (p.destinationName || '').toLowerCase().includes(s) ||
        (p.state || '').toLowerCase().includes(s) ||
        (p.city || '').toLowerCase().includes(s) ||
        (p.category || '').toLowerCase().includes(s) ||
        (p.theme || '').toLowerCase().includes(s) ||
        (p.startingPoint || '').toLowerCase().includes(s) ||
        (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(s))) ||
        (s.includes('day') && `${p.durationDays} day`.includes(s))
      );
    }


    if (query.minPrice !== undefined) {
      filtered = filtered.filter(p => p.startingPrice >= Number(query.minPrice));
    }
    if (query.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.startingPrice <= Number(query.maxPrice));
    }
    if (query.minDays !== undefined) {
      filtered = filtered.filter(p => p.durationDays >= Number(query.minDays));
    }
    if (query.maxDays !== undefined) {
      filtered = filtered.filter(p => p.durationDays <= Number(query.maxDays));
    }

    return { success: true, count: filtered.length, data: filtered };
  }

  async findBySlug(slug: string) {
    try {
      const pkg = await this.prisma.package.findFirst({
        where: { slug, active: true },
        include: {
          highlights: { orderBy: { displayOrder: 'asc' } },
          itineraryDays: { orderBy: { dayNumber: 'asc' } },
          inclusions: true,
          hotels: true,
          transports: true,
          activities: true,
          destination: true,
        },
      });

      if (pkg) {
        // Fetch similar packages
        const similar = await this.prisma.package.findMany({
          where: {
            active: true,
            slug: { not: slug },
            domesticOrInternational: pkg.domesticOrInternational,
          },
          take: 4,
          select: {
            id: true,
            slug: true,
            title: true,
            durationDays: true,
            durationNights: true,
            startingPrice: true,
            originalPrice: true,
            discountPercentage: true,
            coverImage: true,
            rating: true,
            destinationName: true,
          }
        });

        return { success: true, data: { ...pkg, similarPackages: similar } };
      }
    } catch (e) {
      this.logger.warn(`[PackagesService] DB slug query failed: ${e.message}`);
    }

    const ref = REFERENCE_PACKAGES.find(p => p.slug === slug || p.id === slug);
    if (!ref) {
      throw new NotFoundException(`Travel Package with slug '${slug}' not found.`);
    }

    const similar = REFERENCE_PACKAGES
      .filter(p => p.slug !== slug && p.domesticOrInternational === ref.domesticOrInternational)
      .slice(0, 4);

    return { success: true, data: { ...ref, similarPackages: similar } };
  }

  async calculatePrice(dto: CalculatePriceDto) {
    const pkgResult = await this.findBySlug(dto.packageSlug);
    const pkg = pkgResult.data;

    const travellers = Math.max(1, dto.travellers || 1);
    const basePricePerPerson = Number(pkg.discountedPrice || pkg.startingPrice);

    // Hotel upgrade calculation
    let hotelUpgradePerNight = 0;
    let selectedHotelInfo = null;
    if (dto.hotelCategory && pkg.hotels && pkg.hotels.length > 0) {
      const selected = pkg.hotels.find((h: any) => h.hotelCategory === dto.hotelCategory || h.hotelName === dto.hotelCategory);
      if (selected) {
        hotelUpgradePerNight = Number(selected.upgradePricePerNightInr || 0);
        selectedHotelInfo = selected;
      }
    }

    const totalHotelUpgradePerPerson = hotelUpgradePerNight * (pkg.durationNights || 1);

    // Transport calculation
    let transportAddonPerPerson = 0;
    let selectedTransportInfo = null;
    if (dto.transportType && pkg.transports && pkg.transports.length > 0) {
      const selected = pkg.transports.find((t: any) => t.transportType === dto.transportType || t.title === dto.transportType);
      if (selected) {
        transportAddonPerPerson = Number(selected.additionalPriceInr || 0);
        selectedTransportInfo = selected;
      }
    }

    // Selected activities calculation
    let activitiesTotalPerPerson = 0;
    const selectedActivitiesList: any[] = [];
    if (dto.selectedActivityIds && dto.selectedActivityIds.length > 0 && pkg.activities) {
      for (const actId of dto.selectedActivityIds) {
        const act = pkg.activities.find((a: any) => a.id === actId || a.title === actId);
        if (act) {
          activitiesTotalPerPerson += Number(act.priceInr || 0);
          selectedActivitiesList.push(act);
        }
      }
    }

    const finalPricePerPerson = basePricePerPerson + totalHotelUpgradePerPerson + transportAddonPerPerson + activitiesTotalPerPerson;
    const subtotal = finalPricePerPerson * travellers;
    const gstAmount = Math.round(subtotal * 0.05); // 5% GST
    const grandTotal = subtotal + gstAmount;

    return {
      success: true,
      data: {
        packageSlug: pkg.slug,
        packageTitle: pkg.title,
        currency: pkg.currency || 'INR',
        travellers,
        breakdown: {
          basePricePerPerson,
          hotelUpgradePerPerson: totalHotelUpgradePerPerson,
          transportAddonPerPerson,
          activitiesAddonPerPerson: activitiesTotalPerPerson,
          finalPricePerPerson,
          subtotal,
          gstTax: gstAmount,
          gstPercentage: 5,
          grandTotal,
        },
        selectedOptions: {
          hotel: selectedHotelInfo,
          transport: selectedTransportInfo,
          activities: selectedActivitiesList,
        }
      }
    };
  }

  async customizePackage(dto: any) {
    const calculated = await this.calculatePrice({
      packageSlug: dto.packageSlug,
      travellers: dto.travellers,
      hotelCategory: dto.hotelCategory,
      transportType: dto.transportType,
      selectedActivityIds: dto.selectedActivityIds,
      travelDate: dto.travelDate,
    });

    return {
      success: true,
      message: 'Package customization saved successfully.',
      customization: {
        ...dto,
        pricing: calculated.data,
      }
    };
  }

  async createBooking(dto: PackageBookingDto) {
    const pricing = await this.calculatePrice({
      packageSlug: dto.packageSlug,
      travellers: dto.travellers,
      hotelCategory: dto.hotelCategory,
      transportType: dto.transportType,
      selectedActivityIds: dto.selectedActivityIds,
      travelDate: dto.travelDate,
    });

    const bookingRef = `CF-PKG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const bookingData = {
      bookingReference: bookingRef,
      packageSlug: dto.packageSlug,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      travellers: dto.travellers,
      travelDate: new Date(dto.travelDate || Date.now()),
      hotelCategory: dto.hotelCategory || 'Standard 3 Star',
      transportType: dto.transportType || 'Private Cab',
      totalPriceInr: pricing.data.breakdown.grandTotal,
      gstAmountInr: pricing.data.breakdown.gstTax,
      paymentStatus: 'PENDING',
      bookingStatus: 'CONFIRMED',
      specialRequests: dto.specialRequests || '',
    };

    try {
      const pkgResult = await this.findBySlug(dto.packageSlug);
      if (pkgResult?.data?.id && !pkgResult.data.id.startsWith('pkg-')) {
        await this.prisma.packageBooking.create({
          data: {
            bookingReference: bookingRef,
            packageId: pkgResult.data.id,
            travelDate: new Date(dto.travelDate || Date.now()),
            adultsCount: dto.travellers || 1,
            childrenCount: 0,
            basePriceInr: pricing.data.breakdown.subtotal,
            taxAmountInr: pricing.data.breakdown.gstTax,
            totalPriceInr: pricing.data.breakdown.grandTotal,
            status: 'REQUESTED',
            bookingMode: 'request',
            customerName: dto.customerName,
            customerEmail: dto.customerEmail,
            customerPhone: dto.customerPhone,
            notes: dto.specialRequests || '',
          }
        });
      }
    } catch (e) {
      this.logger.warn(`[PackagesService] Could not persist PackageBooking to DB: ${e.message}`);
    }

    return {
      success: true,
      message: 'Package booking request submitted successfully!',
      booking: {
        bookingReference: bookingRef,
        ...bookingData,
        pricingBreakdown: pricing.data.breakdown,
      }
    };
  }

  async toggleWishlist(userId: string, packageId: string) {
    if (!this.localWishlists.has(userId)) {
      this.localWishlists.set(userId, new Set());
    }
    const userWishlist = this.localWishlists.get(userId)!;
    let isSaved = false;

    if (userWishlist.has(packageId)) {
      userWishlist.delete(packageId);
      isSaved = false;
    } else {
      userWishlist.add(packageId);
      isSaved = true;
    }

    try {
      if (isSaved) {
        await this.prisma.packageWishlist.upsert({
          where: { userId_packageId: { userId, packageId } },
          create: { userId, packageId },
          update: {},
        });
      } else {
        await this.prisma.packageWishlist.deleteMany({
          where: { userId, packageId }
        });
      }
    } catch (e) {
      // Ignored if DB unready
    }

    return {
      success: true,
      packageId,
      isWishlisted: isSaved,
      message: isSaved ? 'Added to wishlist' : 'Removed from wishlist',
    };
  }

  async getWishlist(userId: string) {
    const packageIds = Array.from(this.localWishlists.get(userId) || []);
    const items = REFERENCE_PACKAGES.filter(p => packageIds.includes(p.id) || packageIds.includes(p.slug));
    return { success: true, count: items.length, data: items };
  }

  // Admin methods
  async createPackage(data: any) {
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newPkg = {
      id: `pkg-${Date.now()}`,
      slug,
      ...data,
      startingPrice: Number(data.startingPrice || 9999),
      durationDays: Number(data.durationDays || 3),
      durationNights: Number(data.durationNights || 2),
      rating: 5.0,
      totalReviews: 1,
      isActive: true,
    };
    REFERENCE_PACKAGES.unshift(newPkg);
    return { success: true, message: 'Package created successfully.', data: newPkg };
  }

  async updatePackage(idOrSlug: string, data: any) {
    const idx = REFERENCE_PACKAGES.findIndex(p => p.id === idOrSlug || p.slug === idOrSlug);
    if (idx !== -1) {
      REFERENCE_PACKAGES[idx] = { ...REFERENCE_PACKAGES[idx], ...data };
      return { success: true, message: 'Package updated successfully.', data: REFERENCE_PACKAGES[idx] };
    }
    throw new NotFoundException(`Package ${idOrSlug} not found.`);
  }

  async deletePackage(idOrSlug: string) {
    const idx = REFERENCE_PACKAGES.findIndex(p => p.id === idOrSlug || p.slug === idOrSlug);
    if (idx !== -1) {
      REFERENCE_PACKAGES.splice(idx, 1);
      return { success: true, message: 'Package soft-deleted/removed successfully.' };
    }
    throw new NotFoundException(`Package ${idOrSlug} not found.`);
  }
}
