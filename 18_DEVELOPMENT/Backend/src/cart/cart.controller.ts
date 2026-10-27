import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto, RevalidateCartDto } from './cart.dto';

@Controller('api/v1/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private extractUserOrSession(req: any, headers: any): { userId?: string; sessionId?: string } {
    const userId = req.user?.id || req.user?.userId;
    const sessionId = headers['x-session-id'] || headers['x-cart-session-id'] || 'guest-session';
    return { userId, sessionId };
  }

  @Get()
  async getCart(@Req() req: any, @Headers() headers: any) {
    const userOrSession = this.extractUserOrSession(req, headers);
    return this.cartService.getOrCreateCart(userOrSession);
  }

  @Post('items')
  async addItem(
    @Req() req: any,
    @Headers() headers: any,
    @Body() dto: AddCartItemDto,
  ) {
    const userOrSession = this.extractUserOrSession(req, headers);
    return this.cartService.addItem(userOrSession, dto);
  }

  @Patch('items/:id')
  async updateItem(
    @Req() req: any,
    @Headers() headers: any,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const userOrSession = this.extractUserOrSession(req, headers);
    return this.cartService.updateItem(userOrSession, id, dto);
  }

  @Delete('items/:id')
  async removeItem(
    @Req() req: any,
    @Headers() headers: any,
    @Param('id') id: string,
  ) {
    const userOrSession = this.extractUserOrSession(req, headers);
    return this.cartService.removeItem(userOrSession, id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@Req() req: any, @Headers() headers: any) {
    const userOrSession = this.extractUserOrSession(req, headers);
    await this.cartService.clearCart(userOrSession);
    return;
  }

  @Post('revalidate')
  @HttpCode(HttpStatus.OK)
  async revalidateCart(
    @Req() req: any,
    @Headers() headers: any,
    @Body() dto: RevalidateCartDto,
  ) {
    let cartId = dto.cartId;
    if (!cartId) {
      const userOrSession = this.extractUserOrSession(req, headers);
      const cart = await this.cartService.getOrCreateCart(userOrSession);
      cartId = cart.id;
    }
    return this.cartService.revalidateCart(cartId);
  }
}
