import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CheckoutSessionService } from './checkout-session.service';
import { CreateCheckoutSessionDto, ConfirmCheckoutDto } from './checkout-session.dto';

@Controller('api/v1/checkout/session')
export class CheckoutController {
  constructor(private readonly checkoutSessionService: CheckoutSessionService) {}

  @Post()
  async createSession(@Req() req: any, @Body() dto: CreateCheckoutSessionDto) {
    const userId = req.user?.id || req.user?.userId;
    return this.checkoutSessionService.createCheckoutSession(userId, dto.cartId);
  }

  @Get(':id')
  async getSession(@Param('id') id: string) {
    return this.checkoutSessionService.getCheckoutSession(id);
  }

  @Post(':id/revalidate')
  @HttpCode(HttpStatus.OK)
  async revalidateSession(@Param('id') id: string) {
    return this.checkoutSessionService.revalidateSession(id);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmCheckout(
    @Param('id') id: string,
    @Body() dto: ConfirmCheckoutDto,
  ) {
    return this.checkoutSessionService.confirmCheckout(id, dto);
  }
}
