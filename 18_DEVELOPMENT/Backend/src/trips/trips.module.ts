import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { GroupExpensesService } from './group-expenses.service';

@Module({
  controllers: [TripsController],
  providers: [TripsService, GroupExpensesService],
  exports: [TripsService, GroupExpensesService],
})
export class TripsModule {}
