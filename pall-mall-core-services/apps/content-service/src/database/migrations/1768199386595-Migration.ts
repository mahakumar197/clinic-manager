import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768199386595 implements MigrationInterface {
  name = 'Migration1768199386595';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contents" ADD "blog_header" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "blog_header"`);
  }
}
