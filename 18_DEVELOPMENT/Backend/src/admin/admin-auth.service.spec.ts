import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuditService } from './admin-audit.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminAuthService - Security & Bootstrap Hardening', () => {
  let service: AdminAuthService;
  let mockPrisma: any;
  let mockConfig: any;
  let mockAudit: any;

  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };

    mockPrisma = {
      adminUser: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockResolvedValue({ id: 'admin-1', username: 'test_admin' }),
        findUnique: jest.fn(),
      },
      adminSession: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    mockConfig = {
      get: jest.fn((key: string) => {
        if (key === 'ADMIN_BOOTSTRAP_USERNAME') return process.env.ADMIN_BOOTSTRAP_USERNAME;
        if (key === 'ADMIN_BOOTSTRAP_PASSWORD') return process.env.ADMIN_BOOTSTRAP_PASSWORD;
        return undefined;
      }),
    };

    mockAudit = {
      logAction: jest.fn().mockResolvedValue(true),
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('Production mode: fails closed if database has 0 admins and no bootstrap credentials set', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ADMIN_BOOTSTRAP_USERNAME;
    delete process.env.ADMIN_BOOTSTRAP_PASSWORD;

    service = new AdminAuthService(mockPrisma as any, mockConfig as any, mockAudit as any);

    await expect(service.onModuleInit()).rejects.toThrow(/FATAL.*ADMIN_BOOTSTRAP_USERNAME.*environment variables/i);
  });

  it('Production mode: fails closed if bootstrap password is the default placeholder', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_BOOTSTRAP_USERNAME = 'prod_operator';
    process.env.ADMIN_BOOTSTRAP_PASSWORD = 'BharatYatraAdmin2026!';

    service = new AdminAuthService(mockPrisma as any, mockConfig as any, mockAudit as any);

    await expect(service.onModuleInit()).rejects.toThrow(/FATAL.*cannot use default or weak password/i);
  });

  it('Production mode: fails closed if bootstrap password is shorter than 16 chars', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_BOOTSTRAP_USERNAME = 'prod_operator';
    process.env.ADMIN_BOOTSTRAP_PASSWORD = 'ShortPassword1!';

    service = new AdminAuthService(mockPrisma as any, mockConfig as any, mockAudit as any);

    await expect(service.onModuleInit()).rejects.toThrow(/FATAL.*cannot use default or weak password/i);
  });

  it('Production mode: succeeds when valid strong credentials provided', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_BOOTSTRAP_USERNAME = 'prod_security_officer';
    process.env.ADMIN_BOOTSTRAP_PASSWORD = 'SuperSecureLongPassword2026!#$';

    service = new AdminAuthService(mockPrisma as any, mockConfig as any, mockAudit as any);

    await expect(service.onModuleInit()).resolves.not.toThrow();
    expect(mockPrisma.adminUser.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: 'prod_security_officer',
          role: 'SUPER_ADMIN',
        }),
      }),
    );
  });

  it('Test mode: initializes isolated test admin account', async () => {
    process.env.NODE_ENV = 'test';
    delete process.env.ADMIN_BOOTSTRAP_USERNAME;
    delete process.env.ADMIN_BOOTSTRAP_PASSWORD;

    service = new AdminAuthService(mockPrisma as any, mockConfig as any, mockAudit as any);

    await expect(service.onModuleInit()).resolves.not.toThrow();
    expect(mockPrisma.adminUser.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: 'bharatyatra_admin',
          role: 'SUPER_ADMIN',
        }),
      }),
    );
  });
});
