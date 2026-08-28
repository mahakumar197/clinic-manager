import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1770628445253 implements MigrationInterface {
  name = 'Migration1770628445253';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "deleted_data"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "deleted_data" json`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "deleted_data"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "deleted_data" jsonb`);
  }
}
