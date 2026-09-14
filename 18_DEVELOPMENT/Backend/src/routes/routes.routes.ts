import { Router, Request, Response } from 'express';
import { GeoService } from '../routing/geo.service.js';
import { RoutingService } from '../routing/routing.service.js';

const router = Router();
const geoService = new GeoService();
const routingService = new RoutingService(geoService);

router.get('/distance', (req: Request, res: Response) => {
  const originLat = parseFloat(req.query.originLat as string);
  const originLng = parseFloat(req.query.originLng as string);
  const destLat = parseFloat(req.query.destLat as string);
  const destLng = parseFloat(req.query.destLng as string);

  if (isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng)) {
    return res.status(400).json({
      success: false,
      message: 'Valid originLat, originLng, destLat, and destLng query parameters are required.',
    });
  }

  try {
    geoService.validateCoordinates(originLat, originLng);
    geoService.validateCoordinates(destLat, destLng);
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const distanceKm = geoService.calculateRoadDistanceKm(originLat, originLng, destLat, destLng);
  const haversineKm = geoService.haversineDistanceKm(originLat, originLng, destLat, destLng);

  res.json({
    success: true,
    data: {
      origin: { latitude: originLat, longitude: originLng },
      destination: { latitude: destLat, longitude: destLng },
      straightLineDistanceKm: haversineKm,
      approxRoadDistanceKm: distanceKm,
      unit: 'km',
      disclaimer: 'Distance calculated as approx. road distance based on geographic topology.',
    },
  });
});

router.get('/estimate', async (req: Request, res: Response) => {
  const originLat = parseFloat(req.query.originLat as string);
  const originLng = parseFloat(req.query.originLng as string);
  const destLat = parseFloat(req.query.destLat as string);
  const destLng = parseFloat(req.query.destLng as string);
  const mode = (req.query.mode as string) || 'driving';

  if (isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng)) {
    return res.status(400).json({
      success: false,
      message: 'Valid originLat, originLng, destLat, and destLng query parameters are required.',
    });
  }

  try {
    const result = await routingService.getDistanceAndEstimate(
      { latitude: originLat, longitude: originLng },
      { latitude: destLat, longitude: destLng },
      mode,
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/optimize', async (req: Request, res: Response) => {
  const { origin, stops, mode } = req.body || {};

  if (!origin || !stops || !Array.isArray(stops)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must contain origin object and stops array.',
    });
  }

  try {
    const result = await routingService.optimizeRoute(origin, stops, mode || 'driving');
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
