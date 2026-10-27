import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { BookingsModule } from '../bookings/bookings.module';
import { resolveJwtSecret } from '../config/auth-secret.util';

@Module({
  imports: [
    PassportModule,
    BookingsModule,
    JwtModule.register({
      secret: resolveJwtSecret(),
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}

