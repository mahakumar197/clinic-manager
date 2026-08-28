import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestHelpers } from './utils/test-helpers';

describe('IntegrationService (e2e)', () => {
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

  describe('/webhooks (POST)', () => {
    it('should handle webhook payload', () => {
      return request(app.getHttpServer())
        .post('/webhooks')
        .send({
          event: 'test_event',
          data: { id: '123', type: 'test' },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
        });
    });

    it('should validate webhook payload', () => {
      return request(app.getHttpServer())
        .post('/webhooks')
        .send({
          // Invalid payload
          invalidField: 'test',
        })
        .expect(400);
    });
  });

  describe('/zoho (GET)', () => {
    it('should handle Zoho integration endpoints', () => {
      return request(app.getHttpServer()).get('/zoho/status').expect(200);
    });
  });

  describe('Security Validation', () => {
    it('should validate webhook signatures', () => {
      return request(app.getHttpServer())
        .post('/webhooks')
        .set('X-Webhook-Signature', 'invalid-signature')
        .send({
          event: 'test_event',
          data: { id: '123' },
        })
        .expect(401); // Should reject invalid signatures
    });

    it('should prevent unauthorized access to integration endpoints', () => {
      return request(app.getHttpServer())
        .get('/zoho/sensitive-data')
        .expect(401); // Should require authentication
    });
  });
});
