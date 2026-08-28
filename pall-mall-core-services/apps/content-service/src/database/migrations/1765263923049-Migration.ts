import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765263923049 implements MigrationInterface {
  name = 'Migration1765263923049';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "attachments" ("attachment_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_url" text NOT NULL, "file_type" "public"."attachments_file_type_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "message_id" uuid, CONSTRAINT "PK_0f0c0f540cbf0f2e9499f9a082e" PRIMARY KEY ("attachment_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "message_reads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message_id" uuid NOT NULL, "user_id" uuid NOT NULL, "read_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_504f22ef54941c99b9ec9e31c32" UNIQUE ("message_id", "user_id"), CONSTRAINT "PK_7d3be462a9d7dfbbccc93c097e1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "messages" ("message_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "thread_id" uuid NOT NULL, "sender_id" uuid NOT NULL, "message_text" text, "message_type" "public"."messages_message_type_enum" NOT NULL DEFAULT 'text', "visibility" "public"."messages_visibility_enum" NOT NULL DEFAULT 'patient', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6187089f850b8deeca0232cfeba" PRIMARY KEY ("message_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "threads" ("thread_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patient_user_id" uuid NOT NULL, "assigned_user_ids" uuid array, "status" "public"."threads_status_enum" NOT NULL DEFAULT 'open', "archived_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f9fb843269644618778b27d45d8" PRIMARY KEY ("thread_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "thread_tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "thread_id" uuid NOT NULL, "tagged_user_id" uuid NOT NULL, "tagged_by_user_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_78a8ce5c9a59ee7658a201337d2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" ADD CONSTRAINT "FK_623e10eec51ada466c5038979e3" FOREIGN KEY ("message_id") REFERENCES "messages"("message_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message_reads" ADD CONSTRAINT "FK_977d4dcdd4dcb8441bac1b2d967" FOREIGN KEY ("message_id") REFERENCES "messages"("message_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_bb3af7f695d50083e6523290d41" FOREIGN KEY ("thread_id") REFERENCES "threads"("thread_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "thread_tags" ADD CONSTRAINT "FK_3b7d48bd25da9d3618981fdc3ac" FOREIGN KEY ("thread_id") REFERENCES "threads"("thread_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "thread_tags" DROP CONSTRAINT "FK_3b7d48bd25da9d3618981fdc3ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_bb3af7f695d50083e6523290d41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message_reads" DROP CONSTRAINT "FK_977d4dcdd4dcb8441bac1b2d967"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" DROP CONSTRAINT "FK_623e10eec51ada466c5038979e3"`,
    );
    await queryRunner.query(`DROP TABLE "thread_tags"`);
    await queryRunner.query(`DROP TABLE "threads"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TABLE "message_reads"`);
    await queryRunner.query(`DROP TABLE "attachments"`);
  }
}
