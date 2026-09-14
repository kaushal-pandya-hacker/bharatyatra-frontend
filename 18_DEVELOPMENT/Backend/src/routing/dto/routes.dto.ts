import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
  ArrayMinSize,
  ArrayMaxSize,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GeoPointDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class DistanceQueryDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  originLat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  originLng: number;

  @IsNumber()
  @Min(-90)
  @Max(90)
  destLat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  destLng: number;

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeGeometry?: boolean;
}

export class RouteStopDto extends GeoPointDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  durationMinutes?: number;
}

export class OptimizeRouteDto {
  @ValidateNested()
  @Type(() => GeoPointDto)
  origin: GeoPointDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointDto)
  destination?: GeoPointDto;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  stops: RouteStopDto[];

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsString()
  @IsIn(['optimize_all', 'fixed_start', 'fixed_end', 'fixed_start_and_end'])
  optimizationMode?: 'optimize_all' | 'fixed_start' | 'fixed_end' | 'fixed_start_and_end';

  @IsOptional()
  @IsBoolean()
  includeGeometry?: boolean;
}

export class RouteMatrixDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(25)
  @ValidateNested({ each: true })
  @Type(() => GeoPointDto)
  origins: GeoPointDto[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(25)
  @ValidateNested({ each: true })
  @Type(() => GeoPointDto)
  destinations?: GeoPointDto[];

  @IsOptional()
  @IsString()
  mode?: string;
}
