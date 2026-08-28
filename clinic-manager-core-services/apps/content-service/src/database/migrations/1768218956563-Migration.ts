import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768218956563 implements MigrationInterface {
  name = 'Migration1768218956563';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."elearnings_type_enum" RENAME TO "elearnings_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."elearnings_type_enum" AS ENUM('face', 'men', 'breast', 'body')`,
    );
    await queryRunner.query(
      `ALTER TABLE "elearnings" ALTER COLUMN "type" TYPE "public"."elearnings_type_enum" USING "type"::"text"::"public"."elearnings_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."elearnings_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."elearnings_type_enum_old" AS ENUM('Rhinoplasty', 'Breast Augmentation', 'Liposuction', 'Facelift', 'Blepharoplasty', 'Otoplasty', 'Tummy Tuck')`,
    );
    await queryRunner.query(
      `ALTER TABLE "elearnings" ALTER COLUMN "type" TYPE "public"."elearnings_type_enum_old" USING "type"::"text"::"public"."elearnings_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."elearnings_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."elearnings_type_enum_old" RENAME TO "elearnings_type_enum"`,
    );
  }
}
