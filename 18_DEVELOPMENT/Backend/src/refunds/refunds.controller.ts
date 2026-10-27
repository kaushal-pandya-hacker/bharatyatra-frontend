import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { RefundStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@ApiTags('Refunds')
@ApiBearerAuth()
@Controller('api/v1')
export class RefundsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('refunds/request')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Initiate Refund Request' })
  async requestRefund(
    @Req() req: any,
    @Body() body: { bookingId: string; amountInr: number; reason: string },
  ) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Authentication required to request a refund.');
    }

    if (!body.bookingId) {
      throw new BadRequestException('bookingId is required.');
    }

    if (body.amountInr === undefined || body.amountInr <= 0) {
      throw new BadRequestException('Refund amount must be a positive number.');
    }

    // Verify booking exists and belongs to requesting user
    const booking = await this.prisma.booking.findUnique({
      where: { id: body.bookingId },
      include: { payments: true, refunds: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking [${body.bookingId}] not found.`);
    }

    const isAdmin = req.user?.role === 'ADMIN' || !!req.admin;
    if (booking.userId && booking.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Access denied: You do not own this booking.');
    }

    // Check payment status and max refundable balance
    const paidTotal = booking.payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amountInr), 0);
    const refundedTotal = booking.refunds.reduce((sum, r) => sum + Number(r.amountInr), 0);
    const maxRefundable = Math.max(0, paidTotal - refundedTotal);

    if (paidTotal === 0) {
      throw new BadRequestException('Cannot request refund for an unpaid booking.');
    }

    if (body.amountInr > maxRefundable) {
      throw new BadRequestException(
        `Requested refund amount ₹${body.amountInr} exceeds eligible balance of ₹${maxRefundable}.`,
      );
    }

    const refund = await this.prisma.refund.create({
      data: {
        bookingId: body.bookingId,
        amountInr: body.amountInr,
        status: 'REQUESTED',
        reason: body.reason || 'Customer refund request',
      },
    });

    return {
      success: true,
      data: refund,
    };
  }

  @Get('refunds/:id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get Refund Status & History' })
  async getRefundStatus(@Req() req: any, @Param('id') id: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: {
        booking: true,
        order: true,
        orderItem: true,
      },
    });

    if (!refund) {
      throw new NotFoundException(`Refund [${id}] not found.`);
    }

    const userId = req.user?.id || req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN' || !!req.admin;
    const resourceOwnerId = refund.booking?.userId || refund.order?.userId;

    if (userId && resourceOwnerId && resourceOwnerId !== userId && !isAdmin) {
      throw new ForbiddenException('Access denied: You do not have permission to view this refund.');
    }

    return {
      success: true,
      data: refund,
    };
  }

  @Get('admin/refunds')
  @ApiOperation({ summary: 'Admin Refund Queue & Manual Review Workspace' })
  async getAdminRefunds(
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
      throw new ForbiddenException('Admin authorization required to access refund workspace.');
    }

    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = Math.min(limit ? parseInt(limit, 10) : 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.status = status as RefundStatus;
    }

    const [total, refunds] = await Promise.all([
      this.prisma.refund.count({ where }),
      this.prisma.refund.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          booking: true,
          order: {
            include: { user: { select: { id: true, email: true, fullName: true } } },
          },
          orderItem: true,
          cancellationRequest: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      refunds,
    };
  }
}
