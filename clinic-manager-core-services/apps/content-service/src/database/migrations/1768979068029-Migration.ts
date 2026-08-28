import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768979068029 implements MigrationInterface {
  name = 'Migration1768979068029';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."form_approvals_status_enum" AS ENUM('Approved', 'Rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "form_approvals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "submission_id" uuid NOT NULL, "form_id" uuid NOT NULL, "approved_by" uuid, "status" "public"."form_approvals_status_enum", "comment" text, "quick_response" text, "reviewed_at" TIMESTAMP NOT NULL, "approved_at" TIMESTAMP, "rejected_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba856a3ea5032b4970a3b232c33" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "form_approvals"`);
    await queryRunner.query(`DROP TYPE "public"."form_approvals_status_enum"`);
  }
}
