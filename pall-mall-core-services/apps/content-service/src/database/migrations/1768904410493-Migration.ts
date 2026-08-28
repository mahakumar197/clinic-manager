import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768904410493 implements MigrationInterface {
  name = 'Migration1768904410493';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "zoho_form"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "zoho_form" text`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "content_id"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "content_id" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "content_id"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "content_id" integer`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "zoho_form"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "zoho_form" integer`);
  }
}
