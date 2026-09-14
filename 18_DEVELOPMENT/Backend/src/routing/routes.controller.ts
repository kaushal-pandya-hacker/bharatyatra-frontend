import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GeoService } from './geo.service';
import { RoutingService } from './routing.service';
import { DistanceQueryDto, OptimizeRouteDto, RouteMatrixDto } from './dto/routes.dto';

@Controller('routes')
export class RoutesController {
  constructor(
    private readonly geoService: GeoService,
    private readonly routingService: RoutingService,
  ) {}

  @Get('distance')
  async getDistance(
    @Query('originLat') originLat: string,
    @Query('originLng') originLng: string,
    @Query('destLat') destLat: string,
    @Query('destLng') destLng: string,
    @Query('mode') mode: string = 'driving',
    @Query('includeGeometry') includeGeometry?: string,
  ) {
    const oLat = parseFloat(originLat);
    const oLng = parseFloat(originLng);
    const dLat = parseFloat(destLat);
    const dLng = parseFloat(destLng);

    if (isNaN(oLat) || isNaN(oLng) || isNaN(dLat) || isNaN(dLng)) {
      throw new BadRequestException('Valid originLat, originLng, destLat, and destLng query parameters are required.');
    }

    this.geoService.validateCoordinates(oLat, oLng);
    this.geoService.validateCoordinates(dLat, dLng);

    const withGeometry = includeGeometry === 'true' || includeGeometry === '1';

    const result = await this.routingService.getDistanceAndEstimate(
      { latitude: oLat, longitude: oLng },
      { latitude: dLat, longitude: dLng },
      mode,
      withGeometry,
    );

    const haversineKm = this.geoService.haversineDistanceKm(oLat, oLng, dLat, dLng);

    return {
      origin: { latitude: oLat, longitude: oLng },
      destination: { latitude: dLat, longitude: dLng },
      straightLineDistanceKm: haversineKm,
      approxRoadDistanceKm: result.distanceKm,
      distanceKm: result.distanceKm,
      estimatedDurationMinutes: result.estimatedDurationMinutes,
      estimated: result.estimated,
      provider: result.provider,
      geometry: result.geometry,
      legs: result.legs,
      warnings: result.warnings,
      unit: 'km',
      disclaimer: result.disclaimer,
    };
  }

  @Get('estimate')
  async getEstimate(
    @Query('originLat') originLat: string,
    @Query('originLng') originLng: string,
    @Query('destLat') destLat: string,
    @Query('destLng') destLng: string,
    @Query('mode') mode: string = 'driving',
    @Query('includeGeometry') includeGeometry?: string,
  ) {
    const oLat = parseFloat(originLat);
    const oLng = parseFloat(originLng);
    const dLat = parseFloat(destLat);
    const dLng = parseFloat(destLng);

    if (isNaN(oLat) || isNaN(oLng) || isNaN(dLat) || isNaN(dLng)) {
      throw new BadRequestException('Valid originLat, originLng, destLat, and destLng query parameters are required.');
    }

    const withGeometry = includeGeometry === 'true' || includeGeometry === '1';

    return await this.routingService.getDistanceAndEstimate(
      { latitude: oLat, longitude: oLng },
      { latitude: dLat, longitude: dLng },
      mode,
      withGeometry,
    );
  }

  @Post('optimize')
  @HttpCode(HttpStatus.OK)
  async optimizeRoute(@Body() dto: OptimizeRouteDto) {
    if (!dto || !dto.origin || !dto.stops) {
      throw new BadRequestException('Request body must contain origin and stops.');
    }

    const includeGeometry = dto.includeGeometry !== undefined ? dto.includeGeometry : true;

    return await this.routingService.optimizeRoute(
      dto.origin,
      dto.stops,
      dto.destination,
      dto.mode || 'driving',
      dto.optimizationMode || 'fixed_start',
      includeGeometry,
    );
  }

  @Post('matrix')
  @HttpCode(HttpStatus.OK)
  async getRouteMatrix(@Body() dto: RouteMatrixDto) {
    if (!dto || !dto.origins || dto.origins.length === 0) {
      throw new BadRequestException('Request body must contain at least one origin in origins array.');
    }

    return await this.routingService.getRouteMatrix(dto.origins, dto.destinations, dto.mode || 'driving');
  }
}
