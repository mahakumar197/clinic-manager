import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768918364116 implements MigrationInterface {
  name = 'Migration1768918364116';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "task_tracks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patient_id" uuid NOT NULL, "task_id" uuid NOT NULL, "track_data" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0ff50004b3c9098f6f6f20db37a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."form_submissions_status_enum" RENAME TO "form_submissions_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."form_submissions_status_enum" AS ENUM('Draft', 'Submitted', 'Approved', 'Rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_submissions" ALTER COLUMN "status" TYPE "public"."form_submissions_status_enum" USING "status"::"text"::"public"."form_submissions_status_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "form_submissions" ALTER COLUMN "status" TYPE "public"."form_submissions_status_enum_old" USING "status"::"text"::"public"."form_submissions_status_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."form_submissions_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."form_submissions_status_enum_old" RENAME TO "form_submissions_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "task_tracks"`);
  }
}
