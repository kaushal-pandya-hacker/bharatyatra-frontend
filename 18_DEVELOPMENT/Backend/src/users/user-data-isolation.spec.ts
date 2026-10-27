import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { TripsService } from '../trips/trips.service';
import { BookingsService } from '../bookings/bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notification.service';

describe('User Data Ownership & Multi-User Isolation Test Suite', () => {
  let usersService: UsersService;
  let tripsService: TripsService;
  let bookingsService: BookingsService;
  let prismaService: PrismaService;

  const rahulId = 'rahul-user-uuid-1111-1111-111111111111';
  const priyaId = 'priya-user-uuid-2222-2222-222222222222';

  const mockUsers: Record<string, any> = {
    [rahulId]: {
      id: rahulId,
      email: 'rahul@bharatyatra.com',
      fullName: 'Rahul Pandya',
      phoneNumber: '+919876543210',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true,
    },
    [priyaId]: {
      id: priyaId,
      email: 'priya@bharatyatra.com',
      fullName: 'Priya Sharma',
      phoneNumber: '+919876543211',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  };

  const mockProfiles: Record<string, any> = {
    [rahulId]: {
      id: 'prof-rahul',
      userId: rahulId,
      firstName: 'Rahul',
      lastName: 'Pandya',
      displayName: 'Rahul Pandya',
      email: 'rahul@bharatyatra.com',
      phone: '+919876543210',
      preferredLanguage: 'gu',
      preferredCurrency: 'INR',
      homeCity: 'Ahmedabad',
    },
    [priyaId]: {
      id: 'prof-priya',
      userId: priyaId,
      firstName: 'Priya',
      lastName: 'Sharma',
      displayName: 'Priya Sharma',
      email: 'priya@bharatyatra.com',
      phone: '+919876543211',
      preferredLanguage: 'en',
      preferredCurrency: 'INR',
      homeCity: 'Mumbai',
    },
  };

  const mockTravelers: any[] = [
    {
      id: 'trav-rahul-self',
      userId: rahulId,
      firstName: 'Rahul',
      lastName: 'Pandya',
      gender: 'MALE',
      nationality: 'IN',
      isSelf: true,
    },
    {
      id: 'trav-rahul-father',
      userId: rahulId,
      firstName: 'Ramesh',
      lastName: 'Pandya',
      gender: 'MALE',
      nationality: 'IN',
      isSelf: false,
    },
    {
      id: 'trav-priya-self',
      userId: priyaId,
      firstName: 'Priya',
      lastName: 'Sharma',
      gender: 'FEMALE',
      nationality: 'IN',
      isSelf: true,
    },
  ];

  const mockSavedDestinations: any[] = [
    {
      id: 'saved-rahul-gir',
      userId: rahulId,
      destinationId: 'dest-gir-national-park',
      createdAt: new Date(),
      destination: { id: 'dest-gir-national-park', name: 'Gir National Park' },
    },
    {
      id: 'saved-priya-goa',
      userId: priyaId,
      destinationId: 'dest-goa-beaches',
      createdAt: new Date(),
      destination: { id: 'dest-goa-beaches', name: 'Goa Beaches' },
    },
  ];

  const mockTrips: any[] = [
    {
      id: 'trip-rahul-123',
      userId: rahulId,
      title: 'Gujarat Road Trip',
      startDate: new Date('2026-11-10'),
      endDate: new Date('2026-11-14'),
      totalBudgetInr: 25000,
      status: 'ACTIVE',
      itineraries: [{ versionNumber: 1, days: [] }],
    },
    {
      id: 'trip-priya-456',
      userId: priyaId,
      title: 'Goa Vacation Trip',
      startDate: new Date('2026-12-01'),
      endDate: new Date('2026-12-05'),
      totalBudgetInr: 45000,
      status: 'ACTIVE',
      itineraries: [{ versionNumber: 1, days: [] }],
    },
  ];

  const mockBookings: any[] = [
    {
      id: 'book-rahul-789',
      bookingReference: 'BY-RAHUL-789',
      userId: rahulId,
      bookingType: 'HOTEL',
      status: 'CONFIRMED',
      totalAmountInr: 12000,
    },
    {
      id: 'book-priya-999',
      bookingReference: 'BY-PRIYA-999',
      userId: priyaId,
      bookingType: 'FLIGHT',
      status: 'CONFIRMED',
      totalAmountInr: 8500,
    },
  ];

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(mockUsers[where.id] || null)),
        update: jest.fn().mockImplementation(({ where, data }) => {
          if (mockUsers[where.id]) {
            mockUsers[where.id] = { ...mockUsers[where.id], ...data };
            return Promise.resolve(mockUsers[where.id]);
          }
          return Promise.reject(new Error('User not found'));
        }),
      },
      userProfile: {
        findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(mockProfiles[where.userId] || null)),
        upsert: jest.fn().mockImplementation(({ where, create, update }) => {
          const uId = where.userId;
          if (mockProfiles[uId]) {
            mockProfiles[uId] = { ...mockProfiles[uId], ...update };
          } else {
            mockProfiles[uId] = { id: `prof-${uId}`, userId: uId, ...create };
          }
          return Promise.resolve(mockProfiles[uId]);
        }),
      },
      traveler: {
        findMany: jest.fn().mockImplementation(({ where }) =>
          Promise.resolve(mockTravelers.filter((t) => t.userId === where.userId))
        ),
        findUnique: jest.fn().mockImplementation(({ where }) =>
          Promise.resolve(mockTravelers.find((t) => t.id === where.id) || null)
        ),
        create: jest.fn().mockImplementation(({ data }) => {
          const newT = { id: `trav-${Date.now()}`, ...data };
          mockTravelers.push(newT);
          return Promise.resolve(newT);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const idx = mockTravelers.findIndex((t) => t.id === where.id);
          if (idx !== -1) {
            mockTravelers[idx] = { ...mockTravelers[idx], ...data };
            return Promise.resolve(mockTravelers[idx]);
          }
          return Promise.reject(new Error('Traveler not found'));
        }),
        delete: jest.fn().mockImplementation(({ where }) => {
          const idx = mockTravelers.findIndex((t) => t.id === where.id);
          if (idx !== -1) {
            mockTravelers.splice(idx, 1);
            return Promise.resolve({ success: true });
          }
          return Promise.reject(new Error('Traveler not found'));
        }),
      },
      savedDestination: {
        findMany: jest.fn().mockImplementation(({ where }) =>
          Promise.resolve(mockSavedDestinations.filter((s) => s.userId === where.userId))
        ),
        findFirst: jest.fn().mockImplementation(({ where }) =>
          Promise.resolve(mockSavedDestinations.find((s) => s.userId === where.userId && (s.destinationId === where.OR[0].destinationId || s.id === where.OR[1].id)) || null)
        ),
        upsert: jest.fn().mockImplementation(({ where, create }) => {
          const existing = mockSavedDestinations.find((s) => s.userId === where.userId_destinationId.userId && s.destinationId === where.userId_destinationId.destinationId);
          if (existing) return Promise.resolve(existing);
          const newS = { id: `saved-${Date.now()}`, userId: where.userId_destinationId.userId, destinationId: where.userId_destinationId.destinationId, createdAt: new Date() };
          mockSavedDestinations.push(newS);
          return Promise.resolve(newS);
        }),
        delete: jest.fn().mockImplementation(({ where }) => {
          const idx = mockSavedDestinations.findIndex((s) => s.id === where.id);
          if (idx !== -1) {
            mockSavedDestinations.splice(idx, 1);
            return Promise.resolve({ success: true });
          }
          return Promise.reject(new Error('Saved destination not found'));
        }),
      },
      destination: {
        findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve({ id: where.id, name: 'Sample Destination' })),
      },
      userPreference: {
        findUnique: jest.fn().mockReturnValue(Promise.resolve(null)),
        upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve(create)),
      },
      trip: {
        findUnique: jest.fn().mockImplementation(({ where }) =>
          Promise.resolve(mockTrips.find((t) => t.id === where.id) || null)
        ),
        findMany: jest.fn().mockImplementation(({ where }) =>
          Promise.resolve(mockTrips.filter((t) => t.userId === where.userId))
        ),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: `trip-${Date.now()}`, ...data })),
        delete: jest.fn().mockImplementation(({ where }) => {
          const idx = mockTrips.findIndex((t) => t.id === where.id);
          if (idx !== -1) mockTrips.splice(idx, 1);
          return Promise.resolve({ success: true });
        }),
      },
      booking: {
        findUnique: jest.fn().mockImplementation(({ where }) =>
          Promise.resolve(mockBookings.find((b) => b.id === where.id || b.bookingReference === where.bookingReference) || null)
        ),
        findMany: jest.fn().mockImplementation(({ where }) =>
          Promise.resolve(mockBookings.filter((b) => b.userId === where.userId))
        ),
      },
    };

    const mockAuditService = { logAction: jest.fn().mockResolvedValue(true) };
    const mockNotificationService = { sendNotification: jest.fn().mockResolvedValue(true) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        TripsService,
        BookingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAuditService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    tripsService = module.get<TripsService>(TripsService);
    bookingsService = module.get<BookingsService>(BookingsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('1. Profile & Identity Isolation (Rahul vs Priya)', () => {
    it("Rahul receives only Rahul's profile", async () => {
      const res = await usersService.getMe(rahulId);
      expect(res.success).toBe(true);
      expect(res.data.id).toBe(rahulId);
      expect(res.data.fullName).toBe('Rahul Pandya');
      expect(res.data.email).toBe('rahul@bharatyatra.com');
    });

    it("Priya receives only Priya's profile", async () => {
      const res = await usersService.getMe(priyaId);
      expect(res.success).toBe(true);
      expect(res.data.id).toBe(priyaId);
      expect(res.data.fullName).toBe('Priya Sharma');
      expect(res.data.email).toBe('priya@bharatyatra.com');
    });
  });

  describe("2. Traveler Ownership Isolation (Rahul's travelers vs Priya's travelers)", () => {
    it("Rahul receives only Rahul's saved travelers", async () => {
      const res = await usersService.getTravelers(rahulId);
      expect(res.success).toBe(true);
      expect(res.data.length).toBe(2);
      expect(res.data.every((t: any) => t.userId === rahulId)).toBe(true);
    });

    it("Priya receives only Priya's saved travelers and zero Rahul travelers", async () => {
      const res = await usersService.getTravelers(priyaId);
      expect(res.success).toBe(true);
      expect(res.data.length).toBe(1);
      expect(res.data[0].firstName).toBe('Priya');
      expect(res.data.some((t: any) => t.userId === rahulId)).toBe(false);
    });

    it("Priya attempting to modify or delete Rahul's traveler fails with 404", async () => {
      await expect(usersService.updateTraveler(priyaId, 'trav-rahul-father', { firstName: 'Hacked' }))
        .rejects.toThrow(NotFoundException);
      await expect(usersService.deleteTraveler(priyaId, 'trav-rahul-father'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('3. Saved Destinations Ownership Isolation', () => {
    it('Rahul sees Gir in saved destinations, Priya sees Goa', async () => {
      const rahulSaved = await usersService.getSavedDestinations(rahulId);
      const priyaSaved = await usersService.getSavedDestinations(priyaId);

      expect(rahulSaved.data.some((s: any) => s.destination.name.includes('Gir'))).toBe(true);
      expect(rahulSaved.data.some((s: any) => s.destination.name.includes('Goa'))).toBe(false);

      expect(priyaSaved.data.some((s: any) => s.destination.name.includes('Goa'))).toBe(true);
      expect(priyaSaved.data.some((s: any) => s.destination.name.includes('Gir'))).toBe(false);
    });
  });

  describe('4. Trip Ownership & IDOR Protection (Rahul vs Priya)', () => {
    it("Rahul can view Rahul's trip 'trip-rahul-123'", async () => {
      const res = await tripsService.getTripById(rahulId, 'trip-rahul-123');
      expect(res.success).toBe(true);
      expect(res.data.title).toBe('Gujarat Road Trip');
    });

    it("Priya attempting to view Rahul's trip 'trip-rahul-123' returns 404 Not Found (IDOR neutralized)", async () => {
      await expect(tripsService.getTripById(priyaId, 'trip-rahul-123'))
        .rejects.toThrow(NotFoundException);
    });

    it("Priya attempting to delete Rahul's trip 'trip-rahul-123' returns 404 Not Found", async () => {
      await expect(tripsService.deleteTrip(priyaId, 'trip-rahul-123'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('5. Booking Ownership & IDOR Protection', () => {
    it("Rahul receives only Rahul's bookings", async () => {
      const res = await bookingsService.getUserBookings(rahulId);
      expect(res.success).toBe(true);
      expect(res.data.every((b: any) => b.userId === rahulId)).toBe(true);
    });

    it("Priya attempting to view Rahul's booking 'book-rahul-789' returns 404 Not Found", async () => {
      await expect(bookingsService.getBookingById(priyaId, 'book-rahul-789'))
        .rejects.toThrow(NotFoundException);
    });

    it("Priya attempting to cancel Rahul's booking 'book-rahul-789' returns 404 Not Found", async () => {
      await expect(bookingsService.cancelBooking(priyaId, 'book-rahul-789', { cancellationReason: 'Test' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('6. Concurrent Multi-User Request Isolation', () => {
    it('Concurrent requests by Rahul and Priya simultaneously do not mix state', async () => {
      const [rahulRes, priyaRes] = await Promise.all([
        usersService.getMe(rahulId),
        usersService.getMe(priyaId),
      ]);

      expect(rahulRes.data.id).toBe(rahulId);
      expect(rahulRes.data.fullName).toBe('Rahul Pandya');

      expect(priyaRes.data.id).toBe(priyaId);
      expect(priyaRes.data.fullName).toBe('Priya Sharma');
    });
  });
});
