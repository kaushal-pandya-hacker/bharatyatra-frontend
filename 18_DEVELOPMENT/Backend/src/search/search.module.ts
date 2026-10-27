import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { DestinationsModule } from '../destinations/destinations.module';

@Module({
  imports: [DestinationsModule],
  controllers: [SearchController],
})
export class SearchModule {}
