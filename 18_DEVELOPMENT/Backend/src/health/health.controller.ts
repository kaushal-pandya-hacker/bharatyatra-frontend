import { Controller, Get, Res, HttpStatus, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SecurityMonitoringService } from '../security/security-monitoring.service';

@ApiTags('Health & Monitoring')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    @Optional() private readonly monitoringService?: SecurityMonitoringService,
  ) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Low-Cardinality System & Security Telemetry Metrics' })
  getMetrics() {
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();
    const activeAlerts = this.monitoringService ? this.monitoringService.getActiveAlerts().length : 0;
    const totalAlertHistory = this.monitoringService ? this.monitoringService.getAlertHistory().length : 0;

    return {
      service: 'BharatYatra NestJS Master API Engine',
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString(),
      system: {
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          rssMb: Math.round((memory.rss / (1024 * 1024)) * 100) / 100,
          heapTotalMb: Math.round((memory.heapTotal / (1024 * 1024)) * 100) / 100,
          heapUsedMb: Math.round((memory.heapUsed / (1024 * 1024)) * 100) / 100,
          externalMb: Math.round((memory.external / (1024 * 1024)) * 100) / 100,
        },
        cpu: {
          userMicros: cpu.user,
          systemMicros: cpu.system,
        },
      },
      monitoring: {
        activeAlertsInCooldown: activeAlerts,
        totalHistoricalAlerts: totalAlertHistory,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Application & Dependencies Readiness/Liveness Check' })
  async getHealth(@Res() res: Response) {
    const health = await this.performDependencyChecks();
    const statusCode = health.status === 'UP' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(statusCode).json(health);
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Process Liveness Probe' })
  getLiveness() {
    return {
      status: 'UP',
      message: 'BharatYatra NestJS Backend process is alive',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Infrastructure Dependency Readiness Probe' })
  async getReadiness(@Res() res: Response) {
    const health = await this.performDependencyChecks();
    const statusCode = health.status === 'UP' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(statusCode).json(health);
  }

  private async performDependencyChecks() {
    let dbStatus = 'HEALTHY';
    let redisStatus = 'HEALTHY';

    // 1. Database Check
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      dbStatus = 'UNHEALTHY';
    }

    // 2. Redis Check
    try {
      await this.redisService.get('health_ping');
    } catch (err) {
      redisStatus = 'UNHEALTHY';
    }

    const isHealthy = dbStatus === 'HEALTHY'; // Core DB requirement for readiness

    return {
      status: isHealthy ? 'UP' : 'DOWN',
      service: 'BharatYatra NestJS Master API Engine',
      environment: process.env.NODE_ENV || 'production',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      dependencies: {
        application: 'HEALTHY',
        database: dbStatus,
        redis: redisStatus,
        queue: 'HEALTHY',
      },
    };
  }
}
