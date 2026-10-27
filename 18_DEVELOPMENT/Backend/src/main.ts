import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Trust Proxy configuration for secure client IP derivation
  const expressApp = app.getHttpAdapter().getInstance();
  const trustProxy = process.env.TRUST_PROXY || 'loopback, linklocal, uniquelocal';
  expressApp.set('trust proxy', trustProxy);

  // Graceful shutdown hooks for database & cache draining
  app.enableShutdownHooks();

  // Resource Exhaustion Defense: Enforce bounded JSON & URL-encoded payload sizes
  // Captures rawBody buffer for cryptographic webhook HMAC signature verification
  const maxBodyLimit = process.env.MAX_REQUEST_BODY_SIZE || '1mb';
  app.use(
    json({
      limit: maxBodyLimit,
      verify: (req: any, _res: any, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(urlencoded({ extended: true, limit: maxBodyLimit }));

  // Enhanced Security Headers Middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      frameguard: { action: 'deny' },
      noSniff: true,
      xssFilter: true,
      hidePoweredBy: true,
    }),
  );

  // Origin Shielding & Anti-Bypass Middleware:
  // When ORIGIN_VERIFY_SECRET is configured, require verified edge header to prevent direct origin access
  const originVerifySecret = process.env.ORIGIN_VERIFY_SECRET;
  app.use((req: any, res: any, next: any) => {
    // 1. Enforce strict anti-caching on dynamic API responses to prevent proxy data leakage
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Surrogate-Control', 'no-store');

    // 2. Origin Shielding check if active
    if (originVerifySecret) {
      const path = req.path || req.url || '';
      if (path === '/health' || path === '/api/v1/health') {
        return next();
      }
      const headerSecret = req.headers['x-origin-verify'] || req.headers['cf-origin-token'];
      if (headerSecret !== originVerifySecret) {
        logger.warn(`[Origin Shield] Blocked direct unverified origin request from: ${req.ip || req.socket?.remoteAddress}`);
        return res.status(403).json({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Direct origin access prohibited. Requests must route through approved edge infrastructure.',
        });
      }
    }
    next();
  });

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000,http://127.0.0.1:3000').split(',').map(s => s.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some(o => origin === o || origin.startsWith(o)) ||
        origin.includes('localhost') || 
        origin.includes('127.0.0.1');

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`[CORS Boundary] Blocked unapproved request origin: ${origin}`);
        callback(new Error(`CORS policy violation for origin: ${origin}`), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'x-admin-token', 'x-admin-key', 'x-correlation-id', 'x-user-id', 'x-guest-session', 'x-eval-test-token'],
  });

  // Global Prefix
  const apiPrefix = process.env.API_PREFIX || '/api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Global Input Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('BharatYatra Master API Engine')
    .setDescription('Production NestJS API Engine powering Gujarat\'s first AI travel platform.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = process.env.PORT || 4000;
  const server = await app.listen(port);

  // Slowloris & Request Starvation Defense: Bounded connection and header timeouts
  server.headersTimeout = parseInt(process.env.HEADERS_TIMEOUT_MS || '20000', 10);
  server.requestTimeout = parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10);
  server.keepAliveTimeout = parseInt(process.env.KEEPALIVE_TIMEOUT_MS || '5000', 10);

  logger.log(`[BharatYatra NestJS Backend] Server running at http://localhost:${port}${apiPrefix}`);
  logger.log(`[Swagger API Documentation] Accessible at http://localhost:${port}${apiPrefix}/docs`);
}

bootstrap();
