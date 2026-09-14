import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller';
import { RoutingService } from './routing.service';
import { GeoService } from './geo.service';
import { OsrmRoutingProvider } from './providers/osrm-routing.provider';
import { RouteCacheService } from './route-cache.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [RoutesController],
  providers: [GeoService, OsrmRoutingProvider, RouteCacheService, RoutingService],
  exports: [GeoService, RoutingService, OsrmRoutingProvider, RouteCacheService],
})
export class RoutesModule {}
