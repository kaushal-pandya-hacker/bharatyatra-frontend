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
    // Hotel Provider Sandbox / Mock
    this.register({
      providerId: 'prov-hotel-channel-mgr',
      providerName: 'Chalo Farva Hotel Channel Manager',
      providerType: 'HOTEL',
      environment: 'SANDBOX',
      isEnabled: true,
      priority: 1,
      capabilities: DEFAULT_HOTEL_CAPABILITIES
    });

    // GSRTC Bus Provider Sandbox / Mock
    this.register({
      providerId: 'prov-gsrtc-bus-api',
      providerName: 'GSRTC Partner Bus API',
      providerType: 'BUS',
      environment: 'SANDBOX',
      isEnabled: true,
      priority: 1,
      capabilities: DEFAULT_BUS_CAPABILITIES
    });

    // Razorpay Payment Gateway Sandbox / Mock
    this.register({
      providerId: 'prov-razorpay-upi',
      providerName: 'Razorpay / UPI Gateway',
      providerType: 'PAYMENT',
      environment: 'SANDBOX',
      isEnabled: true,
      priority: 1,
      capabilities: DEFAULT_PAYMENT_CAPABILITIES
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
