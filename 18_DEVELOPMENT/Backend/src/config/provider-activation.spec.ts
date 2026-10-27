import { Test, TestingModule } from '@nestjs/testing';
import { ProviderActivationService } from './provider-activation.config';
import { ProviderAdminController } from './provider-admin.controller';

describe('ProviderActivationService & Admin Telemetry', () => {
  let service: ProviderActivationService;
  let controller: ProviderAdminController;

  const originalEnv = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...originalEnv };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderAdminController],
      providers: [ProviderActivationService],
    }).compile();

    service = module.get<ProviderActivationService>(ProviderActivationService);
    controller = module.get<ProviderAdminController>(ProviderAdminController);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });

  it('should mask secret strings safely without exposing full keys', () => {
    expect(service.maskSecret('rzp_test_1234567890')).toBe('rzp_***90');
    expect(service.maskSecret('7b61secretkey123')).toBe('7b61***23');
    expect(service.maskSecret('')).toBe('[NOT CONFIGURED]');
    expect(service.maskSecret(null)).toBe('[NOT CONFIGURED]');
  });

  it('should return factual provider status overview with masked details', () => {
    const overview = service.getProviderStatusOverview();

    expect(overview.flights).toBeDefined();
    expect(overview.hotels).toBeDefined();
    expect(overview.buses).toBeDefined();
    expect(overview.trains).toBeDefined();
    expect(overview.payment).toBeDefined();

    expect(overview.hotels.maskedDetails.apiKey).not.toContain('unmasked_secret');
    expect(overview.payment.maskedDetails.keyId).toBeDefined();
  });

  it('should return admin readiness matrix via REST controller', () => {
    const res = controller.getReadinessMatrix();

    expect(res.matrix).toBeDefined();
    expect(res.matrix.flights.codeReady).toBe(true);
    expect(res.matrix.hotels.codeReady).toBe(true);
    expect(res.matrix.payment.codeReady).toBe(true);
  });

  it('should run pre-flight system diagnostics', () => {
    const preflight = controller.getPreflightCheck();

    expect(preflight.mode).toBeDefined();
    expect(preflight.database).toBeDefined();
    expect(preflight.payment).toBeDefined();
    expect(preflight.suppliers).toBeDefined();
    expect(preflight.notifications).toBeDefined();
  });

  it('should execute health check for a valid provider', async () => {
    const health = await controller.executeHealthCheck('hotels');

    expect(health.provider).toBe('Hotels');
    expect(health.reachable).toBe(true);
    expect(health.status).toBeDefined();
  });

  it('should enforce production startup gate when required credentials are missing in production mode', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    process.env.PAYMENT_PROVIDER = 'razorpay';

    const startup = service.validateProductionStartup();
    expect(startup.success).toBe(false);
    expect(startup.errors.some((err) => err.includes('PRODUCTION_CREDENTIALS_MISSING'))).toBe(true);
  });

  it('should throw error on startup if FAIL_FAST_ON_MISSING_CREDENTIALS is true in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.FAIL_FAST_ON_MISSING_CREDENTIALS = 'true';
    delete process.env.RAZORPAY_KEY_ID;
    process.env.PAYMENT_PROVIDER = 'razorpay';

    expect(() => service.validateProductionStartup()).toThrow(/Production startup gate blocked due to missing credentials/);
  });
});
