import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { SandboxActivityProviderAdapter } from '../providers/activities/sandbox-activity.provider.adapter';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [ProvidersModule],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, SandboxActivityProviderAdapter],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
