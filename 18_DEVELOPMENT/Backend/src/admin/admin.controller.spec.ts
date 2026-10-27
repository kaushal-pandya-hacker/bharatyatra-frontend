import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuditService } from './admin-audit.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AdminController Security Unit Tests', () => {
  let controller: AdminController;
  let adminAuthService: any;
  let adminService: any;

  beforeEach(async () => {
    adminAuthService = {
      login: jest.fn(),
      getAdminFromToken: jest.fn(),
      logout: jest.fn(),
      changePassword: jest.fn(),
    };

    adminService = {
      getDashboardMetrics: jest.fn().mockResolvedValue({
        metrics: { totalUsers: 10, activeUsers: 8, totalTrips: 20 },
        recentActivity: [],
        systemStatus: { status: 'healthy' },
      }),
      getUsers: jest.fn().mockResolvedValue({ success: true, data: [], pagination: {} }),
      getUserDetails: jest.fn(),
      updateUserStatus: jest.fn(),
      getTrips: jest.fn(),
      getBookings: jest.fn(),
      getNotificationHistory: jest.fn(),
      broadcastNotification: jest.fn(),
      getAuditLogs: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminAuthService, useValue: adminAuthService },
        { provide: AdminService, useValue: adminService },
        { provide: AdminAuditService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should authenticate valid admin credentials', async () => {
    adminAuthService.login.mockResolvedValue({
      token: 'admin-jwt-token-123',
      expiresAt: new Date(),
      admin: { id: 'admin-1', username: 'bharatyatra_admin', role: 'SUPER_ADMIN' },
    });

    const result = await controller.adminLogin(
      { ip: '127.0.0.1', headers: {} } as any,
      { username: 'bharatyatra_admin', password: 'ValidPassword123!' },
    );
    expect(result.token).toBe('admin-jwt-token-123');
  });

  it('should reject invalid admin credentials with generic error', async () => {
    adminAuthService.login.mockRejectedValue(
      new UnauthorizedException('Invalid admin credentials.'),
    );

    await expect(
      controller.adminLogin({ ip: '127.0.0.1', headers: {} } as any, { username: 'fake_user', password: 'wrong' }),
    ).rejects.toThrow('Invalid admin credentials.');
  });

  it('should fetch admin dashboard metrics for authorized admin', async () => {
    const stats = await controller.getDashboardMetrics({ admin: { id: 'admin-1' } } as any);
    expect(stats.metrics.totalUsers).toBe(10);
  });
});
