import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769670780958 implements MigrationInterface {
  name = 'Migration1769670780958';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."task_submissions_status_enum" AS ENUM('Draft', 'Submitted', 'Approved', 'Rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "task_submissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "submitted_by" character varying, "status" "public"."task_submissions_status_enum" NOT NULL, "submitted_at" TIMESTAMP NOT NULL, "signature_image" text, "is_guest" boolean, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "task_id" uuid, CONSTRAINT "PK_8d19d6b5dd776e373113de50018" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_uploads" ADD "submission_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_esignatures" ADD "submission_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "forms" ADD "eSignature_required" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forms" DROP COLUMN "eSignature_required"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_esignatures" DROP COLUMN "submission_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_uploads" DROP COLUMN "submission_id"`,
    );
    await queryRunner.query(`DROP TABLE "task_submissions"`);
    await queryRunner.query(
      `DROP TYPE "public"."task_submissions_status_enum"`,
    );
  }
}
