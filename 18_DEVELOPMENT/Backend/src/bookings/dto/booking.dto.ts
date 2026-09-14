import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';

export enum InventoryTypeEnum {
  HOTEL = 'HOTEL',
  RESTAURANT = 'RESTAURANT',
  ACTIVITY = 'ACTIVITY',
}

export class CreateBookingDto {
  @IsEnum(InventoryTypeEnum)
  inventoryType: 'HOTEL' | 'RESTAURANT' | 'ACTIVITY';

  @IsString()
  inventoryId: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  reservationTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  adultCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  childCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  guestCount?: number;

  @IsOptional()
  @IsString()
  customerNotes?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsOptional()
  @IsString()
  tripId?: string;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  totalAmountInr?: number;
}

export class CancelBookingDto {
  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class RejectBookingDto {
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class AddSupplierNoteDto {
  @IsString()
  note: string;
}

