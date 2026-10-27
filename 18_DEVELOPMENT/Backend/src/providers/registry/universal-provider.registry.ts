import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ITravelProvider, ProductTypeEnum } from '../interfaces/universal-provider.interface';
import { ITransportProvider, TransportTypeEnum } from '../interfaces/transport-provider.interface';
import { HotelbedsProviderAdapter } from '../hotelbeds/hotelbeds-provider.adapter';
import { TboFlightAdapter } from '../flights/tbo-flight.provider.adapter';
import { EtravelsmartBusAdapter } from '../buses/etravelsmart-bus.provider.adapter';
import { TrainProviderAdapter } from '../trains/train-provider.adapter';

@Injectable()
export class UniversalProviderRegistry {
  private readonly logger = new Logger(UniversalProviderRegistry.name);
  private readonly providersMap = new Map<string, ITravelProvider>();
  private readonly transportProvidersMap = new Map<string, ITransportProvider>();

  constructor(
    private readonly hotelbedsAdapter: HotelbedsProviderAdapter,
    private readonly tboFlightAdapter: TboFlightAdapter,
    private readonly etravelsmartBusAdapter: EtravelsmartBusAdapter,
    private readonly trainAdapter: TrainProviderAdapter,
  ) {
    this.registerProvider(this.hotelbedsAdapter);

    this.registerTransportProvider(this.tboFlightAdapter);
    this.registerTransportProvider(this.etravelsmartBusAdapter);
    this.registerTransportProvider(this.trainAdapter);
  }

  public registerProvider(provider: ITravelProvider): void {
    for (const type of provider.supportedProductTypes) {
      const key = `${type}:${provider.providerId}`;
      this.providersMap.set(key, provider);
      if (!this.providersMap.has(`PRIMARY:${type}`)) {
        this.providersMap.set(`PRIMARY:${type}`, provider);
      }
    }
  }

  public registerTransportProvider(provider: ITransportProvider): void {
    const key = `${provider.supportedType}:${provider.providerId}`;
    this.transportProvidersMap.set(key, provider);
    if (!this.transportProvidersMap.has(`PRIMARY:${provider.supportedType}`)) {
      this.transportProvidersMap.set(`PRIMARY:${provider.supportedType}`, provider);
    }
    this.logger.log(`[UniversalProviderRegistry] Registered transport adapter '${provider.providerName}' (${provider.providerId}) for ${provider.supportedType}`);
  }

  public getProvider(productType: ProductTypeEnum, providerId?: string): ITravelProvider {
    if (providerId) {
      const key = `${productType}:${providerId}`;
      const found = this.providersMap.get(key);
      if (found) return found;
    }

    const primary = this.providersMap.get(`PRIMARY:${productType}`);
    if (primary) return primary;

    throw new NotFoundException(`No active travel provider available for product type '${productType}'.`);
  }

  public getTransportProvider(type: TransportTypeEnum, providerId?: string): ITransportProvider {
    if (providerId) {
      const key = `${type}:${providerId}`;
      const found = this.transportProvidersMap.get(key);
      if (found) return found;
    }

    const primary = this.transportProvidersMap.get(`PRIMARY:${type}`);
    if (primary) return primary;

    throw new NotFoundException(`No active transport provider configured for vertical '${type}'.`);
  }

  public getAllProviders(): ITravelProvider[] {
    const set = new Set<ITravelProvider>();
    for (const [key, p] of this.providersMap.entries()) {
      if (!key.startsWith('PRIMARY:')) set.add(p);
    }
    return Array.from(set);
  }

  public getAllTransportProviders(): ITransportProvider[] {
    const set = new Set<ITransportProvider>();
    for (const [key, p] of this.transportProvidersMap.entries()) {
      if (!key.startsWith('PRIMARY:')) set.add(p);
    }
    return Array.from(set);
  }
}
