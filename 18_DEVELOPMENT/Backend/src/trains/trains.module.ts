import { Module } from '@nestjs/common';
import { TrainsService } from './trains.service';
import { TrainsController } from './trains.controller';
import { TransportModule } from '../transport/transport.module';

@Module({
  imports: [TransportModule],
  controllers: [TrainsController],
  providers: [TrainsService],
  exports: [TrainsService],
})
export class TrainsModule {}
