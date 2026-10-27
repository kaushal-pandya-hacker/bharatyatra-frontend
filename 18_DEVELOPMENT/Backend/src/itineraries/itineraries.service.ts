import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItinerariesService {
  private readonly logger = new Logger(ItinerariesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getActiveItinerary(tripId: string) {
    return {
      success: true,
      data: {
        itineraryId: `itin_${tripId}_v1`,
        tripId,
        versionNumber: 1,
        status: 'FINALIZED',
        changeReason: 'Initial AI Plan Generation',
        days: [
          {
            dayNumber: 1,
            title: 'Explore Somnath Temple & Triveni Sangam',
            items: [
              { slotTime: '08:30 AM', title: 'Morning Heritage Walk', provenance: 'VERIFIED_DATA' },
              { slotTime: '11:00 AM', title: 'Somnath Temple Darshan', provenance: 'VERIFIED_DATA' },
              { slotTime: '07:00 PM', title: 'Somnath Light & Sound Show', provenance: 'LIVE_AVAILABILITY' }
            ]
          }
        ]
      }
    };
  }

  async getVersionHistory(tripId: string) {
    return {
      success: true,
      data: [
        {
          versionNumber: 1,
          status: 'SUPERSEDED',
          changeReason: 'Initial AI Plan Generation',
          createdBy: 'AI_PLANNER_ENGINE',
          createdAt: '2026-09-10T10:00:00Z',
          parentVersionId: null
        },
        {
          versionNumber: 2,
          status: 'ACTIVE',
          changeReason: 'Adaptive AI Re-Route: Monsoon Weather Alert at Gir Jungle Safari',
          createdBy: 'ADAPTIVE_AI_ENGINE',
          createdAt: '2026-09-12T14:30:00Z',
          parentVersionId: `itin_${tripId}_v1`
        }
      ]
    };
  }

  async createNewVersion(tripId: string, data: { parentVersionNumber: number; reason: string; createdBy: string; days: any[] }) {
    const newVersionNumber = (data.parentVersionNumber || 1) + 1;
    this.logger.log(`[IMMUTABLE VERSIONING] Creating Itinerary v${newVersionNumber} for Trip ${tripId}. Reason: ${data.reason}`);

    return {
      success: true,
      data: {
        itineraryId: `itin_${tripId}_v${newVersionNumber}`,
        tripId,
        versionNumber: newVersionNumber,
        parentVersionId: `itin_${tripId}_v${data.parentVersionNumber || 1}`,
        status: 'FINALIZED',
        changeReason: data.reason,
        createdBy: data.createdBy || 'USER_ACTION',
        createdAt: new Date().toISOString(),
        days: data.days || []
      }
    };
  }
}
