import { IsString, IsEnum, IsObject, IsNumber, IsOptional, IsNotEmpty, Min } from 'class-validator';

export enum CartItemTypeEnum {
  PACKAGE = 'PACKAGE',
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  BUS = 'BUS',
  TRAIN = 'TRAIN',
  ACTIVITY = 'ACTIVITY',
}

export class AddCartItemDto {
  @IsEnum(CartItemTypeEnum)
  itemType!: CartItemTypeEnum;

  @IsString()
  @IsNotEmpty()
  referenceId!: string;

  @IsString()
  @IsNotEmpty()
  provider!: string;

  @IsString()
  @IsNotEmpty()
  productName!: string;

  @IsObject()
  metadata!: Record<string, any>;

  @IsNumber()
  @Min(0, { message: 'priceSnapshot must be a non-negative number' })
  priceSnapshot!: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class UpdateCartItemDto {
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'priceSnapshot must be a non-negative number' })
  priceSnapshot?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  status?: string;
}

export class RevalidateCartDto {
  @IsOptional()
  @IsString()
  cartId?: string;
}
