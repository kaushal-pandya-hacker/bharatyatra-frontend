import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PackagesService } from './packages.service';
import { UniversalProviderRegistry } from '../providers/registry/universal-provider.registry';

export interface CreateQuoteInput {
  packageSlug: string;
  userId?: string;
  travelDate: string;
  adultsCount: number;
  childrenCount?: number;
  roomsCount?: number;
  hotelCategory?: string;
  transportOption?: string;
  selectedActivityIds?: string[];
}

export interface QuoteBreakdown {
  quoteId: string;
  quoteReference: string;
  packageId: string;
  packageSlug: string;
  packageTitle: string;
  travelDate: string;
  adultsCount: number;
  childrenCount: number;
  roomsCount: number;
  hotelCategory?: string;
  transportOption?: string;
  selectedActivities: string[];
  supplierCostInr: number;
  taxInr: number;
  platformFeeInr: number;
  markupInr: number;
  discountInr: number;
  totalAmountInr: number;
  perPersonPriceInr: number;
  currency: string;
  quoteExpirationTime: string;
  pricingSource: string;
  createdTimestamp: string;
  quoteVersion: number;
  isExpired: boolean;
}

@Injectable()
export class QuoteEngineService {
  private readonly logger = new Logger(QuoteEngineService.name);
  private readonly QUOTE_EXPIRATION_MINUTES = 30;

  constructor(
    private readonly prisma: PrismaService,
    private readonly packagesService: PackagesService,
    private readonly providerRegistry: UniversalProviderRegistry,
  ) {}

  /**
   * Section 5 & 6: Create Immutable Package Quote with Live Price Calculation
   * Formula: Customer Price = (Supplier Cost * Taxes * Platform Fee * Markup) + Services - Discount
   */
  async createQuote(input: CreateQuoteInput): Promise<QuoteBreakdown> {
    const pkgResult = await this.packagesService.findBySlug(input.packageSlug);
    const pkg = pkgResult.data;
    if (!pkg) {
      throw new NotFoundException(`Package '${input.packageSlug}' not found.`);
    }

    const adults = Math.max(1, input.adultsCount || 1);
    const children = Math.max(0, input.childrenCount || 0);
    const totalTravellers = adults + children;
    const rooms = input.roomsCount || Math.ceil(adults / 2);

    // 1. Calculate Supplier Base Cost
    const basePricePerPerson = Number(pkg.discountedPrice || pkg.startingPrice);
    let supplierHotelCost = 0;
    let selectedHotelName = '';
    if (input.hotelCategory && pkg.hotels && pkg.hotels.length > 0) {
      const match = pkg.hotels.find(
        (h: any) => h.hotelCategory === input.hotelCategory || h.hotelName === input.hotelCategory,
      );
      if (match) {
        selectedHotelName = match.hotelName;
        supplierHotelCost = Number(match.upgradePricePerNightInr || 0) * (pkg.durationNights || 1);
      }
    }

    // Try live provider price check
    try {
      const hotelProvider = this.providerRegistry.getProvider('HOTEL');
      if (hotelProvider && hotelProvider.checkPrice) {
        const checkInStr = input.travelDate;
        const checkOutDate = new Date(new Date(input.travelDate).getTime() + (pkg.durationNights || 2) * 86400000);
        const checkOutStr = checkOutDate.toISOString().slice(0, 10);
        const livePriceRes = await hotelProvider.checkPrice({
          rateKey: `RATE-PKGPKG-${pkg.id}`,
          productType: 'HOTEL',
          productId: selectedHotelName || 'HBX-DEFAULT',
        });
        if (livePriceRes && livePriceRes.netPrice > 0) {
          supplierHotelCost = livePriceRes.netPrice;
        }
      }
    } catch (err: any) {
      this.logger.warn(`[QuoteEngine] Provider check fallback: ${err?.message}`);
    }

    let supplierTransportCost = 0;
    if (input.transportOption && pkg.transports && pkg.transports.length > 0) {
      const match = pkg.transports.find(
        (t: any) => t.transportType === input.transportOption || t.title === input.transportOption,
      );
      if (match) {
        supplierTransportCost = Number(match.additionalPriceInr || 0);
      }
    }

    let supplierActivitiesCost = 0;
    const selectedActivitiesList: string[] = [];
    if (input.selectedActivityIds && input.selectedActivityIds.length > 0 && pkg.activities) {
      for (const actId of input.selectedActivityIds) {
        const act = pkg.activities.find((a: any) => a.id === actId || a.title === actId);
        if (act) {
          supplierActivitiesCost += Number(act.priceInr || 0);
          selectedActivitiesList.push(act.title || act.id);
        }
      }
    }

    // Supplier Raw Cost total
    const supplierCostPerPerson = basePricePerPerson + supplierHotelCost + supplierTransportCost + supplierActivitiesCost;
    const totalSupplierCost = supplierCostPerPerson * totalTravellers;

    // Platform Fee & BharatYatra Markup (Configurable margins per component)
    const markupRate = 0.08; // 8% BharatYatra margin
    const platformFeeFixed = 250; // ₹250 administrative fee
    const markupAmount = Math.round(totalSupplierCost * markupRate);
    
    // Subtotal before tax
    const subtotalBeforeTax = totalSupplierCost + markupAmount + platformFeeFixed;

    // GST Tax (5% for tour packages)
    const taxInr = Math.round(subtotalBeforeTax * 0.05);

    // Optional Discount
    const discountPerPerson = pkg.originalPrice ? Math.max(0, Number(pkg.originalPrice) - basePricePerPerson) : 0;
    const discountInr = discountPerPerson * totalTravellers;

    // Final Customer Amount
    const totalAmountInr = Math.max(0, subtotalBeforeTax + taxInr - discountInr);
    const perPersonPriceInr = Math.round(totalAmountInr / totalTravellers);

    // Expiration
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.QUOTE_EXPIRATION_MINUTES * 60 * 1000);
    const todayStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const quoteReference = `BY-QT-${todayStr}-${randomSuffix}`;

