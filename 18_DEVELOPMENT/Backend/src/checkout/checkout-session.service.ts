import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { ConfirmCheckoutDto } from './checkout-session.dto';

@Injectable()
export class CheckoutSessionService {
  private readonly logger = new Logger(CheckoutSessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) {}

  /**
   * Create a new CheckoutSession from a Cart after full item revalidation
   */
  async createCheckoutSession(userId: string | undefined, cartId: string) {
    const cart = await this.cartService.getCartById(cartId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot create checkout session for an empty cart');
    }

    // Run full item revalidation
    const revalidationReport = await this.cartService.revalidateCart(cartId);

    if (!revalidationReport.isAvailable) {
      const unavailableItems = revalidationReport.items
        .filter(i => !i.isAvailable)
        .map(i => i.productName)
        .join(', ');
      throw new BadRequestException(
        `The following items are no longer available: ${unavailableItems}. Please remove or update them before proceeding.`,
      );
    }

    // Get fresh cart state with totals after revalidation
    const refreshedCart = await this.cartService.getCartById(cartId);

    const priceSnapshot = {
      subtotal: refreshedCart.subtotal,
      taxes: refreshedCart.taxes,
      serviceFee: refreshedCart.serviceFee,
      discount: refreshedCart.discount,
      totalAmountInr: refreshedCart.total,
      currency: refreshedCart.currency,
      items: refreshedCart.items.map(item => ({
        id: item.id,
        itemType: item.itemType,
        productName: item.productName,
        priceSnapshot: Number(item.priceSnapshot),
      })),
    };

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Strict 15-minute checkout expiration TTL

    const session = await this.prisma.checkoutSession.create({
      data: {
        userId: userId || null,
        cartId: cart.id,
        priceSnapshot,
        revalidationStatus: JSON.parse(JSON.stringify(revalidationReport)),
        paymentStatus: 'PENDING',
        bookingStatus: 'PENDING',
        expiresAt,
      },
      include: {
        cart: {
          include: {
            items: true,
          },
        },
      },
    });

    // Mark cart status as CHECKOUT
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { status: 'CHECKOUT' },
    });

    this.logger.log(`Created CheckoutSession [${session.id}] for cart [${cart.id}], expires at ${expiresAt.toISOString()}`);
    return session;
  }

  /**
   * Get CheckoutSession details with expiration check
   */
  async getCheckoutSession(sessionId: string) {
    const session = await this.prisma.checkoutSession.findUnique({
      where: { id: sessionId },
      include: {
        cart: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`CheckoutSession [${sessionId}] not found`);
    }

    const isExpired = new Date() > new Date(session.expiresAt);

    return {
      ...session,
      isExpired,
    };
  }

  /**
   * Revalidate an existing CheckoutSession
   */
  async revalidateSession(sessionId: string) {
    const session = await this.getCheckoutSession(sessionId);

    if (session.isExpired) {
      throw new BadRequestException(`CheckoutSession [${sessionId}] has expired. Please create a new checkout session.`);
    }

    const report = await this.cartService.revalidateCart(session.cartId);

    // Update session revalidation status
    const refreshedCart = await this.cartService.getCartById(session.cartId);
    const updatedPriceSnapshot = {
      subtotal: refreshedCart.subtotal,
      taxes: refreshedCart.taxes,
      serviceFee: refreshedCart.serviceFee,
      discount: refreshedCart.discount,
      totalAmountInr: refreshedCart.total,
      currency: refreshedCart.currency,
      items: refreshedCart.items.map(item => ({
        id: item.id,
        itemType: item.itemType,
        productName: item.productName,
        priceSnapshot: Number(item.priceSnapshot),
      })),
    };

    const updatedSession = await this.prisma.checkoutSession.update({
      where: { id: sessionId },
      data: {
        priceSnapshot: updatedPriceSnapshot,
        revalidationStatus: JSON.parse(JSON.stringify(report)),
      },
      include: {
        cart: {
          include: { items: true },
        },
      },
    });

    return {
      session: updatedSession,
      revalidationReport: report,
    };
  }

  /**
   * Confirm checkout session details and generate payment gateway order
   */
  async confirmCheckout(sessionId: string, dto: ConfirmCheckoutDto) {
    const session = await this.getCheckoutSession(sessionId);

    if (session.isExpired) {
      throw new BadRequestException(`CheckoutSession [${sessionId}] has expired. Please create a new session.`);
    }

    // Run final revalidation before payment creation
    const reval = await this.cartService.revalidateCart(session.cartId);
    if (!reval.isAvailable) {
      throw new BadRequestException('One or more items became unavailable during checkout verification.');
    }

    const priceSnapshot = session.priceSnapshot as any;
    const totalAmountInr = Number(priceSnapshot.totalAmountInr);

    // Generate Razorpay / Sandbox order ID
    const gatewayOrderId = `order_cz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Update session with traveler and contact info
    const updatedStatus = {
      ...(session.revalidationStatus as any || {}),
      contactInfo: dto.contactInfo,
      travelers: dto.travelers || [],
      confirmedAt: new Date().toISOString(),
    };

    await this.prisma.checkoutSession.update({
      where: { id: sessionId },
      data: {
        paymentStatus: 'PAYMENT_PENDING',
        revalidationStatus: updatedStatus,
      },
    });

    return {
      sessionId: session.id,
      gatewayOrderId,
      amountInr: totalAmountInr,
      currency: priceSnapshot.currency || 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_sandbox_key',
      contactInfo: dto.contactInfo,
      itemsCount: session.cart.items.length,
      expiresAt: session.expiresAt,
    };
  }
}
