import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { BookingsService } from '../bookings/bookings.service';
import { RegisterSupplierDto, LoginSupplierDto, UpdateSupplierProfileDto } from './dto/supplier.dto';
import { CreateSupplierHotelDto, UpdateSupplierHotelDto, CreateSupplierRestaurantDto, UpdateSupplierRestaurantDto, CreateSupplierActivityDto, UpdateSupplierActivityDto } from './dto/supplier-inventory.dto';
import { RejectBookingDto, AddSupplierNoteDto } from '../bookings/dto/booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Suppliers & Vendor Portal')
@Controller(['supplier', 'suppliers'])
export class SuppliersController {
  constructor(
    private readonly suppliersService: SuppliersService,
    private readonly bookingsService: BookingsService,
  ) {}

  private extractSupplierId(user: any, headers: any): string {
    if (user?.id) {
      return user.id;
    }
    return headers['x-supplier-id'] || 'supp_001';
  }

  @Post('register')
  @ApiOperation({ summary: 'Register New B2B Travel Supplier Account' })
  async register(@Body() body: RegisterSupplierDto) {
    return this.suppliersService.registerSupplier(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Supplier Portal Authentication Login' })
  async login(@Body() body: LoginSupplierDto) {
    return this.suppliersService.loginSupplier(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Current Authenticated Supplier Profile' })
  async getProfile(@CurrentUser() user: any) {
    const data = await this.suppliersService.getSupplierProfile(user.id);
    return { success: true, data };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Supplier Business Profile' })
  async updateProfile(@CurrentUser() user: any, @Body() body: UpdateSupplierProfileDto) {
    const data = await this.suppliersService.updateSupplierProfile(user.id, body);
    return { success: true, data };
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Supplier Operational & Financial Dashboard (Tenant Isolated)' })
  async getDashboard(@CurrentUser() user: any, @Headers() headers: any) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.getSupplierDashboard(supplierId);
    return { success: true, data };
  }

  @Get('inventory')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Supplier Inventory Listings (Strict Tenant Isolation)' })
  async getInventory(@CurrentUser() user: any, @Headers() headers: any) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.getSupplierInventory(supplierId);
    return { success: true, data };
  }

  @Post('inventory')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add New Inventory Listing (Rooms, Bus Seats, Activity Slots)' })
  async addInventory(@CurrentUser() user: any, @Headers() headers: any, @Body() body: any) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.addInventoryItem(supplierId, body);
    return { success: true, data };
  }

  @Patch('inventory/:inventoryId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Inventory Price or Availability' })
  async updateInventoryPrice(
    @CurrentUser() user: any,
    @Headers() headers: any,
    @Param('inventoryId') inventoryId: string,
    @Body() body: { basePriceInr: number }
  ) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.updateInventoryPrice(supplierId, inventoryId, body.basePriceInr);
    return { success: true, data };
  }

  @Get('bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Supplier Bookings List with Pagination & Filters' })
  async getBookings(@CurrentUser() user: any, @Headers() headers: any, @Query() query: any) {
    const supplierId = this.extractSupplierId(user, headers);
    return this.bookingsService.getSupplierBookings(supplierId, query);
  }

