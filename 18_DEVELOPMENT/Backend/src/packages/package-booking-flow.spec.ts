import { Test, TestingModule } from '@nestjs/testing';
import { QuoteEngineService } from './quote-engine.service';
import { PackageOrchestratorService } from './package-orchestrator.service';
import { PackagesService } from './packages.service';
import { PrismaService } from '../prisma/prisma.service';
import { UniversalProviderRegistry } from '../providers/registry/universal-provider.registry';
import { BadRequestException } from '@nestjs/common';

describe('Phase 4: Package Booking + Payment + Fulfillment Engine Tests', () => {
  let quoteEngine: QuoteEngineService;
  let orchestrator: PackageOrchestratorService;
  let prisma: PrismaService;

  const mockPackage = {
    id: 'pkg-gujarat-001',
    slug: 'gujarat-heritage-tour',
    title: 'Gujarat Cultural & Heritage Tour',
    startingPrice: 15000,
    discountedPrice: 13500,
    originalPrice: 16000,
    durationNights: 3,
    currency: 'INR',
    hotels: [{ hotelCategory: 'DELUXE', hotelName: 'Grand Heritage Somnath', upgradePricePerNightInr: 1000 }],
    transports: [{ transportType: 'BUS', title: 'GSRTC AC Volvo Sleeper', additionalPriceInr: 1200 }],
    activities: [{ id: 'act-1', title: 'Somnath Light & Sound Show', priceInr: 500 }],
  };

  const mockPrismaService = {
    packageQuote: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'quote-uuid-1', ...data })),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.quoteReference === 'BY-QT-EXPIRED') {
          return Promise.resolve({
            id: 'quote-uuid-expired',
            quoteReference: 'BY-QT-EXPIRED',
            packageId: mockPackage.id,
            travelDate: new Date(),
            adultsCount: 2,
            childrenCount: 0,
            roomsCount: 1,
            supplierCostInr: 30000,
            taxInr: 1500,
            platformFeeInr: 250,
            markupInr: 2400,
            discountInr: 2000,
            totalAmountInr: 32150,
            currency: 'INR',
            expiresAt: new Date(Date.now() - 100000), // Expired
            createdAt: new Date(Date.now() - 200000),
            quoteVersion: 1,
            package: mockPackage,
          });
        }
        return Promise.resolve({
          id: 'quote-uuid-valid',
          quoteReference: where.quoteReference,
          packageId: mockPackage.id,
          travelDate: new Date(),
          adultsCount: 2,
          childrenCount: 0,
          roomsCount: 1,
          supplierCostInr: 30000,
          taxInr: 1500,
          platformFeeInr: 250,
          markupInr: 2400,
          discountInr: 2000,
          totalAmountInr: 32150,
          currency: 'INR',
          expiresAt: new Date(Date.now() + 1800000), // Valid
          createdAt: new Date(),
          quoteVersion: 1,
          package: mockPackage,
        });
      }),
    },
    booking: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({
        id: 'booking-uuid-1',
        bookingReference: data.bookingReference || 'CF-PKG-20260925-1001',
        status: data.status || 'PAYMENT_PENDING',
        totalAmountInr: data.totalAmountInr || 32150,
        currency: 'INR',
        startDate: new Date(),
        endDate: new Date(),
        inventoryId: mockPackage.id,
      })),
      findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve({
        id: where.id,
        bookingReference: 'CF-PKG-20260925-1001',
        status: 'PAYMENT_PENDING',
        totalAmountInr: 32150,
        currency: 'INR',
        inventoryId: mockPackage.id,
        startDate: new Date(),
        endDate: new Date(),
        user: { fullName: 'Rajesh Patel', email: 'rajesh@example.com', phoneNumber: '+919876543210' },
      })),
      update: jest.fn().mockImplementation(({ where, data }) => Promise.resolve({
        id: where.id,
        bookingReference: 'CF-PKG-20260925-1001',
        status: data.status,
        totalAmountInr: 32150,
        currency: 'INR',
      })),
    },
    packageBooking: {
      create: jest.fn().mockResolvedValue({ id: 'pkg-booking-1' }),
    },
    supplierBookingRecord: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'sup-rec-1', ...data })),
    },
    operationalTask: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'op-task-1', ...data })),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: 'audit-log-1' }),
    },
  };

  const mockPackagesService = {
    findBySlug: jest.fn().mockResolvedValue({ data: mockPackage }),
  };

  const mockProviderRegistry = {
    getProvider: jest.fn().mockImplementation((type: string) => ({
      providerId: `${type}_PROVIDER`,
      providerName: `Mock ${type} Provider`,
      checkPrice: jest.fn().mockResolvedValue({ status: 'AVAILABLE', netPrice: 3000, currency: 'INR' }),
      createBooking: jest.fn().mockImplementation((req: any) => {
        if (type === 'BUS_FAIL') {
          throw new Error('Bus seat allocation failed');
        }
        return Promise.resolve({
          supplierReference: `MOCK-${type}-REF-999`,
          status: 'CONFIRMED',
          totalPrice: req.price || 1000,
        });
      }),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuoteEngineService,
        PackageOrchestratorService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PackagesService, useValue: mockPackagesService },
        { provide: UniversalProviderRegistry, useValue: mockProviderRegistry },
      ],
    }).compile();

    quoteEngine = module.get<QuoteEngineService>(QuoteEngineService);
    orchestrator = module.get<PackageOrchestratorService>(PackageOrchestratorService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('Section 5: Immutable Quote System', () => {
    it('should generate an immutable quote with correct price breakdown formula', async () => {
      const quote = await quoteEngine.createQuote({
        packageSlug: 'gujarat-heritage-tour',
        travelDate: '2026-10-15',
        adultsCount: 2,
        hotelCategory: 'DELUXE',
        transportOption: 'BUS',
        selectedActivityIds: ['act-1'],
      });

      expect(quote).toBeDefined();
      expect(quote.quoteReference).toMatch(/^BY-QT-/);
      expect(quote.totalAmountInr).toBeGreaterThan(0);
      expect(quote.taxInr).toBeGreaterThan(0);
      expect(quote.platformFeeInr).toBe(250);
      expect(quote.isExpired).toBe(false);
    });

    it('should throw BadRequestException if quote has expired', async () => {
      await expect(quoteEngine.validateQuote('BY-QT-EXPIRED')).rejects.toThrow(BadRequestException);
    });
  });

  describe('Section 4 & 9: Booking Flow & Payment Requirement', () => {
    it('should initiate booking in PAYMENT_PENDING state before payment', async () => {
      const initiated = await orchestrator.initiateBooking({
        quoteReference: 'BY-QT-VALID-100',
        userId: 'user-uuid-1',
        customerName: 'Rajesh Patel',
        customerEmail: 'rajesh@example.com',
        customerPhone: '+919876543210',
      });

      expect(initiated.success).toBe(true);
      expect(initiated.status).toBe('PAYMENT_PENDING');
      expect(initiated.bookingReference).toBeDefined();
    });

    it('should fulfill multi-service supplier booking AFTER verified payment', async () => {
      const fulfillment = await orchestrator.fulfillBookingAfterVerifiedPayment({
        bookingId: 'booking-uuid-1',
        gatewayOrderId: 'rzp_ord_1001',
        gatewayPaymentId: 'pay_1001',
      });

      expect(fulfillment.success).toBe(true);
      expect(fulfillment.status).toBe('CONFIRMED');
      expect(mockPrismaService.supplierBookingRecord.create).toHaveBeenCalled();
    });
  });

  describe('Section 11: Partial Failure & Operational Task', () => {
    it('should flag PARTIALLY_CONFIRMED and create OperationalTask on component failure', async () => {
      // Mock hotel success, bus fail
      mockProviderRegistry.getProvider.mockImplementation((type: string) => {
        if (type === 'BUS') {
          return {
            providerId: 'BUS_PROVIDER',
            providerName: 'Mock Bus Provider',
            createBooking: jest.fn().mockRejectedValue(new Error('GSRTC bus seat unavailable')),
          };
        }
        return {
          providerId: `${type}_PROVIDER`,
          providerName: `Mock ${type} Provider`,
          createBooking: jest.fn().mockResolvedValue({ supplierReference: `HOTEL-REF-123`, status: 'CONFIRMED' }),
        };
      });

      const fulfillment = await orchestrator.fulfillBookingAfterVerifiedPayment({
        bookingId: 'booking-uuid-1',
        gatewayOrderId: 'rzp_ord_1002',
        gatewayPaymentId: 'pay_1002',
      });

      expect(fulfillment.status).toBe('PARTIALLY_CONFIRMED');
      expect(mockPrismaService.operationalTask.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskType: 'PARTIAL_CONFIRMATION',
            priority: 'HIGH',
          }),
        }),
      );
    });
  });
});
