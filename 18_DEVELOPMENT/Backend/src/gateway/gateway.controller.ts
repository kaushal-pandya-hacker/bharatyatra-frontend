import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { GatewayOrderService } from './orders/gateway-order.service';
import { GatewayPaymentService } from './payments/gateway-payment.service';
import { GatewayRefundService } from './refunds/gateway-refund.service';
import { GatewayWebhookService } from './webhooks/gateway-webhook.service';
import { GatewayReconciliationService } from './reconciliation/gateway-reconciliation.service';
import { GatewayAnalyticsService } from './analytics/gateway-analytics.service';
import { GatewayFraudService } from './fraud/gateway-fraud.service';
import { GatewayAuditService } from './security/gateway-audit.service';
import { GatewayMerchantService } from './merchants/gateway-merchant.service';
import { GatewayLedgerService } from './ledger/gateway-ledger.service';
import { GatewayApiKeyGuard } from './security/gateway-api-key.guard';
import { RequirePermissions, RequireSecretKey } from './security/require-permissions.decorator';
import { PaymentMethodType } from './domain/gateway.types';

@ApiTags('BharatGateway — Independent Payment Engine')
@Controller('api/v1/gateway')
export class GatewayController {
  constructor(
    private readonly orderService: GatewayOrderService,
    private readonly paymentService: GatewayPaymentService,
    private readonly refundService: GatewayRefundService,
    private readonly webhookService: GatewayWebhookService,
    private readonly reconciliationService: GatewayReconciliationService,
    private readonly analyticsService: GatewayAnalyticsService,
    private readonly fraudService: GatewayFraudService,
    private readonly auditService: GatewayAuditService,
    private readonly merchantService: GatewayMerchantService,
    private readonly ledgerService: GatewayLedgerService,
  ) {}

