import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769494464691 implements MigrationInterface {
  name = 'Migration1769494464691';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_profiles_gender_enum" AS ENUM('MALE', 'FEMALE', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "gender" "public"."user_profiles_gender_enum", "age" integer, "height" integer, "weight" integer, "bloodGroup" character varying, "profileImage" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_8481388d6325e752cd4d7e26c6" UNIQUE ("userId"), CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_8481388d6325e752cd4d7e26c6d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_8481388d6325e752cd4d7e26c6d"`,
    );
    await queryRunner.query(`DROP TABLE "user_profiles"`);
    await queryRunner.query(`DROP TYPE "public"."user_profiles_gender_enum"`);
  }
}
