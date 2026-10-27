import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('User Travel Profile & Isolation Unit Tests', () => {
  let usersService: UsersService;

  const mockUserTravelProfiles: Record<string, any> = {};

  const mockPrismaService = {
    user: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === 'user-1') {
          return Promise.resolve({
            id: 'user-1',
            email: 'kaushal@bharatyatra.com',
            fullName: 'Kaushal Pandya',
          });
        }
        if (where.id === 'user-2') {
          return Promise.resolve({
            id: 'user-2',
            email: 'priya@bharatyatra.com',
            fullName: 'Priya Sharma',
          });
        }
        return Promise.resolve(null);
      }),
      update: jest.fn().mockResolvedValue({}),
    },
    userTravelProfile: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        return Promise.resolve(mockUserTravelProfiles[where.userId] || null);
      }),
      upsert: jest.fn().mockImplementation(({ where, create, update }) => {
        const userId = where.userId;
        const existing = mockUserTravelProfiles[userId];
        if (existing) {
          const updated = {
            ...existing,
            ...update,
            updatedAt: new Date(),
          };
          mockUserTravelProfiles[userId] = updated;
          return Promise.resolve(updated);
        } else {
          const created = {
            id: `prof-${Date.now()}`,
            ...create,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          mockUserTravelProfiles[userId] = created;
          return Promise.resolve(created);
        }
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('1. should return uncompleted profile fallback for new user without saved profile', async () => {
    const res = await usersService.getTravelProfile('user-1');
    expect(res.success).toBe(true);
    expect(res.profile.fullName).toBe('Kaushal Pandya');
    expect(res.profile.origin.city).toBe('Ahmedabad');
    expect(res.profile.completed).toBe(false);
  });

  it('2. should save travel profile and return true completion status', async () => {
    const payload = {
      fullName: 'Kaushal Pandya',
      origin: {
        city: 'Ahmedabad',
        state: 'Gujarat',
        country: 'India',
        latitude: 23.0225,
        longitude: 72.5714,
      },
      travelStyle: 'balanced',
      budget: 'moderate',
      pace: 'balanced',
      transport: ['train', 'bus'],
      interests: ['heritage', 'nature'],
      typicalTravelers: 2,
      preferredLanguage: 'en',
      completed: true,
    };

    const updated = await usersService.updateTravelProfile('user-1', payload);
    expect(updated.success).toBe(true);
    expect(updated.profile.fullName).toBe('Kaushal Pandya');
    expect(updated.profile.origin.city).toBe('Ahmedabad');
    expect(updated.profile.completed).toBe(true);

    const fetched = await usersService.getTravelProfile('user-1');
    expect(fetched.profile.completed).toBe(true);
    expect(fetched.profile.origin.city).toBe('Ahmedabad');
  });

  it('3. should isolate travel profiles between User 1 and User 2 (zero cross-user leak)', async () => {
    // User 2 saves different origin (Mumbai)
    await usersService.updateTravelProfile('user-2', {
      fullName: 'Priya Sharma',
      origin: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      travelStyle: 'luxury',
      completed: true,
    });

    const user1Prof = await usersService.getTravelProfile('user-1');
    const user2Prof = await usersService.getTravelProfile('user-2');

    expect(user1Prof.profile.origin.city).toBe('Ahmedabad');
    expect(user2Prof.profile.origin.city).toBe('Mumbai');
    expect(user1Prof.profile.fullName).toBe('Kaushal Pandya');
    expect(user2Prof.profile.fullName).toBe('Priya Sharma');
  });

  it('4. should reject profile update when required full name or city is missing', async () => {
    await expect(
      usersService.updateTravelProfile('user-1', {
        fullName: '',
        origin: { city: 'Ahmedabad', state: 'Gujarat' },
      })
    ).rejects.toThrow(BadRequestException);

    await expect(
      usersService.updateTravelProfile('user-1', {
        fullName: 'Kaushal',
        origin: { city: '', state: 'Gujarat' },
      })
    ).rejects.toThrow(BadRequestException);
  });
});
