import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestHelpers } from './utils/test-helpers';

describe('ContentService (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await TestHelpers.createTestingApp();
  });

  afterEach(async () => {
    await TestHelpers.cleanupDatabase(app);
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('/content (GET)', () => {
    it('should return content list', () => {
      return request(app.getHttpServer())
        .get('/content')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/journey (GET)', () => {
    it('should return journey steps', () => {
      return request(app.getHttpServer())
        .get('/journey')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in responses', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          // Check for common security headers
          expect(res.headers).toHaveProperty('x-content-type-options');
          expect(res.headers).toHaveProperty('x-frame-options');
        });
    });
  });
});
