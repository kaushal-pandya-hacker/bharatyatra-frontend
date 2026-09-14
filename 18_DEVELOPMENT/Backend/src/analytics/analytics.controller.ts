import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AnalyticsService, AnalyticsEventPayload } from './analytics.service';

@Controller('api/v1')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('analytics/events')
  @HttpCode(HttpStatus.CREATED)
  trackEvent(@Body() payload: AnalyticsEventPayload) {
    return this.analyticsService.validateAndTrackEvent(payload);
  }

  @Get('admin/analytics/overview')
  getOverview() {
    return this.analyticsService.getOverviewMetrics();
  }

  @Get('admin/analytics/funnel')
  getFunnel() {
    return this.analyticsService.getFunnelMetrics();
  }

  @Get('admin/analytics/users')
  getUsers() {
    return this.analyticsService.getUsersMetrics();
  }

  @Get('admin/analytics/search')
  getSearch() {
    return this.analyticsService.getSearchMetrics();
  }

  @Get('admin/analytics/ai')
  getAi() {
    return this.analyticsService.getAiMetrics();
  }

  @Get('admin/analytics/adaptive-ai')
  getAdaptiveAi() {
    return this.analyticsService.getAdaptiveAiMetrics();
  }

  @Get('admin/analytics/bookings')
  getBookings() {
    return this.analyticsService.getBookingsMetrics();
  }

  @Get('admin/analytics/payments')
  getPayments() {
    return this.analyticsService.getPaymentsMetrics();
  }

  @Get('admin/analytics/suppliers')
  getSuppliers() {
    return this.analyticsService.getSuppliersMetrics();
  }

  @Get('admin/analytics/revenue')
  getRevenue() {
    return this.analyticsService.getRevenueMetrics();
  }

  @Get('admin/analytics/campaigns')
  getCampaigns() {
    return this.analyticsService.getCampaignsMetrics();
  }

  @Get('admin/analytics/retention')
  getRetention() {
    return this.analyticsService.getRetentionMetrics();
  }
}
