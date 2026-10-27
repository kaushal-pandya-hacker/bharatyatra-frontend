import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export interface ImportStateInput {
  name: string;
  slug: string;
  code?: string;
  type: 'STATE' | 'UNION_TERRITORY';
  capital?: string;
  description?: string;
  shortDescription?: string;
  latitude?: number;
  longitude?: number;
  coverImage?: string;
  districts?: Array<{
    name: string;
    slug: string;
    description?: string;
    latitude?: number;
    longitude?: number;
  }>;
  cities?: Array<{
    name: string;
    slug: string;
    districtSlug?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    coverImage?: string;
    isPopular?: boolean;
  }>;
  destinations?: Array<{
    name: string;
    slug: string;
    citySlug?: string;
    districtSlug?: string;
    category: string;
    subCategory?: string;
    description: string;
    shortDescription?: string;
    tagline?: string;
    overview?: string;
    primaryImageUrl: string;
    heroImageUrl?: string;
    images?: string[];
    latitude?: number;
    longitude?: number;
    bestTimeToVisit?: string;
    recommendedDays?: number;
    estimatedBudget?: number;
    entryFee?: number;
    currency?: string;
    openingTime?: string;
    closingTime?: string;
    isUNESCO?: boolean;
    isHeritage?: boolean;
    isReligious?: boolean;
    isWildlife?: boolean;
    isNature?: boolean;
    isAdventure?: boolean;
    isBeach?: boolean;
    isFamilyFriendly?: boolean;
    permitRequired?: boolean;
    permitType?: string;
    accessRestriction?: string;
    seasonalClosure?: string;
    specialInstructions?: string;
    popularityScore?: number;
    isFeatured?: boolean;
    aliases?: string[];
  }>;
}

