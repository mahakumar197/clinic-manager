import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765950684382 implements MigrationInterface {
  name = 'Migration1765950684382';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "threads" ADD "subject" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "threads" DROP COLUMN "subject"`);
  }
}
