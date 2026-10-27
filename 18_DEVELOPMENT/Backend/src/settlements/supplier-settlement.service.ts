import { Injectable, Logger } from '@nestjs/common';
import { CommissionCalculationResult } from '../commissions/commission-engine.service';

export interface SupplierSettlementRecord {
  settlementId: string;
  supplierId: string;
  settlementPeriod: string;
  bookingReferences: string[];
  grossAmountInr: number;
  totalCommissionInr: number;
  totalTaxInr: number;
  netPayoutInr: number;
  status: 'PENDING' | 'ELIGIBLE' | 'CALCULATED' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'ON_HOLD';
  createdAt: string;
  paidAt?: string;
}

@Injectable()
export class SupplierSettlementService {
  private readonly logger = new Logger(SupplierSettlementService.name);
  private readonly settlementStore = new Map<string, SupplierSettlementRecord>();

  async createSettlementBatch(
    supplierId: string,
    commissionCalculations: CommissionCalculationResult[]
  ): Promise<SupplierSettlementRecord> {
    const settlementId = `stl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const grossAmount = commissionCalculations.reduce((sum, item) => sum + item.grossBookingValueInr, 0);
    const totalCommission = commissionCalculations.reduce((sum, item) => sum + item.platformCommissionInr, 0);
    const totalTax = commissionCalculations.reduce((sum, item) => sum + item.taxOnCommissionInr, 0);
    const netPayout = commissionCalculations.reduce((sum, item) => sum + item.netSupplierPayableInr, 0);

    const record: SupplierSettlementRecord = {
      settlementId,
      supplierId,
      settlementPeriod: `${new Date().toISOString().substring(0, 7)}-CYCLE-1`,
      bookingReferences: commissionCalculations.map(c => c.bookingId),
      grossAmountInr: Number(grossAmount.toFixed(2)),
      totalCommissionInr: Number(totalCommission.toFixed(2)),
      totalTaxInr: Number(totalTax.toFixed(2)),
      netPayoutInr: Number(netPayout.toFixed(2)),
      status: 'CALCULATED',
      createdAt: now,
    };

    this.settlementStore.set(settlementId, record);
    this.logger.log(`[SupplierSettlementService] Created settlement batch ${settlementId} for Supplier ${supplierId} (Net Payout: ₹${record.netPayoutInr})`);

    return record;
  }

  async approveSettlement(settlementId: string): Promise<SupplierSettlementRecord> {
    const settlement = this.settlementStore.get(settlementId);
    if (!settlement) {
      throw new Error(`Settlement ${settlementId} not found.`);
    }

    settlement.status = 'PAID';
    settlement.paidAt = new Date().toISOString();
    this.settlementStore.set(settlementId, settlement);

    this.logger.log(`[SupplierSettlementService] Approved and paid settlement ${settlementId} (Payout: ₹${settlement.netPayoutInr})`);
    return settlement;
  }

  async getSupplierSettlements(supplierId: string): Promise<SupplierSettlementRecord[]> {
    return Array.from(this.settlementStore.values()).filter(s => s.supplierId === supplierId);
  }
}
