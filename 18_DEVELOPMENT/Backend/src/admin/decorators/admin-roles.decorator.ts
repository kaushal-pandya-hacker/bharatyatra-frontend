import { SetMetadata } from '@nestjs/common';

export const ADMIN_ROLES_KEY = 'admin_roles';
export const AdminRoles = (...roles: ('SUPER_ADMIN' | 'ADMIN' | 'SUPPORT' | 'ANALYST')[]) =>
  SetMetadata(ADMIN_ROLES_KEY, roles);
