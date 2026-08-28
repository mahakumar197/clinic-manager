import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768900732077 implements MigrationInterface {
  name = 'Migration1768900732077';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" ADD "is_completed" boolean`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "is_approved" boolean`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "approved_by" uuid`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "approved_at" date`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "approved_at"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "approved_by"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "is_approved"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "is_completed"`);
  }
}
