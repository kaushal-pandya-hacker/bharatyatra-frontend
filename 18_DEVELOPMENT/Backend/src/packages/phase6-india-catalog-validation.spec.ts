import { Test, TestingModule } from '@nestjs/testing';
import { PackagesService } from './packages.service';
import { QuoteEngineService } from './quote-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { UniversalProviderRegistry } from '../providers/registry/universal-provider.registry';
import masterPackagesData from '../data/tourism/packages-master.json';

describe('Phase 6: India-Wide Real Travel Package Expansion Validation', () => {
  let packagesService: PackagesService;
  let quoteEngine: QuoteEngineService;

  const ALL_STATES_AND_UTS = [
    // 28 States
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    // 8 Union Territories
    'Andaman & Nicobar', 'Chandigarh', 'Dadra & Nagar Haveli and Daman & Diu',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
  ];

  const mockPrismaService = {
    package: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    packageQuote: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'quote-p6-uuid', ...data })),
    },
  };

  const mockProviderRegistry = {
    getProvider: jest.fn().mockImplementation((type: string) => ({
      providerId: `${type}_PROVIDER`,
      providerName: `Mock ${type} Provider`,
      checkPrice: jest.fn().mockResolvedValue({ status: 'AVAILABLE', netPrice: 5000, currency: 'INR' }),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        QuoteEngineService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UniversalProviderRegistry, useValue: mockProviderRegistry },
      ],
    }).compile();

    packagesService = module.get<PackagesService>(PackagesService);
    quoteEngine = module.get<QuoteEngineService>(QuoteEngineService);
  });

  const getPackagesList = (): any[] => {
    const raw = masterPackagesData as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.default)) return raw.default;
    if (Array.isArray(raw?.packages)) return raw.packages;
    try {
      const json = require('../data/tourism/packages-master.json');
      if (Array.isArray(json)) return json;
      if (Array.isArray(json?.default)) return json.default;
    } catch (e) {}
    return [];
  };


  describe('1. India-Wide Geographical Coverage Audit', () => {
    it('should cover all 28 Indian States and 8 Union Territories in the catalog dataset', () => {
      const packagesList = getPackagesList();
      const coveredStates = new Set<string>();

      packagesList.forEach((pkg: any) => {
        if (pkg.stateOrRegion) {
          coveredStates.add(pkg.stateOrRegion.trim());
        }
      });

      const missingStates = ALL_STATES_AND_UTS.filter(st => !coveredStates.has(st));
      expect(missingStates).toEqual([]);
      expect(coveredStates.size).toBeGreaterThanOrEqual(36);
    });

    it('should have 0 duplicate package IDs or duplicate slugs', () => {
      const packagesList = getPackagesList();
      const idSet = new Set<string>();
      const slugSet = new Set<string>();

      packagesList.forEach((pkg: any) => {
        expect(idSet.has(pkg.packageId)).toBe(false);
        expect(slugSet.has(pkg.slug)).toBe(false);
        idSet.add(pkg.packageId);
        slugSet.add(pkg.slug);
      });
    });

    it('should ensure every package has structured day-by-day itinerary with valid destinations', () => {
      const packagesList = getPackagesList();

      packagesList.forEach((pkg: any) => {
        expect(pkg.packageName).toBeTruthy();
        expect(pkg.slug).toBeTruthy();
        expect(pkg.durationDays).toBeGreaterThan(0);
        expect(Array.isArray(pkg.dailyItinerary)).toBe(true);
        expect(pkg.dailyItinerary.length).toBeGreaterThan(0);
        expect(pkg.dailyItinerary[0].day).toBe(1);
      });
    });
  });


  describe('2. India-Wide Universal Search Engine', () => {
    it('should return packages when searching by State name ("Kashmir", "Goa", "Rajasthan")', async () => {
      const kashmir = await packagesService.findAll({ search: 'Kashmir' });
      expect(kashmir.count).toBeGreaterThan(0);
      expect(kashmir.data.some((p: any) => p.state.includes('Jammu & Kashmir') || p.title.includes('Kashmir'))).toBe(true);

      const goa = await packagesService.findAll({ search: 'Goa' });
      expect(goa.count).toBeGreaterThan(0);

      const rajasthan = await packagesService.findAll({ search: 'Rajasthan' });
      expect(rajasthan.count).toBeGreaterThan(0);
    });

    it('should return packages when searching by Tourism Theme ("wildlife", "beach", "spiritual", "mountains")', async () => {
      const spiritual = await packagesService.findAll({ search: 'spiritual' });
      expect(spiritual.count).toBeGreaterThan(0);

      const beach = await packagesService.findAll({ search: 'beach' });
      expect(beach.count).toBeGreaterThan(0);
    });

    it('should return packages filtered by price range and duration', async () => {
      const filtered = await packagesService.findAll({
        minPrice: 10000,
        maxPrice: 30000,
        minDays: 3,
        maxDays: 8,
      });

      expect(filtered.count).toBeGreaterThan(0);
      filtered.data.forEach((p: any) => {
        expect(p.startingPrice).toBeGreaterThanOrEqual(10000);
        expect(p.startingPrice).toBeLessThanOrEqual(30000);
        expect(p.durationDays).toBeGreaterThanOrEqual(3);
        expect(p.durationDays).toBeLessThanOrEqual(8);
      });
    });
  });

  describe('3. Quote Engine Compatibility Across India Packages', () => {
    it('should seamlessly calculate live quote for a non-Gujarat package (e.g. Rajasthan Heritage Tour)', async () => {
      const quote = await quoteEngine.createQuote({
        packageSlug: 'rajasthan-circuit-1',

        travelDate: '2026-11-10',
        adultsCount: 2,
        hotelCategory: 'DELUXE',
        transportOption: 'SUV',
      });

      expect(quote).toBeDefined();
      expect(quote.quoteReference).toMatch(/^BY-QT-/);
      expect(quote.totalAmountInr).toBeGreaterThan(0);
      expect(quote.currency).toBe('INR');
      expect(quote.isExpired).toBe(false);
    });
  });
});
