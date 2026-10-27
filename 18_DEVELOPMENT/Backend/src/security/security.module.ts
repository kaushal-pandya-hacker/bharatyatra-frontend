import { Module, Global } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { RedisModule } from '../redis/redis.module';
import { RateLimiterService } from './rate-limiter.service';
import { RateLimitGuard } from './rate-limit.guard';
import { SecurityExceptionFilter } from './security-exception.filter';

import { SecurityMonitoringService } from './security-monitoring.service';

@Global()
@Module({
  imports: [RedisModule],
  providers: [
    RateLimiterService,
    SecurityMonitoringService,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_FILTER,
      useClass: SecurityExceptionFilter,
    },
  ],
  exports: [RateLimiterService, SecurityMonitoringService],
})
export class SecurityModule {}
