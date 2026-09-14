import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdaptiveAiService } from './adaptive-ai.service';
import { UserAdaptationPreference } from './services/decision-approval.engine';

@ApiTags('Adaptive AI Engine')
@Controller('adaptive-ai')
export class AdaptiveAiController {
  constructor(private readonly adaptiveAiService: AdaptiveAiService) {}

  @Post('events')
  @ApiOperation({ summary: 'Ingest External Real-Time Event (Weather, Traffic, Bus, Attraction Closure)' })
  async ingestEvent(@Body() body: any) {
    return this.adaptiveAiService.processEvent(body);
  }

  @Post('evaluate')
  @ApiOperation({ summary: 'Trigger Manual or Automated Active Trip Evaluation' })
  async evaluateTrip(@Body() body: any) {
    return this.adaptiveAiService.processEvent(body);
  }

  @Get('trips/:tripId/adaptations')
  @ApiOperation({ summary: 'Fetch Active Adaptation Proposals for a Trip' })
  async getTripProposals(@Param('tripId') tripId: string) {
    return this.adaptiveAiService.getProposalsForTrip(tripId);
  }

  @Get('trips/:tripId/adaptations/:adaptationId')
  @ApiOperation({ summary: 'Fetch Single Adaptation Proposal Detail' })
  async getProposalDetail(@Param('adaptationId') adaptationId: string) {
    return this.adaptiveAiService.getProposalById(adaptationId);
  }

  @Post('trips/:tripId/adaptations/:adaptationId/approve')
  @ApiOperation({ summary: 'Approve Adaptation Proposal & Create New Immutable Itinerary Version' })
  async approveProposal(
    @Param('tripId') tripId: string,
    @Param('adaptationId') adaptationId: string,
    @Body() body: { userId?: string }
  ) {
    return this.adaptiveAiService.approveProposal(adaptationId, body.userId || 'usr_guest');
  }

  @Post('trips/:tripId/adaptations/:adaptationId/reject')
  @ApiOperation({ summary: 'Reject Adaptation Proposal & Preserve Original Itinerary Unchanged' })
  async rejectProposal(
    @Param('tripId') tripId: string,
    @Param('adaptationId') adaptationId: string,
    @Body() body: { userId?: string }
  ) {
    return this.adaptiveAiService.rejectProposal(adaptationId, body.userId || 'usr_guest');
  }

  @Get('users/me/preferences')
  @ApiOperation({ summary: 'Get User Adaptation Mode Preferences (MANUAL, ASSISTED, AUTO_LOW_RISK)' })
  async getUserPreferences() {
    return this.adaptiveAiService.getUserPreferences('usr_guest');
  }

  @Patch('users/me/preferences')
  @ApiOperation({ summary: 'Update User Adaptation Mode Preference' })
  async updateUserPreferences(@Body() body: { preference: UserAdaptationPreference }) {
    return this.adaptiveAiService.updateUserPreferences('usr_guest', body.preference);
  }
}
