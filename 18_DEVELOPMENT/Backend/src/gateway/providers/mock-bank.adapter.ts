import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import {
  PaymentProvider,
  CreatePaymentSessionParams,
  PaymentSessionResult,
  ExecutePaymentParams,
  ExecutePaymentResult,
  ProcessRefundParams,
  ProcessRefundResult,
  SettlementBatchParams,
  SettlementBatchResult,
} from './payment-provider.interface';

@Injectable()
export class MockBankAdapter implements PaymentProvider {
  private readonly logger = new Logger(MockBankAdapter.name);

  getProviderId(): string {
    return 'DIRECT_BANK_UPI_MOCK';
  }

  isSimulation(): boolean {
    return false;
  }

  isLiveAuthorized(): boolean {
    // Strictly unapproved in software stage
    return false;
  }

  async createPaymentSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult> {
    if (!this.isLiveAuthorized()) {
      throw new ForbiddenException(
        '[REGULATORY BLOCK] Direct bank/UPI gateway integration requires formal RBI Payment Aggregator authorization & bank escrow agreement.',
      );
    }
    throw new Error('Not implemented');
  }

  async executePayment(params: ExecutePaymentParams): Promise<ExecutePaymentResult> {
    if (!this.isLiveAuthorized()) {
      throw new ForbiddenException(
        '[REGULATORY BLOCK] Live direct bank execution disabled pending regulatory certification.',
      );
    }
    throw new Error('Not implemented');
  }

  async processRefund(params: ProcessRefundParams): Promise<ProcessRefundResult> {
    if (!this.isLiveAuthorized()) {
      throw new ForbiddenException(
        '[REGULATORY BLOCK] Live bank refund execution disabled.',
      );
    }
    throw new Error('Not implemented');
  }

  async fetchSettlement(params: SettlementBatchParams): Promise<SettlementBatchResult> {
    if (!this.isLiveAuthorized()) {
      throw new ForbiddenException(
        '[REGULATORY BLOCK] Live bank settlement retrieval disabled.',
      );
    }
    throw new Error('Not implemented');
  }
}
