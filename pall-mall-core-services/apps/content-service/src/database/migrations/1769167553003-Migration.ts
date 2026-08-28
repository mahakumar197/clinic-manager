import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769167553003 implements MigrationInterface {
  name = 'Migration1769167553003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "task_tracks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patient_id" uuid NOT NULL, "task_id" uuid NOT NULL, "track_data" jsonb, "form_response" jsonb, "steps" text array, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0ff50004b3c9098f6f6f20db37a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_tracks" ADD CONSTRAINT "FK_b7a64f4e677ea1d6302b5684fd2" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_tracks" DROP CONSTRAINT "FK_b7a64f4e677ea1d6302b5684fd2"`,
    );
    await queryRunner.query(`DROP TABLE "task_tracks"`);
  }
}
