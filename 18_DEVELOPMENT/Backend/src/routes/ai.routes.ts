import { Router, Request, Response } from 'express';
import { AIService } from '../services/ai.service.js';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const generateItinerarySchema = z.object({
  origin: z.string().min(2),
  destinations: z.array(z.string()).min(1),
  startDate: z.string(),
  durationDays: z.number().min(1).max(30),
  travelerCount: z.number().min(1).default(1),
  travelerType: z.enum(['SOLO', 'COUPLE', 'FAMILY', 'FRIENDS']).default('SOLO'),
  budgetTier: z.enum(['BUDGET', 'BALANCED', 'LUXURY']).default('BALANCED'),
  interests: z.array(z.string()).default([]),
  pacePreference: z.enum(['RELAXED', 'MODERATE', 'PACKED']).default('MODERATE')
});

const evaluateReRouteSchema = z.object({
  tripId: z.string(),
  triggerType: z.enum(['WEATHER_ALERT', 'TRAFFIC_DELAY', 'CLOSURE', 'USER_REQUEST']),
  affectedDate: z.string(),
  description: z.string()
});

router.post('/generate-itinerary', validateBody(generateItinerarySchema), async (req: Request, res: Response) => {
  const itinerary = await AIService.generateItinerary(req.body);
  return res.json({
    success: true,
    data: itinerary
  });
});

router.post('/evaluate-reroute', validateBody(evaluateReRouteSchema), async (req: Request, res: Response) => {
  const reRouteResult = await AIService.evaluateAdaptiveReRoute(req.body);
  return res.json({
    success: true,
    data: reRouteResult
  });
});

export default router;
