import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769077927219 implements MigrationInterface {
  name = 'Migration1769077927219';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "forms" ADD "procedure_type" text`);
    await queryRunner.query(
      `CREATE TYPE "public"."forms_priority_enum" AS ENUM('High', 'Mid', 'Low')`,
    );
    await queryRunner.query(
      `ALTER TABLE "forms" ADD "priority" "public"."forms_priority_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."forms_form_type_enum" AS ENUM('Concern', 'Health Questionnaire', 'Quiz')`,
    );
    await queryRunner.query(
      `ALTER TABLE "forms" ADD "form_type" "public"."forms_form_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_submissions" ADD "is_guest" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "form_submissions" DROP COLUMN "is_guest"`,
    );
    await queryRunner.query(`ALTER TABLE "forms" DROP COLUMN "form_type"`);
    await queryRunner.query(`DROP TYPE "public"."forms_form_type_enum"`);
    await queryRunner.query(`ALTER TABLE "forms" DROP COLUMN "priority"`);
    await queryRunner.query(`DROP TYPE "public"."forms_priority_enum"`);
    await queryRunner.query(`ALTER TABLE "forms" DROP COLUMN "procedure_type"`);
  }
}
