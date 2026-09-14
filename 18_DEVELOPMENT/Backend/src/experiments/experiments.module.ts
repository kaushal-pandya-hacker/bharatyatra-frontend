import { Module } from '@nestjs/common';
import { ExperimentsService } from './experiments.service';
import { ExperimentsController } from './experiments.controller';

@Module({
  providers: [ExperimentsService],
  controllers: [ExperimentsController],
  exports: [ExperimentsService],
})
export class ExperimentsModule {}
