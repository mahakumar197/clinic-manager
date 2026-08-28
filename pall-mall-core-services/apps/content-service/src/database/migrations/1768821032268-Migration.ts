import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768821032268 implements MigrationInterface {
  name = 'Migration1768821032268';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."form_questions_node_type_enum" AS ENUM('Question', 'Section', 'Info', 'Calculated')`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_questions" ADD "node_type" "public"."form_questions_node_type_enum" NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "form_questions" DROP COLUMN "node_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."form_questions_node_type_enum"`,
    );
  }
}
