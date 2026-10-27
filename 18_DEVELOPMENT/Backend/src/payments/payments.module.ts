import { Module } from '@nestjs/common';
import {
  PaymentsController,
  BookingsRefundController,
  SupplierPaymentsController,
  AdminFinancialController,
} from './payments.controller';
import { PaymentOrderService } from './services/payment-order.service';
import { PaymentWebhookService } from './services/payment-webhook.service';
import { SandboxPaymentProvider } from './adapters/sandbox-payment.provider';
import { RazorpayPaymentAdapter } from './adapters/payment-gateway.adapter';
import { CustomerInvoiceService } from '../billing/customer-invoice.service';
import { ReceiptService } from '../billing/receipt.service';
import { RefundEngineService } from '../refunds/refund-engine.service';
import { FinancialReconciliationService } from '../reconciliation/financial-reconciliation.service';
import { CommissionEngineService } from '../commissions/commission-engine.service';
import { SupplierSettlementService } from '../settlements/supplier-settlement.service';
import { FinancialLedgerService } from '../ledger/financial-ledger.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, SuppliersModule, AuditModule, NotificationsModule],
  controllers: [
    PaymentsController,
    BookingsRefundController,
    SupplierPaymentsController,
    AdminFinancialController,
  ],
  providers: [
    PaymentOrderService,
    PaymentWebhookService,
    SandboxPaymentProvider,
    RazorpayPaymentAdapter,
    CustomerInvoiceService,
    ReceiptService,
    RefundEngineService,
    FinancialReconciliationService,
    CommissionEngineService,
    SupplierSettlementService,
    FinancialLedgerService,
  ],
  exports: [
    PaymentOrderService,
    PaymentWebhookService,
    SandboxPaymentProvider,
    CustomerInvoiceService,
    ReceiptService,
    RefundEngineService,
    FinancialReconciliationService,
    CommissionEngineService,
    SupplierSettlementService,
    FinancialLedgerService,
  ],
})
export class PaymentsModule {}
