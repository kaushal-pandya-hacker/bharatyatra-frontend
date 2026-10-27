import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: [
      {
        id: 'trip_saurashtra_123',
        title: '5-Day Saurashtra Heritage & Coastal Tour',
        startDate: '2026-10-15',
        endDate: '2026-10-20',
        status: 'CONFIRMED',
        travelerCount: 2,
        totalBudgetInr: 28500,
        destinations: ['Somnath Temple', 'Gir National Park', 'Dwarka']
      }
    ]
  });
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  return res.json({
    success: true,
    data: {
      id,
      title: '5-Day Saurashtra Heritage & Coastal Tour',
      startDate: '2026-10-15',
      endDate: '2026-10-20',
      status: 'CONFIRMED',
      travelerCount: 2,
      totalBudgetInr: 28500,
      destinations: ['Somnath Temple', 'Gir National Park', 'Dwarka'],
      itineraryVersion: 1
    }
  });
});

export default router;
