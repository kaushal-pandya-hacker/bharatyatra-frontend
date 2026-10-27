import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminAuthService } from '../admin-auth.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract admin token from Authorization header or HttpOnly cookie
    let token: string | undefined;

    const authHeader = request.headers['authorization'] || request.headers['Authorization'];
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (request.cookies && request.cookies.admin_session) {
      token = request.cookies.admin_session;
    } else if (request.headers['x-admin-token']) {
      token = request.headers['x-admin-token'] as string;
    }

    if (!token) {
      throw new UnauthorizedException('Admin authentication required. Please sign in to the Admin Portal.');
    }

    // Verify admin token strictly against AdminSession / AdminUser
    const adminUser = await this.adminAuthService.verifyAdminToken(token);

    if (!adminUser) {
      throw new UnauthorizedException('Invalid or expired admin session. Customer authentication is not permitted.');
    }

    if (!adminUser.isActive) {
      throw new UnauthorizedException('Admin account has been deactivated by system governance.');
    }

    // Attach verified admin user object to request
    request.admin = adminUser;
    request.adminToken = token;

    return true;
  }
}
