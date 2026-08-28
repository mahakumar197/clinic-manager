import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765868689737 implements MigrationInterface {
  name = 'Migration1765868689737';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "thread_stars" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "thread_id" uuid NOT NULL, "user_id" uuid NOT NULL, "starred_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_b829efe06c0a67894e9d59cd7f2" UNIQUE ("thread_id", "user_id"), CONSTRAINT "PK_9de779d98062ecf34cf1ac4df56" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_stars" ADD CONSTRAINT "FK_46d300a26c5afa74883b9a8e769" FOREIGN KEY ("thread_id") REFERENCES "threads"("thread_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "thread_stars" DROP CONSTRAINT "FK_46d300a26c5afa74883b9a8e769"`,
    );
    await queryRunner.query(`DROP TABLE "thread_stars"`);
  }
}
