import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769003127596 implements MigrationInterface {
  name = 'Migration1769003127596';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "approvals_admin" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "submission_id" uuid NOT NULL, "form_id" uuid NOT NULL, "is_approved" boolean, "is_rejected" boolean, "action_by" uuid, "action_at" TIMESTAMP, "comment" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a364253ef40f70b5a91232c6e20" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "approvals_admin"`);
  }
}
