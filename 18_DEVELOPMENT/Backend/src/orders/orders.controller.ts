import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('api/v1')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('orders/mine')
  @UseGuards(JwtAuthGuard)
  async getMyOrders(@Req() req: any) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Authentication required to view orders');
    }
    return this.ordersService.getUserOrders(userId);
  }

  @Get('orders/:id')
  @UseGuards(OptionalJwtAuthGuard)
  async getOrder(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id || req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN' || !!req.admin;
    return this.ordersService.getOrderById(id, userId, isAdmin);
  }

  @Post('orders/:id/cancel-item')
  @UseGuards(JwtAuthGuard)
  async cancelItem(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { orderItemId: string; reason?: string },
  ) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Authentication required to cancel an order item');
    }
    if (!body.orderItemId) {
      throw new BadRequestException('orderItemId is required');
    }
    return this.ordersService.cancelOrderItem(id, body.orderItemId, userId, body.reason);
  }

  @Get('admin/orders')
  async getAdminOrders(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const adminKey = req.headers['x-admin-key'] || req.headers['x-admin-token'];
    const isAdmin =
      req.user?.role === 'ADMIN' ||
      !!req.admin ||
      (adminKey && process.env.ADMIN_SECRET_KEY && adminKey === process.env.ADMIN_SECRET_KEY);

    if (!isAdmin) {
      throw new ForbiddenException('Admin authorization required to access order directory.');
    }

    return this.ordersService.getAdminOrders({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
    });
  }
}
