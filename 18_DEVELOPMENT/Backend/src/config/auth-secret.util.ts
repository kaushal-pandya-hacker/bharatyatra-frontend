import { ConfigService } from '@nestjs/config';

/**
 * Resolves JWT secret with strict production fail-closed enforcement.
 * Prevents hardcoded fallback secrets from being used in production.
 */
export function resolveJwtSecret(configService?: ConfigService): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const secret = configService ? configService.get<string>('JWT_SECRET') : process.env.JWT_SECRET;

  if (isProduction) {
    if (!secret || secret.trim().length < 32 || secret.includes('default_jwt_secret')) {
      throw new Error(
        'CRITICAL SECURITY ERROR: Valid, high-entropy JWT_SECRET (minimum 32 characters) must be configured in production environment. Refusing to initialize authentication.',
      );
    }
    return secret;
  }

  // Non-production fallback for test suites only
  const fallback = process.env.NODE_ENV === 'test' ? 'test_isolated_jwt_secret_for_local_testing_only_32chars' : undefined;
  const effective = secret || fallback;

  if (!effective) {
    throw new Error('JWT_SECRET environment variable is missing. Please configure JWT_SECRET in your .env file.');
  }

  return effective;
}
