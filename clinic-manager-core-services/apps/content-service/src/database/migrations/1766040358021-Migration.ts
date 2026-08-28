import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766040358021 implements MigrationInterface {
  name = 'Migration1766040358021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dropdowns" DROP CONSTRAINT "PK_1580d079d20211aa16d44bb7e83"`,
    );
    await queryRunner.query(`ALTER TABLE "dropdowns" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "dropdowns" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "dropdowns" ADD CONSTRAINT "PK_1580d079d20211aa16d44bb7e83" PRIMARY KEY ("id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dropdowns" DROP CONSTRAINT "PK_1580d079d20211aa16d44bb7e83"`,
    );
    await queryRunner.query(`ALTER TABLE "dropdowns" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "dropdowns" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "dropdowns" ADD CONSTRAINT "PK_1580d079d20211aa16d44bb7e83" PRIMARY KEY ("id")`,
    );
  }
}
