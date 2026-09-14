import { Router, Request, Response } from 'express';
import { DestinationService } from '../services/destination.service.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { region, category, search, limit, offset } = req.query;

  const destinations = await DestinationService.getDestinations({
    region: region as string,
    category: category as string,
    search: search as string,
    limit: limit ? parseInt(limit as string, 10) : 20,
    offset: offset ? parseInt(offset as string, 10) : 0
  });

  return res.json({
    success: true,
    data: destinations,
    meta: {
      count: destinations.length,
      limit: limit ? parseInt(limit as string, 10) : 20,
      offset: offset ? parseInt(offset as string, 10) : 0
    }
  });
});

router.get('/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const destination = await DestinationService.getDestinationBySlug(slug);

  if (!destination) {
    return res.status(404).json({
      success: false,
      error: { code: 'DESTINATION_NOT_FOUND', message: `Destination with slug '${slug}' not found` }
    });
  }

  return res.json({
    success: true,
    data: destination
  });
});

export default router;
