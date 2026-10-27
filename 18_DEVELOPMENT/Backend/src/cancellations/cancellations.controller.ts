import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { CancellationEngineService } from './cancellation-engine.service';
import { CreateCancellationQuoteDto, ConfirmCancellationDto } from './cancellations.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('api/v1')
export class CancellationsController {
  constructor(private readonly cancellationService: CancellationEngineService) {}

  @Get('orders/:id/cancellation-eligibility')
  @UseGuards(JwtAuthGuard)
  async checkEligibility(
    @Req() req: any,
    @Param('id') orderId: string,
    @Query('orderItemId') orderItemId: string,
  ) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Authentication required for cancellation operations.');
    }
    if (!orderItemId) {
      throw new BadRequestException('orderItemId query parameter is required.');
    }
    return this.cancellationService.checkEligibility(userId, orderId, orderItemId);
  }

  @Post('orders/:id/cancellation-quote')
  @UseGuards(JwtAuthGuard)
  async getCancellationQuote(
    @Req() req: any,
    @Param('id') orderId: string,
    @Body() dto: CreateCancellationQuoteDto,
  ) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Authentication required for cancellation operations.');
    }
    return this.cancellationService.getCancellationQuote(userId, orderId, dto.orderItemId, dto.reason);
  }

  @Post('orders/:id/cancel-item')
  @UseGuards(JwtAuthGuard)
  async confirmCancellation(
    @Req() req: any,
    @Param('id') orderId: string,
    @Body() dto: ConfirmCancellationDto,
  ) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Authentication required for cancellation operations.');
    }
    return this.cancellationService.confirmCancellation(userId, dto.cancellationRequestId, dto.reason);
  }

  @Get('cancellations/:id')
  @UseGuards(OptionalJwtAuthGuard)
  async getCancellationRequest(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id || req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN' || !!req.admin;
    const request = await this.cancellationService.getCancellationRequest(id);
    if (userId && request.userId && request.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Access denied: You do not own this cancellation request.');
    }
    return request;
  }

  @Get('admin/cancellations')
  async getAdminCancellations(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const adminKey = req.headers['x-admin-key'] || req.headers['x-admin-token'];
    const isAdmin =
      req.user?.role === 'ADMIN' ||
      !!req.admin ||
      (adminKey && process.env.ADMIN_SECRET_KEY && adminKey === process.env.ADMIN_SECRET_KEY);

    if (!isAdmin) {
      throw new ForbiddenException('Admin authorization required to access cancellation directory.');
    }

    return this.cancellationService.getAdminCancellations({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
    });
  }
}
