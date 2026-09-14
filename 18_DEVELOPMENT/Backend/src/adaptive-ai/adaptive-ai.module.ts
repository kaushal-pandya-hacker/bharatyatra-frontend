import { Module } from '@nestjs/common';
import { AdaptiveAiController } from './adaptive-ai.controller';
import { AdaptiveAiService } from './adaptive-ai.service';
import { EventNormalizerService } from './services/event-normalizer.service';
import { EventIngestionService } from './services/event-ingestion.service';
import { ImpactDetectionEngine } from './services/impact-detection.engine';
import { DecisionApprovalEngine } from './services/decision-approval.engine';
import { ItineraryVersioningService } from './services/itinerary-versioning.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AdaptiveAiController],
  providers: [
    AdaptiveAiService,
    EventNormalizerService,
    EventIngestionService,
    ImpactDetectionEngine,
    DecisionApprovalEngine,
    ItineraryVersioningService,
    PrismaService,
  ],
  exports: [AdaptiveAiService],
})
export class AdaptiveAiModule {}
