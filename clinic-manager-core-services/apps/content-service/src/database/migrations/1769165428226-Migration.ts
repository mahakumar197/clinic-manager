import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769165428226 implements MigrationInterface {
  name = 'Migration1769165428226';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_tracks" DROP COLUMN "form_response"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_tracks" ADD "form_response" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_tracks" DROP COLUMN "form_response"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_tracks" ADD "form_response" jsonb array`,
    );
  }
}
