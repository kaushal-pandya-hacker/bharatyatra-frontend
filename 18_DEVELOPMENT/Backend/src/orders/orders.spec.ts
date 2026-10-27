import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockPrisma: any;
  let mockFlightsService: any;
  let mockHotelsService: any;
  let mockActivitiesService: any;

  beforeEach(() => {
    mockPrisma = {
      checkoutSession: {
        findUnique: jest.fn(),
      },
      order: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      orderItem: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      paymentAllocation: {
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      cart: {
        update: jest.fn(),
      },
    };

    mockFlightsService = {
      createBooking: jest.fn().mockResolvedValue({
        chaloFarvaBookingId: 'booking-flight-1',
        bookingReference: 'CF-FL-100',
        status: 'CONFIRMED',
      }),
    };

    mockHotelsService = {
      createBooking: jest.fn().mockResolvedValue({
        chaloFarvaBookingId: 'booking-hotel-1',
        bookingReference: 'CF-HT-200',
        status: 'CONFIRMED',
      }),
    };

    mockActivitiesService = {
      createBooking: jest.fn().mockRejectedValue(new Error('Activity slot sold out')),
    };

    service = new OrdersService(
      mockPrisma as any,
      mockFlightsService as any,
      mockHotelsService as any,
      undefined,
      undefined,
      mockActivitiesService as any,
      undefined,
    );
  });

  describe('generateOrderReference', () => {
    it('should generate order reference matching CF-ORD-YYYYMMDD-XXXXXX pattern', () => {
      const ref = service.generateOrderReference();

      expect(ref).toMatch(/^CF-ORD-\d{8}-\d{6}$/);
    });
  });

  describe('createOrderFromCheckout', () => {
    it('should create order, order items, and payment allocations from checkout session', async () => {
      const mockSession = {
        id: 'session-123',
        userId: 'user-42',
        cartId: 'cart-1',
        priceSnapshot: {
          subtotal: 10000,
          taxes: 1800,
          serviceFee: 250,
          discount: 0,
          totalAmountInr: 12050,
          currency: 'INR',
        },
        revalidationStatus: { contactInfo: { fullName: 'Kaushal Pandya' } },
        cart: {
          items: [
            {
              id: 'item-fl',
              itemType: 'FLIGHT',
              referenceId: 'FL-1',
              provider: 'Indigo',
              productName: 'Flight to Delhi',
              priceSnapshot: 6000,
              metadata: {},
            },
            {
              id: 'item-ht',
              itemType: 'HOTEL',
              referenceId: 'HT-1',
              provider: 'Hotelbeds',
              productName: 'Taj Hotel',
              priceSnapshot: 4000,
              metadata: {},
            },
          ],
        },
      };

      mockPrisma.checkoutSession.findUnique.mockResolvedValue(mockSession);
      mockPrisma.order.findFirst.mockResolvedValue(null);
      mockPrisma.order.create.mockResolvedValue({
        id: 'order-777',
        orderReference: 'CF-ORD-20260918-123456',
        userId: 'user-42',
        status: 'PAID',
      });

      mockPrisma.orderItem.create
        .mockResolvedValueOnce({ id: 'oi-1', itemType: 'FLIGHT', referenceId: 'FL-1', amountInr: 6000 })
        .mockResolvedValueOnce({ id: 'oi-2', itemType: 'HOTEL', referenceId: 'HT-1', amountInr: 4000 });

      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-777',
        userId: 'user-42',
        items: [
          { id: 'oi-1', itemType: 'FLIGHT', referenceId: 'FL-1', amountInr: 6000, metadata: {} },
          { id: 'oi-2', itemType: 'HOTEL', referenceId: 'HT-1', amountInr: 4000, metadata: {} },
        ],
      });

      mockPrisma.order.update.mockImplementation(({ data }) => Promise.resolve({ id: 'order-777', ...data }));

      const order = await service.createOrderFromCheckout('session-123', 'pay-999');

      expect(order).toBeDefined();
      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            checkoutSessionId: 'session-123',
            paymentId: 'pay-999',
            status: 'PAID',
          }),
        }),
      );
      expect(mockPrisma.paymentAllocation.create).toHaveBeenCalledTimes(2);
      expect(mockPrisma.cart.update).toHaveBeenCalledWith({
        where: { id: 'cart-1' },
        data: { status: 'COMPLETED' },
      });
    });
  });

  describe('orchestrateOrderBookings (Partial Failure Handling)', () => {
    it('should set order status to PARTIALLY_CONFIRMED when 1 supplier succeeds and 1 supplier fails', async () => {
      const mockOrder = {
        id: 'order-multi',
        userId: 'user-1',
        items: [
          {
            id: 'item-fl',
            itemType: 'FLIGHT',
            referenceId: 'FL-100',
            productName: 'Flight to Delhi',
            amountInr: 6000,
            metadata: {},
          },
          {
            id: 'item-act',
            itemType: 'ACTIVITY',
            referenceId: 'ACT-500',
            productName: 'Scuba Diving',
            amountInr: 4000,
            metadata: {},
          },
        ],
      };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.orderItem.update.mockImplementation(({ data }) => Promise.resolve(data));
      mockPrisma.order.update.mockImplementation(({ data }) => Promise.resolve({ ...mockOrder, ...data }));

      const result = await service.orchestrateOrderBookings('order-multi');

      expect(result.status).toBe('PARTIALLY_CONFIRMED');
      expect(mockPrisma.paymentAllocation.updateMany).toHaveBeenCalledWith({
        where: { orderItemId: 'item-act' },
        data: { status: 'REFUND_REQUIRED' },
      });
    });
  });

  describe('cancelOrderItem', () => {
    it('should calculate refund entitlement based on cancellation policy fee', async () => {
      const mockItem = {
        id: 'oi-123',
        orderId: 'order-1',
        amountInr: 5000,
        status: 'CONFIRMED',
        cancellationPolicy: { feePercentage: 10 },
      };

      mockPrisma.orderItem.findFirst.mockResolvedValue(mockItem);
      mockPrisma.orderItem.update.mockResolvedValue({ ...mockItem, status: 'CANCELLED' });

      const result = await service.cancelOrderItem('order-1', 'oi-123', 'Customer change of plans');

      expect(result.status).toBe('CANCELLED');
      expect(result.grossAmount).toBe(5000);
      expect(result.feePercentage).toBe(10);
      expect(result.refundAmount).toBe(4500); // 5000 - 10%
      expect(result.refundStatus).toBe('REQUESTED');
    });
  });
});
