import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769587753729 implements MigrationInterface {
  name = 'Migration1769587753729';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" ADD "completed_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "approved_at"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "approved_at" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "approved_at"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "approved_at" date`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "completed_at"`);
  }
}
