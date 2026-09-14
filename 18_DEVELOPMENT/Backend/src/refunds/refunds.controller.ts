import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Refunds')
@ApiBearerAuth()
@Controller('refunds')
export class RefundsController {
  @Post('request')
  @ApiOperation({ summary: 'Initiate Refund Request' })
  async requestRefund(@Body() body: { bookingId: string; amountInr: number; reason: string }) {
    return {
      success: true,
      data: {
        refundId: `rfnd_${Date.now()}`,
        bookingId: body.bookingId,
        amountInr: body.amountInr,
        status: 'REQUESTED',
        reason: body.reason,
        requestedAt: new Date().toISOString()
      }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Refund Status & History' })
  async getRefundStatus(@Param('id') id: string) {
    return {
      success: true,
      data: {
        refundId: id,
        bookingId: 'bk_demo_123',
        amountInr: 1250,
        status: 'COMPLETED',
        completedAt: new Date().toISOString()
      }
    };
  }
}
