import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768972608066 implements MigrationInterface {
  name = 'Migration1768972608066';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task_tracks" ADD "question_id" text`);
    await queryRunner.query(
      `ALTER TABLE "task_tracks" ADD "form_answer" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_tracks" DROP COLUMN "form_answer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_tracks" DROP COLUMN "question_id"`,
    );
  }
}
