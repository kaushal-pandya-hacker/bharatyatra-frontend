import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    let user: any = null;
    try {
      user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          preferences: true,
        },
      });
    } catch (e) {
      // Ignore database errors and handle null below
    }

    if (!user) {
      throw new NotFoundException('User identity not found');
    }

    const { passwordHash, ...safeUser } = user;
    return {
      success: true,
      data: {
        id: safeUser.id,
        email: safeUser.email,
        fullName: safeUser.fullName,
        phoneNumber: safeUser.phoneNumber,
        role: safeUser.role,
        status: safeUser.status,
        isEmailVerified: safeUser.isEmailVerified,
        isPhoneVerified: safeUser.isPhoneVerified,
        profile: safeUser.profile || {
          firstName: safeUser.fullName ? safeUser.fullName.split(' ')[0] : '',
          lastName: safeUser.fullName && safeUser.fullName.split(' ').length > 1 ? safeUser.fullName.split(' ').slice(1).join(' ') : '',
          displayName: safeUser.fullName || '',
          email: safeUser.email,
          phone: safeUser.phoneNumber,
          preferredLanguage: 'en',
          preferredCurrency: 'INR',
        },
        preferences: safeUser.preferences || {
          preferredLanguage: 'en',
          dietaryPreference: 'VEGETARIAN',
          budgetTier: 'BALANCED',
          travelPace: 'MODERATE',
          interests: [],
        },
      },
    };
  }

  async getProfile(userId: string) {
    let profile: any = null;
    try {
      profile = await this.prisma.userProfile.findUnique({
        where: { userId },
      });
    } catch (e) {}

    if (profile) {
      return {
        success: true,
        data: profile,
      };
    }

    const res = await this.getMe(userId);
    return {
      success: true,
      data: res.data.profile,
    };
  }

  async updateProfile(userId: string, dto: any) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User profile not found');
      }

      // Update primary user fields if provided
      const userUpdates: any = {};
      if (dto.fullName || dto.name) userUpdates.fullName = dto.fullName || dto.name;
      if (dto.phoneNumber || dto.phone) userUpdates.phoneNumber = dto.phoneNumber || dto.phone;

      if (Object.keys(userUpdates).length > 0) {
        await this.prisma.user.update({
          where: { id: userId },
          data: userUpdates,
        });
      }

      // Upsert UserProfile
      const profile = await this.prisma.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          firstName: dto.firstName || (dto.fullName ? dto.fullName.split(' ')[0] : undefined),
          lastName: dto.lastName || (dto.fullName && dto.fullName.split(' ').length > 1 ? dto.fullName.split(' ').slice(1).join(' ') : undefined),
          displayName: dto.displayName || dto.fullName || dto.name,
          email: dto.email || user.email,
          phone: dto.phone || dto.phoneNumber || user.phoneNumber,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          gender: dto.gender,
          profilePhoto: dto.profilePhoto || dto.avatarUrl,
          preferredLanguage: dto.preferredLanguage || 'en',
          preferredCurrency: dto.preferredCurrency || 'INR',
          homeCity: dto.homeCity,
        },
        update: {
          firstName: dto.firstName !== undefined ? dto.firstName : undefined,
          lastName: dto.lastName !== undefined ? dto.lastName : undefined,
          displayName: dto.displayName || dto.fullName || dto.name || undefined,
          email: dto.email !== undefined ? dto.email : undefined,
          phone: dto.phone || dto.phoneNumber !== undefined ? (dto.phone || dto.phoneNumber) : undefined,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          gender: dto.gender !== undefined ? dto.gender : undefined,
          profilePhoto: dto.profilePhoto || dto.avatarUrl !== undefined ? (dto.profilePhoto || dto.avatarUrl) : undefined,
          preferredLanguage: dto.preferredLanguage !== undefined ? dto.preferredLanguage : undefined,
          preferredCurrency: dto.preferredCurrency !== undefined ? dto.preferredCurrency : undefined,
          homeCity: dto.homeCity !== undefined ? dto.homeCity : undefined,
        },
      });

      return {
        success: true,
        data: profile,
      };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException('Failed to update user profile');
    }
  }

  // ==========================================
  // TRAVELER MANAGEMENT
  // ==========================================

  async getTravelers(userId: string) {
    try {
      const travelers = await this.prisma.traveler.findMany({
        where: { userId },
        orderBy: [{ isSelf: 'desc' }, { createdAt: 'asc' }],
      });
      return {
        success: true,
        data: travelers,
      };
    } catch (e) {
      return { success: true, data: [] };
    }
  }

  async createTraveler(userId: string, dto: any) {
    if (!dto.firstName || !dto.lastName) {
      throw new BadRequestException('First name and last name are required for traveler');
    }

    try {
      const traveler = await this.prisma.traveler.create({
        data: {
          userId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          gender: dto.gender || 'OTHER',
          nationality: dto.nationality || 'IN',
          documentType: dto.documentType,
          documentNumber: dto.documentNumber,
          isSelf: Boolean(dto.isSelf),
        },
      });

      return {
        success: true,
        data: traveler,
      };
    } catch (e) {
      throw new BadRequestException('Failed to create traveler record');
    }
  }

  async updateTraveler(userId: string, travelerId: string, dto: any) {
    try {
      const existing = await this.prisma.traveler.findUnique({
        where: { id: travelerId },
      });

      if (!existing || existing.userId !== userId) {
        throw new NotFoundException(`Traveler not found`);
      }

      const updated = await this.prisma.traveler.update({
        where: { id: travelerId },
        data: {
          firstName: dto.firstName || existing.firstName,
          lastName: dto.lastName || existing.lastName,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : existing.dateOfBirth,
          gender: dto.gender || existing.gender,
          nationality: dto.nationality || existing.nationality,
          documentType: dto.documentType !== undefined ? dto.documentType : existing.documentType,
          documentNumber: dto.documentNumber !== undefined ? dto.documentNumber : existing.documentNumber,
          isSelf: dto.isSelf !== undefined ? Boolean(dto.isSelf) : existing.isSelf,
        },
      });

      return {
        success: true,
        data: updated,
      };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException('Failed to update traveler record');
    }
  }

  async deleteTraveler(userId: string, travelerId: string) {
    try {
      const existing = await this.prisma.traveler.findUnique({
        where: { id: travelerId },
      });

      if (!existing || existing.userId !== userId) {
        throw new NotFoundException(`Traveler not found`);
      }

      await this.prisma.traveler.delete({
        where: { id: travelerId },
      });

      return {
        success: true,
        message: 'Traveler deleted successfully',
      };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException('Failed to delete traveler');
    }
  }

  // ==========================================
  // SAVED DESTINATIONS MANAGEMENT
  // ==========================================

  async getSavedDestinations(userId: string) {
    try {
      const saved = await this.prisma.savedDestination.findMany({
        where: { userId },
        include: {
          destination: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: saved.map((s) => ({
          id: s.id,
          savedAt: s.createdAt,
          destination: s.destination,
        })),
      };
    } catch (e) {
      return { success: true, data: [] };
    }
  }

  async saveDestination(userId: string, destinationId: string) {
    if (!destinationId) {
      throw new BadRequestException('destinationId is required');
    }

    try {
      // Verify destination exists
      const dest = await this.prisma.destination.findUnique({
        where: { id: destinationId },
      });
      if (!dest) {
        throw new NotFoundException(`Destination not found`);
      }

      const saved = await this.prisma.savedDestination.upsert({
        where: {
          userId_destinationId: {
            userId,
            destinationId,
          },
        },
        create: {
          userId,
          destinationId,
        },
        update: {},
        include: {
          destination: true,
        },
      });

      return {
        success: true,
        data: saved,
      };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException('Failed to save destination');
    }
  }

  async removeSavedDestination(userId: string, destinationId: string) {
    try {
      const saved = await this.prisma.savedDestination.findFirst({
        where: {
          userId,
          OR: [
            { destinationId },
            { id: destinationId },
          ],
        },
      });

      if (!saved) {
        throw new NotFoundException(`Saved destination not found`);
      }

      await this.prisma.savedDestination.delete({
        where: { id: saved.id },
      });

      return {
        success: true,
        message: 'Destination removed from saved list',
      };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException('Failed to remove saved destination');
    }
  }

  // ==========================================
  // PREFERENCES MANAGEMENT
  // ==========================================

  async getPreferences(userId: string) {
    try {
      const pref = await this.prisma.userPreference.findUnique({
        where: { userId },
      });

      if (pref) {
        return { success: true, data: pref };
      }
    } catch (e) {}

    return {
      success: true,
      data: {
        userId,
        preferredLanguage: 'en',
        dietaryPreference: 'VEGETARIAN',
        budgetTier: 'BALANCED',
        travelPace: 'MODERATE',
        interests: ['Heritage', 'Temples', 'Nature'],
      },
    };
  }

  async updatePreferences(userId: string, dto: any) {
    try {
      const updated = await this.prisma.userPreference.upsert({
        where: { userId },
        create: {
          userId,
          preferredLanguage: dto.preferredLanguage || 'en',
          dietaryPreference: dto.dietaryPreference,
          budgetTier: dto.budgetTier || 'BALANCED',
          travelPace: dto.travelPace || 'MODERATE',
          interests: Array.isArray(dto.interests) ? dto.interests : [],
        },
        update: {
          preferredLanguage: dto.preferredLanguage,
          dietaryPreference: dto.dietaryPreference,
          budgetTier: dto.budgetTier,
          travelPace: dto.travelPace,
          interests: Array.isArray(dto.interests) ? dto.interests : undefined,
        },
      });

      return {
        success: true,
        data: updated,
      };
    } catch (e) {
      throw new BadRequestException('Failed to update user preferences');
    }
  }

  // ==========================================
  // PERSISTENT TRAVEL PROFILE MANAGEMENT
  // ==========================================

  async getTravelProfile(userId: string) {
    let profile: any = null;
    try {
      profile = await (this.prisma as any).userTravelProfile.findUnique({
        where: { userId },
      });
    } catch (e) {
      // Table migration fallback or silent read
    }

    if (!profile) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true, preferences: true },
      }).catch(() => null);

      const fullName = user?.fullName || user?.profile?.displayName || 'BharatYatra Traveler';
      const city = user?.profile?.homeCity || 'Ahmedabad';
      const preferredLanguage = user?.preferences?.preferredLanguage || 'en';

      return {
        success: true,
        profile: {
          fullName,
          origin: {
            city,
            state: 'Gujarat',
            country: 'India',
            latitude: city.toLowerCase() === 'ahmedabad' ? 23.0225 : 22.2587,
            longitude: city.toLowerCase() === 'ahmedabad' ? 72.5714 : 71.1924,
          },
          travelStyle: user?.preferences?.budgetTier ? user.preferences.budgetTier.toLowerCase() : 'balanced',
          budget: 'moderate',
          pace: user?.preferences?.travelPace ? user.preferences.travelPace.toLowerCase() : 'balanced',
          transport: ['train', 'bus'],
          interests: user?.preferences?.interests || ['heritage', 'nature'],
          typicalTravelers: 2,
          preferredLanguage,
          completed: false,
        },
      };
    }

    return {
      success: true,
      profile: {
        fullName: profile.fullName,
        origin: {
          city: profile.homeCity,
          state: profile.homeState,
          country: profile.homeCountry,
          latitude: profile.originLatitude ?? undefined,
          longitude: profile.originLongitude ?? undefined,
        },
        travelStyle: profile.travelStyle || 'balanced',
        budget: profile.budgetPreference || 'moderate',
        pace: profile.travelPace || 'balanced',
        transport: profile.preferredTransport || [],
        interests: profile.interests || [],
        typicalTravelers: profile.typicalTravelers || 2,
        preferredLanguage: profile.preferredLanguage || 'en',
        completed: Boolean(profile.profileCompleted),
      },
    };
  }

  async updateTravelProfile(userId: string, dto: any) {
    const fullName = dto.fullName || dto.name || dto.fullName;
    const origin = dto.origin || {};
    const city = origin.city || dto.homeCity || dto.city;
    const state = origin.state || dto.homeState || dto.state || 'Gujarat';
    const country = origin.country || dto.homeCountry || dto.country || 'India';
    const latitude = origin.latitude ?? dto.originLatitude ?? dto.latitude;
    const longitude = origin.longitude ?? dto.originLongitude ?? dto.longitude;

    if (!fullName || !fullName.trim()) {
      throw new BadRequestException('Full name is required to save travel profile');
    }
    if (!city || !city.trim()) {
      throw new BadRequestException('Origin city is required to save travel profile');
    }
    if (!state || !state.trim()) {
      throw new BadRequestException('Origin state is required to save travel profile');
    }

    const travelStyle = dto.travelStyle || dto.style;
    const budgetPreference = dto.budget || dto.budgetPreference;
    const travelPace = dto.pace || dto.travelPace;
    const preferredTransport = Array.isArray(dto.transport)
      ? dto.transport
      : Array.isArray(dto.preferredTransport)
      ? dto.preferredTransport
      : [];
    const preferredLanguage = dto.preferredLanguage || dto.language || 'en';
    const interests = Array.isArray(dto.interests) ? dto.interests : [];
    const typicalTravelers = typeof dto.typicalTravelers === 'number' ? dto.typicalTravelers : parseInt(dto.typicalTravelers || '2', 10) || 2;
    const isCompleted = dto.completed !== undefined ? Boolean(dto.completed) : true;

    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { fullName: fullName.trim() },
      }).catch(() => {});

      const updated = await (this.prisma as any).userTravelProfile.upsert({
        where: { userId },
        create: {
          userId,
          fullName: fullName.trim(),
          homeCity: city.trim(),
          homeState: state.trim(),
          homeCountry: country.trim(),
          originLatitude: typeof latitude === 'number' ? latitude : null,
          originLongitude: typeof longitude === 'number' ? longitude : null,
          travelStyle: travelStyle || 'balanced',
          budgetPreference: budgetPreference || 'moderate',
          travelPace: travelPace || 'balanced',
          preferredTransport,
          preferredLanguage,
          interests,
          typicalTravelers,
          profileCompleted: isCompleted,
        },
        update: {
          fullName: fullName.trim(),
          homeCity: city.trim(),
          homeState: state.trim(),
          homeCountry: country.trim(),
          originLatitude: typeof latitude === 'number' ? latitude : undefined,
          originLongitude: typeof longitude === 'number' ? longitude : undefined,
          travelStyle: travelStyle !== undefined ? travelStyle : undefined,
          budgetPreference: budgetPreference !== undefined ? budgetPreference : undefined,
          travelPace: travelPace !== undefined ? travelPace : undefined,
          preferredTransport: preferredTransport.length > 0 ? preferredTransport : undefined,
          preferredLanguage: preferredLanguage !== undefined ? preferredLanguage : undefined,
          interests: interests.length > 0 ? interests : undefined,
          typicalTravelers: typicalTravelers !== undefined ? typicalTravelers : undefined,
          profileCompleted: isCompleted,
        },
      });

      return {
        success: true,
        profile: {
          fullName: updated.fullName,
          origin: {
            city: updated.homeCity,
            state: updated.homeState,
            country: updated.homeCountry,
            latitude: updated.originLatitude ?? undefined,
            longitude: updated.originLongitude ?? undefined,
          },
          travelStyle: updated.travelStyle || 'balanced',
          budget: updated.budgetPreference || 'moderate',
          pace: updated.travelPace || 'balanced',
          transport: updated.preferredTransport || [],
          interests: updated.interests || [],
          typicalTravelers: updated.typicalTravelers || 2,
          preferredLanguage: updated.preferredLanguage || 'en',
          completed: Boolean(updated.profileCompleted),
        },
      };
    } catch (e) {
      throw new BadRequestException('Failed to update travel profile');
    }
  }
}
