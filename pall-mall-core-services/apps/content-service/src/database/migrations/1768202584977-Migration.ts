import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768202584977 implements MigrationInterface {
  name = 'Migration1768202584977';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contents" ADD "eLearnings" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "eLearnings"`);
  }
}
