import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [
    BookingsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'chalo_farva_default_jwt_secret_key_32chars',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
