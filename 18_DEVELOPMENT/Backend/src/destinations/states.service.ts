import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StatesService {
  private fallbackData: any = null;

  constructor(private readonly prisma: PrismaService) {
    this.loadFallbackMasterData();
  }

  private loadFallbackMasterData() {
    try {
      const masterPath = path.resolve(__dirname, '../../../../08_TRAVEL_DATA/India/india_master_data.json');
      if (fs.existsSync(masterPath)) {
        const raw = fs.readFileSync(masterPath, 'utf-8');
        this.fallbackData = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[StatesService] Fallback master JSON load notice:', e);
    }
  }

  async findAllStates(query?: { type?: string; search?: string }) {
    try {
      const whereClause: any = { isActive: true };
      if (query?.type && query.type !== 'ALL') {
        whereClause.type = query.type;
      }
      if (query?.search) {
        const term = query.search.trim().toLowerCase();
        whereClause.OR = [
          { name: { contains: term, mode: 'insensitive' } },
          { slug: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { capital: { contains: term, mode: 'insensitive' } },
        ];
      }

      const states = await this.prisma.state.findMany({
        where: whereClause,
        orderBy: [{ type: 'asc' }, { displayOrder: 'asc' }, { name: 'asc' }],
        include: {
          _count: {
            select: { destinations: true, cities: true, districts: true },
          },
        },
      });

      if (states && states.length > 0) {
        return { success: true, count: states.length, data: states };
      }
    } catch (err) {
      console.warn('[StatesService] Database query notice, using structured fallback data');
    }

    // Structured in-memory fallback
    let fallbackStates = this.fallbackData?.states || [];
    if (query?.type && query.type !== 'ALL') {
      fallbackStates = fallbackStates.filter((s: any) => s.type === query.type);
    }
    if (query?.search) {
      const term = query.search.trim().toLowerCase();
      fallbackStates = fallbackStates.filter(
        (s: any) =>
          s.name.toLowerCase().includes(term) ||
          s.slug.toLowerCase().includes(term) ||
          (s.capital && s.capital.toLowerCase().includes(term))
      );
    }

    const formatted = fallbackStates.map((s: any) => ({
      id: s.slug,
      name: s.name,
      slug: s.slug,
      code: s.code,
      type: s.type,
      capital: s.capital,
      description: s.description,
      shortDescription: s.shortDescription,
      latitude: s.latitude,
      longitude: s.longitude,
      coverImage: s.coverImage,
      isActive: true,
      _count: {
        destinations: (s.destinations || []).length,
        cities: (s.cities || []).length,
        districts: (s.districts || []).length,
      },
    }));

    return { success: true, count: formatted.length, data: formatted };
  }

  async findStateBySlug(slug: string) {
    const normalized = slug.toLowerCase().trim();
    try {
      const state = await this.prisma.state.findUnique({
        where: { slug: normalized },
        include: {
          districts: { where: { isActive: true }, orderBy: { name: 'asc' } },
          cities: { where: { isActive: true }, orderBy: { name: 'asc' } },
          destinations: {
            where: { isActive: true },
            orderBy: [{ popularityScore: 'desc' }, { rating: 'desc' }],
          },
        },
      });

      if (state) {
        return { success: true, data: state };
      }
    } catch (e) {
      // Fallback below
    }

    const fallbackStates = this.fallbackData?.states || [];
    const found = fallbackStates.find((s: any) => s.slug === normalized);
    if (!found) {
      throw new NotFoundException(`State with slug '${slug}' not found`);
    }

    return {
      success: true,
      data: {
        id: found.slug,
        name: found.name,
        slug: found.slug,
        code: found.code,
        type: found.type,
        capital: found.capital,
        description: found.description,
        latitude: found.latitude,
        longitude: found.longitude,
        coverImage: found.coverImage,
        isActive: true,
        districts: found.districts || [],
        cities: found.cities || [],
        destinations: found.destinations || [],
      },
    };
  }

  async findStateDistricts(slug: string) {
    const stateObj = await this.findStateBySlug(slug);
    return { success: true, data: stateObj.data.districts || [] };
  }

  async findStateCities(slug: string) {
    const stateObj = await this.findStateBySlug(slug);
    return { success: true, data: stateObj.data.cities || [] };
  }

  async findStateDestinations(slug: string, filters?: { category?: string; isFeatured?: boolean }) {
    const stateObj = await this.findStateBySlug(slug);
    let destinations = stateObj.data.destinations || [];

    if (filters?.category) {
      const cat = filters.category.toLowerCase();
      destinations = destinations.filter((d: any) => d.category?.toLowerCase().includes(cat));
    }
    if (filters?.isFeatured) {
      destinations = destinations.filter((d: any) => d.isFeatured === true);
    }

    return { success: true, count: destinations.length, data: destinations };
  }
}
