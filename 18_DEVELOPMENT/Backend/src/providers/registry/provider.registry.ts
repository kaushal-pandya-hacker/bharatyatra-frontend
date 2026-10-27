import { Injectable, Logger } from '@nestjs/common';
import { ProviderCapabilities, DEFAULT_HOTEL_CAPABILITIES, DEFAULT_BUS_CAPABILITIES, DEFAULT_PAYMENT_CAPABILITIES } from '../capabilities/provider-capabilities.model';

export interface ProviderRegistration {
  providerId: string;
  providerName: string;
  providerType: 'HOTEL' | 'BUS' | 'MAPS' | 'WEATHER' | 'ACTIVITY' | 'PAYMENT' | 'EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP';
  environment: 'NOT_CONNECTED' | 'SANDBOX' | 'PRODUCTION';
  isEnabled: boolean;
  priority: number;
  capabilities: ProviderCapabilities;
}

@Injectable()
export class ProviderRegistry {
  private readonly logger = new Logger(ProviderRegistry.name);
  private registry: Map<string, ProviderRegistration> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    const isProdMode = process.env.NODE_ENV === 'production';

    // Hotel Provider Environment Detection
    const hotelApiKey = process.env.HOTEL_CHANNEL_MANAGER_KEY;
    const hotelEnv: 'NOT_CONNECTED' | 'SANDBOX' | 'PRODUCTION' =
      hotelApiKey && isProdMode ? 'PRODUCTION' : hotelApiKey ? 'SANDBOX' : 'SANDBOX';

    this.register({
      providerId: 'prov-hotel-channel-mgr',
      providerName: 'BharatYatra Hotel Channel Manager',
      providerType: 'HOTEL',
      environment: hotelEnv,
      isEnabled: true,
      priority: 1,
      capabilities: DEFAULT_HOTEL_CAPABILITIES,
    });

    // GSRTC Bus Provider Environment Detection
    const busApiKey = process.env.GSRTC_PARTNER_API_KEY;
    const busEnv: 'NOT_CONNECTED' | 'SANDBOX' | 'PRODUCTION' =
      busApiKey && isProdMode ? 'PRODUCTION' : busApiKey ? 'SANDBOX' : 'SANDBOX';

    this.register({
      providerId: 'prov-gsrtc-bus-api',
      providerName: 'GSRTC Partner Bus API',
      providerType: 'BUS',
      environment: busEnv,
      isEnabled: true,
      priority: 1,
      capabilities: DEFAULT_BUS_CAPABILITIES,
    });

    // Razorpay / UPI Payment Gateway Environment Detection
    const rzpKeyId = process.env.RAZORPAY_KEY_ID;
    const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
    const paymentEnv: 'NOT_CONNECTED' | 'SANDBOX' | 'PRODUCTION' =
      rzpKeyId && rzpSecret && isProdMode ? 'PRODUCTION' : rzpKeyId && rzpSecret ? 'SANDBOX' : 'SANDBOX';

    this.register({
      providerId: 'prov-razorpay-upi',
      providerName: 'Razorpay / UPI Gateway',
      providerType: 'PAYMENT',
      environment: paymentEnv,
      isEnabled: true,
      priority: 1,
      capabilities: DEFAULT_PAYMENT_CAPABILITIES,
    });
  }

  register(reg: ProviderRegistration) {
    this.registry.set(reg.providerId, reg);
    this.logger.log(`[Provider Registry] Registered provider '${reg.providerName}' (${reg.providerType}) Mode: ${reg.environment}`);
  }

  getProvider(providerId: string): ProviderRegistration | undefined {
    return this.registry.get(providerId);
  }

  getProvidersByType(type: string): ProviderRegistration[] {
    return Array.from(this.registry.values())
      .filter(p => p.providerType === type && p.isEnabled)
      .sort((a, b) => a.priority - b.priority);
  }
}
