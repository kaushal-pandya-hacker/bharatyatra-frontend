import { Injectable, Logger, BadRequestException, Optional } from '@nestjs/common';
import { PaymentProvider } from './payment-provider.interface';
import { SimulatedPaymentAdapter } from './simulated-payment.adapter';
import { MockBankAdapter } from './mock-bank.adapter';
import { RazorpaySandboxAdapter } from './razorpay-sandbox.adapter';

@Injectable()
export class ProviderRegistry {
  private readonly logger = new Logger(ProviderRegistry.name);
  private readonly providers = new Map<string, PaymentProvider>();

  constructor(
    private readonly simulatedAdapter: SimulatedPaymentAdapter,
    private readonly mockBankAdapter: MockBankAdapter,
    private readonly razorpaySandboxAdapter?: RazorpaySandboxAdapter,
  ) {
    this.registerProvider(this.simulatedAdapter);
    this.registerProvider(this.mockBankAdapter);
    if (this.razorpaySandboxAdapter) {
      this.registerProvider(this.razorpaySandboxAdapter);
    } else {
      this.registerProvider(new RazorpaySandboxAdapter());
    }
  }

  registerProvider(provider: PaymentProvider): void {
    this.providers.set(provider.getProviderId(), provider);
    this.logger.log(`[ProviderRegistry] Registered provider: ${provider.getProviderId()} (Simulated: ${provider.isSimulation()}, LiveAuthorized: ${provider.isLiveAuthorized()})`);
  }

  getProvider(providerId?: string): PaymentProvider {
    const targetId = providerId || 'BHARATGATEWAY_SIMULATOR';
    const provider = this.providers.get(targetId);

    if (!provider) {
      throw new BadRequestException(`Unknown payment provider: ${targetId}`);
    }

    return provider;
  }

  listProviders(): Array<{ id: string; isSimulation: boolean; isLiveAuthorized: boolean }> {
    return Array.from(this.providers.values()).map(p => ({
      id: p.getProviderId(),
      isSimulation: p.isSimulation(),
      isLiveAuthorized: p.isLiveAuthorized(),
    }));
  }
}
