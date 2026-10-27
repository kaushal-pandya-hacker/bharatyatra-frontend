import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_ROLES_KEY } from '../decorators/admin-roles.decorator';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ADMIN_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No explicit role restriction required
    }

    const request = context.switchToHttp().getRequest();
    const admin = request.admin;

    if (!admin || !admin.role) {
      throw new ForbiddenException('Admin role authorization check failed.');
    }

    // SUPER_ADMIN has access to all admin operations
    if (admin.role === 'SUPER_ADMIN') {
      return true;
    }

    const hasRole = requiredRoles.includes(admin.role);
    if (!hasRole) {
      throw new ForbiddenException(`Action requires higher admin role privilege. Required: [${requiredRoles.join(', ')}], Current: ${admin.role}`);
    }

    return true;
  }
}
