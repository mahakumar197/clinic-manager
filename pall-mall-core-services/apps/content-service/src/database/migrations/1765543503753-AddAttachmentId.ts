import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765543503753 implements MigrationInterface {
  name = 'Migration1765543503753';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP CONSTRAINT "FK_631a22c7d2aa35420e77e6466c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" RENAME COLUMN "commentId" TO "inComment"`,
    );
    await queryRunner.query(
      `CREATE TABLE "dropdowns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" text NOT NULL, "beValue" text NOT NULL, "isActive" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1580d079d20211aa16d44bb7e83" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD "attachmentId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP COLUMN "inComment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD "inComment" boolean NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP COLUMN "inComment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD "inComment" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP COLUMN "attachmentId"`,
    );
    await queryRunner.query(`DROP TABLE "dropdowns"`);
    await queryRunner.query(
      `ALTER TABLE "task_attachments" RENAME COLUMN "inComment" TO "commentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD CONSTRAINT "FK_631a22c7d2aa35420e77e6466c9" FOREIGN KEY ("commentId") REFERENCES "task_comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
