import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GatewayMerchantService } from '../merchants/gateway-merchant.service';
import {
  GATEWAY_PERMISSIONS_KEY,
  GATEWAY_REQUIRE_SECRET_KEY,
} from './require-permissions.decorator';

@Injectable()
export class GatewayApiKeyGuard implements CanActivate {
  constructor(
    private readonly merchantService: GatewayMerchantService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey =
      request.headers['x-api-key'] ||
      (request.headers.authorization && request.headers.authorization.startsWith('Bearer ')
        ? request.headers.authorization.replace('Bearer ', '')
        : null);

    if (!apiKey) {
      throw new UnauthorizedException('Missing required authentication credentials. Provide X-API-KEY header.');
    }

    const validation = this.merchantService.validateKey(apiKey);

    // 1. Check if Secret Key is strictly required for this endpoint
    const requireSecret = this.reflector.getAllAndOverride<boolean>(
      GATEWAY_REQUIRE_SECRET_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requireSecret && !validation.isSecretKey) {
      throw new ForbiddenException(
        'Privileged operation requires Secret API Key (sk_test_...). Publishable keys (pk_test_...) are not authorized.',
      );
    }

    // 2. Check Scoped Permissions
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      GATEWAY_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasAll = requiredPermissions.every(p => validation.permissions.includes(p));
      if (!hasAll) {
        throw new ForbiddenException(
          `API key lacks required permission(s): ${requiredPermissions.join(', ')}. Granted permissions: ${validation.permissions.join(', ')}`,
        );
      }
    }

    // Attach verified merchant context
    request.merchantId = validation.merchantId;
    request.apiKeyPermissions = validation.permissions;
    request.isSecretKey = validation.isSecretKey;
    request.credentialId = validation.credentialId;

    return true;
  }
}
