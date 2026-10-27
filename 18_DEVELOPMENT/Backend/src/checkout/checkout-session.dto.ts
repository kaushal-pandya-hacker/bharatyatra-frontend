import { IsString, IsNotEmpty, IsObject, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TravelerInfoDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  nationality?: string;
}

export class ContactInfoDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;
}

export class CreateCheckoutSessionDto {
  @IsString()
  @IsNotEmpty()
  cartId!: string;
}

export class ConfirmCheckoutDto {
  @IsObject()
  contactInfo!: ContactInfoDto;

  @IsArray()
  @IsOptional()
  travelers?: TravelerInfoDto[];

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
