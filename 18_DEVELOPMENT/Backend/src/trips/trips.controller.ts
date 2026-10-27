import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { GroupExpensesService } from './group-expenses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Trips')
@Controller('trips')
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
    private readonly groupExpensesService: GroupExpensesService,
  ) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate AI Trip and Persist to PostgreSQL' })
  @ApiResponse({ status: 201, description: 'Trip generated and persisted' })
  async generateTrip(@CurrentUser() user: any, @Body() body: any) {
    return this.tripsService.generateAndSaveTrip(user.id, body);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create New Trip Record' })
  async createTrip(@CurrentUser() user: any, @Body() body: any) {
    return this.tripsService.generateAndSaveTrip(user.id, body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get User Trips from PostgreSQL' })
  async getUserTrips(@CurrentUser() user: any) {
    return this.tripsService.getUserTrips(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Detailed Trip Record by ID' })
  async getTripById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tripsService.getTripById(user.id, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Trip Preferences or Dates' })
  async updateTrip(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.tripsService.updateTrip(user.id, id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive or Delete Trip' })
  async deleteTrip(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tripsService.deleteTrip(user.id, id);
  }

  @Post(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save Trip' })
  async saveTrip(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tripsService.saveTrip(user.id, id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel Trip' })
  async cancelTrip(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tripsService.cancelTrip(user.id, id);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete Trip' })
  async completeTrip(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tripsService.completeTrip(user.id, id);
  }

  // ==========================================
  // GROUP TRIP & EXPENSE ENDPOINTS
  // ==========================================

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite or Add Member to Group Trip' })
  async addTripMember(@Param('id') id: string, @Body() body: { name: string; email?: string; userId?: string }) {
    return this.groupExpensesService.addTripMember(id, body);
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List Group Trip Members' })
  async getTripMembers(@Param('id') id: string) {
    return this.groupExpensesService.getTripMembers(id);
  }

  @Post(':id/expenses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add Expense to Group Trip with Split Rules' })
  async addTripExpense(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const payerId = body.payerId || user.id;
    return this.groupExpensesService.addExpense(id, { ...body, payerId });
  }

  @Get(':id/expenses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List Group Trip Expenses' })
  async getTripExpenses(@Param('id') id: string) {
    return this.groupExpensesService.getTripExpenses(id);
  }

  @Get(':id/settlement-summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculate Group Balances and Optimal Settlement Suggestions' })
  async getSettlementSummary(@Param('id') id: string) {
    return this.groupExpensesService.getSettlementSummary(id);
  }

  @Delete(':id/expenses/:expenseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Expense from Group Trip' })
  async deleteExpense(@Param('id') id: string, @Param('expenseId') expenseId: string) {
    return this.groupExpensesService.deleteExpense(id, expenseId);
  }

  @Patch(':id/settlements/:settlementId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Settlement Payment Status' })
  async updateSettlementStatus(
    @Param('id') id: string,
    @Param('settlementId') settlementId: string,
    @Body() body: { status: 'PENDING' | 'SETTLED'; paymentRef?: string }
  ) {
    return this.groupExpensesService.updateSettlementStatus(id, settlementId, body);
  }
}
