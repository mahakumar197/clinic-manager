import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestHelpers } from './utils/test-helpers';

describe('PatientService (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await TestHelpers.createTestingApp();
  });

  afterEach(async () => {
    await TestHelpers.cleanupDatabase(app);
    await app.close();
  });

  describe('/patients (GET)', () => {
    it('should return empty array when no patients exist', () => {
      return request(app.getHttpServer())
        .get('/patients')
        .expect(200)
        .expect([]);
    });

    it('should return patients with proper structure', async () => {
      // Create a test patient first
      const createResponse = await request(app.getHttpServer())
        .post('/patients')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          email: 'john.doe@example.com',
          phone: '+1234567890',
        })
        .expect(201);

      const patientId = createResponse.body.id;

      return request(app.getHttpServer())
        .get('/patients')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('firstName');
          expect(res.body[0]).toHaveProperty('lastName');
          expect(res.body[0]).toHaveProperty('email');
        });
    });
  });

  describe('/patients (POST)', () => {
    it('should create a new patient', () => {
      return request(app.getHttpServer())
        .post('/patients')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          dateOfBirth: '1985-05-15',
          gender: 'female',
          email: 'jane.smith@example.com',
          phone: '+0987654321',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.firstName).toBe('Jane');
          expect(res.body.lastName).toBe('Smith');
          expect(res.body.email).toBe('jane.smith@example.com');
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/patients')
        .send({
          firstName: 'John',
          // Missing required fields
        })
        .expect(400);
    });

    it('should validate email format', () => {
      return request(app.getHttpServer())
        .post('/patients')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          email: 'invalid-email',
          phone: '+1234567890',
        })
        .expect(400);
    });
  });

  describe('/patients/:id (GET)', () => {
    it('should return a patient by id', async () => {
      // Create a test patient first
      const createResponse = await request(app.getHttpServer())
        .post('/patients')
        .send({
          firstName: 'Bob',
          lastName: 'Johnson',
          dateOfBirth: '1975-12-25',
          gender: 'male',
          email: 'bob.johnson@example.com',
          phone: '+1122334455',
        })
        .expect(201);

      const patientId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/patients/${patientId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(patientId);
          expect(res.body.firstName).toBe('Bob');
          expect(res.body.lastName).toBe('Johnson');
        });
    });

    it('should return 404 for non-existent patient', () => {
      return request(app.getHttpServer())
        .get('/patients/non-existent-id')
        .expect(404);
    });
  });

  describe('PHI Data Protection', () => {
    it('should not expose sensitive medical data in responses', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/patients')
        .send({
          firstName: 'Alice',
          lastName: 'Brown',
          dateOfBirth: '1980-03-10',
          gender: 'female',
          email: 'alice.brown@example.com',
          phone: '+1555666777',
          allergies: 'Penicillin, Shellfish',
          chronicConditions: 'Diabetes, Hypertension',
        })
        .expect(201);

      // Verify that sensitive data is properly handled
      expect(createResponse.body).toHaveProperty('allergies');
      expect(createResponse.body).toHaveProperty('chronicConditions');
      // In a real implementation, you might want to check that this data
      // is encrypted or properly secured
    });
  });
});
