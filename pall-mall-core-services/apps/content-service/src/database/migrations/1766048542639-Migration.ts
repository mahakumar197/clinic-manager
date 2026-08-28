import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766048542639 implements MigrationInterface {
  name = 'Migration1766048542639';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task_templates" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "default_phase"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."task_templates_default_phase_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "default_category"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."task_templates_default_category_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "form_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "content_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "template" json NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "template"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "content_id" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "task_templates" ADD "form_id" uuid`);
    await queryRunner.query(
      `CREATE TYPE "public"."task_templates_default_category_enum" AS ENUM('Form Response', 'Watch Content', 'E Signature', 'File Upload')`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "default_category" "public"."task_templates_default_category_enum" NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."task_templates_default_phase_enum" AS ENUM('Pre-Op', 'Post-Op', 'Consultation')`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "default_phase" "public"."task_templates_default_phase_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "name" text NOT NULL`,
    );
  }
}
