import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765363106413 implements MigrationInterface {
  name = 'Migration1765363106413';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_activity" ALTER COLUMN "performedBy" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ALTER COLUMN "assignedBy" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ALTER COLUMN "assignedBy" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ALTER COLUMN "performedBy" DROP NOT NULL`,
    );
  }
}
