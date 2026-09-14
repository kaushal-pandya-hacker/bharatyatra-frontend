import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { SupplierStatus, VerificationStatus } from '@prisma/client';

export class AdminLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class UpdateSupplierStatusDto {
  @IsEnum(SupplierStatus)
  status: SupplierStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateSupplierVerificationDto {
  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus?: VerificationStatus;

  @IsOptional()
  @IsEnum(VerificationStatus)
  status?: VerificationStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ReviewInventoryDto {
  @IsEnum(['APPROVE', 'REJECT', 'APPROVED', 'REJECTED'])
  action: 'APPROVE' | 'REJECT' | 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateInventoryStatusDto {
  @IsEnum(['ACTIVE', 'INACTIVE', 'DRAFT'])
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';

  @IsOptional()
  @IsString()
  reason?: string;
}