  @Get('bookings/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Supplier Booking Details by ID (Tenant Isolated)' })
  async getBookingById(@CurrentUser() user: any, @Headers() headers: any, @Param('id') id: string) {
    const supplierId = this.extractSupplierId(user, headers);
    return this.bookingsService.getSupplierBookingById(supplierId, id);
  }

  @Post('bookings/:id/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supplier Accept Booking (PENDING -> CONFIRMED)' })
  async acceptBooking(@CurrentUser() user: any, @Headers() headers: any, @Param('id') id: string) {
    const supplierId = this.extractSupplierId(user, headers);
    return this.bookingsService.acceptSupplierBooking(supplierId, id, user);
  }

  @Post('bookings/:id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supplier Reject Booking (PENDING -> REJECTED)' })
  async rejectBooking(
    @CurrentUser() user: any,
    @Headers() headers: any,
    @Param('id') id: string,
    @Body() body: RejectBookingDto,
  ) {
    const supplierId = this.extractSupplierId(user, headers);
    return this.bookingsService.rejectSupplierBooking(supplierId, id, body, user);
  }

  @Post('bookings/:id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supplier Start Booking Fulfillment (CONFIRMED -> IN_PROGRESS)' })
  async startBooking(@CurrentUser() user: any, @Headers() headers: any, @Param('id') id: string) {
    const supplierId = this.extractSupplierId(user, headers);
    return this.bookingsService.startSupplierBooking(supplierId, id, user);
  }

  @Post('bookings/:id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supplier Complete Booking (CONFIRMED/IN_PROGRESS -> COMPLETED)' })
  async completeBooking(@CurrentUser() user: any, @Headers() headers: any, @Param('id') id: string) {
    const supplierId = this.extractSupplierId(user, headers);
    return this.bookingsService.completeSupplierBooking(supplierId, id, user);
  }

  @Post('bookings/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supplier Cancel Booking (CONFIRMED/PENDING -> CANCELLED)' })
  async cancelBooking(
    @CurrentUser() user: any,
    @Headers() headers: any,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    const supplierId = this.extractSupplierId(user, headers);
    return this.bookingsService.cancelSupplierBooking(supplierId, id, body, user);
  }

  @Post('bookings/:id/notes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add Supplier Operational Note' })
  async addNote(
    @CurrentUser() user: any,
    @Headers() headers: any,
    @Param('id') id: string,
    @Body() body: AddSupplierNoteDto,
  ) {
    const supplierId = this.extractSupplierId(user, headers);
    return this.bookingsService.addSupplierBookingNote(supplierId, id, body.note, user);
  }

  @Get('settlements')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Supplier Settlement Statements' })
  async getSettlements(@CurrentUser() user: any, @Headers() headers: any) {
    const supplierId = this.extractSupplierId(user, headers);
    return {
      success: true,
      data: [
        {
          settlementId: 'stl_8801',
          supplierId,
          period: '2026-09-CYCLE-1',
          grossAmountInr: 65000.0,
          commissionInr: 7800.0,
          taxInr: 1404.0,
          netPayoutInr: 55796.0,
          status: 'PAID',
        },
      ],
    };
  }

  // ==========================================
  // 1. HOTEL MANAGEMENT ENDPOINTS
  // ==========================================

  @Get('hotels')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Supplier-Owned Hotels List' })
  async getSupplierHotels(@CurrentUser() user: any, @Headers() headers: any) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.getSupplierHotels(supplierId);
    return { success: true, data };
  }

  @Post('hotels')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create New Supplier Hotel' })
  async createSupplierHotel(@CurrentUser() user: any, @Headers() headers: any, @Body() body: CreateSupplierHotelDto) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.createSupplierHotel(supplierId, body);
    return { success: true, data };
  }

  @Get('hotels/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Supplier Hotel Details by ID' })
  async getSupplierHotelById(@CurrentUser() user: any, @Headers() headers: any, @Param('id') id: string) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.getSupplierHotelById(supplierId, id);
    return { success: true, data };
  }

  @Patch('hotels/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Supplier Hotel Record' })
  async updateSupplierHotel(
    @CurrentUser() user: any,
    @Headers() headers: any,
    @Param('id') id: string,
    @Body() body: UpdateSupplierHotelDto
  ) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.updateSupplierHotel(supplierId, id, body);
    return { success: true, data };
  }

  @Delete('hotels/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate / Soft-Delete Supplier Hotel' })
  async deleteSupplierHotel(@CurrentUser() user: any, @Headers() headers: any, @Param('id') id: string) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.deleteSupplierHotel(supplierId, id);
    return { success: true, data };
  }

  // ==========================================
  // 2. RESTAURANT MANAGEMENT ENDPOINTS
  // ==========================================

  @Get('restaurants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Supplier-Owned Restaurants List' })
  async getSupplierRestaurants(@CurrentUser() user: any, @Headers() headers: any) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.getSupplierRestaurants(supplierId);
    return { success: true, data };
  }

  @Post('restaurants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create New Supplier Restaurant' })
  async createSupplierRestaurant(@CurrentUser() user: any, @Headers() headers: any, @Body() body: CreateSupplierRestaurantDto) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.createSupplierRestaurant(supplierId, body);
    return { success: true, data };
  }

  @Get('restaurants/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Supplier Restaurant Details by ID' })
  async getSupplierRestaurantById(@CurrentUser() user: any, @Headers() headers: any, @Param('id') id: string) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.getSupplierRestaurantById(supplierId, id);
    return { success: true, data };
  }

  @Patch('restaurants/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Supplier Restaurant Record' })
  async updateSupplierRestaurant(
    @CurrentUser() user: any,
    @Headers() headers: any,
    @Param('id') id: string,
    @Body() body: UpdateSupplierRestaurantDto
  ) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.updateSupplierRestaurant(supplierId, id, body);
    return { success: true, data };
  }

  @Delete('restaurants/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate / Soft-Delete Supplier Restaurant' })
  async deleteSupplierRestaurant(@CurrentUser() user: any, @Headers() headers: any, @Param('id') id: string) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.deleteSupplierRestaurant(supplierId, id);
    return { success: true, data };
  }

  // ==========================================
  // 3. ACTIVITY MANAGEMENT ENDPOINTS
  // ==========================================

  @Get('activities')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Supplier-Owned Activities List' })
  async getSupplierActivities(@CurrentUser() user: any, @Headers() headers: any) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.getSupplierActivities(supplierId);
    return { success: true, data };
  }

  @Post('activities')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create New Supplier Activity' })
  async createSupplierActivity(@CurrentUser() user: any, @Headers() headers: any, @Body() body: CreateSupplierActivityDto) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.createSupplierActivity(supplierId, body);
    return { success: true, data };
  }

  @Get('activities/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Supplier Activity Details by ID' })
  async getSupplierActivityById(@CurrentUser() user: any, @Headers() headers: any, @Param('id') id: string) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.getSupplierActivityById(supplierId, id);
    return { success: true, data };
  }

  @Patch('activities/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Supplier Activity Record' })
  async updateSupplierActivity(
    @CurrentUser() user: any,
    @Headers() headers: any,
    @Param('id') id: string,
    @Body() body: UpdateSupplierActivityDto
  ) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.updateSupplierActivity(supplierId, id, body);
    return { success: true, data };
  }

  @Delete('activities/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate / Soft-Delete Supplier Activity' })
  async deleteSupplierActivity(@CurrentUser() user: any, @Headers() headers: any, @Param('id') id: string) {
    const supplierId = this.extractSupplierId(user, headers);
    const data = await this.suppliersService.deleteSupplierActivity(supplierId, id);
    return { success: true, data };
  }
}



