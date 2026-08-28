import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeDescriptionNullable1766050000001 implements MigrationInterface {
  name = 'MakeDescriptionNullable1766050000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contents" ALTER COLUMN "description" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contents" ALTER COLUMN "description" SET NOT NULL`,
    );
  }
}
