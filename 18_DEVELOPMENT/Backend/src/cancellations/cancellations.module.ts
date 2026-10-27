import { Module } from '@nestjs/common';
import { CancellationsController } from './cancellations.controller';
import { CancellationEngineService } from './cancellation-engine.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FlightsModule } from '../flights/flights.module';
import { HotelsModule } from '../hotels/hotels.module';
import { BusesModule } from '../buses/buses.module';
import { TrainsModule } from '../trains/trains.module';
import { ActivitiesModule } from '../activities/activities.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RefundsModule } from '../refunds/refunds.module';

@Module({
  imports: [
    PrismaModule,
    FlightsModule,
    HotelsModule,
    BusesModule,
    TrainsModule,
    ActivitiesModule,
    NotificationsModule,
    RefundsModule,
  ],
  controllers: [CancellationsController],
  providers: [CancellationEngineService],
  exports: [CancellationEngineService],
})
export class CancellationsModule {}
