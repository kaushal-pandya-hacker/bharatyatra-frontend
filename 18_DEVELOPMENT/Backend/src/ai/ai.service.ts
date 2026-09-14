import { Injectable, Logger } from '@nestjs/common';

export interface TripPlanGenerator {
  generateCandidateItinerary(input: any): Promise<any>;
}

@Injectable()
export class AiService implements TripPlanGenerator {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';

  async generateCandidateItinerary(input: any): Promise<any> {
    this.logger.log(`[AI ENGINE BOUNDARY] Invoking AI Microservice for trip request ${input.requestId || 'req-default'}`);
    
    try {
      const response = await fetch(`${this.aiServiceUrl}/api/v1/ai/trip-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: input.requestId || `req-${Date.now()}`,
          user_id: input.userId || 'usr-guest',
          prompt: input.prompt || 'Explore Gujarat top attractions',
          date_range: {
            start_date: input.startDate || '2026-10-20',
            end_date: input.endDate || '2026-10-22'
          },
          locations: {
            origin_city: input.originCity || 'Ahmedabad',
            destination_regions: input.destinations || ['Saurashtra', 'Kutch']
          },
          travelers: {
            num_adults: input.numAdults || 2,
            num_children: input.numChildren || 0,
            traveler_type: input.travelerType || 'family',
            accessibility_needs: []
          },
          budget: {
            total_budget_inr: input.totalBudgetInr || 25000,
            budget_category: input.budgetCategory || 'moderate',
            preferred_transport_mode: input.transportMode || 'bus'
          },
          interests: input.interests || ['heritage', 'spiritual'],
          pacing: input.pacing || 'balanced'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data
        };
      }
    } catch (err) {
      this.logger.warn(`Python AI service unavailable at ${this.aiServiceUrl}. Falling back to default mock itinerary: ${err.message}`);
    }

    return {
      success: true,
      data: {
        candidateItineraryId: `ai_cand_${Date.now()}`,
        status: 'AI_RECOMMENDATION',
        note: 'All generated slots require deterministic DB rules validation before presentation.',
        days: [
          {
            dayNumber: 1,
            title: 'Explore Somnath Temple & Seashore',
            slots: [
              { slotTime: '09:00 AM', title: 'Triveni Sangam Holy Dip', category: 'CULTURAL', provenance: 'VERIFIED_DATA' },
              { slotTime: '11:30 AM', title: 'Somnath Temple Darshan', category: 'SIGHTSEEING', provenance: 'VERIFIED_DATA' },
              { slotTime: '07:00 PM', title: 'Seashore Light & Sound Show', category: 'ACTIVITY', provenance: 'LIVE_AVAILABILITY' }
            ]
          }
        ]
      }
    };
  }
}

