import { resolveJwtSecret } from './auth-secret.util';

describe('AuthSecretUtil - JWT Secret Security Hardening', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('In production mode: throws fatal error if JWT_SECRET is missing', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;

    expect(() => resolveJwtSecret()).toThrow(/CRITICAL SECURITY ERROR.*JWT_SECRET.*production/i);
  });

  it('In production mode: throws fatal error if JWT_SECRET uses known default fallback', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'chalo_farva_default_jwt_secret_key_32chars';

    expect(() => resolveJwtSecret()).toThrow(/CRITICAL SECURITY ERROR.*JWT_SECRET.*production/i);
  });

  it('In production mode: throws fatal error if JWT_SECRET is shorter than 32 characters', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'short_secret_123';

    expect(() => resolveJwtSecret()).toThrow(/CRITICAL SECURITY ERROR.*JWT_SECRET.*production/i);
  });

  it('In production mode: accepts strong secret of 32+ chars', () => {
    process.env.NODE_ENV = 'production';
    const strongSecret = 'super_secure_production_secret_key_998877665544332211';
    process.env.JWT_SECRET = strongSecret;

    expect(resolveJwtSecret()).toBe(strongSecret);
  });

  it('In test mode: provides safe isolated fallback secret if JWT_SECRET is not set', () => {
    process.env.NODE_ENV = 'test';
    delete process.env.JWT_SECRET;

    const secret = resolveJwtSecret();
    expect(secret).toBeDefined();
    expect(secret.length).toBeGreaterThanOrEqual(32);
    expect(secret).toContain('test_isolated');
  });
});
