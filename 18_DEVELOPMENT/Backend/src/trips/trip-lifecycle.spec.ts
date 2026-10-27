import { TripsService, resolveTripStatus } from './trips.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('Trip Lifecycle & Persistent Trip System', () => {
  let service: TripsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      trip: {
        create: jest.fn().mockImplementation(async ({ data }) => ({
          id: `trip-db-${Date.now()}`,
          ...data,
          savedAt: data.savedAt || new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          itineraries: [
            {
              versionNumber: 1,
              status: 'FINALIZED',
              days: [],
            },
          ],
        })),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new TripsService(mockPrisma);
  });

  describe('Canonical Status Resolver (resolveTripStatus)', () => {
    const fixedNow = new Date('2026-10-08T10:00:00Z');

    it('should resolve UPCOMING when startDate is in the future', () => {
      const trip = {
        status: 'SAVED',
        startDate: '2026-11-10',
        endDate: '2026-11-14',
      };
      expect(resolveTripStatus(trip, fixedNow)).toBe('UPCOMING');
    });

    it('should resolve ACTIVE when current date is within travel window', () => {
      const trip = {
        status: 'SAVED',
        startDate: '2026-10-05',
        endDate: '2026-10-12',
      };
      expect(resolveTripStatus(trip, fixedNow)).toBe('ACTIVE');
    });

    it('should resolve COMPLETED when endDate is in the past', () => {
      const trip = {
        status: 'SAVED',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
      };
      expect(resolveTripStatus(trip, fixedNow)).toBe('COMPLETED');
    });

    it('should respect explicit CANCELLED status over dates', () => {
      const trip = {
        status: 'CANCELLED',
        startDate: '2026-11-10',
        endDate: '2026-11-14',
      };
      expect(resolveTripStatus(trip, fixedNow)).toBe('CANCELLED');
    });

    it('should respect explicit COMPLETED status over future dates if manually completed', () => {
      const trip = {
        status: 'COMPLETED',
        startDate: '2026-11-10',
        endDate: '2026-11-14',
      };
      expect(resolveTripStatus(trip, fixedNow)).toBe('COMPLETED');
    });
  });

  describe('Trip Creation & Snapshot Immutability', () => {
    it('should store full TripContext and route snapshots on createOrSaveTrip', async () => {
      const userId = 'user-test-101';
      const tripData = {
        title: 'Mumbai → Dwarka Coastal Circuit',
        originCity: 'Mumbai',
        destinationCity: 'Dwarka',
        startDate: '2026-12-01',
        endDate: '2026-12-05',
        durationDays: 5,
        travelers: 2,
        preferredTransport: ['train'],
        interests: ['heritage'],
      };

      const result = await service.createOrSaveTrip(userId, tripData);
      expect(result.success).toBe(true);
      expect(result.data.title).toContain('Mumbai');
      expect(result.data.originCity).toBe('Mumbai');
      expect(result.data.destinationCity).toBe('Dwarka');
      expect(result.data.tripContextJson).toBeDefined();
      expect(result.data.tripContextJson.origin.city).toBe('Mumbai');
    });

    it('should preserve trip snapshot when user profile changes later', async () => {
      const userId = 'user-test-102';
      
      // Step 1: Create trip with Mumbai origin override
      const tripA = await service.createOrSaveTrip(userId, {
        id: 'trip-a-123',
        title: 'Mumbai → Dwarka',
        originCity: 'Mumbai',
        destinationCity: 'Dwarka',
        status: 'SAVED',
      });

      // Step 2: User profile changes home city to Surat (simulated)
      const userProfileNewCity = 'Surat';

      // Step 3: Fetch Trip A and verify it still has origin Mumbai
      const fetchedTripA = await service.getTripById(userId, tripA.data.id);
      expect(fetchedTripA.data.originCity).toBe('Mumbai');
      expect(fetchedTripA.data.tripContextJson.origin.city).toBe('Mumbai');

      // Step 4: Create Trip B using new profile origin
      const tripB = await service.createOrSaveTrip(userId, {
        id: 'trip-b-456',
        title: `${userProfileNewCity} → Goa`,
        originCity: userProfileNewCity,
        destinationCity: 'Goa',
        status: 'SAVED',
      });

      expect(tripB.data.originCity).toBe('Surat');
      expect(fetchedTripA.data.originCity).toBe('Mumbai'); // Unaltered!
    });
  });

  describe('Security & User Data Isolation', () => {
    it('should block User A from fetching User B trip details', async () => {
      const userA = 'user-a-1';
      const userB = 'user-b-2';

      const tripB = await service.createOrSaveTrip(userB, {
        id: 'trip-user-b-private',
        title: 'Private Trip B',
      });

      await expect(service.getTripById(userA, tripB.data.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should block User A from modifying User B trip', async () => {
      const userA = 'user-a-1';
      const userB = 'user-b-2';

      const tripB = await service.createOrSaveTrip(userB, {
        id: 'trip-user-b-mod',
        title: 'Original Title',
      });

      await expect(
        service.updateTrip(userA, tripB.data.id, { title: 'Hacked Title' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should block User A from deleting User B trip', async () => {
      const userA = 'user-a-1';
      const userB = 'user-b-2';

      const tripB = await service.createOrSaveTrip(userB, {
        id: 'trip-user-b-del',
        title: 'Trip to Delete',
      });

      await expect(service.deleteTrip(userA, tripB.data.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Trip Lifecycle Status Transitions', () => {
    it('should mark a trip as CANCELLED using cancelTrip', async () => {
      const userId = 'user-lifecycle-1';
      const created = await service.createOrSaveTrip(userId, {
        id: 'trip-cancel-test',
        title: 'Trip to Cancel',
        status: 'SAVED',
      });

      const cancelled = await service.cancelTrip(userId, created.data.id);
      expect(cancelled.success).toBe(true);
      expect(cancelled.data.status).toBe('CANCELLED');
    });

    it('should mark a trip as COMPLETED using completeTrip', async () => {
      const userId = 'user-lifecycle-2';
      const created = await service.createOrSaveTrip(userId, {
        id: 'trip-complete-test',
        title: 'Trip to Complete',
        status: 'ACTIVE',
      });

      const completed = await service.completeTrip(userId, created.data.id);
      expect(completed.success).toBe(true);
      expect(completed.data.status).toBe('COMPLETED');
    });
  });
});
