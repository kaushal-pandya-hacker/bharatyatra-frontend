import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Optional,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SecurityMonitoringService, SecurityEventType } from './security-monitoring.service';

@Catch()
export class SecurityExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SecurityExceptionFilter.name);

  constructor(
    @Optional() private readonly monitoringService?: SecurityMonitoringService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId =
      (request.headers['x-correlation-id'] as string) ||
      `req_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const clientIp =
      (request.headers['cf-connecting-ip'] as string) ||
      (request.headers['x-real-ip'] as string) ||
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.socket?.remoteAddress ||
      '127.0.0.1';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected internal error occurred. Please try again later.';
    let errorName = 'Internal Server Error';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as any;
        message = obj.message || obj.error || message;
        errorName = obj.error || exception.name;
        details = obj.details || (Array.isArray(obj.message) ? obj.message : null);
      }
    } else if (exception instanceof Error) {
      const anyErr = exception as any;
      if (anyErr.type === 'entity.too.large' || anyErr.status === 413 || anyErr.statusCode === 413) {
        status = HttpStatus.PAYLOAD_TOO_LARGE;
        message = 'Payload too large. The request body exceeds the maximum permitted size of 1MB.';
        errorName = 'Payload Too Large';
      } else if (anyErr.status && typeof anyErr.status === 'number' && anyErr.status >= 400 && anyErr.status < 500) {
        status = anyErr.status;
        message = anyErr.message || message;
        errorName = anyErr.name || 'Client Error';
      } else {
        // Internal system or database exception - sanitize strictly to prevent information disclosure
        this.logger.error(
          `[SYSTEM_ERROR] ID: ${correlationId} | ${request.method} ${request.url} | ${exception.message}`,
          exception.stack,
        );
      }
    }

    // Structured Security Auditing for Security-Relevant Status Codes
    if (status === HttpStatus.UNAUTHORIZED) {
      this.logger.warn(
        `[SECURITY_AUDIT] UNAUTHORIZED_ACCESS | IP: ${clientIp} | Method: ${request.method} | Path: ${request.url} | Correlation: ${correlationId}`,
      );
      if (this.monitoringService) {
        try {
          this.monitoringService.recordEvent({
            eventType: SecurityEventType.AUTH_FAILURE,
            severity: 'HIGH',
            message: `Unauthorized access attempt on ${request.method} ${request.url}`,
            correlationId,
            actor: { ip: clientIp, userAgent: (request.headers['user-agent'] as string) || 'UNKNOWN' },
            resource: { entityType: 'API_ENDPOINT', entityId: request.url },
          });
        } catch {
          // Safe isolation: monitoring error must not disrupt exception delivery
        }
      }
    } else if (status === HttpStatus.FORBIDDEN) {
      this.logger.warn(
        `[SECURITY_AUDIT] FORBIDDEN_ACCESS | IP: ${clientIp} | Method: ${request.method} | Path: ${request.url} | Correlation: ${correlationId}`,
      );
      if (this.monitoringService) {
        try {
          this.monitoringService.recordEvent({
            eventType: SecurityEventType.ACCESS_DENIED_IDOR,
            severity: 'HIGH',
            message: `Forbidden access / potential IDOR attempt on ${request.method} ${request.url}`,
            correlationId,
            actor: { ip: clientIp, userAgent: (request.headers['user-agent'] as string) || 'UNKNOWN' },
            resource: { entityType: 'API_ENDPOINT', entityId: request.url },
          });
        } catch {
          // Safe isolation
        }
      }
    } else if (status === HttpStatus.TOO_MANY_REQUESTS) {
      this.logger.warn(
        `[SECURITY_AUDIT] RATE_LIMIT_TRIGGERED | IP: ${clientIp} | Method: ${request.method} | Path: ${request.url} | Correlation: ${correlationId}`,
      );
      if (this.monitoringService) {
        try {
          this.monitoringService.recordEvent({
            eventType: SecurityEventType.RATE_LIMIT_TRIGGERED,
            severity: 'WARN',
            message: `Rate limit triggered on ${request.method} ${request.url}`,
            correlationId,
            actor: { ip: clientIp, userAgent: (request.headers['user-agent'] as string) || 'UNKNOWN' },
            resource: { entityType: 'API_ENDPOINT', entityId: request.url },
          });
        } catch {
          // Safe isolation
        }
      }
    } else if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      if (this.monitoringService) {
        try {
          const isDbErr = exception instanceof Error && (
            exception.message.toLowerCase().includes('database') ||
            exception.message.toLowerCase().includes('prisma') ||
            exception.message.toLowerCase().includes('connection')
          );
          this.monitoringService.recordEvent({
            eventType: isDbErr ? SecurityEventType.DB_CONNECTION_FAILURE : SecurityEventType.SECRET_VALIDATION_FAILURE,
            severity: 'CRITICAL',
            message: isDbErr ? 'Database error during request' : 'Critical internal server exception',
            correlationId,
            actor: { ip: clientIp, userAgent: (request.headers['user-agent'] as string) || 'UNKNOWN' },
            resource: { entityType: 'API_ENDPOINT', entityId: request.url },
            metadata: { statusCode: status },
          });
        } catch {
          // Safe isolation
        }
      }
    }

    // Never leak stack traces, database credentials, or internal file paths to public clients
    const sanitizedResponse: any = {
      success: false,
      statusCode: status,
      error: errorName,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
    };

    if (details && status < 500) {
      sanitizedResponse.details = details;
    }

    response.status(status).json(sanitizedResponse);
  }
}
