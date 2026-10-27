import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogOptions {
  adminId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AdminAuditService {
  private readonly logger = new Logger(AdminAuditService.name);
  private readonly memoryAuditLogs: any[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async logAction(options: AuditLogOptions) {
    this.logger.log(`[ADMIN AUDIT] Action: ${options.action} | Admin: ${options.adminId || 'System'} | Target: ${options.resourceType || 'General'}:${options.resourceId || 'N/A'}`);

    // Sanitize metadata to never log passwords or raw secrets
    const safeMetadata = options.metadata ? this.sanitizeMetadata(options.metadata) : undefined;

    try {
      await this.prisma.adminAuditLog.create({
        data: {
          adminId: options.adminId || null,
          action: options.action,
          resourceType: options.resourceType || null,
          resourceId: options.resourceId ? String(options.resourceId) : null,
          metadata: safeMetadata ? (safeMetadata as any) : undefined,
          ipAddress: options.ipAddress || null,
          userAgent: options.userAgent || null,
        },
      });
    } catch (e: any) {
      this.logger.warn(`Prisma offline for audit log (${e.message}). Saving to memory fallback store.`);
      const logRecord = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        adminId: options.adminId || null,
        action: options.action,
        resourceType: options.resourceType || null,
        resourceId: options.resourceId ? String(options.resourceId) : null,
        metadata: safeMetadata || null,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
        createdAt: new Date(),
      };
      this.memoryAuditLogs.unshift(logRecord);
    }
  }

  async getAuditLogs(page: number = 1, limit: number = 20, search?: string, action?: string) {
    const skip = (page - 1) * limit;

    try {
      const where: any = {};
      if (action) where.action = action;
      if (search) {
        where.OR = [
          { action: { contains: search, mode: 'insensitive' } },
          { resourceType: { contains: search, mode: 'insensitive' } },
          { resourceId: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [logs, total] = await Promise.all([
        this.prisma.adminAuditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: { admin: { select: { username: true, displayName: true, role: true } } },
        }),
        this.prisma.adminAuditLog.count({ where }),
      ]);

      return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (e) {
      let filtered = [...this.memoryAuditLogs];
      if (action) filtered = filtered.filter((l) => l.action === action);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            (l.action && l.action.toLowerCase().includes(s)) ||
            (l.resourceType && l.resourceType.toLowerCase().includes(s)) ||
            (l.resourceId && l.resourceId.toLowerCase().includes(s)),
        );
      }

      const paginated = filtered.slice(skip, skip + limit);
      return { logs: paginated, total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) };
    }
  }

  private sanitizeMetadata(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'p256dh', 'auth', 'vapidPrivateKey'];
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    return sanitized;
  }
}
