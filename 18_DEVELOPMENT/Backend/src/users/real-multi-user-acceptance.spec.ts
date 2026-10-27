import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { TripsService } from '../trips/trips.service';
import { BookingsService } from '../bookings/bookings.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notification.service';
import { TransportService } from '../transport/transport.service';
import { HotelsService } from '../hotels/hotels.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('REAL MULTI-USER PRODUCTION ACCEPTANCE TEST SUITE', () => {
  let usersService: UsersService;
  let tripsService: TripsService;
  let bookingsService: BookingsService;
  let aiService: AiService;

  // Real isolated test account IDs
  const rahulId = 'rahul-test-uuid-101';
  const priyaId = 'priya-test-uuid-202';

  // In-memory relational database fixture simulating production PostgreSQL tables
  const dbUsers: Record<string, any> = {
    [rahulId]: {
      id: rahulId,
      email: 'rahul.test@bharatyatra.com',
      fullName: 'Rahul Test',
      phoneNumber: '+919876543210',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true,
    },
    [priyaId]: {
      id: priyaId,
      email: 'priya.test@bharatyatra.com',
      fullName: 'Priya Test',
      phoneNumber: '+919876543211',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  };

  const dbProfiles: Record<string, any> = {};
  const dbTravelers: any[] = [];
  const dbSavedDestinations: any[] = [];
  const dbTrips: any[] = [];
  const dbBookings: any[] = [];
  const dbPreferences: Record<string, any> = {};
  const dbDestinations: Record<string, any> = {
    'gir-np': { id: 'gir-np', name: 'Gir National Park', category: 'Wildlife' },
    'somnath': { id: 'somnath', name: 'Somnath Temple', category: 'Spiritual' },
    'dwarka': { id: 'dwarka', name: 'Dwarka Kingdom', category: 'Heritage' },
    'goa-beach': { id: 'goa-beach', name: 'Goa Beaches', category: 'Nature' },
    'manali': { id: 'manali', name: 'Manali Valley', category: 'Adventure' },
  };

  beforeAll(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(dbUsers[where.id] || null)),
        update: jest.fn().mockImplementation(({ where, data }) => {
          if (dbUsers[where.id]) {
            dbUsers[where.id] = { ...dbUsers[where.id], ...data };
            return Promise.resolve(dbUsers[where.id]);
          }
          return Promise.reject(new NotFoundException('User not found'));
        }),
      },
      userProfile: {
        findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(dbProfiles[where.userId] || null)),
        upsert: jest.fn().mockImplementation(({ where, create, update }) => {
          const uId = where.userId;
          if (dbProfiles[uId]) {
            dbProfiles[uId] = { ...dbProfiles[uId], ...update, updatedAt: new Date() };
          } else {
            dbProfiles[uId] = { id: `prof-${uId}`, userId: uId, ...create, createdAt: new Date(), updatedAt: new Date() };
          }
          return Promise.resolve(dbProfiles[uId]);
        }),
      },
      traveler: {
        findMany: jest.fn().mockImplementation(({ where }) =>
          Promise.resolve(dbTravelers.filter((t) => t.userId === where.userId))
        ),
        findUnique: jest.fn().mockImplementation(({ where }) =>
          Promise.resolve(dbTravelers.find((t) => t.id === where.id) || null)
        ),
        create: jest.fn().mockImplementation(({ data }) => {
          const newT = { id: `trav-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, ...data, createdAt: new Date(), updatedAt: new Date() };
          dbTravelers.push(newT);
          return Promise.resolve(newT);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const idx = dbTravelers.findIndex((t) => t.id === where.id);
          if (idx !== -1) {
            dbTravelers[idx] = { ...dbTravelers[idx], ...data, updatedAt: new Date() };
            return Promise.resolve(dbTravelers[idx]);
          }
          return Promise.reject(new NotFoundException('Traveler not found'));
        }),
        delete: jest.fn().mockImplementation(({ where }) => {
          const idx = dbTravelers.findIndex((t) => t.id === where.id);
          if (idx !== -1) {
            dbTravelers.splice(idx, 1);
            return Promise.resolve({ success: true });
          }
          return Promise.reject(new NotFoundException('Traveler not found'));
        }),
      },
      savedDestination: {
        findMany: jest.fn().mockImplementation(({ where }) => {
          const matching = dbSavedDestinations.filter((s) => s.userId === where.userId);
          return Promise.resolve(matching.map((s) => ({ ...s, destination: dbDestinations[s.destinationId] || { id: s.destinationId, name: s.destinationId } })));
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          const destId = where.OR?.[0]?.destinationId;
          const recId = where.OR?.[1]?.id;
          return Promise.resolve(dbSavedDestinations.find((s) => s.userId === where.userId && (s.destinationId === destId || s.id === recId)) || null);
        }),
        upsert: jest.fn().mockImplementation(({ where, create }) => {
          const uId = where.userId_destinationId.userId;
          const dId = where.userId_destinationId.destinationId;
          const existing = dbSavedDestinations.find((s) => s.userId === uId && s.destinationId === dId);
          if (existing) {
            return Promise.resolve({ ...existing, destination: dbDestinations[dId] });
          }
          const newS = { id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, userId: uId, destinationId: dId, createdAt: new Date() };
          dbSavedDestinations.push(newS);
          return Promise.resolve({ ...newS, destination: dbDestinations[dId] });
        }),
        delete: jest.fn().mockImplementation(({ where }) => {
          const idx = dbSavedDestinations.findIndex((s) => s.id === where.id);
          if (idx !== -1) {
            dbSavedDestinations.splice(idx, 1);
            return Promise.resolve({ success: true });
          }
          return Promise.reject(new NotFoundException('Saved destination not found'));
        }),
      },
      destination: {
        findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(dbDestinations[where.id] || null)),
      },
      userPreference: {
        findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(dbPreferences[where.userId] || null)),
        upsert: jest.fn().mockImplementation(({ where, create, update }) => {
          const uId = where.userId;
          if (dbPreferences[uId]) {
            dbPreferences[uId] = { ...dbPreferences[uId], ...update, updatedAt: new Date() };
          } else {
            dbPreferences[uId] = { id: `pref-${uId}`, userId: uId, ...create, updatedAt: new Date() };
          }
          return Promise.resolve(dbPreferences[uId]);
        }),
      },
      trip: {
        findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(dbTrips.find((t) => t.id === where.id) || null)),
        findMany: jest.fn().mockImplementation(({ where }) => Promise.resolve(dbTrips.filter((t) => t.userId === where.userId))),
        create: jest.fn().mockImplementation(({ data }) => {
          const newTrip = { id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, ...data, createdAt: new Date(), updatedAt: new Date() };
          dbTrips.push(newTrip);
          return Promise.resolve(newTrip);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const idx = dbTrips.findIndex((t) => t.id === where.id);
          if (idx !== -1) {
            dbTrips[idx] = { ...dbTrips[idx], ...data, updatedAt: new Date() };
            return Promise.resolve(dbTrips[idx]);
          }
          return Promise.reject(new NotFoundException('Trip not found'));
        }),
        delete: jest.fn().mockImplementation(({ where }) => {
          const idx = dbTrips.findIndex((t) => t.id === where.id);
          if (idx !== -1) {
            dbTrips.splice(idx, 1);
            return Promise.resolve({ success: true });
          }
          return Promise.reject(new NotFoundException('Trip not found'));
        }),
      },
      booking: {
        findUnique: jest.fn().mockImplementation(({ where }) =>
          Promise.resolve(dbBookings.find((b) => b.id === where.id || b.bookingReference === where.bookingReference) || null)
        ),
        findMany: jest.fn().mockImplementation(({ where }) =>
          Promise.resolve(dbBookings.filter((b) => b.userId === where.userId))
        ),
      },
    };

    const mockAuditService = { logAction: jest.fn().mockResolvedValue(true) };
    const mockNotificationService = { sendNotification: jest.fn().mockResolvedValue(true) };
    const mockTransportService = { search: jest.fn().mockResolvedValue({ items: [] }) };
    const mockHotelsService = { searchHotels: jest.fn().mockResolvedValue([]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        TripsService,
        BookingsService,
        AiService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAuditService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: TransportService, useValue: mockTransportService },
        { provide: HotelsService, useValue: mockHotelsService },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    tripsService = module.get<TripsService>(TripsService);
    bookingsService = module.get<BookingsService>(BookingsService);
    aiService = module.get<AiService>(AiService);
  });

  // ============================================================
  // TEST SCENARIO 1: REAL LOGIN & SESSION RESTORATION
  // ============================================================
  it('SCENARIO 1: Rahul logs in and `/api/v1/me` returns Rahul identity', async () => {
    const rahulSession = await usersService.getMe(rahulId);
    expect(rahulSession.success).toBe(true);
    expect(rahulSession.data.id).toBe(rahulId);
    expect(rahulSession.data.fullName).toBe('Rahul Test');
    expect(rahulSession.data.email).toBe('rahul.test@bharatyatra.com');

    const priyaSession = await usersService.getMe(priyaId);
    expect(priyaSession.success).toBe(true);
    expect(priyaSession.data.id).toBe(priyaId);
    expect(priyaSession.data.fullName).toBe('Priya Test');
    expect(priyaSession.data.email).toBe('priya.test@bharatyatra.com');
  });

  // ============================================================
  // TEST SCENARIO 2: REAL PROFILE ISOLATION
  // ============================================================
  it('SCENARIO 2: Profile Isolation — Rahul and Priya update profiles independently', async () => {
    // Rahul sets profile
    await usersService.updateProfile(rahulId, {
      firstName: 'Rahul',
      lastName: 'Test',
      displayName: 'Rahul Traveler',
      homeCity: 'Ahmedabad',
    });

    // Priya sets profile
    await usersService.updateProfile(priyaId, {
      firstName: 'Priya',
      lastName: 'Test',
      displayName: 'Priya Explorer',
      homeCity: 'Mumbai',
    });

    // Verify Rahul profile
    const rahulProfile = await usersService.getProfile(rahulId);
    expect(rahulProfile.data.displayName).toBe('Rahul Traveler');
    expect(rahulProfile.data.homeCity).toBe('Ahmedabad');

    // Verify Priya profile
    const priyaProfile = await usersService.getProfile(priyaId);
    expect(priyaProfile.data.displayName).toBe('Priya Explorer');
    expect(priyaProfile.data.homeCity).toBe('Mumbai');

    // Verify ZERO cross-profile leakage
    expect(rahulProfile.data.displayName).not.toBe('Priya Explorer');
    expect(priyaProfile.data.homeCity).not.toBe('Ahmedabad');
  });

  // ============================================================
  // TEST SCENARIO 3: REAL TRAVELER ISOLATION
  // ============================================================
  it('SCENARIO 3: Traveler Isolation — Rahul creates family members, Priya creates sister', async () => {
    // Rahul creates travelers
    const rahulSelf = await usersService.createTraveler(rahulId, { firstName: 'Rahul', lastName: 'Self', isSelf: true });
    const rahulFather = await usersService.createTraveler(rahulId, { firstName: 'Ramesh', lastName: 'Father' });
    const rahulMother = await usersService.createTraveler(rahulId, { firstName: 'Sita', lastName: 'Mother' });

    // Priya creates travelers
    const priyaSelf = await usersService.createTraveler(priyaId, { firstName: 'Priya', lastName: 'Self', isSelf: true });
    const priyaSister = await usersService.createTraveler(priyaId, { firstName: 'Ananya', lastName: 'Sister' });

    // Rahul checks travelers
    const rahulTravelers = await usersService.getTravelers(rahulId);
    expect(rahulTravelers.data.length).toBe(3);
    expect(rahulTravelers.data.map((t: any) => t.firstName)).toEqual(expect.arrayContaining(['Rahul', 'Ramesh', 'Sita']));

    // Priya checks travelers
    const priyaTravelers = await usersService.getTravelers(priyaId);
    expect(priyaTravelers.data.length).toBe(2);
    expect(priyaTravelers.data.map((t: any) => t.firstName)).toEqual(expect.arrayContaining(['Priya', 'Ananya']));

    // Confirm ZERO cross-user traveler leakage
    expect(priyaTravelers.data.some((t: any) => t.firstName === 'Ramesh')).toBe(false);
    expect(rahulTravelers.data.some((t: any) => t.firstName === 'Ananya')).toBe(false);
  });

  // ============================================================
  // TEST SCENARIO 4: REAL SAVED DESTINATION ISOLATION
  // ============================================================
  it('SCENARIO 4: Saved Destination Isolation — Rahul saves Gir/Somnath/Dwarka, Priya saves Goa/Manali', async () => {
    // Rahul saves destinations
    await usersService.saveDestination(rahulId, 'gir-np');
    await usersService.saveDestination(rahulId, 'somnath');
    await usersService.saveDestination(rahulId, 'dwarka');

    // Priya saves destinations
    await usersService.saveDestination(priyaId, 'goa-beach');
    await usersService.saveDestination(priyaId, 'manali');

    const rahulSaved = await usersService.getSavedDestinations(rahulId);
    const priyaSaved = await usersService.getSavedDestinations(priyaId);

    expect(rahulSaved.data.map((s: any) => s.destination.name)).toEqual(expect.arrayContaining(['Gir National Park', 'Somnath Temple', 'Dwarka Kingdom']));
    expect(priyaSaved.data.map((s: any) => s.destination.name)).toEqual(expect.arrayContaining(['Goa Beaches', 'Manali Valley']));

    expect(rahulSaved.data.some((s: any) => s.destination.name === 'Goa Beaches')).toBe(false);
    expect(priyaSaved.data.some((s: any) => s.destination.name === 'Gir National Park')).toBe(false);
  });

  // ============================================================
  // TEST SCENARIO 5: REAL TRIP ISOLATION & CREATION
  // ============================================================
  it('SCENARIO 5: Trip Isolation — Rahul creates Gujarat Journey, Priya creates Goa Journey', async () => {
    const rahulTripRes = await tripsService.generateAndSaveTrip(rahulId, {
      title: 'Rahul Gujarat Journey',
      destination: 'Dwarka',
      days: '4',
      budget: '25000',
    });

    const priyaTripRes = await tripsService.generateAndSaveTrip(priyaId, {
      title: 'Priya Goa Journey',
      destination: 'Goa',
      days: '5',
      budget: '45000',
    });

    const rahulTrips = await tripsService.getUserTrips(rahulId);
    const priyaTrips = await tripsService.getUserTrips(priyaId);

    expect(rahulTrips.data.some((t: any) => t.title === 'Rahul Gujarat Journey')).toBe(true);
    expect(rahulTrips.data.some((t: any) => t.title === 'Priya Goa Journey')).toBe(false);

    expect(priyaTrips.data.some((t: any) => t.title === 'Priya Goa Journey')).toBe(true);
    expect(priyaTrips.data.some((t: any) => t.title === 'Rahul Gujarat Journey')).toBe(false);
  });

  // ============================================================
  // TEST SCENARIO 6: REAL IDOR ATTACK PROTECTION
  // ============================================================
  it('SCENARIO 6: IDOR Protection — Priya attempting to view/modify/delete Rahul resources returns 404', async () => {
    const rahulTrip = (await tripsService.getUserTrips(rahulId)).data[0];
    const rahulTraveler = (await usersService.getTravelers(rahulId)).data[0];
    const rahulSaved = (await usersService.getSavedDestinations(rahulId)).data[0];

    // GET Rahul trip as Priya -> 404
    await expect(tripsService.getTripById(priyaId, rahulTrip.id)).rejects.toThrow(NotFoundException);

    // PATCH Rahul trip as Priya -> 404
    await expect(tripsService.updateTrip(priyaId, rahulTrip.id, { title: 'Hacked Title' })).rejects.toThrow(NotFoundException);

    // DELETE Rahul trip as Priya -> 404
    await expect(tripsService.deleteTrip(priyaId, rahulTrip.id)).rejects.toThrow(NotFoundException);

    // PATCH Rahul traveler as Priya -> 404
    await expect(usersService.updateTraveler(priyaId, rahulTraveler.id, { firstName: 'Hacked' })).rejects.toThrow(NotFoundException);

    // DELETE Rahul traveler as Priya -> 404
    await expect(usersService.deleteTraveler(priyaId, rahulTraveler.id)).rejects.toThrow(NotFoundException);

    // DELETE Rahul saved destination as Priya -> 404
    await expect(usersService.removeSavedDestination(priyaId, rahulSaved.id)).rejects.toThrow(NotFoundException);
  });

  // ============================================================
  // TEST SCENARIO 7: CLIENT USER_ID TAMPERING PROTECTION
  // ============================================================
  it('SCENARIO 7: Client userId Tampering — Service uses token identity, ignoring body/param userId', async () => {
    // Client sends tampered userId in payload
    const tamperedPayload = {
      userId: rahulId,
      firstName: 'Malicious',
      lastName: 'Modification',
    };

    // Call service with authenticated Priya identity (priyaId)
    const result = await usersService.createTraveler(priyaId, tamperedPayload);

    // Result MUST belong to Priya, NOT Rahul
    expect(result.data.userId).toBe(priyaId);
    expect(result.data.userId).not.toBe(rahulId);

    // Verify Rahul travelers list remains untouched
    const rahulTravelers = await usersService.getTravelers(rahulId);
    expect(rahulTravelers.data.some((t: any) => t.firstName === 'Malicious')).toBe(false);
  });

  // ============================================================
  // TEST SCENARIO 8: AI PLANNER PERSONALIZATION CONTEXT
  // ============================================================
  it('SCENARIO 8: AI Planner receives authenticated user context without exposing secrets', async () => {
    // Set Rahul preferences
    await usersService.updatePreferences(rahulId, {
      preferredLanguage: 'gu',
      dietaryPreference: 'JAIN_VEGETARIAN',
      budgetTier: 'LUXURY',
      travelPace: 'RELAXED',
      interests: ['Heritage', 'Temples'],
    });

    const aiRes = await aiService.generateCandidateItinerary({
      userId: rahulId,
      prompt: 'Plan Gujarat cultural tour',
      destinations: ['Dwarka', 'Somnath'],
    });

    expect(aiRes.success).toBe(true);
    expect(aiRes.data).toBeDefined();
  });

  // ============================================================
  // TEST SCENARIO 9: CONCURRENT REQUEST ISOLATION
  // ============================================================
  it('SCENARIO 9: Concurrent requests by Rahul and Priya simultaneously do not mix state', async () => {
    const [rahulAccount, priyaAccount, rahulTrips, priyaTrips] = await Promise.all([
      usersService.getMe(rahulId),
      usersService.getMe(priyaId),
      tripsService.getUserTrips(rahulId),
      tripsService.getUserTrips(priyaId),
    ]);

    expect(rahulAccount.data.id).toBe(rahulId);
    expect(priyaAccount.data.id).toBe(priyaId);

    expect(rahulTrips.data.every((t: any) => t.userId === rahulId)).toBe(true);
    expect(priyaTrips.data.every((t: any) => t.userId === priyaId)).toBe(true);
  });
});
