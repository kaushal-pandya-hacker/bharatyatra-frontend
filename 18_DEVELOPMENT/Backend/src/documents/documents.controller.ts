import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Documents')
@Controller('documents')
export class DocumentsController {
  @Get(':type/:referenceId')
  @ApiOperation({ summary: 'Get Document Object Storage Reference (Invoice, Voucher, Receipt)' })
  async getDocument(@Param('type') type: string, @Param('referenceId') referenceId: string) {
    return {
      success: true,
      data: {
        documentType: type.toUpperCase(),
        referenceId,
        downloadUrl: `http://localhost:9000/chalo-farva-documents/${type}_${referenceId}.pdf`,
        generatedAt: new Date().toISOString()
      }
    };
  }
}
