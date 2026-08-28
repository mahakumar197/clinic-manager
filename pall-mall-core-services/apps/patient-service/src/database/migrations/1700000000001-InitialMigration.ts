import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000001 implements MigrationInterface {
  name = 'InitialMigration1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create patients table
    await queryRunner.query(`
      CREATE TABLE "patients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "dateOfBirth" date NOT NULL,
        "gender" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "alternatePhone" character varying,
        "address" text,
        "city" character varying,
        "state" character varying,
        "country" character varying,
        "zipCode" character varying,
        "bloodGroup" character varying,
        "emergencyContactName" character varying,
        "emergencyContactPhone" character varying,
        "emergencyContactRelation" character varying,
        "allergies" text,
        "chronicConditions" text,
        "currentMedications" text,
        "insuranceProvider" character varying,
        "insurancePolicyNumber" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "assignedDoctorId" character varying,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "UQ_patients_email" UNIQUE ("email"),
        CONSTRAINT "PK_patients_id" PRIMARY KEY ("id")
      )
    `);

    // Create medical_records table
    await queryRunner.query(`
      CREATE TABLE "medical_records" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "patientId" uuid NOT NULL,
        "recordType" character varying NOT NULL,
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "diagnosis" character varying,
        "treatment" text,
        "prescription" text,
        "doctorId" character varying,
        "doctorName" character varying,
        "visitDate" date NOT NULL,
        "attachments" jsonb,
        "labResults" jsonb,
        "notes" text,
        "version" integer NOT NULL DEFAULT 1,
        "previousVersionId" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_medical_records_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_medical_records_patientId" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_patients_email" ON "patients" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_patients_assignedDoctorId" ON "patients" ("assignedDoctorId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_medical_records_patientId" ON "medical_records" ("patientId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_medical_records_visitDate" ON "medical_records" ("visitDate")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_medical_records_visitDate"`);
    await queryRunner.query(`DROP INDEX "IDX_medical_records_patientId"`);
    await queryRunner.query(`DROP INDEX "IDX_patients_assignedDoctorId"`);
    await queryRunner.query(`DROP INDEX "IDX_patients_email"`);
    await queryRunner.query(`DROP TABLE "medical_records"`);
    await queryRunner.query(`DROP TABLE "patients"`);
  }
}
