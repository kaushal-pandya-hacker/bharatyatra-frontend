import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { AdminService } from './admin.service';
import { AdminAuditService } from './admin-audit.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { AdminRoles } from './decorators/admin-roles.decorator';

@ApiTags('BharatYatra Secure Admin Governance Portal')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly adminService: AdminService,
    private readonly auditService: AdminAuditService,
  ) {}

  // ==========================================
  // 1. ADMIN AUTHENTICATION ENDPOINTS
  // ==========================================

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin Portal Login Authentication' })
  async adminLogin(
    @Req() req: any,
    @Body() body: { username: string; password: string },
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.adminAuthService.login({
      username: body.username,
      password: body.password,
      ipAddress,
      userAgent,
    });
  }

  @Post('auth/logout')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidate Admin Operational Session' })
  async adminLogout(@Req() req: any) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];
    return this.adminAuthService.logout(req.adminToken, req.admin?.id, ipAddress, userAgent);
  }

  @Get('auth/me')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Current Authenticated Admin Identity Profile' })
  async getMe(@Req() req: any) {
    return { success: true, admin: req.admin };
  }

  @Post('auth/change-password')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change Admin Account Password Securely' })
  async changePassword(
    @Req() req: any,
    @Body() body: { currentPassword?: string; newPassword?: string },
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];

    return this.adminAuthService.changePassword(req.admin.id, body, ipAddress, userAgent);
  }

  // ==========================================
  // 2. DASHBOARD METRICS
  // ==========================================

  @Get('dashboard')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Operational Dashboard Metrics & Telemetry' })
  async getDashboardMetrics(@Req() req: any) {
    return this.adminService.getDashboardMetrics(req.admin.id);
  }

  // ==========================================
  // 3. USERS MANAGEMENT
  // ==========================================

  @Get('users')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Paginated & Filterable Customer Users List' })
  async getUsers(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return this.adminService.getUsers({ page: pageNum, limit: limitNum, search, status }, req.admin.id);
  }

  @Get('users/:id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Comprehensive User Inspection Details' })
  async getUserDetail(@Req() req: any, @Param('id') userId: string) {
    return this.adminService.getUserDetail(userId, req.admin.id);
  }

  @Patch('users/:id/status')
  @UseGuards(AdminAuthGuard, AdminRoleGuard)
  @AdminRoles('SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate / Reactivate User Account (Super Admin Only)' })
  async updateUserStatus(
    @Req() req: any,
    @Param('id') targetUserId: string,
    @Body() body: { status: 'ACTIVE' | 'SUSPENDED' | 'DELETED' },
  ) {
    return this.adminService.updateUserStatus(targetUserId, body.status, req.admin.id);
  }

  // ==========================================
  // 4. TRIPS MANAGEMENT
  // ==========================================

  @Get('trips')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Paginated & Filterable Customer Trips Directory' })
  async getTrips(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return this.adminService.getTrips({ page: pageNum, limit: limitNum, search, status }, req.admin.id);
  }

  @Get('trips/:id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Detailed Trip Itinerary & Route Telemetry' })
  async getTripDetail(@Req() req: any, @Param('id') tripId: string) {
    return this.adminService.getTripDetail(tripId, req.admin.id);
  }

  // ==========================================
  // 5. BOOKINGS MANAGEMENT
  // ==========================================

  @Get('bookings')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Paginated & Filterable Bookings Directory' })
  async getBookings(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return this.adminService.getBookings({ page: pageNum, limit: limitNum, search, type, status }, req.admin.id);
  }

  // ==========================================
  // 6. NOTIFICATIONS & BROADCAST MANAGEMENT
  // ==========================================

  @Get('notifications')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get System Notification Audit History' })
  async getNotificationsHistory(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return this.adminService.getNotificationHistory({ page: pageNum, limit: limitNum }, req.admin.id);
  }

  @Post('notifications/broadcast')
  @UseGuards(AdminAuthGuard, AdminRoleGuard)
  @AdminRoles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dispatch Audited System Push Notification Broadcast' })
  async sendBroadcast(
    @Req() req: any,
    @Body() body: { targetUserId?: string; title: string; body: string; url?: string; category?: any },
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];
    return this.adminService.sendSystemBroadcast(req.admin.id, body, ipAddress, userAgent);
  }

  // ==========================================
  // 7. AUDIT LOGS
  // ==========================================

  @Get('audit-logs')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Operational Admin Audit Trail Log' })
  async getAuditLogs(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('action') action?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return this.auditService.getAuditLogs(pageNum, limitNum, search, action);
  }
}
