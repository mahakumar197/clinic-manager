import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1770284690928 implements MigrationInterface {
  name = 'Migration1770284690928';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "approvals_admin" ADD "task_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "approval_admin_comments" ADD "task_submission_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_admin_comments" ALTER COLUMN "submission_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "approval_admin_comments" ALTER COLUMN "submission_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_admin_comments" DROP COLUMN "task_submission_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals_admin" DROP COLUMN "task_id"`,
    );
  }
}
