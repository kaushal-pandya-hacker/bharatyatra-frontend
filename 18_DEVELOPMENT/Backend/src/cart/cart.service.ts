import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FlightsService } from '../flights/flights.service';
import { HotelsService } from '../hotels/hotels.service';
import { BusesService } from '../buses/buses.service';
import { TrainsService } from '../trains/trains.service';
import { ActivitiesService } from '../activities/activities.service';
import { AddCartItemDto, UpdateCartItemDto } from './cart.dto';
import { CartItemType } from '@prisma/client';

export interface ScheduleConflictWarning {
  type: 'SCHEDULE_CONFLICT' | 'TIGHT_CONNECTION' | 'DATE_MISMATCH';
  message: string;
  itemIds: string[];
}

export interface CartTotals {
  subtotal: number;
  taxes: number;
  serviceFee: number;
  discount: number;
  total: number;
  currency: string;
}

export interface RevalidatedItemResult {
  itemId: string;
  itemType: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  priceDifference: number;
  isAvailable: boolean;
  status: string;
  warning?: string;
}

export interface CartRevalidationReport {
  cartId: string;
  isAvailable: boolean;
  hasPriceChange: boolean;
  totalPriceDifference: number;
  items: RevalidatedItemResult[];
  conflicts: ScheduleConflictWarning[];
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly flightsService?: FlightsService,
    private readonly hotelsService?: HotelsService,
    private readonly busesService?: BusesService,
    private readonly trainsService?: TrainsService,
    private readonly activitiesService?: ActivitiesService,
  ) {}

  /**
   * Get active cart for user or session, creating one with 2-hour TTL if non-existent or expired.
   */
  async getOrCreateCart(userOrSession: { userId?: string; sessionId?: string }) {
    const { userId, sessionId } = userOrSession;

    if (!userId && !sessionId) {
      throw new BadRequestException('Either userId or sessionId must be provided');
    }

    const now = new Date();

    let cart = await this.prisma.cart.findFirst({
      where: {
        ...(userId ? { userId } : { sessionId }),
        status: 'ACTIVE',
        expiresAt: { gt: now },
      },
      include: {
        items: true,
      },
    });

    if (!cart) {
      const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours sliding TTL

      cart = await this.prisma.cart.create({
        data: {
          userId: userId || null,
          sessionId: sessionId || null,
          status: 'ACTIVE',
          currency: 'INR',
          expiresAt,
        },
        include: {
          items: true,
        },
      });
      this.logger.log(`Created new active cart [${cart.id}] for ${userId ? `user ${userId}` : `session ${sessionId}`}`);
    }

    const totals = this.calculateTotals(cart.items);
    const conflicts = this.detectTripConflicts(cart.items);

    return {
      ...cart,
      ...totals,
      conflicts,
    };
  }

  /**
   * Add item to active cart
   */
  async addItem(userOrSession: { userId?: string; sessionId?: string }, dto: AddCartItemDto) {
    if (dto.priceSnapshot !== undefined && (isNaN(dto.priceSnapshot) || dto.priceSnapshot < 0)) {
      throw new BadRequestException('priceSnapshot must be a non-negative number.');
    }

    const cart = await this.getOrCreateCart(userOrSession);

    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const item = await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        itemType: dto.itemType as CartItemType,
        referenceId: dto.referenceId,
        provider: dto.provider,
        productName: dto.productName,
        metadata: dto.metadata || {},
        priceSnapshot: dto.priceSnapshot,
        currency: dto.currency || 'INR',
        status: 'AVAILABLE',
      },
    });

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { expiresAt: newExpiresAt },
    });

    this.logger.log(`Added item [${item.id}] of type [${dto.itemType}] to cart [${cart.id}]`);
    return this.getCartById(cart.id);
  }

  /**
   * Update cart item (quantity, snapshot, metadata)
   */
  async updateItem(userOrSession: { userId?: string; sessionId?: string }, itemId: string, dto: UpdateCartItemDto) {
    if (dto.priceSnapshot !== undefined && (isNaN(dto.priceSnapshot) || dto.priceSnapshot < 0)) {
      throw new BadRequestException('priceSnapshot must be a non-negative number.');
    }

    const cart = await this.getOrCreateCart(userOrSession);

    const existingItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!existingItem) {
      throw new NotFoundException(`Cart item [${itemId}] not found in user's active cart`);
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: {
        ...(dto.priceSnapshot !== undefined && { priceSnapshot: dto.priceSnapshot }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });

    return this.getCartById(cart.id);
  }

  /**
   * Remove item from cart
   */
  async removeItem(userOrSession: { userId?: string; sessionId?: string }, itemId: string) {
    const cart = await this.getOrCreateCart(userOrSession);

    const existingItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!existingItem) {
      throw new NotFoundException(`Cart item [${itemId}] not found`);
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCartById(cart.id);
  }

  /**
   * Clear all items in active cart
   */
  async clearCart(userOrSession: { userId?: string; sessionId?: string }) {
    const cart = await this.getOrCreateCart(userOrSession);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getCartById(cart.id);
  }

  /**
   * Retrieve cart by ID with calculated totals & conflict analysis
   */
  async getCartById(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });

    if (!cart) {
      throw new NotFoundException(`Cart [${cartId}] not found`);
    }

    const totals = this.calculateTotals(cart.items);
    const conflicts = this.detectTripConflicts(cart.items);

    return {
      ...cart,
      ...totals,
      conflicts,
    };
  }

  /**
   * Calculate server-authoritative totals
   */
  public calculateTotals(items: any[]): CartTotals {
    const subtotal = items.reduce((acc, item) => acc + Number(item.priceSnapshot || 0), 0);
    const taxes = Math.round(subtotal * 0.18 * 100) / 100;
    const serviceFee = items.length > 0 ? 250.00 : 0.00;
    const discount = 0.00;
    const total = Math.round((subtotal + taxes + serviceFee - discount) * 100) / 100;

    return {
      subtotal,
      taxes,
      serviceFee,
      discount,
      total,
      currency: 'INR',
    };
  }

  /**
   * Detect potential schedule conflicts or tight connections across cart items
   */
  public detectTripConflicts(items: any[]): ScheduleConflictWarning[] {
    const warnings: ScheduleConflictWarning[] = [];

    const transports = items.filter(i => i.itemType === 'FLIGHT' || i.itemType === 'BUS' || i.itemType === 'TRAIN');
    const activities = items.filter(i => i.itemType === 'ACTIVITY');
    const hotels = items.filter(i => i.itemType === 'HOTEL');

    for (const transport of transports) {
      const meta = (transport.metadata as any) || {};
      const arrivalTimeStr = meta.arrivalTime || meta.arrivalDate;
      if (!arrivalTimeStr) continue;

      const arrivalTime = new Date(arrivalTimeStr).getTime();
      if (isNaN(arrivalTime)) continue;

      for (const activity of activities) {
        const actMeta = (activity.metadata as any) || {};
        const actStartStr = actMeta.startDate || actMeta.date;
        if (!actStartStr) continue;

        const actStart = new Date(actStartStr).getTime();
        if (isNaN(actStart)) continue;

        const diffMinutes = (actStart - arrivalTime) / (1000 * 60);
        if (diffMinutes >= 0 && diffMinutes < 60) {
          warnings.push({
            type: 'TIGHT_CONNECTION',
            message: `Tight connection: ${activity.productName} starts only ${Math.round(diffMinutes)} mins after ${transport.productName} arrival.`,
            itemIds: [transport.id, activity.id],
          });
        } else if (diffMinutes < 0 && Math.abs(diffMinutes) < 180) {
          warnings.push({
            type: 'SCHEDULE_CONFLICT',
            message: `Schedule conflict: ${activity.productName} starts before ${transport.productName} arrives.`,
            itemIds: [transport.id, activity.id],
          });
        }
      }
    }

    for (const hotel of hotels) {
      const hMeta = (hotel.metadata as any) || {};
      const checkoutStr = hMeta.checkOutDate || hMeta.endDate;
      if (!checkoutStr) continue;

      const checkoutTime = new Date(checkoutStr).getTime();
      if (isNaN(checkoutTime)) continue;

      for (const transport of transports) {
        const tMeta = (transport.metadata as any) || {};
        const depStr = tMeta.departureTime || tMeta.departureDate;
        if (!depStr) continue;

        const depTime = new Date(depStr).getTime();
        if (isNaN(depTime)) continue;

        if (depTime < checkoutTime && Math.abs((checkoutTime - depTime) / (1000 * 60 * 60 * 24)) < 1) {
          warnings.push({
            type: 'DATE_MISMATCH',
            message: `Checkout warning: ${transport.productName} departs before hotel checkout date.`,
            itemIds: [hotel.id, transport.id],
          });
        }
      }
    }

    return warnings;
  }

  /**
   * Revalidate all items in a cart with live / sandbox providers
   */
  async revalidateCart(cartId: string): Promise<CartRevalidationReport> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });

    if (!cart) {
      throw new NotFoundException(`Cart [${cartId}] not found`);
    }

    let overallAvailable = true;
    let hasPriceChange = false;
    let totalPriceDiff = 0;
    const itemResults: RevalidatedItemResult[] = [];

    for (const item of cart.items) {
      const oldPrice = Number(item.priceSnapshot);
      let newPrice = oldPrice;
      let isAvailable = true;
      let warning: string | undefined;

      const meta = (item.metadata as any) || {};

      try {
        switch (item.itemType) {
          case 'FLIGHT':
            if (this.flightsService) {
              const res = await this.flightsService.revalidate({
                transportId: item.referenceId,
                passengersCount: meta.adults || 1,
              });
              if (res) {
                newPrice = res.newFare ?? oldPrice;
                isAvailable = res.status !== 'UNAVAILABLE';
              }
            }
            break;

          case 'HOTEL':
            if (this.hotelsService) {
              const res = await this.hotelsService.revalidatePrice({
                rateKey: meta.rateKey || item.referenceId,
                hotelCode: item.referenceId,
                expectedPrice: oldPrice,
              });
              if (res) {
                newPrice = (res as any).newPrice ?? (res as any).price ?? oldPrice;
                isAvailable = res.available ?? true;
              }
            }
            break;

          case 'BUS':
            if (this.busesService) {
              const res = await this.busesService.revalidate({
                transportId: item.referenceId,
                passengersCount: meta.passengers || 1,
              });
              if (res) {
                newPrice = res.newFare ?? oldPrice;
                isAvailable = res.status !== 'UNAVAILABLE';
              }
            }
            break;

          case 'TRAIN':
            if (this.trainsService) {
              const res = await this.trainsService.revalidate({
                transportId: item.referenceId,
                passengersCount: meta.passengers || 1,
              });
              if (res) {
                newPrice = res.newFare ?? oldPrice;
                isAvailable = res.status !== 'UNAVAILABLE';
              }
            }
            break;

          case 'ACTIVITY':
            if (this.activitiesService) {
              const res = await this.activitiesService.revalidatePrice({
                activityId: item.referenceId,
                expectedTotalPrice: oldPrice,
                date: meta.date || new Date().toISOString(),
                adults: meta.adults || 1,
              });
              if (res) {
                newPrice = (res as any).newPrice ?? (res as any).totalPrice ?? oldPrice;
                isAvailable = res.available ?? true;
              }
            }
            break;

          default:
            break;
        }
      } catch (err: any) {
        this.logger.warn(`Error revalidating item [${item.id}] of type [${item.itemType}]: ${err.message}`);
      }

      const diff = Math.round((newPrice - oldPrice) * 100) / 100;
      if (diff !== 0) {
        hasPriceChange = true;
        totalPriceDiff += diff;
        warning = `Price changed from ₹${oldPrice.toLocaleString('en-IN')} to ₹${newPrice.toLocaleString('en-IN')}`;
      }

      if (!isAvailable) {
        overallAvailable = false;
        warning = 'Item is no longer available';
      }

      await this.prisma.cartItem.update({
        where: { id: item.id },
        data: {
          priceSnapshot: newPrice,
          status: isAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
        },
      });

      itemResults.push({
        itemId: item.id,
        itemType: item.itemType,
        productName: item.productName,
        oldPrice,
        newPrice,
        priceDifference: diff,
        isAvailable,
        status: isAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
        warning,
      });
    }

    const conflicts = this.detectTripConflicts(cart.items);

    return {
      cartId,
      isAvailable: overallAvailable,
      hasPriceChange,
      totalPriceDifference: Math.round(totalPriceDiff * 100) / 100,
      items: itemResults,
      conflicts,
    };
  }
}
