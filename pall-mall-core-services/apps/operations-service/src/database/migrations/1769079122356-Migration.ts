import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769079122356 implements MigrationInterface {
  name = 'Migration1769079122356';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_authprovider_enum" AS ENUM('EMAIL', 'GOOGLE', 'FACEBOOK', 'APPLE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "authProvider" "public"."users_authprovider_enum" NOT NULL DEFAULT 'EMAIL'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "authProvider"`);
    await queryRunner.query(`DROP TYPE "public"."users_authprovider_enum"`);
  }
}
