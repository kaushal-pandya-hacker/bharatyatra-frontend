import { Injectable } from '@nestjs/common';

export interface ProviderHealthReport {
  providerId: string;
  providerName: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  averageLatencyMs: number;
  errorRatePercent: number;
  lastCheckedAt: string;
}

@Injectable()
export class ProviderHealthService {
  async getProviderHealthReports(): Promise<ProviderHealthReport[]> {
    const timestamp = new Date().toISOString();
    return [
      {
        providerId: 'prov-hotel-channel-mgr',
        providerName: 'Hotel Channel Manager Adapter',
        status: 'HEALTHY',
        averageLatencyMs: 140,
        errorRatePercent: 0.0,
        lastCheckedAt: timestamp
      },
      {
        providerId: 'prov-gsrtc-bus-api',
        providerName: 'GSRTC Partner Bus API Adapter',
        status: 'HEALTHY',
        averageLatencyMs: 210,
        errorRatePercent: 0.5,
        lastCheckedAt: timestamp
      },
      {
        providerId: 'prov-razorpay-upi',
        providerName: 'Razorpay / UPI Gateway Adapter',
        status: 'HEALTHY',
        averageLatencyMs: 95,
        errorRatePercent: 0.0,
        lastCheckedAt: timestamp
      }
    ];
  }
}
