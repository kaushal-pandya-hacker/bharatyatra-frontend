import { Router, Request, Response } from 'express';
import { BookingService } from '../services/booking.service.js';
import { authenticateToken } from '../middleware/auth.js';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const createBookingSchema = z.object({
  tripId: z.string().optional(),
  bookingType: z.enum(['BUS', 'HOTEL', 'ACTIVITY', 'PACKAGE']),
  providerId: z.string(),
  itemDetails: z.record(z.any()),
  amountInr: z.number().positive()
});

router.post('/', authenticateToken, validateBody(createBookingSchema), async (req: Request, res: Response) => {
  const userId = req.user?.id || 'usr_anonymous';
  const booking = await BookingService.createBooking({
    userId,
    ...req.body
  });

  return res.status(201).json({
    success: true,
    data: booking
  });
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const booking = await BookingService.getBookingById(id);
  return res.json({
    success: true,
    data: booking
  });
});

export default router;
