import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769514436364 implements MigrationInterface {
  name = 'Migration1769514436364';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "form_questions" ADD "page" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "form_questions" DROP COLUMN "page"`);
  }
}
