import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765870659621 implements MigrationInterface {
  name = 'Migration1765870659621';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "filters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "type" text NOT NULL, "filterName" text NOT NULL, "filterData" json NOT NULL, "isActive" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0a3564db8ce9b0dcb991598944c" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "filters"`);
  }
}
