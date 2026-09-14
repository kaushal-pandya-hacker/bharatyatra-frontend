import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { checkDatabaseConnection } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import destinationRoutes from './routes/destinations.routes.js';
import aiRoutes from './routes/ai.routes.js';
import bookingRoutes from './routes/bookings.routes.js';
import tripRoutes from './routes/trips.routes.js';
import paymentRoutes from './routes/payments.routes.js';
import routesRoutes from './routes/routes.routes.js';

const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } }
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'Chalo Farva API Engine',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

// API Routes Mounting
app.use(`${env.API_PREFIX}/auth`, authRoutes);
app.use(`${env.API_PREFIX}/destinations`, destinationRoutes);
app.use(`${env.API_PREFIX}/ai`, aiRoutes);
app.use(`${env.API_PREFIX}/bookings`, bookingRoutes);
app.use(`${env.API_PREFIX}/trips`, tripRoutes);
app.use(`${env.API_PREFIX}/payments`, paymentRoutes);
app.use(`${env.API_PREFIX}/routes`, routesRoutes);

// Global Error Handling
app.use(errorHandler);

// Server initialization
async function bootstrap() {
  await checkDatabaseConnection();
  const PORT = parseInt(env.PORT, 10);
  app.listen(PORT, () => {
    console.log(`[Chalo Farva API Server] Running on http://localhost:${PORT}${env.API_PREFIX}`);
  });
}

bootstrap();
