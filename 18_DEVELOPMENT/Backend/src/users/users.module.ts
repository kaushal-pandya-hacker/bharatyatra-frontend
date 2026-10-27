import { Module } from '@nestjs/common';
import { UsersController, MeController } from './users.controller';
import { ProfileTravelController } from './profile-travel.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [MeController, UsersController, ProfileTravelController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