export class TourismImportPipeline {
  /**
   * Imports master states, districts, cities, and destinations into the database cleanly.
   */
  public async importFromMasterJson(filePath: string): Promise<{
    statesImported: number;
    districtsImported: number;
    citiesImported: number;
    destinationsImported: number;
  }> {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(rawData);
    const statesList: ImportStateInput[] = parsed.states || [];

    let statesCount = 0;
    let districtsCount = 0;
    let citiesCount = 0;
    let destinationsCount = 0;

    for (const stateData of statesList) {
      // 1. Upsert State
      const stateRecord = await prisma.state.upsert({
        where: { slug: stateData.slug },
        update: {
          name: stateData.name,
          code: stateData.code,
          type: stateData.type,
          capital: stateData.capital,
          description: stateData.description,
          shortDescription: stateData.shortDescription,
          latitude: stateData.latitude,
          longitude: stateData.longitude,
          coverImage: stateData.coverImage,
          isActive: true,
        },
        create: {
          name: stateData.name,
          slug: stateData.slug,
          code: stateData.code,
          type: stateData.type,
          capital: stateData.capital,
          description: stateData.description,
          shortDescription: stateData.shortDescription,
          latitude: stateData.latitude,
          longitude: stateData.longitude,
          coverImage: stateData.coverImage,
          isActive: true,
        },
      });
      statesCount++;

      // Map for tracking district & city DB IDs by slug
      const districtIdMap = new Map<string, string>();
      const cityIdMap = new Map<string, string>();

      // 2. Upsert Districts
      if (stateData.districts) {
        for (const dist of stateData.districts) {
          const districtRecord = await prisma.district.upsert({
            where: { slug: dist.slug },
            update: {
              name: dist.name,
              stateId: stateRecord.id,
              description: dist.description,
              latitude: dist.latitude,
              longitude: dist.longitude,
              isActive: true,
            },
            create: {
              stateId: stateRecord.id,
              name: dist.name,
              slug: dist.slug,
              description: dist.description,
              latitude: dist.latitude,
              longitude: dist.longitude,
              isActive: true,
            },
          });
          districtIdMap.set(dist.slug, districtRecord.id);
          districtsCount++;
        }
      }

      // 3. Upsert Cities
      if (stateData.cities) {
        for (const city of stateData.cities) {
          const districtId = city.districtSlug ? districtIdMap.get(city.districtSlug) || null : null;
          const cityRecord = await prisma.city.upsert({
            where: { slug: city.slug },
            update: {
              stateId: stateRecord.id,
              districtId,
              name: city.name,
              description: city.description,
              latitude: city.latitude,
              longitude: city.longitude,
              coverImage: city.coverImage,
              isPopular: city.isPopular ?? false,
              isActive: true,
            },
            create: {
              stateId: stateRecord.id,
              districtId,
              name: city.name,
              slug: city.slug,
              description: city.description,
              latitude: city.latitude,
              longitude: city.longitude,
              coverImage: city.coverImage,
              isPopular: city.isPopular ?? false,
              isActive: true,
            },
          });
          cityIdMap.set(city.slug, cityRecord.id);
          citiesCount++;
        }
      }

      // 4. Upsert Destinations
      if (stateData.destinations) {
        for (const dest of stateData.destinations) {
          const districtId = dest.districtSlug ? districtIdMap.get(dest.districtSlug) || null : null;
          const cityId = dest.citySlug ? cityIdMap.get(dest.citySlug) || null : null;

          await prisma.destination.upsert({
            where: { slug: dest.slug },
            update: {
              name: dest.name,
              stateId: stateRecord.id,
              districtId,
              cityId,
              state: stateRecord.name,
              country: 'India',
              category: dest.category,
              subCategory: dest.subCategory,
              description: dest.description,
              shortDescription: dest.shortDescription,
              tagline: dest.tagline,
              overview: dest.overview,
              primaryImageUrl: dest.primaryImageUrl,
              heroImageUrl: dest.heroImageUrl || dest.primaryImageUrl,
              images: dest.images || [dest.primaryImageUrl],
              latitude: dest.latitude,
              longitude: dest.longitude,
              bestTimeToVisit: dest.bestTimeToVisit,
              recommendedDays: dest.recommendedDays || 2,
              estimatedBudget: dest.estimatedBudget || 15000.0,
              entryFee: dest.entryFee ?? 0.0,
              currency: dest.currency || 'INR',
              openingTime: dest.openingTime,
              closingTime: dest.closingTime,
              isUNESCO: dest.isUNESCO ?? false,
              isHeritage: dest.isHeritage ?? false,
              isReligious: dest.isReligious ?? false,
              isWildlife: dest.isWildlife ?? false,
              isNature: dest.isNature ?? false,
              isAdventure: dest.isAdventure ?? false,
              isBeach: dest.isBeach ?? false,
              isFamilyFriendly: dest.isFamilyFriendly ?? true,
              permitRequired: dest.permitRequired ?? false,
              permitType: dest.permitType,
              accessRestriction: dest.accessRestriction,
              seasonalClosure: dest.seasonalClosure,
              specialInstructions: dest.specialInstructions,
              popularityScore: dest.popularityScore || 9.0,
              isFeatured: dest.isFeatured ?? false,
              aliases: dest.aliases || [],
              status: 'ACTIVE',
              isActive: true,
            },
            create: {
              name: dest.name,
              slug: dest.slug,
              stateId: stateRecord.id,
              districtId,
              cityId,
              state: stateRecord.name,
              country: 'India',
              category: dest.category,
              subCategory: dest.subCategory,
              description: dest.description,
              shortDescription: dest.shortDescription,
              tagline: dest.tagline,
              overview: dest.overview,
              primaryImageUrl: dest.primaryImageUrl,
              heroImageUrl: dest.heroImageUrl || dest.primaryImageUrl,
              images: dest.images || [dest.primaryImageUrl],
              latitude: dest.latitude,
              longitude: dest.longitude,
              bestTimeToVisit: dest.bestTimeToVisit,
              recommendedDays: dest.recommendedDays || 2,
              estimatedBudget: dest.estimatedBudget || 15000.0,
              entryFee: dest.entryFee ?? 0.0,
              currency: dest.currency || 'INR',
              openingTime: dest.openingTime,
              closingTime: dest.closingTime,
              isUNESCO: dest.isUNESCO ?? false,
              isHeritage: dest.isHeritage ?? false,
              isReligious: dest.isReligious ?? false,
              isWildlife: dest.isWildlife ?? false,
              isNature: dest.isNature ?? false,
              isAdventure: dest.isAdventure ?? false,
              isBeach: dest.isBeach ?? false,
              isFamilyFriendly: dest.isFamilyFriendly ?? true,
              permitRequired: dest.permitRequired ?? false,
              permitType: dest.permitType,
              accessRestriction: dest.accessRestriction,
              seasonalClosure: dest.seasonalClosure,
              specialInstructions: dest.specialInstructions,
              popularityScore: dest.popularityScore || 9.0,
              isFeatured: dest.isFeatured ?? false,
              aliases: dest.aliases || [],
              status: 'ACTIVE',
              isActive: true,
            },
          });
          destinationsCount++;
        }
      }
    }

    return {
      statesImported: statesCount,
      districtsImported: districtsCount,
      citiesImported: citiesCount,
      destinationsImported: destinationsCount,
    };
  }
}
