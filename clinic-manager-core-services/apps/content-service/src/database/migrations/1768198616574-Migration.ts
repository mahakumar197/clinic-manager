import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768198616574 implements MigrationInterface {
  name = 'Migration1768198616574';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contents" DROP CONSTRAINT "FK_b72f3c8d1ed4903f7922550d031"`,
    );
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "viewCount"`);
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "likeCount"`);
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "publishedAt"`);
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "procedureId"`);
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "authorName"`);
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "contentUrl"`);
    await queryRunner.query(
      `ALTER TABLE "contents" DROP COLUMN "thumbnailUrl"`,
    );
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "authorId"`);
    await queryRunner.query(`ALTER TABLE "contents" ADD "img_count" integer`);
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "thumbnail_url" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "content_url" text array`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "author_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "author_name" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "view_count" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "like_count" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "published_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "contents" ADD "procedure_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "procedures" ADD "content_count" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD CONSTRAINT "FK_13b753096ac125eb57cae5b1517" FOREIGN KEY ("procedure_id") REFERENCES "procedures"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contents" DROP CONSTRAINT "FK_13b753096ac125eb57cae5b1517"`,
    );
    await queryRunner.query(
      `ALTER TABLE "procedures" DROP COLUMN "content_count"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" DROP COLUMN "procedure_id"`,
    );
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "contents" DROP COLUMN "published_at"`,
    );
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "like_count"`);
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "view_count"`);
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "author_name"`);
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "author_id"`);
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "content_url"`);
    await queryRunner.query(
      `ALTER TABLE "contents" DROP COLUMN "thumbnail_url"`,
    );
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "img_count"`);
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "authorId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "thumbnailUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "contentUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "authorName" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "contents" ADD "procedureId" uuid`);
    await queryRunner.query(`ALTER TABLE "contents" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "publishedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "likeCount" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD "viewCount" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "contents" ADD CONSTRAINT "FK_b72f3c8d1ed4903f7922550d031" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
