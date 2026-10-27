import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BookingsModule } from '../bookings/bookings.module';
import { TransportModule } from '../transport/transport.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuditService } from './admin-audit.service';
import { AdminTourismController } from './admin-tourism.controller';
import { AdminTourismService } from './admin-tourism.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { resolveJwtSecret } from '../config/auth-secret.util';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    NotificationsModule,
    BookingsModule,
    TransportModule,
    JwtModule.register({
      secret: resolveJwtSecret(),
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  controllers: [AdminController, AdminTourismController],
  providers: [
    AdminService,
    AdminAuthService,
    AdminAuditService,
    AdminTourismService,
    AdminAuthGuard,
    AdminRoleGuard,
  ],
  exports: [
    AdminService,
    AdminAuthService,
    AdminAuditService,
    AdminTourismService,
    AdminAuthGuard,
    AdminRoleGuard,
  ],
})
export class AdminModule {}
