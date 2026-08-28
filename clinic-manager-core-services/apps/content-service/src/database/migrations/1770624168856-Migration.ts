import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1770624168856 implements MigrationInterface {
  name = 'Migration1770624168856';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" ADD "deleted_data" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "deleted_data"`);
  }
}
