import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766046294206 implements MigrationInterface {
  name = 'Migration1766046294206';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_activity" RENAME COLUMN "task_id" TO "taskId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" RENAME COLUMN "task_id" TO "taskId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" RENAME COLUMN "task_id" TO "taskId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" RENAME COLUMN "task_id" TO "taskId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ADD CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD CONSTRAINT "FK_ba265816ca1d93f51083e06c520" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD CONSTRAINT "FK_47d3c46e4edb30cdaf97ccdb8d8" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD CONSTRAINT "FK_8b1600551063c485554bca74c13" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP CONSTRAINT "FK_8b1600551063c485554bca74c13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP CONSTRAINT "FK_47d3c46e4edb30cdaf97ccdb8d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP CONSTRAINT "FK_ba265816ca1d93f51083e06c520"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" DROP CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" RENAME COLUMN "taskId" TO "task_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" RENAME COLUMN "taskId" TO "task_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" RENAME COLUMN "taskId" TO "task_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" RENAME COLUMN "taskId" TO "task_id"`,
    );
  }
}
