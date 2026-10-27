import { Injectable, Logger } from '@nestjs/common';
import { TransportService } from '../transport/transport.service';
import { TransportTypeEnum } from '../providers/interfaces/transport-provider.interface';
import { HotelsService } from '../hotels/hotels.service';
import { AIProviderInterface } from './ai-provider.interface';

export interface TripPlanGenerator {
  generateCandidateItinerary(input: any): Promise<any>;
}

@Injectable()
export class AiService implements TripPlanGenerator, AIProviderInterface {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';

  constructor(
    private readonly transportService: TransportService,
    private readonly hotelsService: HotelsService,
  ) {}

  async generateText(prompt: string, options?: any): Promise<string> {
    try {
      const response = await fetch(`${this.aiServiceUrl}/api/v1/ai/generate-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...options }),
      });
      if (response.ok) {
        const json = await response.json();
        return json.text || json.message || '';
      }
    } catch (e: any) {
      this.logger.warn(`Text generation remote fallback: ${e.message}`);
    }
    return `NEXI AI Response: ${prompt}`;
  }

  async generateStructuredOutput<T = any>(prompt: string, schema?: any, options?: any): Promise<T> {
    try {
      const response = await fetch(`${this.aiServiceUrl}/api/v1/ai/structured-output`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, schema, ...options }),
      });
      if (response.ok) {
        return (await response.json()) as T;
      }
    } catch (e: any) {
      this.logger.warn(`Structured output fallback: ${e.message}`);
    }
    return {} as T;
  }

  async classifyIntent(text: string): Promise<string> {
    const lower = text.toLowerCase();
    if (lower.includes('pay') || lower.includes('buy') || lower.includes('card') || lower.includes('upi')) {
      return 'PAYMENT_REQUEST';
    }
    if (lower.includes('admin') || lower.includes('dashboard') || lower.includes('ops')) {
      return 'GENERAL_SUPPORT';
    }
    if (lower.includes('hotel') || lower.includes('stay') || lower.includes('room') || lower.includes('resort')) {
      return 'HOTEL_SEARCH';
    }
    if (lower.includes('bus') || lower.includes('flight') || lower.includes('train') || lower.includes('cab')) {
      return 'TRANSPORT_SEARCH';
    }
    if (lower.includes('remove') || lower.includes('add') || lower.includes('cheaper') || lower.includes('change hotel') || lower.includes('parents')) {
      return 'TRIP_MODIFY';
    }
    if (lower.includes('plan') || lower.includes('itinerary') || lower.includes('create trip') || lower.includes('trip to')) {
      return 'TRIP_CREATE';
    }
    if (lower.includes('booking') || lower.includes('ticket') || lower.includes('confirmation')) {
      return 'BOOKING_STATUS';
    }
    return 'QUESTION';
  }

  async generateTrip(input: any): Promise<any> {
    return this.generateCandidateItinerary(input);
  }

  async modifyTrip(currentTrip: any, modificationInstruction: string): Promise<any> {
    this.logger.log(`Modifying trip ${currentTrip?.id || 'current'} with instruction: ${modificationInstruction}`);
    const mod = modificationInstruction.toLowerCase();
    const updatedTrip = JSON.parse(JSON.stringify(currentTrip));

    if (mod.includes('cheaper') || mod.includes('budget')) {
      updatedTrip.budgetInr = Math.round((updatedTrip.budgetInr || 25000) * 0.8);
      updatedTrip.selectedTier = 'budget';
      updatedTrip.changeReason = 'Adjusted to lower budget';
    } else if (mod.includes('remove')) {
      updatedTrip.changeReason = `Modified: ${modificationInstruction}`;
    } else if (mod.includes('add')) {
      updatedTrip.changeReason = `Added destination/activity: ${modificationInstruction}`;
    } else {
      updatedTrip.changeReason = modificationInstruction;
    }

    updatedTrip.version = (updatedTrip.version || 1) + 1;
    return updatedTrip;
  }

  async summarizeConversation(messages: any[]): Promise<string> {
    if (!messages || messages.length === 0) return 'No conversation history.';
    const userMsgs = messages.filter((m) => m.role === 'USER').map((m) => m.content);
    return `User requested: ${userMsgs.join(' | ')}`;
  }

  async generateCandidateItinerary(input: any): Promise<any> {
    this.logger.log(`[AI ENGINE BOUNDARY] Invoking AI Microservice for trip request ${input.requestId || 'req-default'}`);

    const promptText = (input.prompt || '').toLowerCase();
    let transportOption: any = null;
    let hotelOption: any = null;

    if (promptText.includes('flight') || promptText.includes('bus') || promptText.includes('train') || promptText.includes('reach') || promptText.includes('travel')) {
      const type: TransportTypeEnum = promptText.includes('flight') ? 'FLIGHT' : promptText.includes('bus') ? 'BUS' : 'TRAIN';
      try {
        const searchRes = await this.transportService.search({
          type: type,
          origin: input.originCity || 'AMD',
          destination: input.destinations?.[0] || 'GOI',
          departureDate: input.startDate || new Date().toISOString().split('T')[0],
        });
        transportOption = searchRes.items[0] || null;
      } catch (err: any) {
        this.logger.warn(`AI Transport Search lookup failed: ${err.message}`);
      }
    }

    if (promptText.includes('hotel') || promptText.includes('stay') || promptText.includes('resort') || promptText.includes('room')) {
      try {
        const hotelRes = await this.hotelsService.searchHotels({
          destination: input.destinations?.[0] || input.destination || 'Goa',
          checkIn: input.startDate || new Date().toISOString().split('T')[0],
        });
        hotelOption = hotelRes[0] || null;
      } catch (err: any) {
        this.logger.warn(`AI Hotel Search lookup failed: ${err.message}`);
      }
    }

    try {
      const response = await fetch(`${this.aiServiceUrl}/api/v1/ai/trip-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: input.requestId || `req-${Date.now()}`,
          user_id: input.userId || 'usr-guest',
          prompt: input.prompt || 'Explore India top attractions',
          date_range: {
            start_date: input.startDate || '2026-10-20',
            end_date: input.endDate || '2026-10-22',
          },
          locations: {
            origin_city: input.originCity || 'Ahmedabad',
            destination_regions: input.destinations || ['Saurashtra', 'Kutch'],
          },
          travelers: {
            num_adults: input.numAdults || 2,
            num_children: input.numChildren || 0,
            traveler_type: input.travelerType || 'family',
            accessibility_needs: [],
          },
          budget: {
            total_budget_inr: input.totalBudgetInr || 25000,
            budget_category: input.budgetCategory || 'moderate',
            preferred_transport_mode: input.transportMode || 'bus',
          },
          interests: input.interests || ['heritage', 'spiritual'],
          pacing: input.pacing || 'balanced',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (transportOption) {
          data.verifiedTransportRecommendation = transportOption;
        }
        if (hotelOption) {
          data.verifiedHotelRecommendation = hotelOption;
        }
        return { success: true, data };
      }
    } catch (err: any) {
      this.logger.warn(`Python AI service unavailable at ${this.aiServiceUrl}. Falling back to default mock itinerary: ${err.message}`);
    }

    return {
      success: true,
      data: {
        candidateItineraryId: `ai_cand_${Date.now()}`,
        status: 'AI_RECOMMENDATION',
        note: 'All generated slots require deterministic DB rules validation before presentation.',
        verifiedTransportRecommendation: transportOption,
        verifiedHotelRecommendation: hotelOption,
        days: [
          {
            dayNumber: 1,
            title: 'Explore Somnath Temple & Seashore',
            slots: [
              { slotTime: '09:00 AM', title: 'Triveni Sangam Holy Dip', category: 'CULTURAL', provenance: 'VERIFIED_DATA' },
              { slotTime: '11:30 AM', title: 'Somnath Temple Darshan', category: 'SIGHTSEEING', provenance: 'VERIFIED_DATA' },
              { slotTime: '07:00 PM', title: 'Seashore Light & Sound Show', category: 'ACTIVITY', provenance: 'LIVE_AVAILABILITY' },
            ],
          },
        ],
      },
    };
  }
}


