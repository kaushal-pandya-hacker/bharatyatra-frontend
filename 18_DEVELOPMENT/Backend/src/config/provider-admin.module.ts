import { Module } from '@nestjs/common';
import { ProviderActivationService } from './provider-activation.config';
import { ProviderAdminController } from './provider-admin.controller';

@Module({
  controllers: [ProviderAdminController],
  providers: [ProviderActivationService],
  exports: [ProviderActivationService],
})
export class ProviderAdminModule {}
