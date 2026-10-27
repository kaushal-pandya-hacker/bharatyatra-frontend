import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService — Mobile OTP & Authentication Tests', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('mocked_jwt_token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('1. Phone Number Normalization & Validation', () => {
    it('should send OTP to valid 10-digit Indian mobile number', async () => {
      const result = await service.sendOtp('9624282521');
      expect(result.success).toBe(true);
      expect(result.message).toContain('+919624282521');
      expect(result.cooldownSeconds).toBe(30);
    });

    it('should accept +91 prefixed Indian mobile numbers', async () => {
      const result = await service.sendOtp('+919624282521');
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone numbers (less than 10 digits)', async () => {
      await expect(service.sendOtp('962428')).rejects.toThrow(BadRequestException);
    });

    it('should reject non-Indian mobile numbers (start digit not 6-9)', async () => {
      await expect(service.sendOtp('1234567890')).rejects.toThrow(BadRequestException);
    });
  });

  describe('2. Rate Limiting & Cooldown', () => {
    it('should enforce 30-second cooldown between OTP resend requests', async () => {
      await service.sendOtp('9624282521');
      await expect(service.sendOtp('9624282521')).rejects.toThrow(BadRequestException);
    });
  });

  describe('3. OTP Verification & User Session', () => {
    it('should reject OTP verification if no request was made', async () => {
      await expect(service.verifyOtp('9876543210', '123456')).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid 6-digit OTP code', async () => {
      await service.sendOtp('9624282521');
      await expect(service.verifyOtp('9624282521', '000000')).rejects.toThrow(UnauthorizedException);
    });

    it('should verify correct OTP code and create new user profile', async () => {
      const sendRes = await service.sendOtp('9624282521');
      expect(sendRes.success).toBe(true);

      // Access internal OTP store to simulate user receiving SMS
      const otpStore = (service as any).otpStore;
      const record = otpStore.get('+919624282521');
      expect(record).toBeDefined();
      expect(record.otp).toMatch(/^\d{6}$/);

      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'usr_9624282521',
        email: 'phone_919624282521@bharatyatra.com',
        fullName: '',
        phoneNumber: '+919624282521',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        isPhoneVerified: true,
      });

      const verifyRes = await service.verifyOtp('9624282521', record.otp);
      expect(verifyRes.success).toBe(true);
      expect(verifyRes.isNewUser).toBe(true);
      expect(verifyRes.requiresProfileSetup).toBe(true);
      expect(verifyRes.data.token).toBe('mocked_jwt_token');
    });
  });

  describe('4. Profile Completion', () => {
    it('should complete profile setup with full name', async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: 'usr_9624282521',
        email: 'kaushal@example.com',
        fullName: 'Kaushal Pandya',
        phoneNumber: '+919624282521',
        role: 'CUSTOMER',
        status: 'ACTIVE',
      });

      const res = await service.completeProfile('usr_9624282521', {
        fullName: 'Kaushal Pandya',
        email: 'kaushal@example.com',
      });

      expect(res.success).toBe(true);
      expect(res.data.user.fullName).toBe('Kaushal Pandya');
    });

    it('should throw BadRequestException if full name is empty', async () => {
      await expect(service.completeProfile('usr_123', { fullName: '' })).rejects.toThrow(BadRequestException);
    });
  });
});