    // Save to Database
    let dbQuoteId = quoteReference;
    try {
      if (!pkg.id.startsWith('pkg-')) {
        const saved = await this.prisma.packageQuote.create({
          data: {
            quoteReference,
            packageId: pkg.id,
            userId: input.userId || null,
            travelDate: new Date(input.travelDate),
            adultsCount: adults,
            childrenCount: children,
            roomsCount: rooms,
            hotelCategory: input.hotelCategory || 'STANDARD',
            transportOption: input.transportOption || 'STANDARD',
            selectedActivities: selectedActivitiesList,
            supplierCostInr: totalSupplierCost,
            taxInr,
            platformFeeInr: platformFeeFixed,
            markupInr: markupAmount,
            discountInr,
            totalAmountInr,
            currency: pkg.currency || 'INR',
            pricingSource: 'LIVE_SUPPLIER',
            quoteVersion: 1,
            expiresAt,
          },
        });
        dbQuoteId = saved.id;
      }
    } catch (e: any) {
      this.logger.warn(`[QuoteEngine] DB Save Warning: ${e?.message}`);
    }

    return {
      quoteId: dbQuoteId,
      quoteReference,
      packageId: pkg.id,
      packageSlug: pkg.slug,
      packageTitle: pkg.title,
      travelDate: input.travelDate,
      adultsCount: adults,
      childrenCount: children,
      roomsCount: rooms,
      hotelCategory: input.hotelCategory,
      transportOption: input.transportOption,
      selectedActivities: selectedActivitiesList,
      supplierCostInr: totalSupplierCost,
      taxInr,
      platformFeeInr: platformFeeFixed,
      markupInr: markupAmount,
      discountInr,
      totalAmountInr,
      perPersonPriceInr,
      currency: pkg.currency || 'INR',
      quoteExpirationTime: expiresAt.toISOString(),
      pricingSource: 'LIVE_SUPPLIER',
      createdTimestamp: now.toISOString(),
      quoteVersion: 1,
      isExpired: false,
    };
  }

  /**
   * Section 5: Validate Quote & Check Expiration
   */
  async validateQuote(quoteReference: string): Promise<QuoteBreakdown> {
    const quote = await this.prisma.packageQuote.findUnique({
      where: { quoteReference },
      include: { package: true },
    });

    if (!quote) {
      throw new NotFoundException(`Quote '${quoteReference}' not found.`);
    }

    const now = new Date();
    const isExpired = quote.expiresAt < now;

    if (isExpired) {
      throw new BadRequestException(
        `Quote '${quoteReference}' has expired at ${quote.expiresAt.toISOString()}. Please perform a new live availability check to obtain an updated quote.`,
      );
    }

    const totalTravellers = quote.adultsCount + quote.childrenCount;
    const perPersonPriceInr = Math.round(Number(quote.totalAmountInr) / Math.max(1, totalTravellers));

    return {
      quoteId: quote.id,
      quoteReference: quote.quoteReference,
      packageId: quote.packageId,
      packageSlug: quote.package.slug,
      packageTitle: quote.package.title,
      travelDate: quote.travelDate.toISOString().slice(0, 10),
      adultsCount: quote.adultsCount,
      childrenCount: quote.childrenCount,
      roomsCount: quote.roomsCount,
      hotelCategory: quote.hotelCategory || undefined,
      transportOption: quote.transportOption || undefined,
      selectedActivities: quote.selectedActivities,
      supplierCostInr: Number(quote.supplierCostInr),
      taxInr: Number(quote.taxInr),
      platformFeeInr: Number(quote.platformFeeInr),
      markupInr: Number(quote.markupInr),
      discountInr: Number(quote.discountInr),
      totalAmountInr: Number(quote.totalAmountInr),
      perPersonPriceInr,
      currency: quote.currency,
      quoteExpirationTime: quote.expiresAt.toISOString(),
      pricingSource: quote.pricingSource,
      createdTimestamp: quote.createdAt.toISOString(),
      quoteVersion: quote.quoteVersion,
      isExpired,
    };
  }
}
