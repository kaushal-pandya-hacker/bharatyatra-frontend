import { Module } from '@nestjs/common';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { PackageOrchestratorService } from './package-orchestrator.service';
import { QuoteEngineService } from './quote-engine.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [PrismaModule, ProvidersModule],
  controllers: [PackagesController],
  providers: [PackagesService, PackageOrchestratorService, QuoteEngineService],
  exports: [PackagesService, PackageOrchestratorService, QuoteEngineService],
})
export class PackagesModule {}

