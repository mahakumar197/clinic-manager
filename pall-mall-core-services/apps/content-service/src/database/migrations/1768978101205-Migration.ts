import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768978101205 implements MigrationInterface {
  name = 'Migration1768978101205';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "task_esignatures" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patient_id" uuid NOT NULL, "task_id" uuid NOT NULL, "form_id" uuid, "signature" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_037a91ecf1c50dd01575f565ab0" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "task_esignatures"`);
  }
}
