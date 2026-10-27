import { Module } from '@nestjs/common';
import { BusesService } from './buses.service';
import { BusesController } from './buses.controller';
import { TransportModule } from '../transport/transport.module';

@Module({
  imports: [TransportModule],
  controllers: [BusesController],
  providers: [BusesService],
  exports: [BusesService],
})
export class BusesModule {}
