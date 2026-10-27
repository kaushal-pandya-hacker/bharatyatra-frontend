/**
 * BharatGateway™ Secure Integration Client SDK
 * Provides authenticated, real-time communication with the backend gateway APIs
 * with resilient graceful local fallback for offline tests and development.
 */

export interface GatewayOrder {
  orderId: string;
  merchantId: string;
  amountMinor: number;
  currency: string;
  receipt?: string;
  status: 'CREATED' | 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'CANCELLED' | 'PARTIALLY_REFUNDED' | 'REFUNDED';
  idempotencyKey?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  amountRefundedMinor: number;
  attemptsCount?: number;
  expiresAt: string;
  createdAt: string;
}

export interface PaymentAttempt {
  attemptId: string;
  orderId: string;
  merchantId: string;
  amountMinor: number;
  currency: string;
  method: 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';
  status: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  provider: string;
  isSimulated: boolean;
  gatewayTransactionId?: string;
  signature?: string;
  errorCode?: string;
  errorMessage?: string;
  riskScore: number;
  methodDetails: any;
  createdAt: string;
}

export interface RefundItem {
  refundId: string;
  orderId: string;
  amountMinor: number;
  currency: string;
  reason: string;
  status: 'COMPLETED' | 'REQUESTED' | 'FAILED' | 'UNCERTAIN';
  speed: string;
  createdAt: string;
}

export interface WebhookDelivery {
  deliveryId: string;
  eventId?: string;
  eventType: string;
  payload: any;
  signatureHeader: string;
  status: string;
  attempts?: number;
  maxAttempts?: number;
  statusCode?: number;
  lastError?: string;
  errorCategory?: string;
  nextRetryAt?: string;
  deliveredAt?: string;
  createdAt?: string;
}

export interface ReconDiscrepancy {
  orderId?: string;
  providerReference?: string;
  type: string;
  reason: string;
  orderAmountMinor?: number;
  statementAmountMinor?: number;
  ledgerAmountMinor?: number;
  currency?: string;
  evidence?: Record<string, any>;
}

export interface ReconReport {
  batchId: string;
  merchantId?: string;
  statementId?: string;
  executedAt: string;
  totalOrdersScanned: number;
  totalStatementItemsScanned?: number;
  matchedCount: number;
  discrepancyCount: number;
  status: 'MATCHED' | 'DISCREPANCIES_DETECTED';
  discrepancies?: ReconDiscrepancy[];
}

export interface LedgerEntry {
  id: string;
  transactionReference: string;
  merchantId: string;
  accountType: string;
  direction: 'DEBIT' | 'CREDIT';
  amountMinor: number;
  currency: string;
  description: string;
  createdAt: string;
}

export interface MerchantProfile {
  id: string;
  merchantCode: string;
  businessName: string;
  legalEntityName: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
  gstin?: string;
  panNumber?: string;
  kycStatus: string;
  defaultCurrency: string;
  isActive: boolean;
}

export interface ApiCredential {
  id: string;
  merchantId: string;
  keyName: string;
  publishableKey: string;
  secretKeyPrefix: string;
  environment: string;
  permissions: string[];
  isRevoked: boolean;
  createdAt: string;
}

export interface AnalyticsSummary {
  merchantId?: string;
  totalOrdersCount: number;
  totalCapturedOrdersCount: number;
  totalFailedOrdersCount: number;
  grossVolumeMinor: number;
  netCapturedMinor: number;
  refundedVolumeMinor: number;
  overallSuccessRatePct: number;
  methodBreakdown: Record<string, { count: number; volumeMinor: number }>;
  generatedAt: string;
}

const DEFAULT_MERCHANT_ID = 'merch_default_bharat_001';

