import { Injectable, Logger } from '@nestjs/common';

export interface NormalizedTripEvent {
  eventId: string;
  eventType: string;
  source: string;
  occurredAt: string;
  receivedAt: string;
  effectiveFrom: string;
  effectiveUntil: string;
  location: {
    city: string;
    latitude?: number;
    longitude?: number;
  };
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  payloadReference: any;
  deduplicationKey: string;
}

@Injectable()
export class EventNormalizerService {
  private readonly logger = new Logger(EventNormalizerService.name);

  normalizeRawEvent(rawEvent: any): NormalizedTripEvent {
    const rawType = (rawEvent.eventType || rawEvent.event_type || rawEvent.type || 'UNKNOWN').toUpperCase();
    const source = rawEvent.source || rawEvent.provider || 'EXTERNAL_PROVIDER';

    // Event type normalization matrix
    let normalizedType = 'UNKNOWN_EVENT';
    if (rawType.includes('RAIN') || rawType.includes('PRECIPITATION')) {
      normalizedType = 'RAIN_ALERT';
    } else if (rawType.includes('HEAT') || rawType.includes('TEMPERATURE')) {
      normalizedType = 'HEAT_ALERT';
    } else if (rawType.includes('WEATHER')) {
      normalizedType = 'WEATHER_CHANGED';
    } else if (rawType.includes('TRAFFIC') || rawType.includes('JAM') || rawType.includes('ROAD_BLOCK')) {
      normalizedType = 'TRAFFIC_CHANGED';
    } else if (rawType.includes('BUS_CANCEL')) {
      normalizedType = 'BUS_CANCELLED';
    } else if (rawType.includes('BUS_DELAY') || rawType.includes('TRANSIT_DELAY')) {
      normalizedType = 'BUS_DELAY';
    } else if (rawType.includes('ATTRACTION_CLOSE') || rawType.includes('VENUE_CLOSE')) {
      normalizedType = 'ATTRACTION_CLOSED';
    } else if (rawType.includes('HOTEL')) {
      normalizedType = 'HOTEL_CHANGED';
    } else if (rawType.includes('USER_EDIT') || rawType.includes('ITINERARY_CHANGE')) {
      normalizedType = 'USER_CHANGED_ITINERARY';
    } else {
      normalizedType = rawType;
    }

    // Severity resolution
    let severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    if (rawEvent.severity) {
      severity = rawEvent.severity.toUpperCase();
    } else if (normalizedType === 'BUS_CANCELLED' || normalizedType === 'ATTRACTION_CLOSED') {
      severity = 'HIGH';
    } else if (normalizedType === 'RAIN_ALERT' || normalizedType === 'TRAFFIC_CHANGED') {
      severity = 'MEDIUM';
    }

    const now = new Date().toISOString();
    const city = rawEvent.location?.city || rawEvent.city || 'Gujarat';
    const externalId = rawEvent.externalEventId || rawEvent.id || Date.now().toString();
    const deduplicationKey = `${source}:${externalId}:${normalizedType}:${city}`;

    return {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventType: normalizedType,
      source,
      occurredAt: rawEvent.occurredAt || now,
      receivedAt: now,
      effectiveFrom: rawEvent.effectiveFrom || now,
      effectiveUntil: rawEvent.effectiveUntil || new Date(Date.now() + 86400000).toISOString(),
      location: {
        city,
        latitude: rawEvent.location?.latitude || rawEvent.latitude,
        longitude: rawEvent.location?.longitude || rawEvent.longitude,
      },
      severity,
      confidence: rawEvent.confidence || 0.95,
      payloadReference: rawEvent.payload || rawEvent,
      deduplicationKey,
    };
  }
}
