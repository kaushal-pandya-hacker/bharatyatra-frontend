/**
 * BharatYatra — Activities Module Tests
 *
 * Covers:
 *  1. Provider contract tests (SandboxActivityProviderAdapter)
 *  2. ActivitiesService unit tests
 *  3. Security / price-manipulation tests
 *  4. E2E booking flow smoke test
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActivitiesService } from './activities.service';
import { SandboxActivityProviderAdapter } from '../providers/activities/sandbox-activity.provider.adapter';

// ---------------------------------------------------------------------------
// Mock PrismaService
// ---------------------------------------------------------------------------

const mockBookingCreate = jest.fn().mockResolvedValue({
  id: 'booking-uuid-test',
  bookingReference: 'CF-ACT-20260918-1234',
  status: 'PENDING',
  totalAmountInr: 1200,
  currency: 'INR',
  createdAt: new Date(),
  events: [],
  activityDetail: null,
});

const mockBookingFindFirst = jest.fn().mockResolvedValue(null);
const mockBookingFindMany = jest.fn().mockResolvedValue([]);
const mockBookingUpdate = jest.fn().mockResolvedValue({
  id: 'booking-uuid-test',
  bookingReference: 'CF-ACT-20260918-1234',
  status: 'CANCELLED',
  cancelledAt: new Date(),
});
const mockSearchRecordCreate = jest.fn().mockResolvedValue({});
const mockBookingEventFindFirst = jest.fn().mockResolvedValue(null);

const mockPrisma = {
  booking: {
    create: mockBookingCreate,
    findFirst: mockBookingFindFirst,
    findMany: mockBookingFindMany,
    update: mockBookingUpdate,
  },
  activitySearchRecord: {
    create: mockSearchRecordCreate,
  },
  bookingEvent: {
    findFirst: mockBookingEventFindFirst,
  },
};

// ---------------------------------------------------------------------------
// Test Setup
// ---------------------------------------------------------------------------

describe('SandboxActivityProviderAdapter — Contract Tests', () => {
  let provider: SandboxActivityProviderAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [SandboxActivityProviderAdapter],
    }).compile();

    provider = module.get<SandboxActivityProviderAdapter>(SandboxActivityProviderAdapter);
  });

  it('should have correct provider identity', () => {
    expect(provider.providerId).toBe('sandbox-activity-fixture');
    expect(provider.isLive).toBe(false);
  });

  it('should return health HEALTHY', async () => {
    const health = await provider.healthCheck();
    expect(health.status).toBe('HEALTHY');
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('should search all activities without filters', async () => {
    const results = await provider.searchActivities({});
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(r.activityId).toBeDefined();
      expect(r.title).toBeDefined();
      expect(r.minPrice).toBeGreaterThan(0);
      expect(r.currency).toBe('INR');
      expect(r.provider).toBe('sandbox-fixture');
    });
  });

  it('should filter activities by destinationSlug', async () => {
    const results = await provider.searchActivities({ destinationSlug: 'gir-national-park' });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].destinationSlug).toBe('gir-national-park');
  });

  it('should return empty array for unknown destination', async () => {
    const results = await provider.searchActivities({ destinationSlug: 'unknown-place-xyz' });
    expect(results).toEqual([]);
  });

  it('should return activity detail with slots', async () => {
    const detail = await provider.getActivityDetail('act-gir-safari-trail-3');
    expect(detail).not.toBeNull();
    expect(detail!.activityId).toBe('act-gir-safari-trail-3');
    expect(detail!.slots).toBeDefined();
    expect(detail!.slots!.length).toBeGreaterThan(0);
    // Slots should have dates hydrated
    detail!.slots!.forEach((slot) => {
      expect(slot.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('should return null for unknown activity detail', async () => {
    const detail = await provider.getActivityDetail('nonexistent-activity');
    expect(detail).toBeNull();
  });

  it('should confirm availability for known activity', async () => {
    const result = await provider.checkAvailability({
      activityId: 'act-gir-safari-trail-3',
      date: '2026-12-15',
      adults: 2,
      children: 1,
    });
    expect(result.status).toBe('AVAILABLE');
    expect(result.totalPrice).toBeGreaterThan(0);
    expect(result.priceAdultInr).toBeGreaterThan(0);
    expect(result.currency).toBe('INR');
  });

  it('should return UNAVAILABLE for unknown activity', async () => {
    const result = await provider.checkAvailability({
      activityId: 'nonexistent',
      date: '2026-12-15',
      adults: 1,
    });
    expect(result.status).toBe('UNAVAILABLE');
  });

  it('should return TEST_ONLY on createBooking in sandbox mode', async () => {
    const res = await provider.createBooking({
      activityId: 'act-gir-safari-trail-3',
      activityTitle: 'Gir Lion Safari',
      date: '2026-12-15',
      adults: 2,
      children: 0,
      totalPrice: 2400,
      currency: 'INR',
      clientReference: 'CF-ACT-TEST-001',
      holder: { name: 'Ravi', surname: 'Patel', email: 'ravi@test.com', phone: '+919876543210' },
    });
    expect(res.status).toBe('TEST_ONLY');
    expect(res.supplierReference).toContain('SANDBOX');
  });

  it('should cancel sandbox booking successfully', async () => {
    const res = await provider.cancelBooking({
      supplierReference: 'SANDBOX-ACT-CF-ACT-TEST-001',
      clientReference: 'CF-ACT-TEST-001',
    });
    expect(res.status).toBe('CANCELLED');
    expect(res.cancellationFee).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// ActivitiesService Unit Tests
// ---------------------------------------------------------------------------

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let provider: SandboxActivityProviderAdapter;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Directly instantiate to avoid NestJS DI resolution issues in unit tests
    service = new ActivitiesService(mockPrisma as any, new SandboxActivityProviderAdapter());
    provider = new SandboxActivityProviderAdapter();
  });

  // ── Search ──────────────────────────────────────────────────────────────

  it('should return activities for a valid destination', async () => {
    const results = await service.searchActivities({ destinationSlug: 'gir-national-park' });
    expect(results.length).toBeGreaterThan(0);
  });

  it('should log audit record on search (non-blocking)', async () => {
    await service.searchActivities({ destination: 'Ahmedabad' });
    expect(mockSearchRecordCreate).toHaveBeenCalled();
  });

  // ── Detail ──────────────────────────────────────────────────────────────

  it('should return activity detail', async () => {
    const detail = await service.getActivityDetail('act-kutch-rann-cultural');
    expect(detail).not.toBeNull();
    expect(detail.activityId).toBe('act-kutch-rann-cultural');
  });

  it('should throw NotFoundException for unknown activityId', async () => {
    await expect(service.getActivityDetail('nonexistent')).rejects.toThrow(NotFoundException);
  });

  // ── Server-Side Pricing ──────────────────────────────────────────────────

  it('should calculate price correctly', () => {
    const result = service.calculateServerPrice({
      activityId: 'act-gir-safari-trail-3',
      date: '2026-12-15',
      adults: 2,
      children: 1,
      priceAdultInr: 1200,
      priceChildInr: 600,
    });
    expect(result.adults).toBe(2);
    expect(result.children).toBe(1);
    expect(result.subtotal).toBe(2 * 1200 + 1 * 600); // 3000
    expect(result.taxes).toBe(Math.round(3000 * 0.05));
    expect(result.serviceFee).toBe(50);
    expect(result.totalAmount).toBe(3000 + Math.round(3000 * 0.05) + 50);
  });

  it('should default children price to 50% of adult if not provided', () => {
    const result = service.calculateServerPrice({
      activityId: 'test',
      date: '2026-12-15',
      adults: 1,
      children: 2,
      priceAdultInr: 1000,
    });
    expect(result.priceChildInr).toBe(500);
  });

  // ── Revalidation ─────────────────────────────────────────────────────────

  it('should confirm availability matches expected price', async () => {
    const check = await provider.checkAvailability({
      activityId: 'act-gir-safari-trail-3',
      date: '2026-12-15',
      adults: 1,
    });
    const result = await service.revalidatePrice({
      activityId: 'act-gir-safari-trail-3',
      date: '2026-12-15',
      adults: 1,
      children: 0,
      expectedTotalPrice: check.totalPrice,
    });
    expect(result.status).toBe('AVAILABLE');
    expect((result as any).priceChanged).toBeFalsy();
  });

  it('should detect price change when expected differs from current', async () => {
    const result = await service.revalidatePrice({
      activityId: 'act-gir-safari-trail-3',
      date: '2026-12-15',
      adults: 1,
      children: 0,
      expectedTotalPrice: 9999999, // clearly wrong
    });
    expect(result.status).toBe('PRICE_CHANGED');
    expect((result as any).priceChanged).toBe(true);
  });

  // ── Security — Price Manipulation Rejection ──────────────────────────────

  it('should reject booking with price <= 0', async () => {
    await expect(
      service.createBooking('user-123', {
        activityId: 'act-gir-safari-trail-3',
        activityTitle: 'Gir Safari',
        date: '2026-12-15',
        adults: 2,
        children: 0,
        totalPrice: 0,  // MANIPULATED
        holder: { name: 'Test', surname: 'User', email: 'test@test.com', phone: '+919876543210' },
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should reject booking with manipulated low price (below 90% of expected)', async () => {
    // The provider will return priceAdultInr=1200 for 2 adults = 2400 total
    // Submitting 100 should be rejected (< 90% of 2400)
    await expect(
      service.createBooking('user-123', {
        activityId: 'act-gir-safari-trail-3',
        activityTitle: 'Gir Safari',
        date: '2026-12-15',
        adults: 2,
        children: 0,
        totalPrice: 100, // MANIPULATED
        holder: { name: 'Test', surname: 'User', email: 'test@test.com', phone: '+919876543210' },
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should reject booking without activityId', async () => {
    await expect(
      service.createBooking('user-123', {
        activityId: '',
        activityTitle: 'Test',
        date: '2026-12-15',
        adults: 1,
        children: 0,
        totalPrice: 1200,
        holder: { name: 'A', surname: 'B', email: 'a@b.com', phone: '+910000000000' },
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject booking without date', async () => {
    await expect(
      service.createBooking('user-123', {
        activityId: 'act-gir-safari-trail-3',
        activityTitle: 'Gir Safari',
        date: '',
        adults: 1,
        children: 0,
        totalPrice: 1200,
        holder: { name: 'A', surname: 'B', email: 'a@b.com', phone: '+910000000000' },
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // ── Idempotency ──────────────────────────────────────────────────────────

  it('should return existing booking on duplicate idempotency key', async () => {
    mockBookingFindFirst.mockResolvedValueOnce({
      id: 'existing-booking-id',
      bookingReference: 'CF-ACT-EXISTING',
      status: 'PENDING',
      totalAmountInr: 1200,
      currency: 'INR',
      createdAt: new Date(),
      events: [],
    });

    const result = await service.createBooking(
      'user-123',
      {
        activityId: 'act-gir-safari-trail-3',
        activityTitle: 'Gir Safari',
        date: '2026-12-15',
        adults: 1,
        children: 0,
        totalPrice: 1200,
        holder: { name: 'Test', surname: 'User', email: 'test@test.com', phone: '+91987654321' },
      },
      'IDEM-KEY-001',
    );

    expect((result as any).idempotent).toBe(true);
    expect((result as any).bookingReference).toBe('CF-ACT-EXISTING');
  });

  // ── Health Check ──────────────────────────────────────────────────────────

  it('should return health check report', async () => {
    const health = await service.getHealthCheck();
    expect(health.providerId).toBe('sandbox-activity-fixture');
    expect(health.capabilities.search).toBe(true);
    expect(health.capabilities.booking).toBe(true);
    expect(health.isLive).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// E2E Booking Flow Smoke Test
// ---------------------------------------------------------------------------

describe('Activities E2E Booking Flow', () => {
  let service: ActivitiesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ActivitiesService(mockPrisma as any, new SandboxActivityProviderAdapter());
  });

  it('should execute full search → detail → price → revalidate → book flow', async () => {
    // Step 1: Search
    const results = await service.searchActivities({ destinationSlug: 'gir-national-park' });
    expect(results.length).toBeGreaterThan(0);
    const activity = results[0];

    // Step 2: Detail
    const detail = await service.getActivityDetail(activity.activityId);
    expect(detail).not.toBeNull();
    const slot = detail.slots![0];

    // Step 3: Server-side price calculation
    const priceBreakdown = service.calculateServerPrice({
      activityId: activity.activityId,
      date: slot.date,
      adults: 2,
      children: 1,
      priceAdultInr: slot.priceAdultInr,
      priceChildInr: slot.priceChildInr,
    });
    expect(priceBreakdown.totalAmount).toBeGreaterThan(0);

    // Step 4: Revalidate
    const revalidation = await service.revalidatePrice({
      activityId: activity.activityId,
      slotId: slot.slotId,
      date: slot.date,
      adults: 2,
      children: 1,
      expectedTotalPrice: slot.priceAdultInr * 2 + slot.priceChildInr * 1,
    });
    expect(revalidation.status).not.toBe('UNAVAILABLE');

    // Step 5: Book
    const booking = await service.createBooking('user-e2e-test', {
      activityId: activity.activityId,
      activityTitle: activity.title,
      slotId: slot.slotId,
      date: slot.date,
      time: slot.time,
      adults: 2,
      children: 1,
      totalPrice: slot.priceAdultInr * 2 + slot.priceChildInr * 1,
      holder: {
        name: 'Ravi',
        surname: 'Patel',
        email: 'ravi.patel@bharatyatra.com',
        phone: '+919876543210',
      },
      participants: [
        { type: 'ADULT', name: 'Ravi', surname: 'Patel', age: 35 },
        { type: 'ADULT', name: 'Priya', surname: 'Patel', age: 32 },
        { type: 'CHILD', name: 'Arjun', surname: 'Patel', age: 8 },
      ],
      specialRequests: 'Please arrange morning safari slot.',
    });

    expect((booking as any).chaloFarvaBookingId).toBeDefined();
    expect((booking as any).bookingReference).toMatch(/^CF-ACT-/);
    expect((booking as any).activityId).toBe(activity.activityId);
    expect(mockBookingCreate).toHaveBeenCalledTimes(1);
  });
});
