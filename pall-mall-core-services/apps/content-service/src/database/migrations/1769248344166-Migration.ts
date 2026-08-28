import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769248344166 implements MigrationInterface {
  name = 'Migration1769248344166';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "approval_doctor_comments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "submission_id" uuid NOT NULL,
                "comment" text NOT NULL,
                "commented_by" uuid NOT NULL,
                "is_active" boolean NOT NULL,
                "commented_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_9a9177c622b224031a51c0b1d8e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(
      `ALTER TABLE "approvals_doctor" DROP COLUMN "comment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals_doctor" DROP COLUMN "commented_by"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "approvals_doctor" ADD "commented_by" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "approvals_doctor" ADD "comment" text`,
    );
    await queryRunner.query(`DROP TABLE "approval_doctor_comments"`);
  }
}
