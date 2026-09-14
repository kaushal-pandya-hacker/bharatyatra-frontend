import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [
    PassportModule,
    BookingsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'chalo_farva_default_jwt_secret_key_32chars',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}

