import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
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
export class SimulatedPaymentAdapter implements PaymentProvider {
  private readonly logger = new Logger(SimulatedPaymentAdapter.name);
  private readonly simulationSecret = process.env.GATEWAY_SIMULATOR_SECRET || 'bharatgateway_safe_simulation_secret_2026';

  getProviderId(): string {
    return 'BHARATGATEWAY_SIMULATOR';
  }

  isSimulation(): boolean {
    return true;
  }

  isLiveAuthorized(): boolean {
    return false; // Strictly non-live
  }

  async createPaymentSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult> {
    const sessionId = `sess_sim_${crypto.randomBytes(12).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    this.logger.log(`[SIMULATOR] Created session ${sessionId} for Order ${params.orderId} (Amount: ₹${(params.amountMinor / 100).toFixed(2)})`);

    return {
      sessionId,
      orderId: params.orderId,
      provider: this.getProviderId(),
      checkoutUrl: `/payment-gateway/checkout/${params.orderId}`,
      isSimulated: true,
      expiresAt,
    };
  }

  async executePayment(params: ExecutePaymentParams): Promise<ExecutePaymentResult> {
    const attemptId = `pay_sim_${crypto.randomBytes(12).toString('hex')}`;
    const scenario = params.methodDetails.simulatedScenario || 'SUCCESS';
    const gatewayTxnId = `txn_sim_${crypto.randomBytes(16).toString('hex')}`;
    const now = new Date().toISOString();

    this.logger.log(`[SIMULATOR] Executing simulated payment for Order ${params.orderId} via ${params.method}. Scenario: ${scenario}`);

    // Deterministic simulation scenarios
    switch (scenario) {
      case 'INSUFFICIENT_FUNDS':
        return {
          attemptId,
          orderId: params.orderId,
          provider: this.getProviderId(),
          status: 'FAILED',
          isSimulated: true,
          gatewayTransactionId: gatewayTxnId,
          signature: this.computeSignature(params.orderId, gatewayTxnId, 'FAILED'),
          errorCode: 'ERR_INSUFFICIENT_FUNDS',
          errorMessage: 'Simulated customer bank account or card balance insufficient.',
          riskScore: 10,
          completedAt: now,
        };

      case 'INCORRECT_PIN':
        return {
          attemptId,
          orderId: params.orderId,
          provider: this.getProviderId(),
          status: 'FAILED',
          isSimulated: true,
          gatewayTransactionId: gatewayTxnId,
          signature: this.computeSignature(params.orderId, gatewayTxnId, 'FAILED'),
          errorCode: 'ERR_AUTHENTICATION_PIN_FAILED',
          errorMessage: 'Simulated UPI PIN or 3DS OTP incorrect.',
          riskScore: 25,
          completedAt: now,
        };

      case 'BANK_TIMEOUT':
        return {
          attemptId,
          orderId: params.orderId,
          provider: this.getProviderId(),
          status: 'FAILED',
          isSimulated: true,
          gatewayTransactionId: gatewayTxnId,
          signature: this.computeSignature(params.orderId, gatewayTxnId, 'FAILED'),
          errorCode: 'ERR_ISSUER_BANK_TIMEOUT',
          errorMessage: 'Simulated acquiring bank or NPCI switch timeout.',
          riskScore: 5,
          completedAt: now,
        };

      case 'CARD_EXPIRED':
        return {
          attemptId,
          orderId: params.orderId,
          provider: this.getProviderId(),
          status: 'FAILED',
          isSimulated: true,
          gatewayTransactionId: gatewayTxnId,
          signature: this.computeSignature(params.orderId, gatewayTxnId, 'FAILED'),
          errorCode: 'ERR_CARD_EXPIRED',
          errorMessage: 'Card expiration date has lapsed.',
          riskScore: 15,
          completedAt: now,
        };

      case 'FRAUD_BLOCKED':
        return {
          attemptId,
          orderId: params.orderId,
          provider: this.getProviderId(),
          status: 'FAILED',
          isSimulated: true,
          gatewayTransactionId: gatewayTxnId,
          signature: this.computeSignature(params.orderId, gatewayTxnId, 'FAILED'),
          errorCode: 'ERR_HIGH_RISK_TRANSACTION_BLOCKED',
          errorMessage: 'Simulator automated risk rules rejected suspicious transaction pattern.',
          riskScore: 92,
          completedAt: now,
        };

      case 'SUCCESS':
      default:
        return {
          attemptId,
          orderId: params.orderId,
          provider: this.getProviderId(),
          status: 'SUCCESS',
          isSimulated: true,
          gatewayTransactionId: gatewayTxnId,
          signature: this.computeSignature(params.orderId, gatewayTxnId, 'SUCCESS'),
          riskScore: 5,
          completedAt: now,
        };
    }
  }

  async processRefund(params: ProcessRefundParams): Promise<ProcessRefundResult> {
    const providerRefundId = `rf_sim_${crypto.randomBytes(12).toString('hex')}`;
    const now = new Date().toISOString();

    this.logger.log(`[SIMULATOR] Processed simulated refund of ₹${(params.amountMinor / 100).toFixed(2)} for Order ${params.orderId}`);

    return {
      refundId: params.refundId,
      status: 'COMPLETED',
      providerRefundId,
      isSimulated: true,
      processedAt: now,
    };
  }

  async fetchSettlement(params: SettlementBatchParams): Promise<SettlementBatchResult> {
    const batchId = `set_sim_${Date.now()}`;
    const now = new Date().toISOString();

    return {
      batchId,
      merchantId: params.merchantId,
      totalOrders: 10,
      grossAmountMinor: 1000000,
      netSettlementMinor: 1000000,
      feeMinor: 0, // Zero fee model
      taxMinor: 0,
      status: 'SETTLED',
      settledAt: now,
    };
  }

  private computeSignature(orderId: string, txnId: string, status: string): string {
    return crypto
      .createHmac('sha256', this.simulationSecret)
      .update(`${orderId}|${txnId}|${status}`)
      .digest('hex');
  }
}
