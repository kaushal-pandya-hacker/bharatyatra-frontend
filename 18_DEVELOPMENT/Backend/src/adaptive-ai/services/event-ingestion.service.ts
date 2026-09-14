import { Injectable, Logger } from '@nestjs/common';
import { EventNormalizerService, NormalizedTripEvent } from './event-normalizer.service';

@Injectable()
export class EventIngestionService {
  private readonly logger = new Logger(EventIngestionService.name);
  private readonly processedDeduplicationKeys = new Set<string>();

  constructor(private readonly normalizer: EventNormalizerService) {}

  ingestAndNormalize(rawEvent: any): NormalizedTripEvent | null {
    const normalized = this.normalizer.normalizeRawEvent(rawEvent);

    // 1. Deduplication check
    if (this.processedDeduplicationKeys.has(normalized.deduplicationKey)) {
      this.logger.warn(`[EventIngestionService] Duplicate event ignored (key: ${normalized.deduplicationKey})`);
      return null;
    }

    // 2. Staleness check (ignore events whose effectiveUntil is in the past)
    if (new Date(normalized.effectiveUntil).getTime() < Date.now()) {
      this.logger.warn(`[EventIngestionService] Stale event ignored (effectiveUntil: ${normalized.effectiveUntil})`);
      return null;
    }

    // Cache deduplication key (with size cap safety)
    if (this.processedDeduplicationKeys.size > 10000) {
      this.processedDeduplicationKeys.clear();
    }
    this.processedDeduplicationKeys.add(normalized.deduplicationKey);

    this.logger.log(
      `[EventIngestionService] Ingested normalized event '${normalized.eventType}' (Severity: ${normalized.severity}, City: ${normalized.location.city})`
    );

    return normalized;
  }
}
