import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DestinationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    region?: string;
    category?: string;
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = Number(params.limit) || 50;
    const offset = Number(params.offset) || 0;

    const whereClause: any = {
      isActive: true,
    };

    if (params.region && params.region !== 'ALL') {
      whereClause.region = params.region;
    }

    if (params.category) {
      whereClause.category = { contains: params.category, mode: 'insensitive' };
    }

    if (params.status) {
      whereClause.status = params.status;
    }

    if (params.search) {
      const query = params.search.trim();
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { shortDescription: { contains: query, mode: 'insensitive' } },
        { tagline: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [destinations, total] = await Promise.all([
      this.prisma.destination.findMany({
        where: whereClause,
        take: limit,
        skip: offset,
        orderBy: { rating: 'desc' },
      }),
      this.prisma.destination.count({ where: whereClause }),
    ]);

    return {
      success: true,
      data: destinations,
      meta: {
        total,
        count: destinations.length,
        limit,
        offset,
      },
    };
  }

  async findBySlug(slug: string) {
    const normalizedSlug = slug.toLowerCase().trim();
    const destination = await this.prisma.destination.findUnique({
      where: { slug: normalizedSlug },
      include: {
        attractions: { orderBy: { name: 'asc' } },
        activities: { where: { status: 'ACTIVE' }, orderBy: { title: 'asc' } },
        hotels: { where: { status: 'ACTIVE' }, orderBy: { pricePerNight: 'asc' } },
        restaurants: { where: { status: 'ACTIVE' }, orderBy: { rating: 'desc' } },
      },
    });

    if (!destination) {
      const fallback = await this.prisma.destination.findFirst({
        where: {
          slug: { equals: normalizedSlug, mode: 'insensitive' },
        },
        include: {
          attractions: { orderBy: { name: 'asc' } },
          activities: { where: { status: 'ACTIVE' }, orderBy: { title: 'asc' } },
          hotels: { where: { status: 'ACTIVE' }, orderBy: { pricePerNight: 'asc' } },
          restaurants: { where: { status: 'ACTIVE' }, orderBy: { rating: 'desc' } },
        },
      });

      if (!fallback) {
        throw new NotFoundException(`Destination with slug '${slug}' not found`);
      }
      return fallback;
    }

    return destination;
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
    let activities = (destination.activities || []).filter(a => !a.status || a.status === 'ACTIVE');

    if (filters?.category) {
      const cat = String(filters.category).toLowerCase();
      activities = activities.filter(a => a.category.toLowerCase().includes(cat));
    }
    if (filters?.maxPrice !== undefined && filters?.maxPrice !== null && !isNaN(Number(filters.maxPrice))) {
      const maxP = Number(filters.maxPrice);
      activities = activities.filter(a => Number(a.priceInr) <= maxP);
    }
    if (filters?.duration !== undefined && filters?.duration !== null && !isNaN(Number(filters.duration))) {
      const maxDur = Number(filters.duration);
      activities = activities.filter(a => (a.durationMinutes || 60) <= maxDur);
    }

    return {
      success: true,
      data: activities,
    };
  }

  async findHotelsBySlug(slug: string, filters?: { minPrice?: any; maxPrice?: any; starRating?: any; category?: string }) {
    const destination = await this.findBySlug(slug);
    let hotels = (destination.hotels || []).filter(h => !h.status || h.status === 'ACTIVE');

    if (filters?.minPrice !== undefined && filters?.minPrice !== null && !isNaN(Number(filters.minPrice))) {
      const minP = Number(filters.minPrice);
      hotels = hotels.filter(h => Number(h.pricePerNight) >= minP);
    }
    if (filters?.maxPrice !== undefined && filters?.maxPrice !== null && !isNaN(Number(filters.maxPrice))) {
      const maxP = Number(filters.maxPrice);
      hotels = hotels.filter(h => Number(h.pricePerNight) <= maxP);
    }
    if (filters?.starRating !== undefined && filters?.starRating !== null && !isNaN(Number(filters.starRating))) {
      const minStar = Number(filters.starRating);
      hotels = hotels.filter(h => h.starRating >= minStar);
    }
    if (filters?.category) {
      const cat = String(filters.category).toLowerCase();
      hotels = hotels.filter(h => h.category.toLowerCase().includes(cat));
    }

    return {
      success: true,
      data: hotels,
    };
  }

  async findRestaurantsBySlug(slug: string, filters?: { cuisine?: string; priceRange?: string; minRating?: any }) {
    const destination = await this.findBySlug(slug);
    let restaurants = (destination.restaurants || []).filter(r => !r.status || r.status === 'ACTIVE');

    if (filters?.cuisine) {
      const cuis = String(filters.cuisine).toLowerCase();
      restaurants = restaurants.filter(r => r.cuisineType.toLowerCase().includes(cuis));
    }
    if (filters?.priceRange) {
      const pr = String(filters.priceRange).toLowerCase();
      restaurants = restaurants.filter(r => r.priceRange.toLowerCase() === pr);
    }
    if (filters?.minRating !== undefined && filters?.minRating !== null && !isNaN(Number(filters.minRating))) {
      const minR = Number(filters.minRating);
      restaurants = restaurants.filter(r => Number(r.rating) >= minR);
    }

    return {
      success: true,
      data: restaurants,
    };
  }

  async findHotelById(id: string) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id },
      include: { destination: true },
    });
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID '${id}' not found`);
    }
    return { success: true, data: hotel };
  }

  async findRestaurantById(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: { destination: true },
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID '${id}' not found`);
    }
    return { success: true, data: restaurant };
  }

  async findActivityById(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: { destination: true },
    });
    if (!activity) {
      throw new NotFoundException(`Activity with ID '${id}' not found`);
    }
    return { success: true, data: activity };
  }
}
