import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FeedbackService, SubmitFeedbackRequest, FeedbackCategory, FeedbackStatus, FeedbackSeverity } from './feedback.service';

@ApiTags('Beta Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Submit Beta Feedback / Issue Report' })
  submitFeedback(@Body() body: SubmitFeedbackRequest) {
    return this.feedbackService.submit(body);
  }

  @Get('admin')
  @ApiOperation({ summary: 'Get All Triaged Beta Feedback (Admin Only)' })
  getAllFeedback(
    @Query('category') category?: FeedbackCategory,
    @Query('status') status?: FeedbackStatus,
    @Query('severity') severity?: FeedbackSeverity,
  ) {
    return this.feedbackService.getAllFeedback(category, status, severity);
  }

  @Patch('admin/:feedbackId')
  @ApiOperation({ summary: 'Update Beta Feedback Triage Status (Admin Only)' })
  updateStatus(
    @Param('feedbackId') feedbackId: string,
    @Body() body: { status: FeedbackStatus; adminNotes?: string },
  ) {
    return this.feedbackService.updateStatus(feedbackId, body.status, body.adminNotes);
  }

  @Get('admin/analytics')
  @ApiOperation({ summary: 'Get Beta Feedback & Launch Blocker Analytics' })
  getAnalytics() {
    return this.feedbackService.getAnalyticsSummary();
  }
}
