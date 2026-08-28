import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769169433718 implements MigrationInterface {
  name = 'Migration1769169433718';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "approval_admin_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "submission_id" uuid NOT NULL, "comment" text NOT NULL, "commented_by" uuid NOT NULL, "is_active" boolean NOT NULL, "commented_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_34157223a4cdc84521946e1a421" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals_admin" DROP COLUMN "comment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals_admin" DROP COLUMN "commented_by"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "approvals_admin" ADD "commented_by" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals_admin" ADD "comment" jsonb`,
    );
    await queryRunner.query(`DROP TABLE "approval_admin_comments"`);
  }
}
