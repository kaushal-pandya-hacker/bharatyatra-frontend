import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAuditService } from './admin-audit.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export interface AdminUserRecord {
  id: string;
  username: string;
  displayName: string;
  email?: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT' | 'ANALYST';
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
}

interface FailedAttemptTracker {
  attempts: number;
  lockedUntil?: Date;
}

@Injectable()
export class AdminAuthService implements OnModuleInit {
  private readonly logger = new Logger(AdminAuthService.name);

  // Rate limiting & brute force tracking
  private readonly failedLoginAttempts = new Map<string, FailedAttemptTracker>();

  // In-memory fallback stores
  private readonly memoryAdminUsers = new Map<string, any>();
  private readonly memorySessions = new Map<string, any>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditService: AdminAuditService,
  ) {}

  async onModuleInit() {
    await this.bootstrapInitialAdmin();
  }

  // Bootstrap initial SUPER_ADMIN user securely if none exists
  private async bootstrapInitialAdmin() {
    const isProduction = process.env.NODE_ENV === 'production';
    const isTest = process.env.NODE_ENV === 'test';

    const bootstrapUsername = this.configService.get<string>('ADMIN_BOOTSTRAP_USERNAME');
    const bootstrapPassword = this.configService.get<string>('ADMIN_BOOTSTRAP_PASSWORD');

    // In production, NEVER use hardcoded or default passwords
    if (isProduction) {
      try {
        const existingCount = await this.prisma.adminUser.count();
        if (existingCount > 0) {
          return; // Already initialized
        }
      } catch (err) {
        this.logger.error('[FATAL] Cannot verify admin users in database during production startup. Refusing to boot with in-memory admin.');
        throw new Error('Database connection failed during production admin verification. System halted.');
      }

      if (!bootstrapUsername || !bootstrapPassword) {
        throw new Error(
          '[FATAL] Production startup halted: Database has 0 admin accounts and ADMIN_BOOTSTRAP_USERNAME / ADMIN_BOOTSTRAP_PASSWORD are not configured in environment variables.',
        );
      }

      if (bootstrapPassword === 'BharatYatraAdmin2026!' || bootstrapPassword.length < 16) {
        throw new Error(
          '[FATAL] Production startup halted: ADMIN_BOOTSTRAP_PASSWORD cannot use default or weak password (min 16 chars required in production).',
        );
      }
    }

    // In test or development environments:
    const activeUsername = bootstrapUsername || (isTest ? 'bharatyatra_admin' : undefined);
    const activePassword = bootstrapPassword || (isTest ? 'BharatYatraAdmin2026!' : undefined);

    if (!activeUsername || !activePassword) {
      this.logger.warn('[BOOTSTRAP] Admin bootstrap skipped: ADMIN_BOOTSTRAP_USERNAME / ADMIN_BOOTSTRAP_PASSWORD not provided.');
      return;
    }

    const hashedPassword = await bcrypt.hash(activePassword, 10);

    try {
      const existingCount = await this.prisma.adminUser.count();
      if (existingCount === 0) {
        await this.prisma.adminUser.create({
          data: {
            username: activeUsername,
            passwordHash: hashedPassword,
            displayName: 'Initial Super Admin',
            email: 'admin@bharatyatra.in',
            role: 'SUPER_ADMIN',
            isActive: true,
          },
        });
        this.logger.log(`[BOOTSTRAP] Initial SUPER_ADMIN account '${activeUsername}' initialized in database.`);
      }
    } catch (e) {
      if (isProduction) {
        throw new Error('Database offline during production admin provisioning.');
      }
      this.logger.warn(`Prisma offline during admin bootstrap. Initializing isolated in-memory test admin account.`);
      const defaultAdmin = {
        id: '00000000-0000-0000-0000-000000000099',
        username: activeUsername,
        passwordHash: hashedPassword,
        displayName: 'Initial Super Admin',
        email: 'admin@bharatyatra.in',
        role: 'SUPER_ADMIN',
        isActive: true,
        createdAt: new Date(),
      };
      this.memoryAdminUsers.set(activeUsername.toLowerCase(), defaultAdmin);
    }
  }

  async login(credentials: { username: string; password: string; ipAddress?: string; userAgent?: string }) {
    const username = (credentials.username || '').trim().toLowerCase();
    const password = credentials.password || '';

    if (!username || !password) {
      throw new UnauthorizedException('Invalid admin credentials.');
    }

    // Check brute force lockout for username / IP
    const lockKey = `${username}_${credentials.ipAddress || 'unknown'}`;
    const failedTracker = this.failedLoginAttempts.get(lockKey);

    if (failedTracker && failedTracker.lockedUntil && failedTracker.lockedUntil > new Date()) {
      const waitMins = Math.ceil((failedTracker.lockedUntil.getTime() - Date.now()) / 60000);
      await this.auditService.logAction({
        action: 'ACCOUNT_LOCKED_ATTEMPT',
        resourceType: 'AdminUser',
        resourceId: username,
        ipAddress: credentials.ipAddress,
        userAgent: credentials.userAgent,
        metadata: { waitMins },
      });
      throw new UnauthorizedException(`Account temporarily locked due to multiple failed login attempts. Try again in ${waitMins} minute(s).`);
    }

    // Authenticate admin user
    let admin: any = null;

    try {
      admin = await this.prisma.adminUser.findUnique({
        where: { username },
      });
    } catch (e) {
      admin = this.memoryAdminUsers.get(username);
    }

    // Verify password with bcrypt
    const passwordValid = admin ? await bcrypt.compare(password, admin.passwordHash) : false;

    if (!admin || !passwordValid || !admin.isActive) {
      // Record failed attempt
      const attempts = (failedTracker?.attempts || 0) + 1;
      let lockedUntil: Date | undefined;

      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minute lockout
        this.logger.warn(`Admin login brute-force lock enforced for target '${username}' (IP: ${credentials.ipAddress})`);
      }

      this.failedLoginAttempts.set(lockKey, { attempts, lockedUntil });

      await this.auditService.logAction({
        action: 'FAILED_LOGIN',
        resourceType: 'AdminUser',
        resourceId: username,
        ipAddress: credentials.ipAddress,
        userAgent: credentials.userAgent,
        metadata: { attempts },
      });

      // Generic error message to prevent username enumeration
      throw new UnauthorizedException('Invalid admin credentials.');
    }

    // Reset failed attempts on successful login
    this.failedLoginAttempts.delete(lockKey);

    // Generate secure admin session token
    const sessionToken = `adm_sess_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h validity

    let session: any = null;

    try {
      session = await this.prisma.adminSession.create({
        data: {
          adminId: admin.id,
          token: sessionToken,
          ipAddress: credentials.ipAddress || null,
          userAgent: credentials.userAgent || null,
          expiresAt,
        },
      });

      await this.prisma.adminUser.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() },
      });
    } catch (e) {
      session = {
        id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        adminId: admin.id,
        token: sessionToken,
        ipAddress: credentials.ipAddress,
        userAgent: credentials.userAgent,
        expiresAt,
        createdAt: new Date(),
      };
      this.memorySessions.set(sessionToken, { ...session, admin });
    }

    await this.auditService.logAction({
      adminId: admin.id,
      action: 'ADMIN_LOGIN',
      resourceType: 'AdminUser',
      resourceId: admin.id,
      ipAddress: credentials.ipAddress,
      userAgent: credentials.userAgent,
    });

    return {
      token: sessionToken,
      expiresAt,
      admin: {
        id: admin.id,
        username: admin.username,
        displayName: admin.displayName,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async verifyAdminToken(token: string): Promise<AdminUserRecord | null> {
    if (!token) return null;

    try {
      const session = await this.prisma.adminSession.findUnique({
        where: { token },
        include: { admin: true },
      });

      if (!session || session.expiresAt < new Date()) {
        return null;
      }

      if (!session.admin || !session.admin.isActive) {
        return null;
      }

      return {
        id: session.admin.id,
        username: session.admin.username,
        displayName: session.admin.displayName,
        email: session.admin.email,
        role: session.admin.role as any,
        isActive: session.admin.isActive,
        lastLoginAt: session.admin.lastLoginAt,
        createdAt: session.admin.createdAt,
      };
    } catch (e) {
      const memSess = this.memorySessions.get(token);
      if (!memSess || memSess.expiresAt < new Date()) return null;
      return memSess.admin;
    }
  }

  async logout(token: string, adminId?: string, ipAddress?: string, userAgent?: string) {
    if (!token) return { success: true };

    try {
      await this.prisma.adminSession.delete({
        where: { token },
      });
    } catch (e) {
      this.memorySessions.delete(token);
    }

    if (adminId) {
      await this.auditService.logAction({
        adminId,
        action: 'ADMIN_LOGOUT',
        resourceType: 'AdminUser',
        resourceId: adminId,
        ipAddress,
        userAgent,
      });
    }

    return { success: true, message: 'Admin session invalidated.' };
  }

  async changePassword(
    adminId: string,
    dto: { currentPassword?: string; newPassword?: string },
    ipAddress?: string,
    userAgent?: string,
  ) {
    if (!dto.currentPassword || !dto.newPassword) {
      throw new BadRequestException('Current password and new password are required.');
    }

    if (dto.newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long.');
    }

    let admin: any = null;

    try {
      admin = await this.prisma.adminUser.findUnique({ where: { id: adminId } });
    } catch (e) {
      admin = Array.from(this.memoryAdminUsers.values()).find((u) => u.id === adminId);
    }

    if (!admin) {
      throw new UnauthorizedException('Admin user not found.');
    }

    const currentValid = await bcrypt.compare(dto.currentPassword, admin.passwordHash);
    if (!currentValid) {
      throw new UnauthorizedException('Current password does not match.');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    try {
      await this.prisma.adminUser.update({
        where: { id: adminId },
        data: { passwordHash: newPasswordHash },
      });

      // Invalidate all other active sessions for security
      await this.prisma.adminSession.deleteMany({
        where: { adminId },
      });
    } catch (e) {
      admin.passwordHash = newPasswordHash;
    }

    await this.auditService.logAction({
      adminId,
      action: 'CHANGE_PASSWORD',
      resourceType: 'AdminUser',
      resourceId: adminId,
      ipAddress,
      userAgent,
    });

    return { success: true, message: 'Admin password changed successfully. Other sessions invalidated.' };
  }
}
