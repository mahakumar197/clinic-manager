import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContentAndJourneyTables1705000000000 implements MigrationInterface {
  name = 'CreateContentAndJourneyTables1705000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
            CREATE TYPE "contents_type_enum" AS ENUM('image', 'video', 'blog', 'elearning')
        `);

    await queryRunner.query(`
            CREATE TYPE "contents_status_enum" AS ENUM('draft', 'published', 'archived')
        `);

    await queryRunner.query(`
            CREATE TYPE "journey_status_enum" AS ENUM('not_started', 'in_progress', 'completed', 'abandoned')
        `);

    await queryRunner.query(`
            CREATE TYPE "step_status_enum" AS ENUM('pending', 'completed', 'skipped')
        `);

    // Create contents table
    await queryRunner.query(`
            CREATE TABLE "contents" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "type" "contents_type_enum" NOT NULL,
                "thumbnailUrl" character varying,
                "videoUrl" character varying,
                "tags" text NOT NULL DEFAULT '',
                "categories" text NOT NULL DEFAULT '',
                "status" "contents_status_enum" NOT NULL DEFAULT 'draft',
                "authorId" uuid NOT NULL,
                "authorName" character varying NOT NULL,
                "viewCount" integer NOT NULL DEFAULT 0,
                "likeCount" integer NOT NULL DEFAULT 0,
                "publishedAt" TIMESTAMP WITH TIME ZONE,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_contents" PRIMARY KEY ("id")
            )
        `);

    // Create user_journeys table
    await queryRunner.query(`
            CREATE TABLE "user_journeys" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "journeyName" character varying NOT NULL,
                "description" text,
                "status" "journey_status_enum" NOT NULL DEFAULT 'not_started',
                "currentStep" integer NOT NULL DEFAULT 0,
                "totalSteps" integer NOT NULL DEFAULT 0,
                "progressPercentage" integer NOT NULL DEFAULT 0,
                "startedAt" TIMESTAMP WITH TIME ZONE,
                "completedAt" TIMESTAMP WITH TIME ZONE,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_user_journeys" PRIMARY KEY ("id")
            )
        `);

    // Create journey_steps table
    await queryRunner.query(`
            CREATE TABLE "journey_steps" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "journeyId" uuid NOT NULL,
                "stepNumber" integer NOT NULL,
                "stepName" character varying NOT NULL,
                "description" text,
                "status" "step_status_enum" NOT NULL DEFAULT 'pending',
                "contentId" uuid,
                "metadata" jsonb,
                "completedAt" TIMESTAMP WITH TIME ZONE,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_journey_steps" PRIMARY KEY ("id")
            )
        `);

    // Add foreign key constraint for journey_steps -> user_journeys
    await queryRunner.query(`
            ALTER TABLE "journey_steps" 
            ADD CONSTRAINT "FK_journey_steps_journey" 
            FOREIGN KEY ("journeyId") 
            REFERENCES "user_journeys"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

    // Create indexes for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_contents_status" ON "contents" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_contents_type" ON "contents" ("type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_contents_authorId" ON "contents" ("authorId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_contents_publishedAt" ON "contents" ("publishedAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_journeys_userId" ON "user_journeys" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_journeys_status" ON "user_journeys" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_journey_steps_journeyId" ON "journey_steps" ("journeyId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_journey_steps_contentId" ON "journey_steps" ("contentId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_journey_steps_contentId"`);
    await queryRunner.query(`DROP INDEX "IDX_journey_steps_journeyId"`);
    await queryRunner.query(`DROP INDEX "IDX_user_journeys_status"`);
    await queryRunner.query(`DROP INDEX "IDX_user_journeys_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_contents_publishedAt"`);
    await queryRunner.query(`DROP INDEX "IDX_contents_authorId"`);
    await queryRunner.query(`DROP INDEX "IDX_contents_type"`);
    await queryRunner.query(`DROP INDEX "IDX_contents_status"`);

    // Drop foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "journey_steps" DROP CONSTRAINT "FK_journey_steps_journey"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "journey_steps"`);
    await queryRunner.query(`DROP TABLE "user_journeys"`);
    await queryRunner.query(`DROP TABLE "contents"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "step_status_enum"`);
    await queryRunner.query(`DROP TYPE "journey_status_enum"`);
    await queryRunner.query(`DROP TYPE "contents_status_enum"`);
    await queryRunner.query(`DROP TYPE "contents_type_enum"`);
  }
}
