import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1771224890270 implements MigrationInterface {
  name = 'Migration1771224890270';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" ADD "postop_date" date`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "postop_date"`);
  }
}
