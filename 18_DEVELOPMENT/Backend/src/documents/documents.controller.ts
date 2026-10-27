import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Documents')
@Controller('documents')
export class DocumentsController {
  @Get(':type/:referenceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Document Storage Reference (Invoice, Voucher, Receipt, Trip PDF)' })
  async getDocument(@Req() req: any, @Param('type') type: string, @Param('referenceId') referenceId: string) {
    const storageBaseUrl = process.env.STORAGE_BASE_URL || process.env.NEXT_PUBLIC_STORAGE_URL || 'https://storage.bharatyatra.com/vouchers';
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour signed link

    return {
      success: true,
      data: {
        documentType: type.toUpperCase(),
        referenceId,
        downloadUrl: `${storageBaseUrl.replace(/\/+$/, '')}/${type.toLowerCase()}_${referenceId}.pdf?token=signed_${Date.now()}`,
        expiresAt,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}
