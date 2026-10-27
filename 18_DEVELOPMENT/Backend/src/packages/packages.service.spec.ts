import { Test, TestingModule } from '@nestjs/testing';
import { PackagesService } from './packages.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PackagesService', () => {
  let service: PackagesService;

  const mockPrismaService = {
    package: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'test-id' }),
    },
    packageBooking: {
      create: jest.fn().mockResolvedValue({ id: 'booking-id', bookingReference: 'CF-PKG-1234' }),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PackagesService>(PackagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return packages matching search or fallback to reference packages', async () => {
    const result = await service.findAll({ search: 'Somnath' });
    expect(result.success).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('should find package by slug', async () => {
    const result = await service.findBySlug('dwarka-somnath-holy-yatra-standard');
    expect(result.success).toBe(true);
    expect(result.data.title).toBeDefined();
  });

  it('should calculate package price with travellers and hotel upgrade', async () => {
    const calc = await service.calculatePrice({
      packageSlug: 'dwarka-somnath-holy-yatra-standard',
      travellers: 2,
    });

    expect(calc.success).toBe(true);
    expect(calc.data.breakdown.grandTotal).toBeGreaterThan(0);
    expect(calc.data.breakdown.gstTax).toBeGreaterThan(0);
  });
});
