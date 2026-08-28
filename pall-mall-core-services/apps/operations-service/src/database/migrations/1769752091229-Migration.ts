import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769752091229 implements MigrationInterface {
  name = 'Migration1769752091229';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "patient_phase_id" integer`,
    );

    await queryRunner.query(`
            CREATE TABLE "patient_information" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "patient_id" uuid NOT NULL,
                "doctor_id" uuid,
                "coordinator_id" uuid,
                "procedureName" text,
                "hospitalName" text,
                "meta_data" jsonb,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_patient_information" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_patient_information_patient_id" UNIQUE ("patient_id")
            )
        `);

    await queryRunner.query(
      `ALTER TABLE "patient_information" ADD CONSTRAINT "FK_patient_information_patient" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_information" ADD CONSTRAINT "FK_patient_information_doctor" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_information" ADD CONSTRAINT "FK_patient_information_coordinator" FOREIGN KEY ("coordinator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patient_information" DROP CONSTRAINT "FK_patient_information_coordinator"`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_information" DROP CONSTRAINT "FK_patient_information_doctor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_information" DROP CONSTRAINT "FK_patient_information_patient"`,
    );
    await queryRunner.query(`DROP TABLE "patient_information"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "patient_phase_id"`,
    );
  }
}
