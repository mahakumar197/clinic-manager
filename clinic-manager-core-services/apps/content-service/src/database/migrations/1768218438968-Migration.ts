import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768218438968 implements MigrationInterface {
  name = 'Migration1768218438968';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."elearnings_type_enum" AS ENUM('Rhinoplasty', 'Breast Augmentation', 'Liposuction', 'Facelift', 'Blepharoplasty', 'Otoplasty', 'Tummy Tuck')`,
    );
    await queryRunner.query(
      `CREATE TABLE "elearnings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" text NOT NULL, "type" "public"."elearnings_type_enum" NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8bf97f63bcfd45345cc2ff996d5" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "elearnings"`);
    await queryRunner.query(`DROP TYPE "public"."elearnings_type_enum"`);
  }
}
