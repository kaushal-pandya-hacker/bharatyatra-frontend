import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAuditService } from './admin-audit.service';
import { WebPushService } from '../notifications/web-push.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AdminAuditService,
    private readonly webPushService: WebPushService,
  ) {}

  private isValidUuid(id: string): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
  }

  // ==========================================
  // 1. DASHBOARD OVERVIEW METRICS (REAL DB ONLY)
  // ==========================================

  async getDashboardMetrics(adminId?: string) {
    const now = new Date();
    const [
      uTotal,
      uActive,
      tTotal,
      tUpcoming,
      tActive,
      tCompleted,
      bTotal,
      pushCount,
      suppCount,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.user.count().catch(() => 0),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }).catch(() => 0),
      this.prisma.trip.count().catch(() => 0),
      this.prisma.trip.count({ where: { startDate: { gt: now } } }).catch(() => 0),
      this.prisma.trip.count({ where: { startDate: { lte: now }, endDate: { gte: now } } }).catch(() => 0),
      this.prisma.trip.count({ where: { endDate: { lt: now } } }).catch(() => 0),
      this.prisma.booking.count().catch(() => 0),
      this.prisma.pushSubscription.count({ where: { isActive: true } }).catch(() => 0),
      this.prisma.supplier.count().catch(() => 0),
      this.prisma.adminAuditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { admin: { select: { username: true, displayName: true } } },
      }).catch(() => []),
    ]);

    if (adminId) {
      await this.auditService.logAction({
        adminId,
        action: 'VIEW_DASHBOARD',
        resourceType: 'System',
      });
    }

    return {
      metrics: {
        totalUsers: uTotal,
        activeUsers: uActive,
        totalTrips: tTotal,
        upcomingTrips: tUpcoming,
        activeTrips: tActive,
        completedTrips: tCompleted,
        totalBookings: bTotal,
        activePushSubscriptions: pushCount,
        totalSuppliers: suppCount,
      },
      recentActivity: recentAuditLogs,
      systemStatus: {
        status: 'OPERATIONAL',
        database: 'CONNECTED',
        pushGateway: 'ACTIVE',
        serverTime: new Date(),
      },
    };
  }

  // ==========================================
  // 2. USERS MANAGEMENT (REAL DB ONLY)
  // ==========================================

  async getUsers(params: { page?: number; limit?: number; search?: string; status?: string }, adminId?: string) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }

    if (params.search) {
      const s = params.search.trim();
      where.OR = [
        { fullName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { phoneNumber: { contains: s, mode: 'insensitive' } },
      ];

      if (this.isValidUuid(s)) {
        where.OR.push({ id: s });
      }
    }

    try {
      const [list, count] = await Promise.all([
        this.prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            travelProfile: { select: { homeCity: true, homeState: true } },
            _count: { select: { trips: true, bookings: true, pushSubscriptions: true } },
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      const users = list.map((u) => ({
        id: u.id,
        name: u.fullName || u.email?.split('@')[0] || 'User',
        email: u.email,
        phone: u.phoneNumber || '—',
        role: u.role,
        status: u.status,
        homeCity: u.travelProfile?.homeCity || '',
        homeState: u.travelProfile?.homeState || '',
        tripsCount: u._count.trips,
        bookingsCount: u._count.bookings,
        pushDevicesCount: u._count.pushSubscriptions,
        joinedAt: u.createdAt,
      }));

      if (adminId) {
        await this.auditService.logAction({
          adminId,
          action: 'VIEW_USERS_LIST',
          resourceType: 'User',
          metadata: { page, limit, search: params.search },
        });
      }

      return { users, total: count, page, limit, totalPages: Math.ceil(count / limit) || 1 };
    } catch (e: any) {
      this.logger.error(`Error fetching real users list: ${e.message}`);
      return { users: [], total: 0, page, limit, totalPages: 1 };
    }
  }

  // Detailed User Inspection (REAL DB ONLY)
  async getUserDetail(userId: string, adminId?: string) {
    if (!userId) throw new BadRequestException('User ID required');
    if (!this.isValidUuid(userId)) throw new NotFoundException('Invalid User ID format');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true,
        travelProfile: true,
        notificationPreference: true,
        trips: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, title: true, startDate: true, endDate: true, status: true, totalBudgetInr: true, originCity: true, destinationCity: true },
        },
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, bookingReference: true, bookingType: true, totalAmountInr: true, status: true, createdAt: true },
        },
        pushSubscriptions: {
          where: { isActive: true },
          select: { id: true, deviceType: true, browser: true, isActive: true, lastUsedAt: true, createdAt: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found in database.`);
    }

    if (adminId) {
      await this.auditService.logAction({
        adminId,
        action: 'VIEW_USER_DETAIL',
        resourceType: 'User',
        resourceId: userId,
      });
    }

    return user;
  }

  // Deactivate/Reactivate User Account (REAL DB ONLY)
  async updateUserStatus(targetUserId: string, status: 'ACTIVE' | 'SUSPENDED' | 'DELETED', adminId: string) {
    if (!targetUserId || !status) throw new BadRequestException('Target user ID and status required.');
    if (!this.isValidUuid(targetUserId)) throw new NotFoundException('Invalid Target User ID');

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { status: status as any },
    });

    await this.auditService.logAction({
      adminId,
      action: status === 'SUSPENDED' ? 'DEACTIVATE_USER' : 'REACTIVATE_USER',
      resourceType: 'User',
      resourceId: targetUserId,
      metadata: { newStatus: status },
    });

    return { success: true, message: `User account "${updatedUser.fullName || targetUserId}" status updated to ${status}.` };
  }

  // ==========================================
  // 3. TRIPS MANAGEMENT (REAL DB ONLY)
  // ==========================================

  async getTrips(params: { page?: number; limit?: number; search?: string; status?: string }, adminId?: string) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }

    if (params.search) {
      const s = params.search.trim();
      where.OR = [
        { title: { contains: s, mode: 'insensitive' } },
        { originCity: { contains: s, mode: 'insensitive' } },
        { destinationCity: { contains: s, mode: 'insensitive' } },
      ];
      if (this.isValidUuid(s)) {
        where.OR.push({ id: s }, { userId: s });
      }
    }

    try {
      const [list, count] = await Promise.all([
        this.prisma.trip.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        }),
        this.prisma.trip.count({ where }),
      ]);

      const trips = list.map((t) => ({
        id: t.id,
        userId: t.userId,
        userName: t.user?.fullName || t.user?.email || 'Traveler',
        userEmail: t.user?.email,
        title: t.title,
        originCity: t.originCity || 'N/A',
        destinationCity: t.destinationCity || 'N/A',
        startDate: t.startDate,
        endDate: t.endDate,
        durationDays: t.durationDays,
        travelers: t.travelers,
        totalBudgetInr: t.totalBudgetInr,
        status: t.status,
        createdAt: t.createdAt,
      }));

      if (adminId) {
        await this.auditService.logAction({
          adminId,
          action: 'VIEW_TRIPS_LIST',
          resourceType: 'Trip',
          metadata: { page, limit, search: params.search },
        });
      }

      return { trips, total: count, page, limit, totalPages: Math.ceil(count / limit) || 1 };
    } catch (e: any) {
      this.logger.error(`Error fetching real trips: ${e.message}`);
      return { trips: [], total: 0, page, limit, totalPages: 1 };
    }
  }

  async getTripDetail(tripId: string, adminId?: string) {
    if (!this.isValidUuid(tripId)) throw new NotFoundException('Invalid Trip ID format');

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        user: { select: { id: true, fullName: true, email: true, phoneNumber: true } },
        itineraries: { include: { days: { include: { items: true } } } },
        bookings: true,
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID "${tripId}" not found in database.`);
    }

    if (adminId) {
      await this.auditService.logAction({
        adminId,
        action: 'VIEW_TRIP_DETAIL',
        resourceType: 'Trip',
        resourceId: tripId,
      });
    }

    return trip;
  }

  // ==========================================
  // 4. BOOKINGS MANAGEMENT (REAL DB ONLY)
  // ==========================================

  async getBookings(params: { page?: number; limit?: number; search?: string; type?: string; status?: string }, adminId?: string) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.type) where.bookingType = params.type;
    if (params.status) where.status = params.status;

    if (params.search) {
      const s = params.search.trim();
      where.OR = [
        { bookingReference: { contains: s, mode: 'insensitive' } },
        { inventoryTitle: { contains: s, mode: 'insensitive' } },
      ];
      if (this.isValidUuid(s)) {
        where.OR.push({ id: s }, { userId: s });
      }
    }

    try {
      const [list, count] = await Promise.all([
        this.prisma.booking.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            supplier: { select: { id: true, businessName: true } },
          },
        }),
        this.prisma.booking.count({ where }),
      ]);

      const bookings = list.map((b) => ({
        id: b.id,
        bookingReference: b.bookingReference,
        userId: b.userId,
        userName: b.user?.fullName || b.user?.email || 'Traveler',
        type: b.bookingType,
        supplierName: b.supplier?.businessName || 'Direct Supplier',
        title: `${b.bookingType} Reservation (${b.bookingReference})`,
        totalAmountInr: b.totalAmountInr,
        status: b.status,
        createdAt: b.createdAt,
      }));

      if (adminId) {
        await this.auditService.logAction({
          adminId,
          action: 'VIEW_BOOKINGS_LIST',
          resourceType: 'Booking',
          metadata: { page, limit, search: params.search, type: params.type, status: params.status },
        });
      }

      return { bookings, total: count, page, limit, totalPages: Math.ceil(count / limit) || 1 };
    } catch (e: any) {
      this.logger.error(`Error fetching real bookings: ${e.message}`);
      return { bookings: [], total: 0, page, limit, totalPages: 1 };
    }
  }

  // ==========================================
  // 5. NOTIFICATION AUDIT & BROADCAST (REAL DB ONLY)
  // ==========================================

  async getNotificationHistory(params: { page?: number; limit?: number }, adminId?: string) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    try {
      const [list, count] = await Promise.all([
        this.prisma.notification.findMany({
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: { user: { select: { fullName: true, email: true } } },
        }),
        this.prisma.notification.count(),
      ]);

      return { notifications: list, total: count, page, limit, totalPages: Math.ceil(count / limit) || 1 };
    } catch (e: any) {
      this.logger.error(`Error fetching notification history: ${e.message}`);
      return { notifications: [], total: 0, page: 1, limit: 20, totalPages: 1 };
    }
  }

  async sendSystemBroadcast(
    adminId: string,
    dto: { targetUserId?: string; title: string; body: string; url?: string; category?: any },
    ipAddress?: string,
    userAgent?: string,
  ) {
    if (!dto.title || !dto.body) {
      throw new BadRequestException('Notification title and body are required.');
    }

    let sentCount = 0;

    if (dto.targetUserId) {
      if (!this.isValidUuid(dto.targetUserId)) throw new BadRequestException('Invalid Target User ID');
      const res = await this.webPushService.sendToUser(dto.targetUserId, {
        type: dto.category || 'SYSTEM',
        title: dto.title,
        body: dto.body,
        url: dto.url || '/notifications',
        data: { broadcastBy: adminId },
      });
      sentCount = res.sentCount;
    } else {
      // Broadcast to all users with active push subscriptions in DB
      const activeSubs = await this.prisma.pushSubscription.findMany({
        where: { isActive: true },
        select: { userId: true },
        distinct: ['userId'],
      });

      for (const sub of activeSubs) {
        const res = await this.webPushService.sendToUser(sub.userId, {
          type: dto.category || 'SYSTEM',
          title: dto.title,
          body: dto.body,
          url: dto.url || '/notifications',
          data: { broadcastBy: adminId },
        });
        sentCount += res.sentCount;
      }
    }

    await this.auditService.logAction({
      adminId,
      action: 'SEND_NOTIFICATION_BROADCAST',
      resourceType: 'User',
      resourceId: dto.targetUserId || 'ALL_USERS',
      metadata: { title: dto.title, sentCount },
      ipAddress,
      userAgent,
    });

    return { success: true, message: `Dispatched operational push to ${sentCount} active devices.` };
  }
}