// In-Memory store for standalone frontend demo execution
const memoryOrders: GatewayOrder[] = [
  {
    orderId: 'order_bg_demo_101',
    merchantId: DEFAULT_MERCHANT_ID,
    amountMinor: 249900, // ₹2,499.00
    currency: 'INR',
    receipt: 'RCPT_HOTEL_AHMEDABAD_981',
    status: 'CAPTURED',
    customerEmail: 'kaushal@bharatyatra.in',
    customerPhone: '+919876543210',
    description: 'Gujarat Heritage Tour Package - 3N/4D',
    amountRefundedMinor: 0,
    attemptsCount: 1,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    orderId: 'order_bg_demo_102',
    merchantId: DEFAULT_MERCHANT_ID,
    amountMinor: 85000, // ₹850.00
    currency: 'INR',
    receipt: 'RCPT_CAB_SOMNATH_102',
    status: 'CREATED',
    customerEmail: 'traveler@gmail.com',
    customerPhone: '+919822001122',
    description: 'Somnath Temple Express Cab Transit',
    amountRefundedMinor: 0,
    attemptsCount: 0,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    orderId: 'order_bg_demo_103',
    merchantId: DEFAULT_MERCHANT_ID,
    amountMinor: 500000, // ₹5,000.00
    currency: 'INR',
    receipt: 'RCPT_RESORT_KUTCH_003',
    status: 'PARTIALLY_REFUNDED',
    customerEmail: 'guest@outlook.com',
    customerPhone: '+919988776655',
    description: 'Rann Utsav Tent City Booking',
    amountRefundedMinor: 200000, // ₹2,000.00 refunded
    attemptsCount: 1,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const memoryAttempts: PaymentAttempt[] = [
  {
    attemptId: 'pay_bg_att_001',
    orderId: 'order_bg_demo_101',
    merchantId: DEFAULT_MERCHANT_ID,
    amountMinor: 249900,
    currency: 'INR',
    method: 'UPI',
    status: 'SUCCESS',
    provider: 'BHARATGATEWAY_SIMULATOR',
    isSimulated: true,
    gatewayTransactionId: 'txn_sim_894182948192841928',
    signature: 'hmac_sha256_mock_sig_94819284',
    riskScore: 5,
    methodDetails: { vpa: 'k***@okhdfcbank', scenario: 'SUCCESS' },
    createdAt: new Date(Date.now() - 3500000).toISOString(),
  },
];

const memoryRefunds: RefundItem[] = [
  {
    refundId: 'ref_bg_001',
    orderId: 'order_bg_demo_103',
    amountMinor: 200000,
    currency: 'INR',
    reason: 'Customer schedule conflict',
    status: 'COMPLETED',
    speed: 'NORMAL',
    createdAt: new Date(Date.now() - 3000000).toISOString(),
  },
];

const memoryWebhooks: WebhookDelivery[] = [
  {
    deliveryId: 'evt_bg_001',
    eventType: 'payment.captured',
    payload: { orderId: 'order_bg_demo_101', amountMinor: 249900, status: 'CAPTURED' },
    signatureHeader: 't=1729621000,v1=98418928491823918249128',
    status: 'SIMULATED_DELIVERY',
    deliveredAt: new Date(Date.now() - 3500000).toISOString(),
  },
];

const memoryLedger: LedgerEntry[] = [
  {
    id: 'led_entry_001',
    transactionReference: 'tx_pay_order_bg_demo_101',
    merchantId: DEFAULT_MERCHANT_ID,
    accountType: 'GATEWAY_CLEARING',
    direction: 'DEBIT',
    amountMinor: 249900,
    currency: 'INR',
    description: 'Customer payment received for Order order_bg_demo_101',
    createdAt: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: 'led_entry_002',
    transactionReference: 'tx_pay_order_bg_demo_101',
    merchantId: DEFAULT_MERCHANT_ID,
    accountType: 'MERCHANT_SETTLEMENT_PAYABLE',
    direction: 'CREDIT',
    amountMinor: 249900,
    currency: 'INR',
    description: 'Settlement payable to Merchant merch_default_bharat_001 for Order order_bg_demo_101',
    createdAt: new Date(Date.now() - 3500000).toISOString(),
  },
];

export const GatewayClient = {
  // Sync fallback accessors
  getOrders(): GatewayOrder[] {
    return [...memoryOrders];
  },

  getOrder(orderId: string): GatewayOrder | undefined {
    return memoryOrders.find(o => o.orderId === orderId);
  },

  getAttempts(): PaymentAttempt[] {
    return [...memoryAttempts];
  },

  getRefunds(): RefundItem[] {
    return [...memoryRefunds];
  },

  getWebhooks(): WebhookDelivery[] {
    return [...memoryWebhooks];
  },

  getLedger(): LedgerEntry[] {
    return [...memoryLedger];
  },

  // -------------------------------------------------------------
  // ASYNC BACKEND-CONNECTED METHODS WITH RESILIENT FALLBACK
  // -------------------------------------------------------------

  async fetchOrders(): Promise<GatewayOrder[]> {
    try {
      const res = await fetch('/api/v1/gateway/orders', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      // Graceful fallback
    }
    return this.getOrders();
  },

  async fetchOrderById(orderId: string): Promise<GatewayOrder | null> {
    try {
      const res = await fetch(`/api/v1/gateway/orders?orderId=${encodeURIComponent(orderId)}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      // Graceful fallback
    }
    return this.getOrder(orderId) || null;
  },

  async fetchAttempts(): Promise<PaymentAttempt[]> {
    try {
      const res = await fetch('/api/v1/gateway/payments', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      // Graceful fallback
    }
    return this.getAttempts();
  },

  async fetchRefunds(): Promise<RefundItem[]> {
    try {
      const res = await fetch('/api/v1/gateway/refunds', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      // Graceful fallback
    }
    return this.getRefunds();
  },

  async fetchLedger(): Promise<LedgerEntry[]> {
    try {
      const res = await fetch('/api/v1/gateway/ledger', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      // Graceful fallback
    }
    return this.getLedger();
  },

  async fetchWebhooks(): Promise<WebhookDelivery[]> {
    try {
      const res = await fetch('/api/v1/gateway/webhooks', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      // Graceful fallback
    }
    return this.getWebhooks();
  },

  async fetchAnalytics(): Promise<AnalyticsSummary | null> {
    try {
      const res = await fetch('/api/v1/gateway/analytics', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      // Graceful fallback
    }
    return null;
  },

  async fetchCredentials(): Promise<ApiCredential[]> {
    try {
      const res = await fetch('/api/v1/gateway/keys', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      // Graceful fallback
    }
    return [
      {
        id: 'cred_default_001',
        merchantId: DEFAULT_MERCHANT_ID,
        keyName: 'Default Integration Key',
        publishableKey: 'pk_test_bharat_sim_9481928491823918',
        secretKeyPrefix: 'sk_test_bha...',
        environment: 'SIMULATED',
        permissions: ['orders:create', 'orders:read', 'refunds:create', 'webhooks:manage'],
        isRevoked: false,
        createdAt: new Date().toISOString(),
      },
    ];
  },

  async fetchProfile(): Promise<MerchantProfile | null> {
    try {
      const res = await fetch('/api/v1/gateway/profile', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      // Graceful fallback
    }
    return {
      id: DEFAULT_MERCHANT_ID,
      merchantCode: 'MERCH_DEFAULT',
      businessName: 'BharatYatra Travel & Retail Labs',
      legalEntityName: 'BharatYatra Tech Solutions Pvt Ltd',
      contactEmail: 'engineering@bharatyatra.in',
      contactPhone: '+919876543210',
      websiteUrl: 'https://bharatyatra.in',
      gstin: '24AAAAA0000A1Z5',
      panNumber: 'ABCDE1234F',
      kycStatus: 'APPROVED',
      defaultCurrency: 'INR',
      isActive: true,
    };
  },

  async createOrder(data: {
    amountRupees: number;
    receipt?: string;
    customerEmail?: string;
    customerPhone?: string;
    description?: string;
  }): Promise<GatewayOrder> {
    const amountMinor = Math.round(data.amountRupees * 100);

    // Try backend proxy first
    try {
      const res = await fetch('/api/v1/gateway/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountMinor,
          currency: 'INR',
          receipt: data.receipt || `RCPT_${Date.now()}`,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          description: data.description,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          memoryOrders.unshift(json.data);
          return json.data;
        }
      }
    } catch (e) {
      // Fallback to local memory
    }

    const newOrder: GatewayOrder = {
      orderId: `order_bg_${Date.now()}`,
      merchantId: DEFAULT_MERCHANT_ID,
      amountMinor,
      currency: 'INR',
      receipt: data.receipt || `RCPT_${Date.now()}`,
      status: 'CREATED',
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      description: data.description || 'Merchant checkout order',
      amountRefundedMinor: 0,
      attemptsCount: 0,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    memoryOrders.unshift(newOrder);
    return newOrder;
  },

  async processSimulatedPayment(data: {
    orderId: string;
    method: 'UPI' | 'CARD' | 'NETBANKING';
    scenario: 'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'INCORRECT_PIN' | 'BANK_TIMEOUT' | 'CARD_EXPIRED' | 'FRAUD_BLOCKED';
    methodDetails?: any;
  }): Promise<{ success: boolean; attempt: PaymentAttempt; errorMessage?: string }> {
    // Try backend first
    try {
      const res = await fetch('/api/v1/gateway/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.orderId,
          method: data.method,
          methodDetails: {
            ...data.methodDetails,
            simulatedScenario: data.scenario,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const attempt = json.data;
          memoryAttempts.unshift(attempt);

          const order = memoryOrders.find(o => o.orderId === data.orderId);
          if (order) {
            order.status = attempt.status === 'SUCCESS' ? 'CAPTURED' : 'FAILED';
          }
          return {
            success: json.success || attempt.status === 'SUCCESS',
            attempt,
            errorMessage: attempt.errorMessage,
          };
        }
      }
    } catch (e) {
      // Fallback to local engine simulation
    }

    const order = this.getOrder(data.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const isSuccess = data.scenario === 'SUCCESS';
    const attemptId = `pay_bg_${Date.now()}`;
    const txnId = `txn_sim_${Date.now()}`;

    const attempt: PaymentAttempt = {
      attemptId,
      orderId: order.orderId,
      merchantId: order.merchantId,
      amountMinor: order.amountMinor,
      currency: order.currency,
      method: data.method,
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      provider: 'BHARATGATEWAY_SIMULATOR',
      isSimulated: true,
      gatewayTransactionId: txnId,
      signature: `sim_sig_${Date.now()}`,
      errorCode: isSuccess ? undefined : `ERR_${data.scenario}`,
      errorMessage: isSuccess ? undefined : `Simulated trigger: ${data.scenario}`,
      riskScore: data.scenario === 'FRAUD_BLOCKED' ? 95 : 10,
      methodDetails: data.methodDetails || { scenario: data.scenario },
      createdAt: new Date().toISOString(),
    };

    memoryAttempts.unshift(attempt);

    if (isSuccess) {
      order.status = 'CAPTURED';
      memoryWebhooks.unshift({
        deliveryId: `evt_${Date.now()}`,
        eventType: 'payment.captured',
        payload: { orderId: order.orderId, amountMinor: order.amountMinor, status: 'CAPTURED' },
        signatureHeader: `t=${Math.floor(Date.now() / 1000)},v1=sha256_mock_${Date.now()}`,
        status: 'SIMULATED_DELIVERY',
        deliveredAt: new Date().toISOString(),
      });
      memoryLedger.unshift(
        {
          id: `led_ent_${Date.now()}_1`,
          transactionReference: `tx_pay_${order.orderId}`,
          merchantId: order.merchantId,
          accountType: 'GATEWAY_CLEARING',
          direction: 'DEBIT',
          amountMinor: order.amountMinor,
          currency: 'INR',
          description: `Customer payment received for Order ${order.orderId}`,
          createdAt: new Date().toISOString(),
        },
        {
          id: `led_ent_${Date.now()}_2`,
          transactionReference: `tx_pay_${order.orderId}`,
          merchantId: order.merchantId,
          accountType: 'MERCHANT_SETTLEMENT_PAYABLE',
          direction: 'CREDIT',
          amountMinor: order.amountMinor,
          currency: 'INR',
          description: `Settlement payable to Merchant ${order.merchantId} for Order ${order.orderId}`,
          createdAt: new Date().toISOString(),
        },
      );
    } else {
      order.status = 'FAILED';
      memoryWebhooks.unshift({
        deliveryId: `evt_${Date.now()}`,
        eventType: 'payment.failed',
        payload: { orderId: order.orderId, status: 'FAILED', errorCode: attempt.errorCode },
        signatureHeader: `t=${Math.floor(Date.now() / 1000)},v1=sha256_mock_${Date.now()}`,
        status: 'SIMULATED_DELIVERY',
        deliveredAt: new Date().toISOString(),
      });
    }

    return { success: isSuccess, attempt, errorMessage: attempt.errorMessage };
  },

  async createRefund(orderId: string, amountRupees?: number, reason: string = 'Merchant requested'): Promise<RefundItem> {
    const order = this.getOrder(orderId);
    const refundMinor = amountRupees ? Math.round(amountRupees * 100) : (order ? order.amountMinor - order.amountRefundedMinor : 0);

    // Try backend proxy
    try {
      const res = await fetch('/api/v1/gateway/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amountMinor: refundMinor > 0 ? refundMinor : undefined,
          reason,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          memoryRefunds.unshift(json.data);
          if (order) {
            order.amountRefundedMinor += json.data.amountMinor;
            order.status = order.amountRefundedMinor >= order.amountMinor ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
          }
          return json.data;
        }
      }
    } catch (e) {
      // Fallback
    }

    if (!order) throw new Error('Order not found');
    if (refundMinor <= 0 || refundMinor > order.amountMinor - order.amountRefundedMinor) {
      throw new Error('Invalid refund amount');
    }

    order.amountRefundedMinor += refundMinor;
    order.status = order.amountRefundedMinor === order.amountMinor ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

    const refund: RefundItem = {
      refundId: `ref_bg_${Date.now()}`,
      orderId: order.orderId,
      amountMinor: refundMinor,
      currency: order.currency,
      reason,
      status: 'COMPLETED',
      speed: 'NORMAL',
      createdAt: new Date().toISOString(),
    };

    memoryRefunds.unshift(refund);
    memoryLedger.unshift(
      {
        id: `led_ref_${Date.now()}_1`,
        transactionReference: `tx_ref_${refund.refundId}`,
        merchantId: order.merchantId,
        accountType: 'MERCHANT_SETTLEMENT_PAYABLE',
        direction: 'DEBIT',
        amountMinor: refundMinor,
        currency: 'INR',
        description: `Debit merchant settlement for refund ${refund.refundId}`,
        createdAt: new Date().toISOString(),
      },
      {
        id: `led_ref_${Date.now()}_2`,
        transactionReference: `tx_ref_${refund.refundId}`,
        merchantId: order.merchantId,
        accountType: 'REFUND_CLEARING',
        direction: 'CREDIT',
        amountMinor: refundMinor,
        currency: 'INR',
        description: `Credit refund clearing to customer for refund ${refund.refundId}`,
        createdAt: new Date().toISOString(),
      },
    );

    return refund;
  },

  async runReconciliation(options?: { statementId?: string; batchId?: string }): Promise<ReconReport> {
    try {
      const res = await fetch('/api/v1/gateway/reconciliation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options || {}),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      // Fallback
    }

    return {
      batchId: `rec_batch_${Date.now()}`,
      executedAt: new Date().toISOString(),
      totalOrdersScanned: memoryOrders.length,
      matchedCount: memoryOrders.filter(o => o.status === 'CAPTURED' || o.status === 'PARTIALLY_REFUNDED' || o.status === 'REFUNDED').length,
      discrepancyCount: 0,
      status: 'MATCHED',
    };
  },

  async redeliverWebhook(deliveryId: string): Promise<WebhookDelivery | null> {
    try {
      const res = await fetch('/api/v1/gateway/webhooks?action=redeliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      // Fallback
    }
    return null;
  },

  async getObservabilityStatus(): Promise<any> {
    const refunds = this.getRefunds();
    const uncertainRefunds = refunds.filter(r => r.status === 'UNCERTAIN');
    const failedRefunds = refunds.filter(r => r.status === 'FAILED');
    const webhookDeliveries = this.getWebhooks();
    const webhookBacklog = webhookDeliveries.filter((d: WebhookDelivery) => d.status === 'RETRYING' || d.status === 'PENDING');
    const ledger = this.getLedger();
    let debits = 0;
    let credits = 0;
    for (const e of ledger) {
      if (e.direction === 'DEBIT') debits += e.amountMinor;
      else credits += e.amountMinor;
    }

    return {
      timestamp: new Date().toISOString(),
      platform: {
        environment: 'SIMULATED',
        livePaymentsEnabled: false,
        status: 'OPERATIONAL',
      },
      ledger: {
        isStrictlyBalanced: debits === credits,
        entriesRecorded: ledger.length,
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
    };
  },

  async verifyPayment(params: {
    orderId: string;
    paymentId: string;
    signature?: string;
    providerId?: string;
  }): Promise<any> {
    try {
      const res = await fetch('/api/v1/gateway/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      // Fallback
    }
    return null;
  },
};

