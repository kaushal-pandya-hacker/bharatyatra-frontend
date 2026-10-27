import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutSessionService } from './checkout-session.service';
import { CartModule } from '../cart/cart.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, CartModule],
  controllers: [CheckoutController],
  providers: [CheckoutSessionService],
  exports: [CheckoutSessionService],
})
export class CheckoutModule {}
