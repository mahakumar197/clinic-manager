import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768303824460 implements MigrationInterface {
  name = 'Migration1768303824460';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "liked_users" text array`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "liked_users"`);
  }
}
