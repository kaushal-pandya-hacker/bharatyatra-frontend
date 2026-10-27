import { Module } from '@nestjs/common';
import { NexiController } from './nexi.controller';
import { NexiService } from './nexi.service';
import { NexiKnowledgeService } from './knowledge/nexi-knowledge.service';
import { NexiGeminiProvider } from './llm/nexi-gemini.provider';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, AiModule, NotificationsModule],
  controllers: [NexiController],
  providers: [NexiService, NexiKnowledgeService, NexiGeminiProvider],
  exports: [NexiService, NexiKnowledgeService, NexiGeminiProvider],
})
export class NexiModule {}
