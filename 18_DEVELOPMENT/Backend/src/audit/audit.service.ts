import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogInput {
  userId?: string | null;
  adminEmail?: string | null;
  action: string;
  details: string;
  ipAddress?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  reason?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logEvent(
    inputOrUserId: AuditLogInput | string | null,
    action?: string,
    details?: string,
    ipAddress?: string,
    entityType?: string,
    entityId?: string,
    reason?: string,
  ) {
    let logData: AuditLogInput;

    if (typeof inputOrUserId === 'object' && inputOrUserId !== null) {
      logData = inputOrUserId;
    } else {
      logData = {
        userId: typeof inputOrUserId === 'string' ? inputOrUserId : null,
        action: action || 'UNKNOWN_ACTION',
        details: details || '',
        ipAddress: ipAddress || null,
        entityType: entityType || null,
        entityId: entityId || null,
        reason: reason || null,
      };
    }

    const sanitizedDetails = (logData.details || '').replace(/("password"|"token"|"card"|"secret"):".*?"/gi, '$1:"[REDACTED]"');

    this.logger.log(
      `[AUDIT EVENT] Action: ${logData.action} | User: ${logData.userId || logData.adminEmail || 'ANONYMOUS'} | Entity: ${logData.entityType || ''}:${logData.entityId || ''} | Details: ${sanitizedDetails}`
    );

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: logData.userId || null,
          adminEmail: logData.adminEmail || null,
          action: logData.action,
          details: sanitizedDetails,
          ipAddress: logData.ipAddress || null,
          entityType: logData.entityType || null,
          entityId: logData.entityId || null,
          reason: logData.reason || null,
        },
      });
    } catch (e) {}
  }
}
