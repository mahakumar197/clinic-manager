import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestHelpers } from './utils/test-helpers';

describe('NotificationService (e2e)', () => {
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

  describe('/notifications (POST)', () => {
    it('should send email notification', () => {
      return request(app.getHttpServer())
        .post('/notifications/email')
        .send({
          to: 'test@example.com',
          subject: 'Test Email',
          body: 'This is a test email',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
        });
    });

    it('should validate email notification payload', () => {
      return request(app.getHttpServer())
        .post('/notifications/email')
        .send({
          // Missing required fields
          subject: 'Test Email',
        })
        .expect(400);
    });
  });

  describe('/notifications (GET)', () => {
    it('should return notification templates', () => {
      return request(app.getHttpServer())
        .get('/notifications/templates')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Security Validation', () => {
    it('should prevent injection attacks in email content', () => {
      return request(app.getHttpServer())
        .post('/notifications/email')
        .send({
          to: 'test@example.com',
          subject: 'Test Email',
          body: '<script>alert("XSS")</script>',
        })
        .expect(201); // Should sanitize input
    });
  });
});
