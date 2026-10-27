import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('BharatYatra Admin Portal Security & Authorization (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Unauthenticated & Customer Isolation Tests', () => {
    it('GET /api/v1/admin/dashboard without auth should return 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('GET /api/v1/admin/users without auth should return 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('GET /api/v1/admin/trips with invalid token should return 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/trips')
        .set('Authorization', 'Bearer invalid_customer_or_fake_token')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('2. Admin Authentication & Rate Limiting', () => {
    it('POST /api/v1/admin/auth/login with wrong credentials should return 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/auth/login')
        .send({ username: 'bharatyatra_admin', password: 'wrong_password_123' })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(res.body.message).toContain('Invalid admin credentials');
    });

    it('POST /api/v1/admin/auth/login with correct credentials should return token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/auth/login')
        .send({ username: 'bharatyatra_admin', password: 'BharatYatraAdmin2026!' })
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('token');
      expect(res.body.admin).toHaveProperty('role', 'SUPER_ADMIN');
      adminToken = res.body.token;
    });
  });

  describe('3. Authenticated Admin Operations & Management', () => {
    it('GET /api/v1/admin/dashboard with valid admin token should return 200', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('metrics');
      expect(res.body.metrics).toHaveProperty('totalUsers');
      expect(res.body.metrics).toHaveProperty('totalTrips');
      expect(res.body.metrics).toHaveProperty('totalBookings');
    });

    it('GET /api/v1/admin/users should return paginated users list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('users');
      expect(Array.isArray(res.body.users)).toBe(true);
    });

    it('GET /api/v1/admin/trips should return paginated trips directory', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/trips?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('trips');
      expect(Array.isArray(res.body.trips)).toBe(true);
    });

    it('GET /api/v1/admin/bookings should return paginated bookings directory', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/bookings?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('bookings');
      expect(Array.isArray(res.body.bookings)).toBe(true);
    });

    it('GET /api/v1/admin/audit-logs should return operational audit log trail', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('logs');
      expect(Array.isArray(res.body.logs)).toBe(true);
    });
  });

  describe('4. Session Invalidation & Logout', () => {
    it('POST /api/v1/admin/auth/logout should invalidate admin token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/auth/logout')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      // Subsequent call with invalidated token must be rejected
      await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
