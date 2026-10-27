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

import { HotelbedsClientService } from './hotelbeds/hotelbeds-client.service';
import { HotelbedsHotelProvider } from './hotelbeds/hotelbeds-hotel.provider';
import { HotelbedsProviderAdapter } from './hotelbeds/hotelbeds-provider.adapter';
import { TboFlightAdapter } from './flights/tbo-flight.provider.adapter';
import { EtravelsmartBusAdapter } from './buses/etravelsmart-bus.provider.adapter';
import { TrainProviderAdapter } from './trains/train-provider.adapter';
import { SandboxActivityProviderAdapter } from './activities/sandbox-activity.provider.adapter';
import { UniversalProviderRegistry } from './registry/universal-provider.registry';

@Global()
@Module({
  controllers: [WebhooksController],
  providers: [
    ProviderRegistry,
    UniversalProviderRegistry,
    ProviderNormalizerService,
    CircuitBreakerService,
    WebhooksService,
    ReconciliationService,
    ProviderHealthService,
    HotelbedsClientService,
    HotelbedsHotelProvider,
    HotelbedsProviderAdapter,
    TboFlightAdapter,
    EtravelsmartBusAdapter,
    TrainProviderAdapter,
    SandboxActivityProviderAdapter,
    MockHotelProvider,
    MockBusProvider,
    MockPaymentProvider,
    MockWeatherProvider,
    MockNotificationProvider,
  ],
  exports: [
    ProviderRegistry,
    UniversalProviderRegistry,
    ProviderNormalizerService,
    CircuitBreakerService,
    WebhooksService,
    ReconciliationService,
    ProviderHealthService,
    HotelbedsClientService,
    HotelbedsHotelProvider,
    HotelbedsProviderAdapter,
    TboFlightAdapter,
    EtravelsmartBusAdapter,
    TrainProviderAdapter,
    SandboxActivityProviderAdapter,
    MockHotelProvider,
    MockBusProvider,
    MockPaymentProvider,
    MockWeatherProvider,
    MockNotificationProvider,
  ],
})
export class ProvidersModule {}