  // ----------------------------------------------------------------------------
  // 1. HEALTH & METADATA
  // ----------------------------------------------------------------------------
  @Get('health')
  @ApiOperation({ summary: 'BharatGateway Platform Health & Engine State' })
  getHealth() {
    return {
      status: 'HEALTHY',
      platform: 'BharatGateway™ Independent Fintech Platform',
      version: '1.0.0',
      engineMode: 'SAFE_SIMULATOR',
      providerLockin: 'ZERO (Autonomous)',
      features: {
        integerMinorUnits: true,
        doubleEntryLedger: true,
        hmacWebhooks: true,
        fourWayReconciliation: true,
        fraudDefense: true,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // ----------------------------------------------------------------------------
  // 2. PUBLIC & MERCHANT ONBOARDING
  // ----------------------------------------------------------------------------
  @Post('merchants/register')
  @ApiOperation({ summary: 'Register New Independent Merchant' })
  registerMerchant(@Body() body: any) {
    const result = this.merchantService.createMerchant({
      businessName: body.businessName || 'Demo Merchant Pvt Ltd',
      legalEntityName: body.legalEntityName || body.businessName || 'Demo Merchant Pvt Ltd',
      contactEmail: body.contactEmail || 'merchant@example.com',
      contactPhone: body.contactPhone || '+919999999999',
      websiteUrl: body.websiteUrl,
      gstin: body.gstin,
      panNumber: body.panNumber,
    });

    this.auditService.logEvent({
      actorId: result.merchant.contactEmail,
      actorRole: 'MERCHANT',
      merchantId: result.merchant.id,
      action: 'MERCHANT_REGISTERED',
      resourceType: 'MERCHANT',
      resourceId: result.merchant.id,
      metadata: { businessName: result.merchant.businessName },
    });

    return {
      success: true,
      message: 'Merchant onboarded successfully into BharatGateway simulator.',
      data: result,
    };
  }

  @Get('merchants/profile')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Publishable or Secret Key' })
  getProfile(@Req() req: any) {
    const merchant = this.merchantService.getMerchant(req.merchantId);
    return { success: true, data: merchant };
  }

  @Post('merchants/keys')
  @UseGuards(GatewayApiKeyGuard)
  @RequireSecretKey()
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  generateKeys(@Req() req: any, @Body() body: any) {
    const keys = this.merchantService.generateApiCredentials(
      req.merchantId,
      body.keyName || 'Generated API Key',
      body.permissions,
      body.expiresInDays,
    );
    this.auditService.logEvent({
      actorId: req.merchantId,
      actorRole: 'MERCHANT',
      merchantId: req.merchantId,
      action: 'API_KEY_GENERATED',
      resourceType: 'CREDENTIAL',
      resourceId: keys.credentialId,
      metadata: { keyPrefix: keys.publishableKey.substring(0, 10) },
    });
    return { success: true, data: keys };
  }

  @Post('merchants/keys/revoke')
  @UseGuards(GatewayApiKeyGuard)
  @RequireSecretKey()
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  revokeKey(@Req() req: any, @Body() body: any) {
    if (!body.credentialId) {
      throw new BadRequestException('Missing credentialId to revoke.');
    }
    const revoked = this.merchantService.revokeKey(req.merchantId, body.credentialId);
    this.auditService.logEvent({
      actorId: req.merchantId,
      actorRole: 'MERCHANT',
      merchantId: req.merchantId,
      action: 'API_KEY_REVOKED',
      resourceType: 'CREDENTIAL',
      resourceId: body.credentialId,
      metadata: { credentialId: body.credentialId },
    });
    return { success: true, message: 'API key successfully revoked.' };
  }

  @Get('merchants/keys')
  @UseGuards(GatewayApiKeyGuard)
  @RequireSecretKey()
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  listKeys(@Req() req: any) {
    const keys = this.merchantService.listCredentials(req.merchantId);
    return { success: true, data: keys };
  }

  // ----------------------------------------------------------------------------
  // 3. PAYMENT ORDERS
  // ----------------------------------------------------------------------------
  @Post('orders')
  @UseGuards(GatewayApiKeyGuard)
  @RequireSecretKey()
  @RequirePermissions('orders:create')
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  @ApiOperation({ summary: 'Create Payment Order (Strictly Integer Minor Units: Paise)' })
  async createOrder(@Req() req: any, @Body() body: any, @Headers('x-idempotency-key') idempotencyHeader?: string) {
    const order = await this.orderService.createOrder({
      merchantId: req.merchantId,
      amountMinor: Number(body.amountMinor || body.amount_minor),
      currency: body.currency,
      receipt: body.receipt,
      idempotencyKey: idempotencyHeader || body.idempotencyKey,
      customerId: body.customerId,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      description: body.description,
      returnUrl: body.returnUrl,
      notes: body.notes,
    });

    this.auditService.logEvent({
      actorId: req.merchantId,
      actorRole: 'MERCHANT',
      merchantId: req.merchantId,
      action: 'ORDER_CREATED',
      resourceType: 'ORDER',
      resourceId: order.orderId,
      metadata: { amountMinor: order.amountMinor, currency: order.currency },
    });

    return {
      success: true,
      data: order,
    };
  }

  @Get('orders')
  @UseGuards(GatewayApiKeyGuard)
  @RequirePermissions('orders:read')
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Publishable or Secret Key' })
  listOrders(@Req() req: any) {
    const orders = this.orderService.listOrders(req.merchantId);
    return { success: true, count: orders.length, data: orders };
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Get Order by ID (Sanitized for unauthenticated checkout simulator)' })
  getOrder(@Param('orderId') orderId: string, @Headers('x-api-key') apiKey?: string) {
    const order = this.orderService.getOrder(orderId);

    if (apiKey) {
      try {
        const validation = this.merchantService.validateKey(apiKey);
        if (validation.merchantId === order.merchantId) {
          return { success: true, data: order };
        }
      } catch (e) {
        // Fall through to public sanitized view
      }
    }

    // Public sanitized view: exclude internal merchant notes and sensitive customer phone
    const { notes, customerPhone, ...publicSanitized } = order;
    return {
      success: true,
      data: {
        ...publicSanitized,
        isSimulated: true,
      },
    };
  }

  // ----------------------------------------------------------------------------
  // 4. PAYMENT ATTEMPTS & SIMULATION
  // ----------------------------------------------------------------------------
  @Post('payments/process')
  @ApiOperation({ summary: 'Process Payment via Safe Simulator Engine' })
  async processPayment(@Body() body: any, @Req() req: any) {
    const result = await this.paymentService.processPayment({
      orderId: body.orderId,
      method: body.method || PaymentMethodType.UPI,
      methodDetails: body.methodDetails || { simulatedScenario: body.simulatedScenario || 'SUCCESS' },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'],
    });

    this.auditService.logEvent({
      actorId: 'CUSTOMER_CHECKOUT',
      actorRole: 'CUSTOMER',
      merchantId: result.merchantId,
      action: result.status === 'SUCCESS' ? 'PAYMENT_CAPTURED' : 'PAYMENT_FAILED',
      resourceType: 'PAYMENT',
      resourceId: result.attemptId,
      metadata: {
        orderId: result.orderId,
        amountMinor: result.amountMinor,
        status: result.status,
        method: result.method,
      },
      ipAddress: req.ip,
    });

    return {
      success: result.status === 'SUCCESS',
      data: result,
    };
  }

  @Post('payments/verify')
  @ApiOperation({ summary: 'Authoritative Server-Side Payment Verification & Capture' })
  async verifyPayment(@Body() body: any, @Req() req: any) {
    if (!body.orderId || !body.paymentId) {
      throw new BadRequestException('orderId and paymentId are required for payment verification.');
    }

    const result = await this.paymentService.verifyAndCapturePayment({
      orderId: body.orderId,
      paymentId: body.paymentId,
      signature: body.signature,
      providerId: body.providerId || 'RAZORPAY_SANDBOX',
      merchantId: req.merchantId,
    });

    this.auditService.logEvent({
      actorId: 'SERVER_VERIFICATION',
      actorRole: 'SYSTEM',
      merchantId: result.merchantId,
      action: result.status === 'SUCCESS' ? 'PAYMENT_VERIFIED_CAPTURED' : 'PAYMENT_VERIFICATION_FAILED',
      resourceType: 'PAYMENT',
      resourceId: result.attemptId,
      metadata: {
        orderId: result.orderId,
        paymentId: body.paymentId,
        provider: result.provider,
        status: result.status,
      },
    });

    return {
      success: result.status === 'SUCCESS',
      data: result,
    };
  }

  @Get('payments')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  listPayments(@Req() req: any) {
    const attempts = this.paymentService.listAttempts(req.merchantId);
    return { success: true, count: attempts.length, data: attempts };
  }

  @Get('payments/:attemptId')
  @ApiOperation({ summary: 'Get Payment Attempt Details' })
  getPayment(@Param('attemptId') attemptId: string) {
    const attempt = this.paymentService.getAttempt(attemptId);
    return { success: true, data: attempt };
  }

  // ----------------------------------------------------------------------------
  // 5. REFUNDS
  // ----------------------------------------------------------------------------
  @Post('refunds')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  @ApiOperation({ summary: 'Process Full or Partial Refund with Ledger Reversals' })
  async processRefund(@Req() req: any, @Body() body: any, @Headers('x-idempotency-key') idempHeader?: string) {
    const refund = await this.refundService.processRefund({
      orderId: body.orderId,
      merchantId: req.merchantId,
      amountMinor: body.amountMinor ? Number(body.amountMinor) : undefined,
      reason: body.reason || 'Customer requested refund',
      speed: body.speed || 'NORMAL',
      idempotencyKey: idempHeader || body.idempotencyKey,
    });

    this.auditService.logEvent({
      actorId: req.merchantId,
      actorRole: 'MERCHANT',
      merchantId: req.merchantId,
      action: 'REFUND_PROCESSED',
      resourceType: 'REFUND',
      resourceId: refund.refundId,
      metadata: { orderId: refund.orderId, amountMinor: refund.amountMinor },
    });

    return { success: true, data: refund };
  }

  @Get('refunds')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  listRefunds(@Req() req: any) {
    const refunds = this.refundService.listRefunds(req.merchantId);
    return { success: true, count: refunds.length, data: refunds };
  }

  // ----------------------------------------------------------------------------
  // 6. WEBHOOKS
  // ----------------------------------------------------------------------------
  @Post('webhooks/endpoints')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  registerWebhook(@Req() req: any, @Body() body: any) {
    const endpoint = this.webhookService.registerEndpoint(req.merchantId, body.url, body.events);
    return { success: true, data: endpoint };
  }

  @Get('webhooks/endpoints')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  listWebhooks(@Req() req: any) {
    const endpoints = this.webhookService.getEndpoints(req.merchantId);
    return { success: true, count: endpoints.length, data: endpoints };
  }

  @Get('webhooks/deliveries')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  listWebhookDeliveries(@Req() req: any) {
    const deliveries = this.webhookService.getDeliveryHistory(req.merchantId);
    return { success: true, count: deliveries.length, data: deliveries };
  }

  @Post('webhooks/deliveries/:deliveryId/redeliver')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  @ApiOperation({ summary: 'Trigger Controlled Redelivery of Webhook Event' })
  async redeliverWebhook(@Param('deliveryId') deliveryId: string, @Req() req: any) {
    const delivery = await this.webhookService.retryDelivery(deliveryId, req.merchantId, true);
    return { success: true, data: delivery };
  }

  // ----------------------------------------------------------------------------
  // 7. RECONCILIATION
  // ----------------------------------------------------------------------------
  @Post('reconciliation/run')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  @ApiOperation({ summary: 'Trigger 4-Way Reconciliation Batch Engine' })
  async runReconciliation(@Req() req: any, @Body() body: any) {
    const report = await this.reconciliationService.runReconciliationBatch(
      req.merchantId,
      body?.statementId,
      body?.batchId,
    );
    return { success: true, data: report };
  }

  @Post('reconciliation/statements/simulate')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  @ApiOperation({ summary: 'Generate Simulated External Provider Statement for Testing' })
  generateSimulatedStatement(@Req() req: any, @Body() body: any) {
    const statement = this.reconciliationService.generateSimulatedStatement(req.merchantId, body?.options);
    return { success: true, data: statement };
  }

  @Get('reconciliation/batches')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  listReconciliationBatches(@Req() req: any) {
    const reports = this.reconciliationService.listReports(req.merchantId);
    return { success: true, count: reports.length, data: reports };
  }

  @Get('reconciliation/batches/:batchId')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  getReconciliationBatch(@Param('batchId') batchId: string, @Req() req: any) {
    const report = this.reconciliationService.getReport(batchId, req.merchantId);
    return { success: true, data: report };
  }

  // ----------------------------------------------------------------------------
  // 8. ANALYTICS & AUDIT
  // ----------------------------------------------------------------------------
  @Get('analytics/summary')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  getAnalytics(@Req() req: any) {
    const summary = this.analyticsService.getAnalyticsSummary(req.merchantId);
    return { success: true, data: summary };
  }

  @Get('analytics/export')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  exportCsv(@Req() req: any, @Res() res: Response) {
    const csv = this.analyticsService.generateOrdersCsv(req.merchantId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=orders_${req.merchantId}.csv`);
    return res.status(200).send(csv);
  }

  @Get('fraud/alerts')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  listFraudAlerts(@Req() req: any) {
    const alerts = this.fraudService.getAlerts(req.merchantId);
    return { success: true, count: alerts.length, data: alerts };
  }

  @Get('audit/logs')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  listAuditLogs(@Req() req: any) {
    const logs = this.auditService.getEvents(req.merchantId);
    return { success: true, count: logs.length, data: logs };
  }

  // ----------------------------------------------------------------------------
  // 9. FINANCIAL LEDGER
  // ----------------------------------------------------------------------------
  @Get('ledger/entries')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  @ApiOperation({ summary: 'List Immutable Double-Entry Ledger Entries for Merchant' })
  listLedgerEntries(@Req() req: any) {
    const entries = this.ledgerService.getEntries(req.merchantId);
    return { success: true, count: entries.length, data: entries };
  }

  // ----------------------------------------------------------------------------
  // 10. OBSERVABILITY & SYSTEM RELIABILITY (PHASE 5)
  // ----------------------------------------------------------------------------
  @Get('observability/status')
  @UseGuards(GatewayApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', description: 'Merchant Secret Key' })
  @ApiOperation({ summary: 'Platform Observability, Failure Visibility & Backlog Monitoring' })
  getObservabilityStatus(@Req() req: any) {
    const refunds = this.refundService.listRefunds(req.merchantId);
    const uncertainRefunds = refunds.filter((r: any) => r.status === 'UNCERTAIN');
    const failedRefunds = refunds.filter((r: any) => r.status === 'FAILED');
    const webhookDeliveries = this.webhookService.getDeliveries(req.merchantId);
    const webhookBacklog = webhookDeliveries.filter((d: any) => d.status === 'RETRYING' || d.status === 'PENDING');
    const reconBatches = this.reconciliationService.listReports(req.merchantId);
    const totalDiscrepancies = reconBatches.reduce((acc: number, b: any) => acc + b.discrepancyCount, 0);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      platform: {
        environment: 'SIMULATED',
        livePaymentsEnabled: false,
        status: 'OPERATIONAL',
      },
      ledger: {
        isStrictlyBalanced: this.ledgerService.verifyLedgerBalance(req.merchantId),
        entriesRecorded: this.ledgerService.getEntries(req.merchantId).length,
      },
      refunds: {
        total: refunds.length,
        uncertainPendingRecon: uncertainRefunds.length,
        failed: failedRefunds.length,
      },
      webhooks: {
        totalDeliveries: webhookDeliveries.length,
        retryingBacklog: webhookBacklog.length,
      },
      reconciliation: {
        batchesExecuted: reconBatches.length,
        totalDiscrepanciesDetected: totalDiscrepancies,
      },
    };
  }
}
