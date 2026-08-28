import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  name = 'InitialMigration1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "passwordHash" character varying,
        "firstName" character varying,
        "lastName" character varying,
        "phone" character varying,
        "role" character varying NOT NULL DEFAULT 'patient',
        "googleId" character varying,
        "facebookId" character varying,
        "appleId" character varying,
        "refreshToken" character varying,
        "tokenVersion" integer NOT NULL DEFAULT 0,
        "failedLoginAttempts" integer NOT NULL DEFAULT 0,
        "lockedUntil" TIMESTAMP,
        "isActive" boolean NOT NULL DEFAULT true,
        "isEmailVerified" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // Create otps table
    await queryRunner.query(`
      CREATE TABLE "otps" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "code" character varying NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "isUsed" boolean NOT NULL DEFAULT false,
        "attempts" integer NOT NULL DEFAULT 0,
        "ipAddress" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_otps_id" PRIMARY KEY ("id")
      )
    `);

    // Create refresh_tokens table
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "token" text NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "isRevoked" boolean NOT NULL DEFAULT false,
        "deviceInfo" character varying,
        "ipAddress" character varying,
        "userAgent" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id")
      )
    `);

    // Create auth_attempts table
    await queryRunner.query(`
      CREATE TABLE "auth_attempts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid,
        "email" character varying NOT NULL,
        "ipAddress" character varying NOT NULL,
        "userAgent" character varying,
        "isSuccessful" boolean NOT NULL,
        "failureReason" character varying,
        "attemptedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_auth_attempts_id" PRIMARY KEY ("id")
      )
    `);

    // Create audit_logs table
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid,
        "userName" character varying,
        "action" character varying NOT NULL,
        "entityType" character varying NOT NULL,
        "entityId" character varying NOT NULL,
        "oldValue" jsonb,
        "newValue" jsonb,
        "metadata" jsonb,
        "ipAddress" character varying,
        "userAgent" character varying,
        "correlationId" character varying,
        "description" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_users_email" ON "users" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_otps_userId" ON "otps" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_userId" ON "refresh_tokens" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_auth_attempts_email" ON "auth_attempts" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_userId" ON "audit_logs" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_entityType_entityId" ON "audit_logs" ("entityType", "entityId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_createdAt" ON "audit_logs" ("createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_entityType_entityId"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_auth_attempts_email"`);
    await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_otps_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "auth_attempts"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "otps"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
