import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766751905948 implements MigrationInterface {
  name = 'Migration1766751905948';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" RENAME COLUMN "zohoform" TO "zoho_form"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" RENAME COLUMN "zoho_form" TO "zohoform"`,
    );
  }
}
