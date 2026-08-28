import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768816144041 implements MigrationInterface {
  name = 'Migration1768816144041';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "form_answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "answer" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "submission_id" uuid, "question_id" uuid, CONSTRAINT "PK_c52f7d73b7cd03332ba47dca123" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."form_submissions_status_enum" AS ENUM('Draft', 'Submitted', 'Approved')`,
    );
    await queryRunner.query(
      `CREATE TABLE "form_submissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "submitted_by" character varying, "status" "public"."form_submissions_status_enum" NOT NULL, "submitted_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "form_id" uuid, CONSTRAINT "PK_fb6e1e9f26cda31c358a8a1530e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "forms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "phase" character varying NOT NULL, "description" text, "is_active" boolean NOT NULL, "version" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba062fd30b06814a60756f233da" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."form_questions_question_type_enum" AS ENUM('text', 'number', 'email', 'phone', 'date', 'time', 'datetime', 'radio', 'checkbox', 'select', 'textarea', 'file', 'image', 'video', 'audio', 'location', 'signature', 'slider', 'rating')`,
    );
    await queryRunner.query(
      `CREATE TABLE "form_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question" text NOT NULL, "question_type" "public"."form_questions_question_type_enum" NOT NULL, "display_order" integer NOT NULL, "options" jsonb, "validations" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "form_id" uuid, CONSTRAINT "PK_79b081029ae61e3761034f88c85" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_answers" ADD CONSTRAINT "FK_dc0eae2ffbfb192d6280643996e" FOREIGN KEY ("submission_id") REFERENCES "form_submissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_answers" ADD CONSTRAINT "FK_71c62b5c18fc7ff9dd69ac0ac93" FOREIGN KEY ("question_id") REFERENCES "form_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_submissions" ADD CONSTRAINT "FK_56176b21d723c3b3344305c48e1" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_questions" ADD CONSTRAINT "FK_24b9656f35b4c59b31be505fa47" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "form_questions" DROP CONSTRAINT "FK_24b9656f35b4c59b31be505fa47"`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_submissions" DROP CONSTRAINT "FK_56176b21d723c3b3344305c48e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_answers" DROP CONSTRAINT "FK_71c62b5c18fc7ff9dd69ac0ac93"`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_answers" DROP CONSTRAINT "FK_dc0eae2ffbfb192d6280643996e"`,
    );
    await queryRunner.query(`DROP TABLE "form_questions"`);
    await queryRunner.query(
      `DROP TYPE "public"."form_questions_question_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "forms"`);
    await queryRunner.query(`DROP TABLE "form_submissions"`);
    await queryRunner.query(
      `DROP TYPE "public"."form_submissions_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "form_answers"`);
  }
}
