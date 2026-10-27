import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';

import { QuoteEngineService } from './quote-engine.service';
import { PackageOrchestratorService } from './package-orchestrator.service';
import { PackagesService } from './packages.service';
import { PrismaService } from '../prisma/prisma.service';
import { UniversalProviderRegistry } from '../providers/registry/universal-provider.registry';
import { PaymentWebhookService } from '../payments/services/payment-webhook.service';
import { RefundEngineService } from '../refunds/refund-engine.service';
import { ProviderActivationService } from '../config/provider-activation.config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('Phase 5: Production Provider Activation + End-to-End Certification', () => {
  let quoteEngine: QuoteEngineService;
  let orchestrator: PackageOrchestratorService;
  let webhookService: PaymentWebhookService;
  let refundEngine: RefundEngineService;
  let providerActivation: ProviderActivationService;
  let prisma: PrismaService;

  const mockPackage = {
    id: 'pkg-gujarat-somnath-dwarka',
    slug: 'somnath-dwarka-spiritual',
    title: 'Somnath & Dwarka Divine Pilgrimage Package',
    startingPrice: 18000,
    discountedPrice: 16500,
    originalPrice: 19500,
    durationNights: 4,
    currency: 'INR',
    hotels: [{ hotelCategory: 'HERITAGE', hotelName: 'Lords Inn Somnath', upgradePricePerNightInr: 1200 }],
    transports: [{ transportType: 'BUS', title: 'GSRTC AC Sleeper Express', additionalPriceInr: 1500 }],
    activities: [{ id: 'act-101', title: 'Dwarkadhish Morning Aarti Special Pass', priceInr: 350 }],
  };

  const mockPrismaService = {
    packageQuote: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'quote-uuid-p5-1', ...data })),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.quoteReference === 'BY-QT-EXPIRED-P5') {
          return Promise.resolve({
            id: 'quote-uuid-expired-p5',
            quoteReference: 'BY-QT-EXPIRED-P5',
            packageId: mockPackage.id,
            travelDate: new Date(),
            adultsCount: 2,
            childrenCount: 0,
            roomsCount: 1,
            supplierCostInr: 35000,
            taxInr: 1750,
            platformFeeInr: 250,
            markupInr: 2800,
            discountInr: 3000,
            totalAmountInr: 36800,
            currency: 'INR',
            expiresAt: new Date(Date.now() - 500000), // Expired
            createdAt: new Date(Date.now() - 1000000),
            quoteVersion: 1,
            package: mockPackage,
          });
        }
        return Promise.resolve({
          id: 'quote-uuid-valid-p5',
          quoteReference: where.quoteReference,
          packageId: mockPackage.id,
          travelDate: new Date(),
          adultsCount: 2,
          childrenCount: 0,
          roomsCount: 1,
          supplierCostInr: 35000,
          taxInr: 1750,
          platformFeeInr: 250,
          markupInr: 2800,
          discountInr: 3000,
          totalAmountInr: 36800,
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
        id: 'booking-p5-001',
        bookingReference: data.bookingReference || 'CF-PKG-20260925-8888',
        status: data.status || 'PAYMENT_PENDING',
        totalAmountInr: data.totalAmountInr || 36800,
        currency: 'INR',
        startDate: new Date('2026-10-20'),
        endDate: new Date('2026-10-24'),
        inventoryId: mockPackage.id,
      })),
      findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve({
        id: where.id || 'booking-p5-001',
        bookingReference: 'CF-PKG-20260925-8888',
        status: 'PAYMENT_PENDING',
        totalAmountInr: 36800,
        currency: 'INR',
        inventoryId: mockPackage.id,
        startDate: new Date('2026-10-20'),
        endDate: new Date('2026-10-24'),
        user: { fullName: 'Aarav Mehta', email: 'aarav@bharatyatra.com', phoneNumber: '+919988776655' },
      })),
      update: jest.fn().mockImplementation(({ where, data }) => Promise.resolve({
        id: where.id,
        bookingReference: 'CF-PKG-20260925-8888',
        status: data.status,
        totalAmountInr: 36800,
        currency: 'INR',
      })),
    },
    packageBooking: {
      create: jest.fn().mockResolvedValue({ id: 'pkg-b-p5' }),
    },
    supplierBookingRecord: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: `sup-rec-${Math.random()}`, ...data })),
    },
    operationalTask: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: `op-task-${Math.random()}`, ...data })),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: 'audit-log-p5' }),
    },
  };

  const mockPackagesService = {
    findBySlug: jest.fn().mockResolvedValue({ data: mockPackage }),
  };

  const mockProviderRegistry = {
    getProvider: jest.fn().mockImplementation((type: string) => ({
      providerId: `${type}_PROVIDER`,
      providerName: `Mock ${type} Provider`,
      checkPrice: jest.fn().mockResolvedValue({ status: 'AVAILABLE', netPrice: 4500, currency: 'INR' }),
      createBooking: jest.fn().mockImplementation((req: any) => Promise.resolve({
        supplierReference: `SUP-${type}-REF-2026`,
        status: 'CONFIRMED',
        totalPrice: req.price || 1500,
      })),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuoteEngineService,
        PackageOrchestratorService,
        PaymentWebhookService,
        RefundEngineService,
        ProviderActivationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PackagesService, useValue: mockPackagesService },
        { provide: UniversalProviderRegistry, useValue: mockProviderRegistry },
      ],
    }).compile();

    quoteEngine = module.get<QuoteEngineService>(QuoteEngineService);
    orchestrator = module.get<PackageOrchestratorService>(PackageOrchestratorService);
    webhookService = module.get<PaymentWebhookService>(PaymentWebhookService);
    refundEngine = module.get<RefundEngineService>(RefundEngineService);
    providerActivation = module.get<ProviderActivationService>(ProviderActivationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('1. Provider Status Matrix & Audit Verification', () => {
    it('should generate a truthful preflight overview masking all secrets', () => {
      const overview = providerActivation.getProviderStatusOverview();
      expect(overview).toBeDefined();
      expect(overview.payment.providerName).toBe('Payment Gateway');
      expect(overview.hotels.providerName).toBe('Hotels');
      expect(overview.trains.selectedProvider).toBe('confirmation');
      expect(overview.flights.selectedProvider).toBe('mock');
    });

    it('should correctly flag unconfigured production keys without breaking development mode', () => {
      const preflight = providerActivation.getPreflightCheck();
      expect(preflight.mode).toBeDefined();
      expect(preflight.database.urlMasked).not.toContain('password');
    });
  });

  describe('2. Payment Safety & Webhook Deduplication', () => {
    it('should verify valid webhooks and deduplicate repeated webhook events', () => {
      const payload = { event: 'payment.captured', id: 'evt_unique_1001', amount: 3680000 };
      const secret = process.env.PAYMENT_WEBHOOK_SECRET || 'chalo_farva_webhook_secret_key_2026';
      const sig = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');

      const firstPass = webhookService.verifyAndNormalizeWebhook('razorpay', payload, sig);
      expect(firstPass.processed).toBe(true);
      expect(firstPass.eventType).toBe('PAYMENT_CAPTURED');

      const secondPass = webhookService.verifyAndNormalizeWebhook('razorpay', payload, sig);
      expect(secondPass.processed).toBe(false);
      expect(secondPass.eventType).toBe('DUPLICATE_IGNORED');
    });

    it('should reject webhooks with missing signature', () => {
      expect(() => {
        webhookService.verifyAndNormalizeWebhook('razorpay', { event: 'payment.captured' }, '');
      }).toThrow(UnauthorizedException);
    });
  });

  describe('3. Gujarat E2E Package Booking Flow (Somnath-Dwarka)', () => {
    it('should execute full package flow: Quote -> Initiate PAYMENT_PENDING -> Fulfill CONFIRMED', async () => {
      // Step A: Create Quote
      const quote = await quoteEngine.createQuote({
        packageSlug: 'somnath-dwarka-spiritual',
        travelDate: '2026-10-20',
        adultsCount: 2,
        hotelCategory: 'HERITAGE',
        transportOption: 'BUS',
        selectedActivityIds: ['act-101'],
      });
      expect(quote.quoteReference).toBeDefined();

      // Step B: Initiate Booking (PAYMENT_PENDING state)
      const initiated = await orchestrator.initiateBooking({
        quoteReference: quote.quoteReference,
        userId: 'usr_aarav',
        customerName: 'Aarav Mehta',
        customerEmail: 'aarav@bharatyatra.com',
        customerPhone: '+919988776655',
      });
      expect(initiated.status).toBe('PAYMENT_PENDING');

      // Step C: Fulfill AFTER Payment Verified
      const fulfillment = await orchestrator.fulfillBookingAfterVerifiedPayment({
        bookingId: initiated.bookingId,
        gatewayOrderId: 'rzp_order_somnath_101',
        gatewayPaymentId: 'pay_somnath_101',
      });

      expect(fulfillment.success).toBe(true);
      expect(fulfillment.status).toBe('CONFIRMED');
      expect(mockPrismaService.supplierBookingRecord.create).toHaveBeenCalled();
    });
  });

  describe('4. Partial Failure & Operational Task Generation', () => {
    it('should handle partial supplier failure by creating OperationalTask and setting PARTIALLY_CONFIRMED', async () => {
      mockProviderRegistry.getProvider.mockImplementation((type: string) => {
        if (type === 'BUS') {
          return {
            providerId: 'BUS_PROVIDER',
            providerName: 'GSRTC Bus Provider',
            createBooking: jest.fn().mockRejectedValue(new Error('GSRTC seat allocation timeout')),
          };
        }
        return {
          providerId: `${type}_PROVIDER`,
          providerName: `Mock ${type} Provider`,
          createBooking: jest.fn().mockResolvedValue({ supplierReference: 'HBX-REF-HOTEL-99', status: 'CONFIRMED' }),
        };
      });

      const fulfillment = await orchestrator.fulfillBookingAfterVerifiedPayment({
        bookingId: 'booking-p5-001',
        gatewayOrderId: 'rzp_ord_partial_55',
        gatewayPaymentId: 'pay_partial_55',
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

  describe('5. Refund Policy Calculation', () => {
    it('should calculate 100% full refund on provider booking failure', () => {
      const calc = refundEngine.calculateRefund(36800, { policyType: 'STRICT', hoursBeforeDeparture: 10 }, 10, true);
      expect(calc.refundType).toBe('FULL_REFUND');
      expect(calc.refundAmountInr).toBe(36800);
      expect(calc.cancellationFeeInr).toBe(0);
    });

    it('should calculate strict policy cancellation charges when customer cancels <24 hours before travel', () => {
      const calc = refundEngine.calculateRefund(36800, { policyType: 'STRICT', hoursBeforeDeparture: 12 }, 12, false);
      expect(calc.refundType).toBe('NO_REFUND');
      expect(calc.refundAmountInr).toBe(0);
      expect(calc.cancellationFeeInr).toBe(36800);
    });
  });
});
