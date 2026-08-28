import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1770374396207 implements MigrationInterface {
  name = 'Migration1770374396207';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "form_approvals" DROP COLUMN "approved_by"`,
    );
    await queryRunner.query(`ALTER TABLE "form_approvals" ADD "task_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "form_approvals" ADD "reviewed_by" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_doctor_comments" ADD "task_submission_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_approvals" ALTER COLUMN "form_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "form_approvals" ALTER COLUMN "form_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_doctor_comments" DROP COLUMN "task_submission_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_approvals" DROP COLUMN "reviewed_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_approvals" DROP COLUMN "task_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_approvals" ADD "approved_by" uuid`,
    );
  }
}
