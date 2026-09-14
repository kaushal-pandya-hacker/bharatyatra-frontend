import { Global, Module } from '@nestjs/common';
import { ProviderRegistry } from './registry/provider.registry';
import { ProviderNormalizerService } from './normalization/provider-normalizer.service';
import { CircuitBreakerService } from './circuit-breaker/circuit-breaker.service';
import { WebhooksController } from './webhooks/webhooks.controller';
import { WebhooksService } from './webhooks/webhooks.service';
import { ReconciliationService } from './reconciliation/reconciliation.service';
import { ProviderHealthService } from './monitoring/provider-health.service';

import { MockHotelProvider } from './mocks/mock-hotel.provider';
import { MockBusProvider } from './mocks/mock-bus.provider';
import { MockPaymentProvider } from './mocks/mock-payment.provider';
import { MockWeatherProvider, MockNotificationProvider } from './mocks/mock-weather-notification.provider';

@Global()
@Module({
  controllers: [WebhooksController],
  providers: [
    ProviderRegistry,
    ProviderNormalizerService,
    CircuitBreakerService,
    WebhooksService,
    ReconciliationService,
    ProviderHealthService,
    MockHotelProvider,
    MockBusProvider,
    MockPaymentProvider,
    MockWeatherProvider,
    MockNotificationProvider,
  ],
  exports: [
    ProviderRegistry,
    ProviderNormalizerService,
    CircuitBreakerService,
    WebhooksService,
    ReconciliationService,
    ProviderHealthService,
    MockHotelProvider,
    MockBusProvider,
    MockPaymentProvider,
    MockWeatherProvider,
    MockNotificationProvider,
  ],
})
export class ProvidersModule {}
