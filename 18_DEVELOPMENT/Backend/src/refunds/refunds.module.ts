import { Module } from '@nestjs/common';
import { RefundsController } from './refunds.controller';
import { RefundEngineService } from './refund-engine.service';

@Module({
  controllers: [RefundsController],
  providers: [RefundEngineService],
  exports: [RefundEngineService],
})
export class RefundsModule {}
