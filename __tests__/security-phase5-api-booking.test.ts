import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

describe('Phase 5 Security Tests - API Security, Object-Level Authorization, Booking Integrity & Data Validation', () => {
  const rootDir = path.resolve(__dirname, '..');
  const backendDir = path.join(rootDir, '18_DEVELOPMENT', 'Backend');

  describe('1. Object-Level Authorization & IDOR/BOLA Defense', () => {
    it('OrdersController enforces authentication and ownership checks on order retrieval', () => {
      const controllerPath = path.join(backendDir, 'src', 'orders', 'orders.controller.ts');
      const servicePath = path.join(backendDir, 'src', 'orders', 'orders.service.ts');
      assert.ok(fs.existsSync(controllerPath));
      assert.ok(fs.existsSync(servicePath));

      const controllerCode = fs.readFileSync(controllerPath, 'utf8');
      const serviceCode = fs.readFileSync(servicePath, 'utf8');

      // Controller forwards requesting user ID
      assert.ok(controllerCode.includes('userId'), 'OrdersController must extract userId');
      assert.ok(controllerCode.includes('getOrderById(id, userId, isAdmin)'), 'getOrder must forward userId to service');

      // Service enforces ownership match
      assert.ok(
        serviceCode.includes('order.userId !== requestingUserId'),
        'OrdersService must reject cross-user order inspection',
      );
      assert.ok(serviceCode.includes('ForbiddenException'), 'Must throw ForbiddenException on unauthorized access');
    });

    it('OrdersController and Service prevent unauthorized cancellation of other users\' order items', () => {
      const controllerPath = path.join(backendDir, 'src', 'orders', 'orders.controller.ts');
      const servicePath = path.join(backendDir, 'src', 'orders', 'orders.service.ts');
      const controllerCode = fs.readFileSync(controllerPath, 'utf8');
      const serviceCode = fs.readFileSync(servicePath, 'utf8');

      assert.ok(controllerCode.includes('@UseGuards(JwtAuthGuard)'), 'cancelItem must require authentication');
      assert.ok(
        serviceCode.includes('item.order.userId !== requestingUserId'),
        'cancelOrderItem must verify order item belongs to requesting user',
      );
    });

    it('Admin order directory endpoint enforces strict administrative authorization', () => {
      const controllerPath = path.join(backendDir, 'src', 'orders', 'orders.controller.ts');
      const content = fs.readFileSync(controllerPath, 'utf8');

      assert.ok(content.includes('admin/orders'), 'Must define admin/orders route');
      assert.ok(
        content.includes('ForbiddenException') && content.includes('isAdmin'),
        'Admin orders route must verify admin permissions',
      );
    });

    it('CancellationsController purges mock fallback UUID and enforces authentication', () => {
      const controllerPath = path.join(backendDir, 'src', 'cancellations', 'cancellations.controller.ts');
      const content = fs.readFileSync(controllerPath, 'utf8');

      assert.ok(!content.includes('00000000-0000-0000-0000-000000000001'), 'Must NOT contain mock UUID fallback');
      assert.ok(content.includes('UnauthorizedException'), 'Must reject unauthenticated cancellation requests');
    });

    it('RefundsController enforces authentication, booking ownership and max refundable bounds', () => {
      const controllerPath = path.join(backendDir, 'src', 'refunds', 'refunds.controller.ts');
      const content = fs.readFileSync(controllerPath, 'utf8');

      assert.ok(content.includes('@UseGuards(JwtAuthGuard)'), 'Refund request must require authentication');
      assert.ok(content.includes('booking.userId !== userId'), 'Must check booking ownership');
      assert.ok(content.includes('maxRefundable'), 'Must enforce eligible balance limit');
      assert.ok(content.includes('body.amountInr <= 0'), 'Must reject non-positive refund amounts');
    });
  });

  describe('2. Input Validation, Injection & Price Integrity', () => {
    it('Cart DTOs enforce Min(0) non-negative constraint on price snapshots', () => {
      const dtoPath = path.join(backendDir, 'src', 'cart', 'cart.dto.ts');
      const servicePath = path.join(backendDir, 'src', 'cart', 'cart.service.ts');
      const dtoCode = fs.readFileSync(dtoPath, 'utf8');
      const serviceCode = fs.readFileSync(servicePath, 'utf8');

      assert.ok(dtoCode.includes('@Min(0'), 'AddCartItemDto must enforce Min(0) validator');
      assert.ok(serviceCode.includes('dto.priceSnapshot < 0'), 'CartService must reject negative priceSnapshot');
    });

    it('Global ValidationPipe in main.ts enables strict whitelisting and rejects rogue properties', () => {
      const mainPath = path.join(backendDir, 'src', 'main.ts');
      const content = fs.readFileSync(mainPath, 'utf8');

      assert.ok(content.includes('whitelist: true'), 'Must enable whitelist: true');
      assert.ok(content.includes('forbidNonWhitelisted: true'), 'Must enable forbidNonWhitelisted: true');
      assert.ok(content.includes('transform: true'), 'Must enable transform: true');
    });

    it('Booking creation recalculates authoritative pricing from stored inventory on the server', () => {
      const bookingsServicePath = path.join(backendDir, 'src', 'bookings', 'bookings.service.ts');
      const content = fs.readFileSync(bookingsServicePath, 'utf8');

      assert.ok(
        content.includes('subtotal = unitPrice * qty') || content.includes('unitPrice = Number('),
        'Must calculate pricing using database unitPrice rather than client payload',
      );
    });

    it('State Machine enforces valid booking state transitions and prevents direct jumping to CANCELLED', () => {
      const bookingsServicePath = path.join(backendDir, 'src', 'bookings', 'bookings.service.ts');
      const content = fs.readFileSync(bookingsServicePath, 'utf8');

      assert.ok(content.includes("booking.status === 'CANCELLED'"), 'Must check if already cancelled');
      assert.ok(
        content.includes("booking.status === 'COMPLETED'") || content.includes("booking.status === 'EXPIRED'"),
        'Must block cancellation of completed or expired bookings',
      );
    });
  });

  describe('3. Payment Webhook Security & Zero-Mock Enforcement', () => {
    it('PaymentsController and PaymentWebhookService reject mock signatures and length-only checks', () => {
      const controllerPath = path.join(backendDir, 'src', 'payments', 'payments.controller.ts');
      const servicePath = path.join(backendDir, 'src', 'payments', 'services', 'payment-webhook.service.ts');
      const controllerCode = fs.readFileSync(controllerPath, 'utf8');
      const serviceCode = fs.readFileSync(servicePath, 'utf8');

      assert.ok(!controllerCode.includes('mock_sig_valid'), 'mock_sig_valid must be purged from payments.controller.ts');
      assert.ok(!serviceCode.includes('signature.length >= 10'), 'Length-only signature check must be purged');
      assert.ok(serviceCode.includes('crypto.timingSafeEqual'), 'Must use crypto.timingSafeEqual for constant-time check');
    });

    it('PaymentOrderService verifies booking ownership before processing refunds', () => {
      const servicePath = path.join(backendDir, 'src', 'payments', 'services', 'payment-order.service.ts');
      const content = fs.readFileSync(servicePath, 'utf8');

      assert.ok(
        content.includes('booking.userId !== actorId'),
        'processRefund must verify actorId owns booking',
      );
      assert.ok(content.includes('ForbiddenException'), 'Must throw ForbiddenException on refund hijack attempt');
    });
  });

  describe('4. NEXI AI Privacy & Tool Boundary Isolation', () => {
    it('NexiController enforces message length limit and rate limiting', () => {
      const controllerPath = path.join(backendDir, 'src', 'nexi', 'nexi.controller.ts');
      const content = fs.readFileSync(controllerPath, 'utf8');

      assert.ok(content.includes('2000'), 'Must enforce 2000 character message length limit');
      assert.ok(content.includes('@RateLimit('), 'Must enforce rate limiting on chat endpoint');
    });

    it('NexiService queries user context strictly for authenticated userId without direct SQL generation', () => {
      const servicePath = path.join(backendDir, 'src', 'nexi', 'nexi.service.ts');
      const content = fs.readFileSync(servicePath, 'utf8');

      assert.ok(content.includes('buildUserContext(userId)'), 'Must scope context building to userId');
      assert.ok(!content.includes('$queryRawUnsafe'), 'NexiService must NOT execute raw dynamic SQL');
    });
  });
});
