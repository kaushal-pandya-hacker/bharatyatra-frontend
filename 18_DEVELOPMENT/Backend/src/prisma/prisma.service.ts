import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  public isDatabaseConnected = false;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    const poolMax = parseInt(process.env.DB_POOL_MAX || (isProduction ? '10' : '5'), 10);
    const poolTimeout = parseInt(process.env.DB_POOL_TIMEOUT_S || '10', 10);
    const connectTimeout = parseInt(process.env.DB_CONNECT_TIMEOUT_S || '5', 10);

    let dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl && !dbUrl.includes('connection_limit=')) {
      const separator = dbUrl.includes('?') ? '&' : '?';
      dbUrl = `${dbUrl}${separator}connection_limit=${poolMax}&pool_timeout=${poolTimeout}&connect_timeout=${connectTimeout}`;
    }

    super({
      datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
      log: isProduction ? ['error'] : ['warn', 'error'],
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.isDatabaseConnected = true;
      this.logger.log('[PrismaService] Connected to PostgreSQL database successfully.');
    } catch (error) {
      this.isDatabaseConnected = false;
      this.logger.warn('[PrismaService] PostgreSQL not available. Operating in resilient in-memory mode.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('[PrismaService] Disconnected from PostgreSQL database gracefully.');
  }
}
