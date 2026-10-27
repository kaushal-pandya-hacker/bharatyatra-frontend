import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Customer Support')
@ApiBearerAuth()
@Controller('support')
export class SupportController {
  @Post('ticket')
  @ApiOperation({ summary: 'Submit Customer Support Ticket' })
  async createTicket(@Body() body: { subject: string; description: string; bookingId?: string }) {
    return {
      success: true,
      data: {
        ticketId: `tkt_${Date.now()}`,
        subject: body.subject,
        status: 'OPEN',
        priority: 'HIGH',
        createdAt: new Date().toISOString()
      }
    };
  }
}
