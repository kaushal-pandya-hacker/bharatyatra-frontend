import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

// Alias lookup dictionary for fuzzy city & historical names
const ALIAS_MAP: Record<string, string> = {
  bangalore: 'bengaluru',
  bombay: 'mumbai',
  calcutta: 'kolkata',
  madras: 'chennai',
  trivandrum: 'thiruvananthapuram',
  cochin: 'kochi',
  baroda: 'vadodara',
  poona: 'pune',
  waltair: 'visakhapatnam',
  vizag: 'visakhapatnam',
  banaras: 'varanasi',
  kashi: 'varanasi',
  kevadia: 'ekta-nagar',
  gauhati: 'guwahati',
  pondicherry: 'puducherry',
};

@Injectable()
export class DestinationsService {
  private fallbackMasterData: any = null;

  constructor(private readonly prisma: PrismaService) {
    this.loadFallbackMasterData();
  }

  private loadFallbackMasterData() {
    try {
      const masterPath = path.resolve(__dirname, '../../../../08_TRAVEL_DATA/India/india_master_data.json');
      if (fs.existsSync(masterPath)) {
        const raw = fs.readFileSync(masterPath, 'utf-8');
        this.fallbackMasterData = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[DestinationsService] Master JSON load notice:', e);
    }
  }

  private resolveAlias(term: string): string {
    const clean = term.toLowerCase().trim();
    return ALIAS_MAP[clean] || clean;
  }

  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private getAllFallbackDestinations(): any[] {
    const states = this.fallbackMasterData?.states || [];
    const list: any[] = [];
    for (const state of states) {
      for (const dest of state.destinations || []) {
        list.push({
          id: dest.slug,
          name: dest.name,
          slug: dest.slug,
          state: state.name,
          region: state.name,
          country: 'India',
          category: dest.category,
          subCategory: dest.subCategory,
          description: dest.description,
          shortDescription: dest.shortDescription,
          primaryImageUrl: dest.primaryImageUrl,
          heroImageUrl: dest.primaryImageUrl,
          images: [dest.primaryImageUrl],
          rating: 4.8,
          totalReviews: 120,
          recommendedDays: dest.recommendedDays || 2,
          estimatedBudget: dest.estimatedBudget || 15000,
          entryFee: dest.entryFee || 0,
          currency: 'INR',
          latitude: dest.latitude,
          longitude: dest.longitude,
          bestTimeToVisit: dest.bestTimeToVisit,
          isUNESCO: dest.isUNESCO || false,
          isHeritage: dest.isHeritage || false,
          isReligious: dest.isReligious || false,
          isWildlife: dest.isWildlife || false,
          isNature: dest.isNature || false,
          isAdventure: dest.isAdventure || false,
          isBeach: dest.isBeach || false,
          isFamilyFriendly: dest.isFamilyFriendly ?? true,
          permitRequired: dest.permitRequired || false,
          popularityScore: dest.popularityScore || 9.0,
          isFeatured: dest.isFeatured || false,
          aliases: dest.aliases || [],
          status: 'ACTIVE',
          isActive: true,
          attractions: [],
          activities: [],
          hotels: [],
          restaurants: [],
        });
      }
    }
    return list;
  }

  async findAll(params: {
    state?: string;
    region?: string;
    category?: string;
    subCategory?: string;
    search?: string;
    isUNESCO?: boolean;
    isHeritage?: boolean;
    isReligious?: boolean;
    isWildlife?: boolean;
    isNature?: boolean;
    isAdventure?: boolean;
    isBeach?: boolean;
    permitRequired?: boolean;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = Number(params.limit) || 100;
    const offset = Number(params.offset) || 0;

    try {
      const whereClause: any = { isActive: true };

      if (params.state && params.state !== 'ALL') {
        whereClause.state = { contains: params.state, mode: 'insensitive' };
      }
      if (params.region && params.region !== 'ALL') {
        whereClause.region = { contains: params.region, mode: 'insensitive' };
      }
      if (params.category && params.category !== 'ALL') {
        whereClause.category = { contains: params.category, mode: 'insensitive' };
      }
      if (params.subCategory) {
        whereClause.subCategory = { contains: params.subCategory, mode: 'insensitive' };
      }
      if (params.isUNESCO) whereClause.isUNESCO = true;
      if (params.isHeritage) whereClause.isHeritage = true;
      if (params.isReligious) whereClause.isReligious = true;
      if (params.isWildlife) whereClause.isWildlife = true;
      if (params.isNature) whereClause.isNature = true;
      if (params.isAdventure) whereClause.isAdventure = true;
      if (params.isBeach) whereClause.isBeach = true;
      if (params.permitRequired !== undefined) whereClause.permitRequired = String(params.permitRequired) === 'true';

      if (params.search) {
        const queryRaw = params.search.trim();
        const resolvedQuery = this.resolveAlias(queryRaw);
        whereClause.OR = [
          { name: { contains: resolvedQuery, mode: 'insensitive' } },
          { slug: { contains: resolvedQuery, mode: 'insensitive' } },
          { state: { contains: resolvedQuery, mode: 'insensitive' } },
          { region: { contains: resolvedQuery, mode: 'insensitive' } },
          { category: { contains: resolvedQuery, mode: 'insensitive' } },
          { description: { contains: resolvedQuery, mode: 'insensitive' } },
          { aliases: { has: resolvedQuery } },
        ];
      }

      if (this.prisma.isDatabaseConnected) {
        const [destinations, total] = await Promise.all([
          this.prisma.destination.findMany({
            where: whereClause,
            take: limit,
            skip: offset,
            orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
          }),
          this.prisma.destination.count({ where: whereClause }),
        ]);

        if (destinations && destinations.length > 0) {
          return {
            success: true,
            data: destinations,
            meta: { total, count: destinations.length, limit, offset },
          };
        }
      }
    } catch (e) {
      // Fallback
    }

    // In-memory fallback dataset query
    let items = this.getAllFallbackDestinations();
    if (params.state && params.state !== 'ALL') {
      items = items.filter(d => d.state.toLowerCase().includes(params.state!.toLowerCase()));
    }
    if (params.category && params.category !== 'ALL') {
      items = items.filter(d => d.category.toLowerCase().includes(params.category!.toLowerCase()));
    }
    if (params.isUNESCO) items = items.filter(d => d.isUNESCO);
    if (params.isHeritage) items = items.filter(d => d.isHeritage);
    if (params.isReligious) items = items.filter(d => d.isReligious);
    if (params.isWildlife) items = items.filter(d => d.isWildlife);
    if (params.isNature) items = items.filter(d => d.isNature);
    if (params.isAdventure) items = items.filter(d => d.isAdventure);
    if (params.isBeach) items = items.filter(d => d.isBeach);
    if (params.permitRequired !== undefined) {
      items = items.filter(d => d.permitRequired === (String(params.permitRequired) === 'true'));
    }

    if (params.search) {
      const queryRaw = params.search.trim().toLowerCase();
      const resolved = this.resolveAlias(queryRaw);
      items = items.filter(
        d =>
          d.name.toLowerCase().includes(queryRaw) ||
          d.name.toLowerCase().includes(resolved) ||
          d.slug.toLowerCase().includes(queryRaw) ||
          d.state.toLowerCase().includes(queryRaw) ||
          d.category.toLowerCase().includes(queryRaw) ||
          (d.aliases || []).some((a: string) => a.toLowerCase().includes(queryRaw) || a.toLowerCase().includes(resolved))
      );
    }

    const sliced = items.slice(offset, offset + limit);
    return {
      success: true,
      data: sliced,
      meta: { total: items.length, count: sliced.length, limit, offset },
    };
  }

  async searchGlobal(queryStr: string) {
    if (!queryStr || !queryStr.trim()) {
      return { success: true, data: [] };
    }
    const clean = queryStr.trim().toLowerCase();
    const resolved = this.resolveAlias(clean);

    // Search destinations
    const destRes = await this.findAll({ search: resolved, limit: 30 });
    return {
      success: true,
      searchTerm: queryStr,
      resolvedAlias: resolved !== clean ? resolved : null,
      results: destRes.data,
    };
  }

  async findNearby(lat: number, lng: number, radiusKm = 150) {
    const all = await this.findAll({ limit: 500 });
    const withDistance = (all.data || [])
      .filter((d: any) => d.latitude != null && d.longitude != null)
      .map((d: any) => {
        const dist = this.calculateDistanceKm(lat, lng, Number(d.latitude), Number(d.longitude));
        return { ...d, distanceKm: Math.round(dist * 10) / 10 };
      })
      .filter((d: any) => d.distanceKm <= radiusKm)
      .sort((a: any, b: any) => a.distanceKm - b.distanceKm);

    return {
      success: true,
      origin: { lat, lng },
      radiusKm,
      count: withDistance.length,
      data: withDistance,
    };
  }

  async findBySlug(slug: string) {
    const normalizedSlug = slug.toLowerCase().trim();
    try {
      const destination = await this.prisma.destination.findUnique({
        where: { slug: normalizedSlug },
        include: {
          gallery: { orderBy: { displayOrder: 'asc' } },
          attractions: { orderBy: { name: 'asc' } },
          activities: { where: { status: 'ACTIVE' }, orderBy: { title: 'asc' } },
          hotels: { where: { status: 'ACTIVE' }, orderBy: { pricePerNight: 'asc' } },
          restaurants: { where: { status: 'ACTIVE' }, orderBy: { rating: 'desc' } },
        },
      });

      if (destination) {
        return destination;
      }
    } catch (e) {
      // Fallback
    }

    const fallbackList = this.getAllFallbackDestinations();
    const found = fallbackList.find((d: any) => d.slug === normalizedSlug);
    if (!found) {
      throw new NotFoundException(`Destination with slug '${slug}' not found`);
    }

    return found;
  }

  async findAttractionsBySlug(slug: string) {
    const destination = await this.findBySlug(slug);
    return {
      success: true,
      data: destination.attractions || [],
    };
  }

  async findActivitiesBySlug(slug: string, filters?: { category?: string; maxPrice?: any; duration?: any }) {
    const destination = await this.findBySlug(slug);
    let activities = (destination.activities || []).filter((a: any) => !a.status || a.status === 'ACTIVE');

    if (filters?.category) {
      const cat = String(filters.category).toLowerCase();
      activities = activities.filter((a: any) => a.category.toLowerCase().includes(cat));
    }
    if (filters?.maxPrice !== undefined && filters?.maxPrice !== null && !isNaN(Number(filters.maxPrice))) {
      const maxP = Number(filters.maxPrice);
      activities = activities.filter((a: any) => Number(a.priceInr) <= maxP);
    }

    return {
      success: true,
      data: activities,
    };
  }

  async findHotelsBySlug(slug: string, filters?: { minPrice?: any; maxPrice?: any; starRating?: any; category?: string }) {
    const destination = await this.findBySlug(slug);
    let hotels = (destination.hotels || []).filter((h: any) => !h.status || h.status === 'ACTIVE');

    if (filters?.minPrice !== undefined && filters?.minPrice !== null && !isNaN(Number(filters.minPrice))) {
      const minP = Number(filters.minPrice);
      hotels = hotels.filter((h: any) => Number(h.pricePerNight) >= minP);
    }
    if (filters?.maxPrice !== undefined && filters?.maxPrice !== null && !isNaN(Number(filters.maxPrice))) {
      const maxP = Number(filters.maxPrice);
      hotels = hotels.filter((h: any) => Number(h.pricePerNight) <= maxP);
    }

    return {
      success: true,
      data: hotels,
    };
  }

  async findRestaurantsBySlug(slug: string, filters?: { cuisine?: string; priceRange?: string; minRating?: any }) {
    const destination = await this.findBySlug(slug);
    let restaurants = (destination.restaurants || []).filter((r: any) => !r.status || r.status === 'ACTIVE');

    if (filters?.cuisine) {
      const c = String(filters.cuisine).toLowerCase();
      restaurants = restaurants.filter((r: any) => (r.cuisineType || '').toLowerCase().includes(c));
    }

    return {
      success: true,
      data: restaurants,
    };
  }

  async findHotelById(id: string) {
    try {
      const hotel = await this.prisma.hotel.findUnique({ where: { id } });
      if (hotel) return { success: true, data: hotel };
    } catch (e) {}
    return { success: true, data: null };
  }

  async findRestaurantById(id: string) {
    try {
      const restaurant = await this.prisma.restaurant.findUnique({ where: { id } });
      if (restaurant) return { success: true, data: restaurant };
    } catch (e) {}
    return { success: true, data: null };
  }

  async findActivityById(id: string) {
    try {
      const activity = await this.prisma.activity.findUnique({ where: { id } });
      if (activity) return { success: true, data: activity };
    } catch (e) {}
    return { success: true, data: null };
  }
}
