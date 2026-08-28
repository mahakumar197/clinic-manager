import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProceduresTable1705100000000 implements MigrationInterface {
  name = 'AddProceduresTable1705100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types for procedures
    await queryRunner.query(`
      CREATE TYPE "procedure_type_enum" AS ENUM('face', 'men', 'breast', 'body')
    `);

    await queryRunner.query(`
      CREATE TYPE "procedure_status_enum" AS ENUM('active', 'inactive')
    `);

    // Create procedures table
    await queryRunner.query(`
      CREATE TABLE "procedures" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "type" "procedure_type_enum" NOT NULL,
        "thumbnailUrl" character varying,
        "videoUrl" character varying,
        "status" "procedure_status_enum" NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_procedures" PRIMARY KEY ("id")
      )
    `);

    // Add procedureId column to contents table
    await queryRunner.query(`
      ALTER TABLE "contents" 
      ADD COLUMN "procedureId" uuid
    `);

    // Add foreign key constraint for contents -> procedures
    await queryRunner.query(`
      ALTER TABLE "contents" 
      ADD CONSTRAINT "FK_contents_procedure" 
      FOREIGN KEY ("procedureId") 
      REFERENCES "procedures"("id") 
      ON DELETE SET NULL 
      ON UPDATE NO ACTION
    `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_procedures_type" ON "procedures" ("type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_procedures_status" ON "procedures" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_contents_procedureId" ON "contents" ("procedureId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_contents_procedureId"`);
    await queryRunner.query(`DROP INDEX "IDX_procedures_status"`);
    await queryRunner.query(`DROP INDEX "IDX_procedures_type"`);

    // Drop foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "contents" DROP CONSTRAINT "FK_contents_procedure"`,
    );

    // Drop procedureId column from contents table
    await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN "procedureId"`);

    // Drop procedures table
    await queryRunner.query(`DROP TABLE "procedures"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "procedure_status_enum"`);
    await queryRunner.query(`DROP TYPE "procedure_type_enum"`);
  }
}
