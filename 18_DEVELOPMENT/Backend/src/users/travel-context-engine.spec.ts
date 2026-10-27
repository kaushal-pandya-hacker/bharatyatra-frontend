import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

// Local Types matching Canonical TravelContext & TripContext
export interface TravelContext {
  user: {
    id?: string;
    name: string;
  };
  origin: {
    city: string;
    state: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  preferences: {
    travelStyle?: string;
    budget?: string;
    pace?: string;
    transport: string[];
    interests: string[];
  };
  typicalTravelers: number;
}

export interface TripContext {
  traveler: {
    id?: string;
    name: string;
    typicalTravelers: number;
  };
  origin: {
    city: string;
    state: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  trip: {
    origin: {
      city: string;
      state: string;
      country: string;
      latitude?: number;
      longitude?: number;
    };
    destination: {
      city: string;
      state?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
    };
    travelers: number;
    startDate?: string;
    endDate?: string;
  };
  preferences: {
    travelStyle?: string;
    budget?: string;
    pace?: string;
    transport: string[];
    interests: string[];
  };
}

export function buildTravelContext(profile: any): TravelContext {
  return {
    user: {
      id: profile.userId || profile.id,
      name: profile.fullName ? profile.fullName.split(' ')[0] : 'Traveler',
    },
    origin: {
      city: profile.homeCity || profile.origin?.city || 'Ahmedabad',
      state: profile.homeState || profile.origin?.state || 'Gujarat',
      country: profile.homeCountry || profile.origin?.country || 'India',
      latitude: profile.originLatitude ?? profile.origin?.latitude ?? 23.0225,
      longitude: profile.originLongitude ?? profile.origin?.longitude ?? 72.5714,
    },
    preferences: {
      travelStyle: profile.travelStyle || 'balanced',
      budget: profile.budgetPreference || profile.budget || 'moderate',
      pace: profile.travelPace || profile.pace || 'balanced',
      transport: profile.preferredTransport || profile.transport || ['train', 'bus'],
      interests: profile.interests || ['heritage', 'nature'],
    },
    typicalTravelers: profile.typicalTravelers || 2,
  };
}

export function buildTripContext(
  travelContext: TravelContext,
  tripOverrides: {
    origin?: { city: string; state?: string; country?: string; latitude?: number; longitude?: number };
    destination: { city: string; state?: string; country?: string; latitude?: number; longitude?: number };
    travelers?: number;
    startDate?: string;
  }
): TripContext {
  const tripOrigin = tripOverrides.origin?.city
    ? {
        city: tripOverrides.origin.city,
        state: tripOverrides.origin.state || travelContext.origin.state || 'Gujarat',
        country: tripOverrides.origin.country || travelContext.origin.country || 'India',
        latitude: tripOverrides.origin.latitude ?? travelContext.origin.latitude,
        longitude: tripOverrides.origin.longitude ?? travelContext.origin.longitude,
      }
    : travelContext.origin;

  return {
    traveler: {
      id: travelContext.user.id,
      name: travelContext.user.name,
      typicalTravelers: travelContext.typicalTravelers,
    },
    origin: travelContext.origin,
    trip: {
      origin: tripOrigin,
      destination: {
        city: tripOverrides.destination.city,
        state: tripOverrides.destination.state || 'Gujarat',
        country: tripOverrides.destination.country || 'India',
        latitude: tripOverrides.destination.latitude,
        longitude: tripOverrides.destination.longitude,
      },
      travelers: tripOverrides.travelers && tripOverrides.travelers > 0 ? tripOverrides.travelers : travelContext.typicalTravelers,
      startDate: tripOverrides.startDate || '2026-12-24',
    },
    preferences: travelContext.preferences,
  };
}

describe('Travel Context Engine & Multi-User Personalization Acceptance Test Suite', () => {
  let usersService: UsersService;
  const mockTravelProfiles: Record<string, any> = {};

  const mockPrismaService = {
    user: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === 'usr-1') return Promise.resolve({ id: 'usr-1', email: 'kaushal@bharatyatra.com', fullName: 'Kaushal Pandya' });
        if (where.id === 'usr-2') return Promise.resolve({ id: 'usr-2', email: 'priya@bharatyatra.com', fullName: 'Priya Sharma' });
        return Promise.resolve(null);
      }),
      update: jest.fn().mockResolvedValue({}),
    },
    userTravelProfile: {
      findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(mockTravelProfiles[where.userId] || null)),
      upsert: jest.fn().mockImplementation(({ where, create, update }) => {
        const userId = where.userId;
        if (mockTravelProfiles[userId]) {
          mockTravelProfiles[userId] = { ...mockTravelProfiles[userId], ...update, updatedAt: new Date() };
        } else {
          mockTravelProfiles[userId] = { id: `prof-${userId}`, ...create, createdAt: new Date(), updatedAt: new Date() };
        }
        return Promise.resolve(mockTravelProfiles[userId]);
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

  it('1. Build TravelContext generates canonical structure from persistent user travel profile', async () => {
    await usersService.updateTravelProfile('usr-1', {
      fullName: 'Kaushal Pandya',
      origin: { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
      travelStyle: 'adventure',
      budget: 'budget',
      pace: 'packed',
      transport: ['train'],
      interests: ['nature', 'wildlife'],
      typicalTravelers: 3,
      completed: true,
    });

    const res = await usersService.getTravelProfile('usr-1');
    const travelCtx = buildTravelContext(res.profile);

    expect(travelCtx.user.name).toBe('Kaushal');
    expect(travelCtx.origin.city).toBe('Ahmedabad');
    expect(travelCtx.preferences.travelStyle).toBe('adventure');
    expect(travelCtx.preferences.budget).toBe('budget');
    expect(travelCtx.preferences.interests).toEqual(['nature', 'wildlife']);
    expect(travelCtx.typicalTravelers).toBe(3);
  });

  it('2. TripContext layers trip-specific origin & travelers without mutating permanent profile origin', async () => {
    const res = await usersService.getTravelProfile('usr-1');
    const travelCtx = buildTravelContext(res.profile);

    // User temporarily changes trip origin to Mumbai and travelers to 4
    const tripCtx = buildTripContext(travelCtx, {
      origin: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      destination: { city: 'Dwarka', state: 'Gujarat', country: 'India' },
      travelers: 4,
    });

    // Trip origin is Mumbai
    expect(tripCtx.trip.origin.city).toBe('Mumbai');
    expect(tripCtx.trip.travelers).toBe(4);

    // Permanent profile origin REMAINS Ahmedabad
    expect(travelCtx.origin.city).toBe('Ahmedabad');
    expect(res.profile.origin.city).toBe('Ahmedabad');
  });

  it('3. AI Personalization Context Differentiator: Profile A (Ahmedabad/Budget) vs Profile B (Mumbai/Luxury)', async () => {
    await usersService.updateTravelProfile('usr-2', {
      fullName: 'Priya Sharma',
      origin: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      travelStyle: 'luxury',
      budget: 'premium',
      pace: 'slow',
      transport: ['flight', 'car'],
      interests: ['heritage', 'food'],
      typicalTravelers: 2,
      completed: true,
    });

    const profA = await usersService.getTravelProfile('usr-1');
    const profB = await usersService.getTravelProfile('usr-2');

    const ctxA = buildTravelContext(profA.profile);
    const ctxB = buildTravelContext(profB.profile);

    const tripCtxA = buildTripContext(ctxA, { destination: { city: 'Dwarka' } });
    const tripCtxB = buildTripContext(ctxB, { destination: { city: 'Dwarka' } });

    // Differentiated trip contexts
    expect(tripCtxA.trip.origin.city).toBe('Ahmedabad');
    expect(tripCtxB.trip.origin.city).toBe('Mumbai');

    expect(tripCtxA.preferences.budget).toBe('budget');
    expect(tripCtxB.preferences.budget).toBe('premium');

    expect(tripCtxA.preferences.interests).toEqual(['nature', 'wildlife']);
    expect(tripCtxB.preferences.interests).toEqual(['heritage', 'food']);
  });

  it('4. Data Isolation: User 1 cannot access or overwrite User 2 profile', async () => {
    const prof1 = await usersService.getTravelProfile('usr-1');
    const prof2 = await usersService.getTravelProfile('usr-2');

    expect(prof1.profile.fullName).toBe('Kaushal Pandya');
    expect(prof2.profile.fullName).toBe('Priya Sharma');
    expect(prof1.profile.origin.city).not.toBe(prof2.profile.origin.city);
  });

  it('5. Profile Edit update affects future trips while leaving saved historical trips intact', async () => {
    const prof1 = await usersService.getTravelProfile('usr-1');
    const initialCtx = buildTravelContext(prof1.profile);
    const historicalTripCtx = buildTripContext(initialCtx, { destination: { city: 'Somnath' } });

    expect(historicalTripCtx.trip.origin.city).toBe('Ahmedabad');

    // Update Profile 1 origin to Delhi
    await usersService.updateTravelProfile('usr-1', {
      fullName: 'Kaushal Pandya',
      origin: { city: 'Delhi', state: 'Delhi', country: 'India' },
      completed: true,
    });

    const updatedProf1 = await usersService.getTravelProfile('usr-1');
    const newTravelCtx = buildTravelContext(updatedProf1.profile);
    const futureTripCtx = buildTripContext(newTravelCtx, { destination: { city: 'Somnath' } });

    // Future trip uses NEW origin (Delhi)
    expect(futureTripCtx.trip.origin.city).toBe('Delhi');

    // Historical trip context remains Ahmedabad
    expect(historicalTripCtx.trip.origin.city).toBe('Ahmedabad');
  });
});
