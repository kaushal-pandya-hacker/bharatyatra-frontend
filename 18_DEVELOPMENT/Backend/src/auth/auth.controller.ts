import { Controller, Post, Get, Body, HttpCode, HttpStatus, UnauthorizedException, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, Length } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { RateLimit } from '../security/rate-limit.decorator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  passwordHash: string;
}

export class RegisterDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  passwordHash: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class SendOtpDto {
  @IsString()
  phoneNumber: string;
}

export class VerifyOtpDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits.' })
  otp: string;
}

export class CompleteProfileDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ points: 3, duration: 60, byAccount: true, keyPrefix: 'otp_send' })
  @ApiOperation({ summary: 'Request 6-digit OTP for Mobile Authentication' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async sendOtp(@Body() body: SendOtpDto) {
    return this.authService.sendOtp(body.phoneNumber);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ points: 5, duration: 60, byAccount: true, keyPrefix: 'otp_verify' })
  @ApiOperation({ summary: 'Verify 6-digit Mobile OTP & Create/Retrieve Session' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.phoneNumber, body.otp);
  }

  @Post('profile-setup')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete User Profile Setup After OTP Verification' })
  @ApiResponse({ status: 200, description: 'Profile setup completed' })
  async completeProfile(@CurrentUser() user: any, @Body() body: CompleteProfileDto) {
    return this.authService.completeProfile(user.id || user.sub, body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ points: 5, duration: 60, byAccount: true, keyPrefix: 'auth_login' })
  @ApiOperation({ summary: 'User Login & JWT Authentication' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.passwordHash);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  @RateLimit({ points: 5, duration: 3600, byAccount: true, keyPrefix: 'auth_register' })
  @ApiOperation({ summary: 'User Account Registration' })
  @ApiResponse({ status: 201, description: 'User account created' })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Current Authenticated User Profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id || user.sub);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User Logout' })
  async logout() {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}

