import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PackagesService, PackageFilterQuery, CalculatePriceDto, PackageBookingDto } from './packages.service';
import { PackageOrchestratorService, CalculatePackageLivePriceDto, OrchestratePackageBookingDto } from './package-orchestrator.service';
import { QuoteEngineService, CreateQuoteInput } from './quote-engine.service';

@ApiTags('Travel Packages')
@Controller('packages')
export class PackagesController {
  constructor(
    private readonly packagesService: PackagesService,
    private readonly orchestratorService: PackageOrchestratorService,
    private readonly quoteEngineService: QuoteEngineService,
  ) {}

  @Post('quote')
  @ApiOperation({ summary: 'Create Immutable Live Package Quote' })
  async createQuote(@Body() dto: CreateQuoteInput) {
    return this.quoteEngineService.createQuote(dto);
  }

  @Get('quote/:quoteReference')
  @ApiOperation({ summary: 'Validate & View Immutable Quote Breakdown' })
  async getQuote(@Param('quoteReference') quoteReference: string) {
    return this.quoteEngineService.validateQuote(quoteReference);
  }

  @Post('initiate-booking')
  @ApiOperation({ summary: 'Initiate Package Booking (PAYMENT_PENDING state - No pre-payment supplier locks)' })
  async initiateBooking(@Body() dto: any) {
    return this.orchestratorService.initiateBooking(dto);
  }

  @Post('fulfill-booking')
  @ApiOperation({ summary: 'Fulfill Supplier Services Post-Verified Payment' })
  async fulfillBooking(@Body() dto: any) {
    return this.orchestratorService.fulfillBookingAfterVerifiedPayment(dto);
  }


  @Get()
  @ApiOperation({ summary: 'Get & Search Travel Packages with Dynamic Filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'destination', required: false })
  @ApiQuery({ name: 'domesticOrInternational', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'theme', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'minDays', required: false })
  @ApiQuery({ name: 'maxDays', required: false })
  async getPackages(@Query() query: PackageFilterQuery) {
    return this.packagesService.findAll(query);
  }

  @Get('wishlist/:userId')
  @ApiOperation({ summary: 'Get User Wishlisted Packages' })
  async getWishlist(@Param('userId') userId: string) {
    return this.packagesService.getWishlist(userId);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get Full Package Details & Itinerary by Slug' })
  async getPackageBySlug(@Param('slug') slug: string) {
    return this.packagesService.findBySlug(slug);
  }

  @Post('calculate-price')
  @ApiOperation({ summary: 'Dynamic Binding Price Calculation Service (Zero-Trust)' })
  async calculatePrice(@Body() dto: CalculatePriceDto) {
    return this.packagesService.calculatePrice(dto);
  }

  @Post('calculate-live-price')
  @ApiOperation({ summary: 'Supplier-Connected Live Package Pricing Engine' })
  async calculateLivePrice(@Body() dto: CalculatePackageLivePriceDto) {
    return this.orchestratorService.calculatePackageLivePrice(dto);
  }

  @Post('orchestrate-booking')
  @ApiOperation({ summary: 'Multi-Supplier Package Booking Orchestration Transaction' })
  async orchestrateBooking(@Body() dto: OrchestratePackageBookingDto) {
    return this.orchestratorService.orchestratePackageBooking(dto);
  }

  @Post('customize')
  @ApiOperation({ summary: 'Save Custom Package Options' })
  async customizePackage(@Body() dto: any) {
    return this.packagesService.customizePackage(dto);
  }

  @Post('booking')
  @ApiOperation({ summary: 'Submit Travel Package Booking Request' })
  async createBooking(@Body() dto: PackageBookingDto) {
    return this.packagesService.createBooking(dto);
  }

  @Post('wishlist')
  @ApiOperation({ summary: 'Toggle Package Wishlist' })
  async toggleWishlist(@Body() dto: { userId: string; packageId: string }) {
    return this.packagesService.toggleWishlist(dto.userId, dto.packageId);
  }

  // Admin Endpoints
  @Post('admin')
  @ApiOperation({ summary: 'Create New Travel Package (Admin)' })
  async createPackageAdmin(@Body() data: any) {
    return this.packagesService.createPackage(data);
  }

  @Put('admin/:id')
  @ApiOperation({ summary: 'Update Travel Package (Admin)' })
  async updatePackageAdmin(@Param('id') id: string, @Body() data: any) {
    return this.packagesService.updatePackage(id, data);
  }

  @Delete('admin/:id')
  @ApiOperation({ summary: 'Delete Travel Package (Admin)' })
  async deletePackageAdmin(@Param('id') id: string) {
    return this.packagesService.deletePackage(id);
  }
}
