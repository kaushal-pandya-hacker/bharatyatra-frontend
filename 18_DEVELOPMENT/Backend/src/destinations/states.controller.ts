import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StatesService } from './states.service';

@ApiTags('States & Geographic Regions')
@Controller('states')
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Get()
  @ApiOperation({ summary: 'List All 28 Indian States & 8 Union Territories' })
  @ApiQuery({ name: 'type', required: false, description: 'STATE or UNION_TERRITORY' })
  @ApiQuery({ name: 'search', required: false, description: 'Fuzzy search by name or capital' })
  async getStates(
    @Query('type') type?: string,
    @Query('search') search?: string
  ) {
    return this.statesService.findAllStates({ type, search });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get Detailed State Profile by Slug' })
  async getStateBySlug(@Param('slug') slug: string) {
    return this.statesService.findStateBySlug(slug);
  }

  @Get(':slug/districts')
  @ApiOperation({ summary: 'Get Districts for a State' })
  async getStateDistricts(@Param('slug') slug: string) {
    return this.statesService.findStateDistricts(slug);
  }

  @Get(':slug/cities')
  @ApiOperation({ summary: 'Get Cities & Towns for a State' })
  async getStateCities(@Param('slug') slug: string) {
    return this.statesService.findStateCities(slug);
  }

  @Get(':slug/destinations')
  @ApiOperation({ summary: 'Get Tourism Destinations in a State' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'isFeatured', required: false })
  async getStateDestinations(
    @Param('slug') slug: string,
    @Query('category') category?: string,
    @Query('isFeatured') isFeatured?: boolean
  ) {
    return this.statesService.findStateDestinations(slug, { category, isFeatured });
  }
}
