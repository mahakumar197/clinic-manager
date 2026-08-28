import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769155575728 implements MigrationInterface {
  name = 'Migration1769155575728';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_tracks" DROP COLUMN "form_answer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_tracks" DROP COLUMN "question_id"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" ADD "screen_id" text`);
    await queryRunner.query(
      `ALTER TABLE "task_tracks" ADD "form_response" jsonb array`,
    );
    await queryRunner.query(`ALTER TABLE "task_tracks" ADD "steps" text array`);
    await queryRunner.query(
      `ALTER TABLE "form_questions" DROP COLUMN "options"`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_questions" ADD "options" text array`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_questions" ALTER COLUMN "is_active" DROP DEFAULT`,
    );
    await queryRunner.query(`ALTER TABLE "form_answers" DROP COLUMN "answer"`);
    await queryRunner.query(
      `ALTER TABLE "form_answers" ADD "answer" text array`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "form_answers" DROP COLUMN "answer"`);
    await queryRunner.query(`ALTER TABLE "form_answers" ADD "answer" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "form_questions" ALTER COLUMN "is_active" SET DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_questions" DROP COLUMN "options"`,
    );
    await queryRunner.query(`ALTER TABLE "form_questions" ADD "options" jsonb`);
    await queryRunner.query(`ALTER TABLE "task_tracks" DROP COLUMN "steps"`);
    await queryRunner.query(
      `ALTER TABLE "task_tracks" DROP COLUMN "form_response"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "screen_id"`);
    await queryRunner.query(`ALTER TABLE "task_tracks" ADD "question_id" text`);
    await queryRunner.query(
      `ALTER TABLE "task_tracks" ADD "form_answer" jsonb`,
    );
  }
}
