import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { TransportModule } from '../transport/transport.module';
import { HotelsModule } from '../hotels/hotels.module';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [TransportModule, HotelsModule, ActivitiesModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}

