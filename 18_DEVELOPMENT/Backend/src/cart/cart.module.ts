import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FlightsModule } from '../flights/flights.module';
import { HotelsModule } from '../hotels/hotels.module';
import { BusesModule } from '../buses/buses.module';
import { TrainsModule } from '../trains/trains.module';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    PrismaModule,
    FlightsModule,
    HotelsModule,
    BusesModule,
    TrainsModule,
    ActivitiesModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
