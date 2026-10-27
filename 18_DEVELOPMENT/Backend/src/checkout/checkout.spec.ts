import { CheckoutSessionService } from './checkout-session.service';

describe('CheckoutSessionService', () => {
  let service: CheckoutSessionService;
  let mockPrisma: any;
  let mockCartService: any;

  beforeEach(() => {
    mockPrisma = {
      checkoutSession: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      cart: {
        update: jest.fn(),
      },
    };

    mockCartService = {
      getCartById: jest.fn().mockResolvedValue({
        id: 'cart-123',
        subtotal: 10000,
        taxes: 1800,
        serviceFee: 250,
        discount: 0,
        total: 12050,
        currency: 'INR',
        items: [
          {
            id: 'item-1',
            itemType: 'FLIGHT',
            productName: 'Flight to Delhi',
            priceSnapshot: 10000,
          },
        ],
      }),
      revalidateCart: jest.fn().mockResolvedValue({
        cartId: 'cart-123',
        isAvailable: true,
        hasPriceChange: false,
        totalPriceDifference: 0,
        items: [],
        conflicts: [],
      }),
    };

    service = new CheckoutSessionService(mockPrisma as any, mockCartService as any);
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session with 15-minute TTL when all items are available', async () => {
      const mockSession = {
        id: 'session-999',
        userId: 'user-1',
        cartId: 'cart-123',
        priceSnapshot: { totalAmountInr: 12050 },
        paymentStatus: 'PENDING',
        bookingStatus: 'PENDING',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };
      mockPrisma.checkoutSession.create.mockResolvedValue(mockSession);

      const result = await service.createCheckoutSession('user-1', 'cart-123');

      expect(result.id).toBe('session-999');
      expect(mockCartService.revalidateCart).toHaveBeenCalledWith('cart-123');
      expect(mockPrisma.cart.update).toHaveBeenCalledWith({
        where: { id: 'cart-123' },
        data: { status: 'CHECKOUT' },
      });
    });

    it('should reject checkout session creation if any item is unavailable', async () => {
      mockCartService.revalidateCart.mockResolvedValue({
        cartId: 'cart-123',
        isAvailable: false,
        items: [
          { productName: 'Sold Out Flight', isAvailable: false },
        ],
      });

      await expect(
        service.createCheckoutSession('user-1', 'cart-123'),
      ).rejects.toThrow('no longer available');
    });
  });

  describe('confirmCheckout', () => {
    it('should confirm session details and generate payment gateway order', async () => {
      const mockSession = {
        id: 'session-999',
        cartId: 'cart-123',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Valid unexpired
        priceSnapshot: { totalAmountInr: 12050, currency: 'INR' },
        cart: { items: [{ id: 'i1' }] },
      };
      mockPrisma.checkoutSession.findUnique.mockResolvedValue(mockSession);
      mockPrisma.checkoutSession.update.mockResolvedValue(mockSession);

      const confirmDto = {
        contactInfo: {
          fullName: 'Kaushal Pandya',
          email: 'kaushal@bharatyatra.com',
          phone: '+919876543210',
        },
      };

      const result = await service.confirmCheckout('session-999', confirmDto);

      expect(result.sessionId).toBe('session-999');
      expect(result.amountInr).toBe(12050);
      expect(result.gatewayOrderId).toBeDefined();
      expect(result.gatewayOrderId).toContain('order_');
    });

    it('should reject confirmation if checkout session has expired', async () => {
      const expiredSession = {
        id: 'session-expired',
        expiresAt: new Date(Date.now() - 60000), // Expired 1 min ago
        cart: { items: [] },
      };
      mockPrisma.checkoutSession.findUnique.mockResolvedValue(expiredSession);

      await expect(
        service.confirmCheckout('session-expired', {
          contactInfo: { fullName: 'Test', email: 't@t.com', phone: '123' },
        }),
      ).rejects.toThrow('expired');
    });
  });
});
