import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { BookingsService } from '../bookings/bookings.service';
import { AdminLoginDto, UpdateSupplierStatusDto, UpdateSupplierVerificationDto, ReviewInventoryDto, UpdateInventoryStatusDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Admin Marketplace Governance & Operations')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly bookingsService: BookingsService,
  ) {}

  // ==========================================
  // 1. ADMIN AUTHENTICATION (PUBLIC)
  // ==========================================

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin Operational Portal Authentication Login' })
  async adminLogin(@Body() body: AdminLoginDto) {
    const data = await this.adminService.adminLogin(body);
    return { success: true, data };
  }

  // ==========================================
  // 2. PROTECTED ADMIN ENDPOINTS (@Roles('ADMIN'))
  // ==========================================

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Live Operational Dashboard Metrics from Database' })
  async getDashboardMetrics() {
    const data = await this.adminService.getDashboardMetrics();
    return { success: true, data };
  }

  @Get('suppliers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List Suppliers with Verification & Status Filters' })
  async getSuppliers(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('verificationStatus') verificationStatus?: string,
  ) {
    const data = await this.adminService.getSuppliers({ search, status, verificationStatus });
    return { success: true, data };
  }

  @Get('suppliers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Supplier Business Profile, Owned Inventory & Audit History' })
  async getSupplierById(@Param('id') id: string) {
    const data = await this.adminService.getSupplierById(id);
    return { success: true, data };
  }

  @Patch('suppliers/:id/verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify, Reject, or Suspend Supplier Verification Status' })
  async updateSupplierVerification(
    @Param('id') id: string,
    @Body() body: UpdateSupplierVerificationDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.adminService.updateSupplierVerification(id, body, user);
    return { success: true, data };
  }

  @Patch('suppliers/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Supplier Account Status (ACTIVE, SUSPENDED, INACTIVE)' })
  async updateSupplierStatus(
    @Param('id') id: string,
    @Body() body: UpdateSupplierStatusDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.adminService.updateSupplierStatus(id, body, user);
    return { success: true, data };
  }

  @Get('inventory')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List Inventory Listings Across Hotels, Restaurants & Activities' })
  async getInventory(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    const data = await this.adminService.getInventory({ type, status, search, supplierId });
    return { success: true, data };
  }

  @Get('inventory/:type/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Detailed Information for a Specific Inventory Listing' })
  async getInventoryItem(
    @Param('type') type: string,
    @Param('id') id: string,
  ) {
    const data = await this.adminService.getInventoryItem(type, id);
    return { success: true, data };
  }

  @Patch('inventory/:type/:id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or Reject Inventory Listing with Reason' })
  async reviewInventoryItem(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() body: ReviewInventoryDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.adminService.reviewInventoryItem(type, id, body, user);
    return { success: true, data };
  }

  @Patch('inventory/:type/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate or Deactivate Inventory Listing' })
  async updateInventoryStatus(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() body: UpdateInventoryStatusDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.adminService.updateInventoryStatus(type, id, body, user);
    return { success: true, data };
  }

  @Get('bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Operational Bookings Directory with Filters & Pagination' })
  async getAdminBookings(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('supplierId') supplierId?: string,
    @Query('inventoryType') inventoryType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.bookingsService.getAdminBookings({ status, search, supplierId, inventoryType, page, limit });
  }

  @Get('bookings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Admin Booking Details with Audit Logs' })
  async getAdminBookingById(@Param('id') id: string) {
    return this.bookingsService.getAdminBookingById(id);
  }

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Operational Audit Trail Stream' })
  async getAuditLogs(
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('adminId') adminId?: string,
  ) {
    const data = await this.adminService.getAuditLogs({ action, entityType, adminId });
    return { success: true, data };
  }
}
