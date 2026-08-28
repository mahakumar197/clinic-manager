import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765957770757 implements MigrationInterface {
  name = 'Migration1765957770757';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "procedureType"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_proceduretype_enum"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "procedureType" uuid NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "phase"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_phase_enum"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "phase" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "category"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_category_enum"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "category" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "status" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "dropdowns" DROP COLUMN "enValue"`);
    await queryRunner.query(`ALTER TABLE "dropdowns" ADD "enValue" text`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "status" "public"."tasks_status_enum" NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "dropdowns" DROP COLUMN "enValue"`);
    await queryRunner.query(
      `ALTER TABLE "dropdowns" ADD "enValue" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_status_enum" AS ENUM('Pending', 'Inprogress', 'Completed', 'Overdue')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "status" "public"."tasks_status_enum" NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "category"`);
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_category_enum" AS ENUM('Form Response', 'Watch Content', 'E Signature', 'File Upload')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "category" "public"."tasks_category_enum" NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "phase"`);
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_phase_enum" AS ENUM('Pre-Op', 'Post-Op', 'Consultation')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "phase" "public"."tasks_phase_enum" NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "procedureType"`);
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_proceduretype_enum" AS ENUM('Rhinoplasty', 'Breast Augmentation', 'Liposuction', 'Facelift', 'Blepharoplasty', 'Otoplasty', 'Tummy Tuck')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "procedureType" "public"."tasks_proceduretype_enum"`,
    );
  }
}
