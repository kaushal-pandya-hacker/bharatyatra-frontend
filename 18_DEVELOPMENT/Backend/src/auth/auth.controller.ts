import { Controller, Post, Get, Body, HttpCode, HttpStatus, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';

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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
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
    return {
      success: true,
      data: user,
    };
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
