import { Injectable, Logger } from '@nestjs/common';
import { ProductTypeEnum } from '../providers/interfaces/universal-provider.interface';

export interface PricingRule {
  id: string;
  providerId?: string;
  productType: ProductTypeEnum;
  pricingModel: 'NET_MARKUP' | 'COMMISSION_SPLIT' | 'ZERO_MARKUP';
  commissionRatePercent: number; // e.g. 10 for 10%
  markupAmountInr: number;       // e.g. 200 INR
  taxRatePercent: number;        // e.g. 18 for 18% GST
  feeAmountInr: number;          // e.g. 50 INR
  currency: string;
  isEnabled: boolean;
}

export interface CalculatedPriceResult {
  netPrice: number;
  markupAmount: number;
  commissionAmount: number;
  taxAmount: number;
  feeAmount: number;
  totalCustomerPrice: number;
  currency: string;
  appliedRuleId: string;
}

@Injectable()
export class PricingEngineService {
  private readonly logger = new Logger(PricingEngineService.name);
  private rules: PricingRule[] = [
    {
      id: 'default-hotel-rule',
      productType: 'HOTEL',
      pricingModel: 'ZERO_MARKUP',
      commissionRatePercent: 0,
      markupAmountInr: 0,
      taxRatePercent: 0, // HBX net prices in sandbox evaluation include taxes/net rate
      feeAmountInr: 0,
      currency: 'INR',
      isEnabled: true,
    },
    {
      id: 'default-bus-rule',
      productType: 'BUS',
      pricingModel: 'NET_MARKUP',
      commissionRatePercent: 5,
      markupAmountInr: 25,
      taxRatePercent: 5,
      feeAmountInr: 10,
      currency: 'INR',
      isEnabled: true,
    },
  ];

  public getRules(): PricingRule[] {
    return this.rules;
  }

  public addOrUpdateRule(rule: PricingRule): void {
    const idx = this.rules.findIndex((r) => r.id === rule.id);
    if (idx >= 0) {
      this.rules[idx] = rule;
    } else {
      this.rules.push(rule);
    }
    this.logger.log(`[PricingEngine] Updated rule ${rule.id} for productType=${rule.productType}`);
  }

  /**
   * Calculate customer final payable price given net price and product type
   */
  public calculateCustomerPrice(
    netPrice: number,
    productType: ProductTypeEnum,
    providerId?: string,
  ): CalculatedPriceResult {
    const rule =
      [...this.rules]
        .reverse()
        .find((r) => r.isEnabled && r.productType === productType && (!r.providerId || r.providerId === providerId)) ||
      this.rules[0];

    const markup = rule.markupAmountInr || 0;
    const commission = (netPrice * (rule.commissionRatePercent || 0)) / 100;
    const fee = rule.feeAmountInr || 0;
    const subtotal = netPrice + markup + fee;
    const tax = (subtotal * (rule.taxRatePercent || 0)) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    return {
      netPrice,
      markupAmount: markup,
      commissionAmount: commission,
      taxAmount: tax,
      feeAmount: fee,
      totalCustomerPrice: total,
      currency: rule.currency || 'INR',
      appliedRuleId: rule.id,
    };
  }
}
