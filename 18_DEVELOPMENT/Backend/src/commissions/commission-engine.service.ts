import { Injectable, Logger } from '@nestjs/common';

export interface CommissionRule {
  ruleId: string;
  category: string; // HOTEL | BUS | ACTIVITY | RESTAURANT
  commissionType: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  rate: number; // e.g. 0.12 (12%)
  fixedAmountInr: number;
}

export interface CommissionCalculationResult {
  bookingId: string;
  supplierId: string;
  category: string;
  grossBookingValueInr: number;
  platformCommissionInr: number;
  supplierPayableInr: number;
  taxOnCommissionInr: number;
  netSupplierPayableInr: number;
}

@Injectable()
export class CommissionEngineService {
  private readonly logger = new Logger(CommissionEngineService.name);

  // Default Marketplace Commercial Rules
  private readonly defaultRules: Record<string, CommissionRule> = {
    HOTEL: { ruleId: 'comm_hotel_std', category: 'HOTEL', commissionType: 'PERCENTAGE', rate: 0.12, fixedAmountInr: 0 }, // 12% commission
    BUS: { ruleId: 'comm_bus_std', category: 'BUS', commissionType: 'PERCENTAGE', rate: 0.08, fixedAmountInr: 0 }, // 8% commission
    ACTIVITY: { ruleId: 'comm_act_std', category: 'ACTIVITY', commissionType: 'PERCENTAGE', rate: 0.15, fixedAmountInr: 0 }, // 15% commission
    RESTAURANT: { ruleId: 'comm_rest_std', category: 'RESTAURANT', commissionType: 'PERCENTAGE', rate: 0.10, fixedAmountInr: 0 }, // 10% commission
  };

  calculateCommission(
    bookingId: string,
    supplierId: string,
    category: string,
    grossAmountInr: number
  ): CommissionCalculationResult {
    const rule = this.defaultRules[category.toUpperCase()] || {
      ruleId: 'comm_default',
      category: 'GENERAL',
      commissionType: 'PERCENTAGE',
      rate: 0.10,
      fixedAmountInr: 0,
    };

    let platformCommissionInr = 0;
    if (rule.commissionType === 'PERCENTAGE') {
      platformCommissionInr = Number((grossAmountInr * rule.rate).toFixed(2));
    } else {
      platformCommissionInr = rule.fixedAmountInr;
    }

    const taxOnCommissionInr = Number((platformCommissionInr * 0.18).toFixed(2)); // 18% GST on platform commission
    const supplierPayableInr = Number((grossAmountInr - platformCommissionInr).toFixed(2));
    const netSupplierPayableInr = Number((supplierPayableInr - taxOnCommissionInr).toFixed(2));

    this.logger.log(
      `[CommissionEngineService] Calculated commission for Booking ${bookingId} (Gross: ₹${grossAmountInr}, Platform Comm: ₹${platformCommissionInr}, Net Supplier Payout: ₹${netSupplierPayableInr})`
    );

    return {
      bookingId,
      supplierId,
      category,
      grossBookingValueInr: grossAmountInr,
      platformCommissionInr,
      supplierPayableInr,
      taxOnCommissionInr,
      netSupplierPayableInr,
    };
  }
}
