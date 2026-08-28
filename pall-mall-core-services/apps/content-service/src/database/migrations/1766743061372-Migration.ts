import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766743061372 implements MigrationInterface {
  name = 'Migration1766743061372';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "zohoform"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "zohoform" integer`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "content_id"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "content_id" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "content_id"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "content_id" uuid`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "zohoform"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "zohoform" uuid`);
  }
}
