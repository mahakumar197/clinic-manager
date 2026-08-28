import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772040959236 implements MigrationInterface {
    name = 'Migration1772040959236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_activity" DROP CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68"`);
        await queryRunner.query(`ALTER TABLE "task_comments" DROP CONSTRAINT "FK_ba265816ca1d93f51083e06c520"`);
        await queryRunner.query(`ALTER TABLE "task_attachments" DROP CONSTRAINT "FK_47d3c46e4edb30cdaf97ccdb8d8"`);
        await queryRunner.query(`ALTER TABLE "task_assignees" DROP CONSTRAINT "FK_8b1600551063c485554bca74c13"`);
        await queryRunner.query(`ALTER TABLE "task_uploads" DROP CONSTRAINT "FK_0fdc2926eb58b8ab68648ed44c4"`);
        await queryRunner.query(`ALTER TABLE "task_activity" RENAME COLUMN "taskId" TO "task_id"`);
        await queryRunner.query(`ALTER TABLE "task_comments" RENAME COLUMN "taskId" TO "task_id"`);
        await queryRunner.query(`ALTER TABLE "task_attachments" RENAME COLUMN "taskId" TO "task_id"`);
        await queryRunner.query(`ALTER TABLE "task_assignees" RENAME COLUMN "taskId" TO "task_id"`);
        await queryRunner.query(`ALTER TABLE "task_uploads" RENAME COLUMN "taskId" TO "task_id"`);
        await queryRunner.query(`ALTER TABLE "task_submissions" ALTER COLUMN "task_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_activity" ADD CONSTRAINT "FK_7de35d88c452b75c02120595521" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_comments" ADD CONSTRAINT "FK_ba9e465cfc707006e60aae59946" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_attachments" ADD CONSTRAINT "FK_8c07320adec50a39744a4a301d3" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_assignees" ADD CONSTRAINT "FK_0141288f2306f20da9a60ec8d69" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_uploads" ADD CONSTRAINT "FK_e02521de0c2216561418e768f42" FOREIGN KEY ("submission_id") REFERENCES "task_submissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_uploads" ADD CONSTRAINT "FK_e2caf4cfb5150446996f8a364a3" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_submissions" ADD CONSTRAINT "FK_d6cfaee118a0300d652e28ee166" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_esignatures" ADD CONSTRAINT "FK_099f2474c93aee78b7c14142d27" FOREIGN KEY ("submission_id") REFERENCES "task_submissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_esignatures" ADD CONSTRAINT "FK_8c450464b24c5e60b6aaa79d1c0" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_esignatures" DROP CONSTRAINT "FK_8c450464b24c5e60b6aaa79d1c0"`);
        await queryRunner.query(`ALTER TABLE "task_esignatures" DROP CONSTRAINT "FK_099f2474c93aee78b7c14142d27"`);
        await queryRunner.query(`ALTER TABLE "task_submissions" DROP CONSTRAINT "FK_d6cfaee118a0300d652e28ee166"`);
        await queryRunner.query(`ALTER TABLE "task_uploads" DROP CONSTRAINT "FK_e2caf4cfb5150446996f8a364a3"`);
        await queryRunner.query(`ALTER TABLE "task_uploads" DROP CONSTRAINT "FK_e02521de0c2216561418e768f42"`);
        await queryRunner.query(`ALTER TABLE "task_assignees" DROP CONSTRAINT "FK_0141288f2306f20da9a60ec8d69"`);
        await queryRunner.query(`ALTER TABLE "task_attachments" DROP CONSTRAINT "FK_8c07320adec50a39744a4a301d3"`);
        await queryRunner.query(`ALTER TABLE "task_comments" DROP CONSTRAINT "FK_ba9e465cfc707006e60aae59946"`);
        await queryRunner.query(`ALTER TABLE "task_activity" DROP CONSTRAINT "FK_7de35d88c452b75c02120595521"`);
        await queryRunner.query(`ALTER TABLE "task_submissions" ALTER COLUMN "task_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_uploads" RENAME COLUMN "task_id" TO "taskId"`);
        await queryRunner.query(`ALTER TABLE "task_assignees" RENAME COLUMN "task_id" TO "taskId"`);
        await queryRunner.query(`ALTER TABLE "task_attachments" RENAME COLUMN "task_id" TO "taskId"`);
        await queryRunner.query(`ALTER TABLE "task_comments" RENAME COLUMN "task_id" TO "taskId"`);
        await queryRunner.query(`ALTER TABLE "task_activity" RENAME COLUMN "task_id" TO "taskId"`);
        await queryRunner.query(`ALTER TABLE "task_uploads" ADD CONSTRAINT "FK_0fdc2926eb58b8ab68648ed44c4" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_assignees" ADD CONSTRAINT "FK_8b1600551063c485554bca74c13" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_attachments" ADD CONSTRAINT "FK_47d3c46e4edb30cdaf97ccdb8d8" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_comments" ADD CONSTRAINT "FK_ba265816ca1d93f51083e06c520" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_activity" ADD CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
