import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/auth/signup/email (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/signup/email')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'Password@123',
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBeDefined();
        });
    });

    it('should reject weak password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/signup/email')
        .send({
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User',
        })
        .expect(400);
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/signup/email')
        .send({
          email: 'invalid-email',
          password: 'Password@123',
          name: 'Test User',
        })
        .expect(400);
    });

    it('should reject duplicate email', async () => {
      const email = `duplicate${Date.now()}@example.com`;

      // First registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/signup/email')
        .send({
          email,
          password: 'Password@123',
          name: 'Test User',
        })
        .expect(201);

      // Duplicate registration
      return request(app.getHttpServer())
        .post('/api/v1/auth/signup/email')
        .send({
          email,
          password: 'Password@123',
          name: 'Test User',
        })
        .expect(400);
    });
  });

  describe('/api/v1/auth/login (POST)', () => {
    const testUser = {
      email: `logintest${Date.now()}@example.com`,
      password: 'Password@123',
      name: 'Login Test',
    };

    beforeAll(async () => {
      // Create test user
      await request(app.getHttpServer())
        .post('/api/v1/auth/signup/email')
        .send(testUser);
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe(testUser.email);
          accessToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
        });
    });

    it('should reject invalid password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword@123',
        })
        .expect(401);
    });

    it('should reject non-existent email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password@123',
        })
        .expect(401);
    });
  });

  describe('/api/v1/auth/refresh (POST)', () => {
    it('should refresh access token with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
        });
    });

    it('should reject invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });
  });

  describe('/api/v1/auth/logout (POST)', () => {
    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({
          refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Logged out successfully');
        });
    });

    it('should reject using the same refresh token after logout', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = [];

      // Make 101 requests (limit is 100)
      for (let i = 0; i < 101; i++) {
        requests.push(request(app.getHttpServer()).get('/api/v1/healthcheck'));
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.some((res) => res.status === 429);

      expect(rateLimited).toBe(true);
    });
  });
});
