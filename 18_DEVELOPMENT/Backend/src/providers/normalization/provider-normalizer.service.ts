import { Injectable } from '@nestjs/common';

export interface NormalizedItem {
  id: string;
  providerId: string;
  externalReference: string;
  title: string;
  priceInr: number;
  provenance: 'LIVE' | 'VERIFIED' | 'AI_SUGGESTED';
  retrievedAt: string;
  rawPayload?: any;
}

@Injectable()
export class ProviderNormalizerService {
  normalizeHotelSearchResponse(providerId: string, rawHotels: any[]): NormalizedItem[] {
    const timestamp = new Date().toISOString();
    return rawHotels.map((h, i) => ({
      id: h.hotelId || `htl_${i}`,
      providerId,
      externalReference: h.hotelId || `EXT_${i}`,
      title: h.name || 'Gujarat Hotel Stay',
      priceInr: Number(h.pricePerNightInr || h.priceInr || 3500),
      provenance: 'LIVE',
      retrievedAt: timestamp
    }));
  }

  normalizeBusSearchResponse(providerId: string, rawBuses: any[]): NormalizedItem[] {
    const timestamp = new Date().toISOString();
    return rawBuses.map((b, i) => ({
      id: b.busId || `bus_${i}`,
      providerId,
      externalReference: b.busId || `EXT_BUS_${i}`,
      title: b.operatorName || 'GSRTC Volvo Express',
      priceInr: Number(b.fareInr || 650),
      provenance: 'LIVE',
      retrievedAt: timestamp
    }));
  }
}
