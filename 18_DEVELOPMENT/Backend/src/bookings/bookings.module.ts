import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { UniversalBookingsController } from './universal-bookings.controller';
import { UniversalBookingEngineService } from './universal-booking-engine.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProvidersModule } from '../providers/providers.module';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [PrismaModule, NotificationsModule, ProvidersModule, PricingModule],
  controllers: [BookingsController, UniversalBookingsController],
  providers: [BookingsService, UniversalBookingEngineService],
  exports: [BookingsService, UniversalBookingEngineService],
})
export class BookingsModule {}
