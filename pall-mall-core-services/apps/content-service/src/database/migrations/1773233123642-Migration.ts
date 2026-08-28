import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1773233123642 implements MigrationInterface {
    name = 'Migration1773233123642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "form_responses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "link_name" character varying NOT NULL, "display_name" character varying NOT NULL, "answers" text array, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "submission_id" uuid, CONSTRAINT "PK_36a512e5574d0a366b40b26874e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "form_responses" ADD CONSTRAINT "FK_f18eff90671880b90de139c7eed" FOREIGN KEY ("submission_id") REFERENCES "form_submissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_responses" DROP CONSTRAINT "FK_f18eff90671880b90de139c7eed"`);
        await queryRunner.query(`DROP TABLE "form_responses"`);
    }

}
