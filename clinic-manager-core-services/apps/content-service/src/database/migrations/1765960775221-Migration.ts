import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765960775221 implements MigrationInterface {
  name = 'Migration1765960775221';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "status" uuid NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_status_enum" AS ENUM('Pending', 'Inprogress', 'Completed', 'Overdue')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "status" "public"."tasks_status_enum" NOT NULL`,
    );
  }
}
