import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCancellationQuoteDto {
  @IsString()
  @IsNotEmpty()
  orderItemId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ConfirmCancellationDto {
  @IsString()
  @IsNotEmpty()
  cancellationRequestId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
