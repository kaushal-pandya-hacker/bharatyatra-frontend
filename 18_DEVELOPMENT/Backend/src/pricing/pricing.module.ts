import { Global, Module } from '@nestjs/common';
import { PricingEngineService } from './pricing-engine.service';

@Global()
@Module({
  providers: [PricingEngineService],
  exports: [PricingEngineService],
})
export class PricingModule {}
