import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  let mockPrisma: any;
  let mockFlightsService: any;
  let mockHotelsService: any;

  beforeEach(() => {
    mockPrisma = {
      cart: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      cartItem: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    mockFlightsService = {
      revalidate: jest.fn().mockResolvedValue({
        status: 'AVAILABLE',
        oldFare: 5850,
        newFare: 5850,
        priceChanged: false,
      }),
    };

    mockHotelsService = {
      revalidatePrice: jest.fn().mockResolvedValue({
        status: 'AVAILABLE',
        available: true,
        price: 7200,
        priceChanged: false,
      }),
    };

    service = new CartService(
      mockPrisma as any,
      mockFlightsService as any,
      mockHotelsService as any,
    );
  });

  describe('getOrCreateCart', () => {
    it('should return existing active cart if found', async () => {
      const existingCart = {
        id: 'cart-123',
        userId: 'user-1',
        status: 'ACTIVE',
        currency: 'INR',
        expiresAt: new Date(Date.now() + 3600000),
        items: [],
      };
      mockPrisma.cart.findFirst.mockResolvedValue(existingCart);

      const result = await service.getOrCreateCart({ userId: 'user-1' });

      expect(result.id).toBe('cart-123');
      expect(result.total).toBe(0);
      expect(mockPrisma.cart.create).not.toHaveBeenCalled();
    });

    it('should create new active cart with 2-hour sliding TTL if no active cart exists', async () => {
      mockPrisma.cart.findFirst.mockResolvedValue(null);
      const createdCart = {
        id: 'cart-new',
        userId: 'user-1',
        status: 'ACTIVE',
        currency: 'INR',
        expiresAt: new Date(Date.now() + 7200000),
        items: [],
      };
      mockPrisma.cart.create.mockResolvedValue(createdCart);

      const result = await service.getOrCreateCart({ userId: 'user-1' });

      expect(result.id).toBe('cart-new');
      expect(mockPrisma.cart.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            status: 'ACTIVE',
          }),
        }),
      );
    });
  });

  describe('calculateTotals', () => {
    it('should calculate server-authoritative totals with 18% GST and ₹250 platform service fee', () => {
      const items = [
        { priceSnapshot: 5000 },
        { priceSnapshot: 3000 },
      ];

      const totals = service.calculateTotals(items);

      expect(totals.subtotal).toBe(8000);
      expect(totals.taxes).toBe(1440); // 18% of 8000
      expect(totals.serviceFee).toBe(250);
      expect(totals.total).toBe(9690); // 8000 + 1440 + 250
    });
  });

  describe('detectTripConflicts', () => {
    it('should detect tight connection warning when activity starts within 60 mins of flight arrival', () => {
      const items = [
        {
          id: 'item-flight',
          itemType: 'FLIGHT',
          productName: 'Ahmedabad to Delhi Flight',
          metadata: { arrivalTime: '2026-10-18T10:00:00.000Z' },
        },
        {
          id: 'item-act',
          itemType: 'ACTIVITY',
          productName: 'Red Fort Guided Tour',
          metadata: { startDate: '2026-10-18T10:15:00.000Z' },
        },
      ];

      const conflicts = service.detectTripConflicts(items);

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].type).toBe('TIGHT_CONNECTION');
      expect(conflicts[0].message).toContain('starts only 15 mins after');
    });

    it('should detect schedule conflict when activity is scheduled before flight arrival', () => {
      const items = [
        {
          id: 'item-flight',
          itemType: 'FLIGHT',
          productName: 'Mumbai to Goa Flight',
          metadata: { arrivalTime: '2026-10-18T14:00:00.000Z' },
        },
        {
          id: 'item-act',
          itemType: 'ACTIVITY',
          productName: 'Scuba Diving Tour',
          metadata: { startDate: '2026-10-18T13:00:00.000Z' },
        },
      ];

      const conflicts = service.detectTripConflicts(items);

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].type).toBe('SCHEDULE_CONFLICT');
      expect(conflicts[0].message).toContain('starts before');
    });
  });

  describe('revalidateCart', () => {
    it('should fan-out revalidate all items and generate accurate report', async () => {
      const mockCart = {
        id: 'cart-123',
        items: [
          {
            id: 'item-1',
            itemType: 'FLIGHT',
            referenceId: 'FL-101',
            productName: 'Indigo Air',
            priceSnapshot: 5850,
            metadata: {},
          },
          {
            id: 'item-2',
            itemType: 'HOTEL',
            referenceId: 'HOT-500',
            productName: 'Taj Hotel',
            priceSnapshot: 7200,
            metadata: {},
          },
        ],
      };
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
      mockPrisma.cartItem.update.mockImplementation(({ data }) => Promise.resolve(data));

      const report = await service.revalidateCart('cart-123');

      expect(report.isAvailable).toBe(true);
      expect(report.hasPriceChange).toBe(false);
      expect(report.items.length).toBe(2);
      expect(mockFlightsService.revalidate).toHaveBeenCalledWith({
        transportId: 'FL-101',
        passengersCount: 1,
      });
      expect(mockHotelsService.revalidatePrice).toHaveBeenCalled();
    });

    it('should detect price changes and surface differential price updates', async () => {
      const mockCart = {
        id: 'cart-123',
        items: [
          {
            id: 'item-2',
            itemType: 'HOTEL',
            referenceId: 'HOT-500',
            productName: 'Taj Hotel',
            priceSnapshot: 6500,
            metadata: {},
          },
        ],
      };
      mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
      mockHotelsService.revalidatePrice.mockResolvedValue({
        status: 'PRICE_CHANGED',
        available: true,
        price: 7100,
        priceChanged: true,
      });
      mockPrisma.cartItem.update.mockImplementation(({ data }) => Promise.resolve(data));

      const report = await service.revalidateCart('cart-123');

      expect(report.hasPriceChange).toBe(true);
      expect(report.totalPriceDifference).toBe(600);
      expect(report.items[0].warning).toContain('Price changed from ₹6,500 to ₹7,100');
    });
  });
});
