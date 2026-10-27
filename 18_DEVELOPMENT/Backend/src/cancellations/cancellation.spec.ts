import { CancellationEngineService } from './cancellation-engine.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('CancellationEngineService', () => {
  let service: CancellationEngineService;
  let mockPrisma: any;
  let mockFlightsService: any;
  let mockRefundEngineService: any;

  beforeEach(() => {
    mockPrisma = {
      order: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      orderItem: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      cancellationRequest: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
      refund: {
        create: jest.fn(),
      },
      bookingEvent: {
        create: jest.fn(),
      },
    };

    mockFlightsService = {
      cancelBooking: jest.fn().mockResolvedValue({
        status: 'CANCELLED',
        cancellationFee: 1000,
        refundAmount: 5000,
      }),
    };

    mockRefundEngineService = {
      processRefund: jest.fn().mockResolvedValue({
        refundId: 'rfnd-123',
        gatewayRefundId: 'rzp_rfnd_999',
        status: 'REFUNDED',
      }),
    };

    service = new CancellationEngineService(
      mockPrisma as any,
      mockFlightsService as any,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      mockRefundEngineService as any,
    );
  });

  describe('checkEligibility', () => {
    it('should throw ForbiddenException (403) if user does not own the order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-100',
        userId: 'user-owner',
        items: [],
      });

      await expect(
        service.checkEligibility('user-unauthorized', 'order-100', 'item-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return ineligible if order item travel date has passed', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-100',
        userId: 'user-1',
        items: [
          {
            id: 'item-1',
            status: 'CONFIRMED',
            metadata: { departureDate: '2020-01-01' },
          },
        ],
      });

      const result = await service.checkEligibility('user-1', 'order-100', 'item-1');

      expect(result.isEligible).toBe(false);
      expect(result.reason).toBe('TRAVEL_DATE_PASSED');
    });
  });

  describe('getCancellationQuote', () => {
    it('should calculate server-authoritative quote breakdown', async () => {
      const futureDate = new Date(Date.now() + 7 * 86400000).toISOString();
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-100',
        userId: 'user-1',
        items: [
          {
            id: 'item-1',
            status: 'CONFIRMED',
            itemType: 'FLIGHT',
            productName: 'Flight to Delhi',
            amountInr: 8000,
            metadata: { departureDate: futureDate },
            cancellationPolicy: { refundable: true, feePercentage: 10 },
          },
        ],
      });

      mockPrisma.orderItem.findUnique.mockResolvedValue({
        id: 'item-1',
        itemType: 'FLIGHT',
        productName: 'Flight to Delhi',
        amountInr: 8000,
        cancellationPolicy: { refundable: true, feePercentage: 10 },
      });

      mockPrisma.cancellationRequest.create.mockResolvedValue({
        id: 'cancel-req-1',
        status: 'QUOTE_READY',
      });

      const quote = await service.getCancellationQuote('user-1', 'order-100', 'item-1');

      expect(quote.cancellationRequestId).toBe('cancel-req-1');
      expect(quote.originalAmount).toBe(8000);
      expect(quote.supplierCancellationFee).toBe(800); // 10% of 8000
      expect(quote.platformFee).toBe(100);
      expect(quote.estimatedRefund).toBeGreaterThan(0);
    });
  });

  describe('confirmCancellation (Multi-Item Component Cancellation)', () => {
    it('should cancel only the requested item and transition order to PARTIALLY_CANCELLED when remaining items are confirmed', async () => {
      const mockRequest = {
        id: 'req-multi',
        userId: 'user-1',
        orderId: 'order-multi',
        status: 'QUOTE_READY',
        quoteData: { estimatedRefund: 4500, supplierCancellationFee: 500, platformFee: 100, taxRefund: 100 },
        order: {
          id: 'order-multi',
          orderReference: 'CF-ORD-20260918-999',
          paymentId: 'pay-1',
          items: [
            { id: 'item-fl', itemType: 'FLIGHT', status: 'CONFIRMED' },
            { id: 'item-ht', itemType: 'HOTEL', status: 'CONFIRMED' },
          ],
        },
        orderItem: {
          id: 'item-ht',
          itemType: 'FLIGHT',
          bookingId: 'bk-ht-1',
          productName: 'Taj Hotel',
          amountInr: 5000,
        },
      };

      mockPrisma.cancellationRequest.findUnique.mockResolvedValue(mockRequest);
      mockPrisma.cancellationRequest.update.mockResolvedValue({ ...mockRequest, status: 'CANCELLED' });
      mockPrisma.orderItem.update.mockImplementation(({ data }) => Promise.resolve(data));
      mockPrisma.order.update.mockImplementation(({ data }) => Promise.resolve(data));
      mockPrisma.refund.create.mockResolvedValue({ id: 'rfnd-new', status: 'PROCESSING' });

      const result = await service.confirmCancellation('user-1', 'req-multi', 'Customer change of dates');

      expect(result.status).toBe('CANCELLED');
      expect(result.orderStatus).toBe('PARTIALLY_CANCELLED');
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-multi' },
        data: { status: 'PARTIALLY_CANCELLED' },
      });
      expect(mockRefundEngineService.processRefund).toHaveBeenCalledWith({
        paymentId: 'pay-1',
        refundId: 'rfnd-new',
        amountInr: 4500,
        reason: 'Customer change of dates',
      });
    });

    it('should route cancellation to MANUAL_REVIEW when supplier cancellation fails', async () => {
      const mockRequest = {
        id: 'req-fail',
        userId: 'user-1',
        orderId: 'order-1',
        status: 'QUOTE_READY',
        quoteData: { estimatedRefund: 2000 },
        order: {
          id: 'order-1',
          items: [{ id: 'item-fl', status: 'CONFIRMED' }],
        },
        orderItem: {
          id: 'item-fl',
          itemType: 'FLIGHT',
          bookingId: 'bk-fl-1',
          productName: 'Indigo Flight',
          amountInr: 3000,
        },
      };

      mockPrisma.cancellationRequest.findUnique.mockResolvedValue(mockRequest);
      mockPrisma.cancellationRequest.update.mockResolvedValue({ ...mockRequest, status: 'MANUAL_REVIEW' });
      mockFlightsService.cancelBooking.mockRejectedValue(new Error('Supplier API timeout'));

      const result = await service.confirmCancellation('user-1', 'req-fail');

      expect(result.status).toBe('MANUAL_REVIEW');
      expect(result.message).toContain('manual agent verification');
      expect(mockPrisma.cancellationRequest.update).toHaveBeenCalledWith({
        where: { id: 'req-fail' },
        data: { status: 'MANUAL_REVIEW', processedAt: expect.any(Date) },
      });
    });
  });
});
