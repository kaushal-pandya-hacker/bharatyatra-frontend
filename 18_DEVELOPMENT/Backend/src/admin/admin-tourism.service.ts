import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminTourismService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertState(dto: any) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return this.prisma.state.upsert({
      where: { slug },
      update: {
        name: dto.name,
        code: dto.code,
        type: dto.type || 'STATE',
        capital: dto.capital,
        description: dto.description,
        latitude: dto.latitude ? Number(dto.latitude) : null,
        longitude: dto.longitude ? Number(dto.longitude) : null,
        coverImage: dto.coverImage,
        isActive: dto.isActive ?? true,
      },
      create: {
        name: dto.name,
        slug,
        code: dto.code,
        type: dto.type || 'STATE',
        capital: dto.capital,
        description: dto.description,
        latitude: dto.latitude ? Number(dto.latitude) : null,
        longitude: dto.longitude ? Number(dto.longitude) : null,
        coverImage: dto.coverImage,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async upsertDistrict(dto: any) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return this.prisma.district.upsert({
      where: { slug },
      update: {
        name: dto.name,
        stateId: dto.stateId,
        description: dto.description,
        latitude: dto.latitude ? Number(dto.latitude) : null,
        longitude: dto.longitude ? Number(dto.longitude) : null,
        isActive: dto.isActive ?? true,
      },
      create: {
        stateId: dto.stateId,
        name: dto.name,
        slug,
        description: dto.description,
        latitude: dto.latitude ? Number(dto.latitude) : null,
        longitude: dto.longitude ? Number(dto.longitude) : null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async upsertCity(dto: any) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return this.prisma.city.upsert({
      where: { slug },
      update: {
        name: dto.name,
        stateId: dto.stateId,
        districtId: dto.districtId || null,
        description: dto.description,
        latitude: dto.latitude ? Number(dto.latitude) : null,
        longitude: dto.longitude ? Number(dto.longitude) : null,
        coverImage: dto.coverImage,
        isPopular: dto.isPopular ?? false,
        isActive: dto.isActive ?? true,
      },
      create: {
        stateId: dto.stateId,
        districtId: dto.districtId || null,
        name: dto.name,
        slug,
        description: dto.description,
        latitude: dto.latitude ? Number(dto.latitude) : null,
        longitude: dto.longitude ? Number(dto.longitude) : null,
        coverImage: dto.coverImage,
        isPopular: dto.isPopular ?? false,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async upsertDestination(dto: any) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return this.prisma.destination.upsert({
      where: { slug },
      update: {
        name: dto.name,
        stateId: dto.stateId || null,
        districtId: dto.districtId || null,
        cityId: dto.cityId || null,
        state: dto.state || 'Gujarat',
        category: dto.category,
        subCategory: dto.subCategory,
        description: dto.description,
        shortDescription: dto.shortDescription,
        primaryImageUrl: dto.primaryImageUrl,
        heroImageUrl: dto.heroImageUrl || dto.primaryImageUrl,
        images: dto.images || [dto.primaryImageUrl],
        latitude: dto.latitude ? Number(dto.latitude) : null,
        longitude: dto.longitude ? Number(dto.longitude) : null,
        bestTimeToVisit: dto.bestTimeToVisit,
        recommendedDays: dto.recommendedDays ? Number(dto.recommendedDays) : 2,
        entryFee: dto.entryFee ? Number(dto.entryFee) : 0,
        isUNESCO: dto.isUNESCO ?? false,
        isHeritage: dto.isHeritage ?? false,
        isReligious: dto.isReligious ?? false,
        isWildlife: dto.isWildlife ?? false,
        isNature: dto.isNature ?? false,
        isAdventure: dto.isAdventure ?? false,
        isBeach: dto.isBeach ?? false,
        isFamilyFriendly: dto.isFamilyFriendly ?? true,
        permitRequired: dto.permitRequired ?? false,
        permitType: dto.permitType,
        accessRestriction: dto.accessRestriction,
        seasonalClosure: dto.seasonalClosure,
        specialInstructions: dto.specialInstructions,
        status: dto.status || 'ACTIVE',
        isActive: dto.isActive ?? true,
        aliases: dto.aliases || [],
      },
      create: {
        name: dto.name,
        slug,
        stateId: dto.stateId || null,
        districtId: dto.districtId || null,
        cityId: dto.cityId || null,
        state: dto.state || 'Gujarat',
        category: dto.category,
        subCategory: dto.subCategory,
        description: dto.description,
        shortDescription: dto.shortDescription,
        primaryImageUrl: dto.primaryImageUrl,
        heroImageUrl: dto.heroImageUrl || dto.primaryImageUrl,
        images: dto.images || [dto.primaryImageUrl],
        latitude: dto.latitude ? Number(dto.latitude) : null,
        longitude: dto.longitude ? Number(dto.longitude) : null,
        bestTimeToVisit: dto.bestTimeToVisit,
        recommendedDays: dto.recommendedDays ? Number(dto.recommendedDays) : 2,
        entryFee: dto.entryFee ? Number(dto.entryFee) : 0,
        isUNESCO: dto.isUNESCO ?? false,
        isHeritage: dto.isHeritage ?? false,
        isReligious: dto.isReligious ?? false,
        isWildlife: dto.isWildlife ?? false,
        isNature: dto.isNature ?? false,
        isAdventure: dto.isAdventure ?? false,
        isBeach: dto.isBeach ?? false,
        isFamilyFriendly: dto.isFamilyFriendly ?? true,
        permitRequired: dto.permitRequired ?? false,
        permitType: dto.permitType,
        accessRestriction: dto.accessRestriction,
        seasonalClosure: dto.seasonalClosure,
        specialInstructions: dto.specialInstructions,
        status: dto.status || 'ACTIVE',
        isActive: dto.isActive ?? true,
        aliases: dto.aliases || [],
      },
    });
  }

  async setDestinationStatus(slug: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'ACTIVE') {
    const isActive = status !== 'ARCHIVED';
    return this.prisma.destination.update({
      where: { slug },
      data: { status, isActive },
    });
  }
}
