import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769250767014 implements MigrationInterface {
  name = 'Migration1769250767014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "approval_doctor_quick_response" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "submission_id" uuid NOT NULL, "quick_response" text NOT NULL, "quick_response_by" uuid NOT NULL, "is_active" boolean NOT NULL, "quick_response_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c94b93d93b8569d54da0632962c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "approval_doctor_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "submission_id" uuid NOT NULL, "comment" text NOT NULL, "commented_by" uuid NOT NULL, "is_active" boolean NOT NULL, "commented_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9a9177c622b224031a51c0b1d8e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_approvals" DROP COLUMN "quick_response"`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_approvals" DROP COLUMN "comment"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "form_approvals" ADD "comment" text`);
    await queryRunner.query(
      `ALTER TABLE "form_approvals" ADD "quick_response" text`,
    );
    await queryRunner.query(`DROP TABLE "approval_doctor_comments"`);
    await queryRunner.query(`DROP TABLE "approval_doctor_quick_response"`);
  }
}
