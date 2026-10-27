import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service.js';
import { authenticateToken } from '../middleware/auth.js';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const checkoutSchema = z.object({
  bookingId: z.string(),
  amountInr: z.number().positive(),
  paymentMethod: z.enum(['UPI', 'NET_BANKING', 'CREDIT_CARD', 'DEBIT_CARD'])
});

router.post('/checkout', authenticateToken, validateBody(checkoutSchema), async (req: Request, res: Response) => {
  const session = await PaymentService.createCheckoutSession(req.body);
  return res.json({
    success: true,
    data: session
  });
});

router.post('/webhook', async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const result = await PaymentService.verifyPaymentWebhook(req.body, signature);
  return res.json({
    success: true,
    data: result
  });
});

export default router;
