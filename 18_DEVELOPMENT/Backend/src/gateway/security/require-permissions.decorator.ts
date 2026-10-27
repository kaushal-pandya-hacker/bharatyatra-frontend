import { SetMetadata } from '@nestjs/common';

export const GATEWAY_PERMISSIONS_KEY = 'gateway_permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(GATEWAY_PERMISSIONS_KEY, permissions);

export const GATEWAY_REQUIRE_SECRET_KEY = 'gateway_require_secret_key';
export const RequireSecretKey = () => SetMetadata(GATEWAY_REQUIRE_SECRET_KEY, true);
