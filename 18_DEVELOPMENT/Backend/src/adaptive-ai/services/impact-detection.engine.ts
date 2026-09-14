import { Injectable, Logger } from '@nestjs/common';
import { NormalizedTripEvent } from './event-normalizer.service';

export interface AffectedItineraryItem {
  itemId: string;
  dayNumber: number;
  slotTime: string;
  title: string;
  category: string;
  isWeatherSensitive: boolean;
  isPaidBooking: boolean;
  impactReason: string;
}

export interface ImpactAssessmentResult {
  hasImpact: boolean;
  impactScore: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  affectedCity: string;
  affectedItems: AffectedItineraryItem[];
  cascadingImpacts: string[];
}

@Injectable()
export class ImpactDetectionEngine {
  private readonly logger = new Logger(ImpactDetectionEngine.name);

  // Weather sensitive categories
  private readonly OUTDOOR_CATEGORIES = ['BEACH', 'SAFARI', 'BOATING', 'HERITAGE_WALK', 'GARDEN', 'VIEWING_GALLERY', 'OUTDOOR'];

  assessTripImpact(tripData: any, event: NormalizedTripEvent): ImpactAssessmentResult {
    this.logger.log(`[ImpactDetectionEngine] Assessing impact of '${event.eventType}' on Trip ${tripData.tripId || 'trip-1'}`);

    const affectedItems: AffectedItineraryItem[] = [];
    const cascadingImpacts: string[] = [];

    const days = tripData.days || [];
    for (const day of days) {
      const slots = day.slots || day.items || [];
      for (const slot of slots) {
        const slotCategory = (slot.category || slot.itemType || 'SIGHTSEEING').toUpperCase();
        const slotTitle = (slot.title || slot.name || '').toUpperCase();
        const isOutdoor = this.OUTDOOR_CATEGORIES.some(cat => slotCategory.includes(cat) || slotTitle.includes(cat));

        // 1. Weather Impact Evaluation
        if (event.eventType === 'RAIN_ALERT' || event.eventType === 'WEATHER_CHANGED') {
          if (isOutdoor) {
            affectedItems.push({
              itemId: slot.itemId || slot.id || `item_${day.dayNumber}_${slot.slotTime}`,
              dayNumber: day.dayNumber,
              slotTime: slot.slotTime || '10:00 AM',
              title: slot.title,
              category: slotCategory,
              isWeatherSensitive: true,
              isPaidBooking: !!slot.bookingId || slot.isPaidBooking || false,
              impactReason: `Outdoor activity '${slot.title}' affected by forecast heavy rain in ${event.location.city}`,
            });
          }
        }

        // 2. Transport Delay Impact & Downstream Cascading Evaluation
        if (event.eventType === 'BUS_DELAY' || event.eventType === 'BUS_CANCELLED' || event.eventType === 'TRAFFIC_CHANGED') {
          if (slotCategory.includes('BUS') || slotCategory.includes('TRANSIT')) {
            affectedItems.push({
              itemId: slot.itemId || slot.id || `item_${day.dayNumber}_${slot.slotTime}`,
              dayNumber: day.dayNumber,
              slotTime: slot.slotTime || '08:00 AM',
              title: slot.title,
              category: slotCategory,
              isWeatherSensitive: false,
              isPaidBooking: true,
              impactReason: `Transit segment '${slot.title}' delayed/cancelled by provider notice`,
            });
            cascadingImpacts.push(`Downstream check-in and evening sightseeing on Day ${day.dayNumber} delayed by +90 mins.`);
          }
        }

        // 3. Attraction Closure Evaluation
        if (event.eventType === 'ATTRACTION_CLOSED') {
          if (slotTitle.includes(event.location.city.toUpperCase()) || slotCategory.includes('SIGHTSEEING')) {
            affectedItems.push({
              itemId: slot.itemId || slot.id || `item_${day.dayNumber}_${slot.slotTime}`,
              dayNumber: day.dayNumber,
              slotTime: slot.slotTime || '11:00 AM',
              title: slot.title,
              category: slotCategory,
              isWeatherSensitive: false,
              isPaidBooking: false,
              impactReason: `Attraction '${slot.title}' closed due to operational notice`,
            });
          }
        }
      }
    }

    const hasImpact = affectedItems.length > 0;
    let impactScore: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' = 'NONE';

    if (affectedItems.length >= 2 || cascadingImpacts.length > 0 || event.severity === 'CRITICAL') {
      impactScore = 'HIGH';
    } else if (affectedItems.length === 1) {
      impactScore = event.severity === 'HIGH' ? 'HIGH' : 'MEDIUM';
    }

    return {
      hasImpact,
      impactScore,
      affectedCity: event.location.city,
      affectedItems,
      cascadingImpacts,
    };
  }
}
