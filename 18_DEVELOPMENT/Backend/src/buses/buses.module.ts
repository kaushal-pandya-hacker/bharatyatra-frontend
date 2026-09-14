import { Module } from '@nestjs/common';
import { BusesController } from './buses.controller';

@Module({
  controllers: [BusesController],
})
export class BusesModule {}
