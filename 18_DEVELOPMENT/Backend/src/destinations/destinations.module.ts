import { Module } from '@nestjs/common';
import { DestinationsController } from './destinations.controller';
import { DestinationsService } from './destinations.service';
import { StatesController } from './states.controller';
import { StatesService } from './states.service';

@Module({
  controllers: [DestinationsController, StatesController],
  providers: [DestinationsService, StatesService],
  exports: [DestinationsService, StatesService],
})
export class DestinationsModule {}
