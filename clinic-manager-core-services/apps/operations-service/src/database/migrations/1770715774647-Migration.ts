import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1770715774647 implements MigrationInterface {
  name = 'Migration1770715774647';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_f382af58ab36057334fb262efd5" UNIQUE ("googleId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_f9740e1e654a5daddb82c60bd75" UNIQUE ("facebookId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_60cea0d80c39eedaaaf5e21f175" UNIQUE ("appleId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_60cea0d80c39eedaaaf5e21f175"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_f9740e1e654a5daddb82c60bd75"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_f382af58ab36057334fb262efd5"`,
    );
  }
}
