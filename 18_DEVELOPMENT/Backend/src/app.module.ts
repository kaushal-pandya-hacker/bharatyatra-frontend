import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { ProvidersModule } from './providers/providers.module';
import { AuditModule } from './audit/audit.module';

// Domain Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DestinationsModule } from './destinations/destinations.module';
import { SearchModule } from './search/search.module';
import { TripsModule } from './trips/trips.module';
import { ItinerariesModule } from './itineraries/itineraries.module';
import { HotelsModule } from './hotels/hotels.module';
import { BusesModule } from './buses/buses.module';
import { ActivitiesModule } from './activities/activities.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { PackagesModule } from './packages/packages.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { RefundsModule } from './refunds/refunds.module';
import { FinancialModule } from './financial/financial.module';
import { DocumentsModule } from './documents/documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SupportModule } from './support/support.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { AdaptiveAiModule } from './adaptive-ai/adaptive-ai.module';
import { HealthModule } from './health/health.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { FeedbackModule } from './feedback/feedback.module';
import { LaunchModule } from './launch/launch.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ExperimentsModule } from './experiments/experiments.module';
import { RoutesModule } from './routing/routes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    QueueModule,
    ProvidersModule,
    AuditModule,
    HealthModule,
    AuthModule,
    UsersModule,
    DestinationsModule,
    SearchModule,
    TripsModule,
    ItinerariesModule,
    HotelsModule,
    BusesModule,
    ActivitiesModule,
    RestaurantsModule,
    PackagesModule,
    BookingsModule,
    PaymentsModule,
    RefundsModule,
    FinancialModule,
    DocumentsModule,
    NotificationsModule,
    ReviewsModule,
    SupportModule,
    SuppliersModule,
    AdminModule,
    AiModule,
    AdaptiveAiModule,
    FeatureFlagsModule,
    FeedbackModule,
    LaunchModule,
    AnalyticsModule,
    ExperimentsModule,
    RoutesModule,
  ],
})
export class AppModule {}
