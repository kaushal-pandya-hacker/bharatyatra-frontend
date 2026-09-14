import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ItineraryVersionRecord {
  versionId: string;
  tripId: string;
  versionNumber: number;
  changeReason: string;
  status: 'AI_DRAFT' | 'USER_MODIFIED' | 'FINALIZED';
  createdAt: string;
}

@Injectable()
export class ItineraryVersioningService {
  private readonly logger = new Logger(ItineraryVersioningService.name);
  private readonly mockVersionStore = new Map<string, any[]>();

  constructor(private readonly prisma: PrismaService) {}

  async createNewVersion(
    tripId: string,
    changeReason: string,
    proposedDays: any[]
  ): Promise<ItineraryVersionRecord> {
    this.logger.log(`[ItineraryVersioningService] Creating new itinerary version for Trip ${tripId}`);

    let currentVersions = this.mockVersionStore.get(tripId) || [];
    const nextVersionNum = currentVersions.length + 2; // Starts from v2

    try {
      if (this.prisma && this.prisma.itinerary) {
        const created = await this.prisma.itinerary.create({
          data: {
            tripId,
            versionNumber: nextVersionNum,
            status: 'USER_MODIFIED',
            changeReason,
          },
        });

        return {
          versionId: created.id,
          tripId: created.tripId,
          versionNumber: created.versionNumber,
          changeReason: created.changeReason || changeReason,
          status: 'USER_MODIFIED',
          createdAt: created.createdAt.toISOString(),
        };
      }
    } catch (e) {
      this.logger.warn(`Prisma DB offline, creating mock in-memory version record: ${e.message}`);
    }

    const versionRecord: ItineraryVersionRecord = {
      versionId: `itin_v${nextVersionNum}_${Date.now()}`,
      tripId,
      versionNumber: nextVersionNum,
      changeReason,
      status: 'USER_MODIFIED',
      createdAt: new Date().toISOString(),
    };

    currentVersions.push(versionRecord);
    this.mockVersionStore.set(tripId, currentVersions);

    return versionRecord;
  }

  async getVersionHistory(tripId: string): Promise<ItineraryVersionRecord[]> {
    return this.mockVersionStore.get(tripId) || [
      {
        versionId: `itin_v1_orig`,
        tripId,
        versionNumber: 1,
        changeReason: 'Original AI Trip Plan Finalized',
        status: 'FINALIZED',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  }
}
