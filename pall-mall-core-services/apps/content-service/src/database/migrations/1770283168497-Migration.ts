import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1770283168497 implements MigrationInterface {
  name = 'Migration1770283168497';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."task_submissions_type_enum" AS ENUM('e_signature', 'file_upload')`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_submissions" ADD "type" "public"."task_submissions_type_enum" NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_submissions" DROP COLUMN "type"`,
    );
    await queryRunner.query(`DROP TYPE "public"."task_submissions_type_enum"`);
  }
}
