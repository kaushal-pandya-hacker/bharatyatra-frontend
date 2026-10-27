import { Module, Global } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { SimulatedPaymentAdapter } from './providers/simulated-payment.adapter';
import { MockBankAdapter } from './providers/mock-bank.adapter';
import { RazorpaySandboxAdapter } from './providers/razorpay-sandbox.adapter';
import { ProviderRegistry } from './providers/provider.registry';
import { GatewayMerchantService } from './merchants/gateway-merchant.service';
import { GatewayOrderService } from './orders/gateway-order.service';
import { GatewayPaymentService } from './payments/gateway-payment.service';
import { GatewayLedgerService } from './ledger/gateway-ledger.service';
import { GatewayRefundService } from './refunds/gateway-refund.service';
import { GatewayWebhookService } from './webhooks/gateway-webhook.service';
import { GatewayFraudService } from './fraud/gateway-fraud.service';
import { GatewayReconciliationService } from './reconciliation/gateway-reconciliation.service';
import { GatewayAnalyticsService } from './analytics/gateway-analytics.service';
import { GatewayAuditService } from './security/gateway-audit.service';
import { GatewayApiKeyGuard } from './security/gateway-api-key.guard';
import { GatewayPersistenceService } from './database/gateway-persistence.service';

@Global()
@Module({
  controllers: [GatewayController],
  providers: [
    GatewayPersistenceService,
    SimulatedPaymentAdapter,
    MockBankAdapter,
    RazorpaySandboxAdapter,
    ProviderRegistry,
    GatewayMerchantService,
    GatewayOrderService,
    GatewayPaymentService,
    GatewayLedgerService,
    GatewayRefundService,
    GatewayWebhookService,
    GatewayFraudService,
    GatewayReconciliationService,
    GatewayAnalyticsService,
    GatewayAuditService,
    GatewayApiKeyGuard,
  ],
  exports: [
    GatewayPersistenceService,
    SimulatedPaymentAdapter,
    MockBankAdapter,
    RazorpaySandboxAdapter,
    ProviderRegistry,
    GatewayMerchantService,
    GatewayOrderService,
    GatewayPaymentService,
    GatewayLedgerService,
    GatewayRefundService,
    GatewayWebhookService,
    GatewayFraudService,
    GatewayReconciliationService,
    GatewayAnalyticsService,
    GatewayAuditService,
    GatewayApiKeyGuard,
  ],
})
export class GatewayModule {}
