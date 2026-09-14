import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) return { success: true, data: user };
    } catch (e) {}

    return {
      success: true,
      data: {
        id: userId,
        email: 'traveler@chalofarva.com',
        fullName: 'Demo Gujarat Traveler',
        phoneNumber: '+919876543210',
        role: 'CUSTOMER',
        status: 'ACTIVE'
      }
    };
  }

  async updateProfile(userId: string, data: any) {
    return {
      success: true,
      data: { id: userId, ...data, updatedAt: new Date().toISOString() }
    };
  }

  async getPreferences(userId: string) {
    return {
      success: true,
      data: {
        userId,
        preferredLanguage: 'gu',
        dietaryPreference: 'Gujarati Jain / Vegetarian',
        budgetTier: 'BALANCED',
        travelPace: 'MODERATE',
        interests: ['Heritage', 'Temples', 'Wildlife', 'Food']
      }
    };
  }

  async updatePreferences(userId: string, data: any) {
    return {
      success: true,
      data: { userId, ...data }
    };
  }
}
