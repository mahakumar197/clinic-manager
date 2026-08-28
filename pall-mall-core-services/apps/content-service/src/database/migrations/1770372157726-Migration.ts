import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1770372157726 implements MigrationInterface {
  name = 'Migration1770372157726';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "task_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patient_phase_id" integer NOT NULL, "is_global" boolean NOT NULL DEFAULT true, "procedure_type" integer, "task_name" text NOT NULL, "task_description" text, "category" integer NOT NULL, "zoho_form" text, "content_id" text, "screen_id" text, "due_date_offset_days" integer, "is_active" boolean NOT NULL DEFAULT true, "display_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8b139f7bc7882efe9c21aae8b36" PRIMARY KEY ("id")); COMMENT ON COLUMN "task_config"."patient_phase_id" IS 'Patient phase (140=Guest, 141=Consultation, 142=Pre-Op, 143=Post-Op)'; COMMENT ON COLUMN "task_config"."is_global" IS 'True if task applies to all procedures, false if procedure-specific'; COMMENT ON COLUMN "task_config"."procedure_type" IS 'Specific procedure type ID (28=Rhinoplasty, 29=Breast Augmentation, etc.) - null if is_global=true'; COMMENT ON COLUMN "task_config"."task_name" IS 'Task name to be used when creating the task'; COMMENT ON COLUMN "task_config"."task_description" IS 'Task description'; COMMENT ON COLUMN "task_config"."category" IS 'Task category ID (16=Form Response, 17=Watch Content, 18=E-Signature, 19=File Upload)'; COMMENT ON COLUMN "task_config"."zoho_form" IS 'Zoho form ID if category is Form Response (16)'; COMMENT ON COLUMN "task_config"."content_id" IS 'Content ID if category is Watch Content (17)'; COMMENT ON COLUMN "task_config"."screen_id" IS 'Screen ID for mobile app navigation'; COMMENT ON COLUMN "task_config"."due_date_offset_days" IS 'Number of days from phase start to set as due date (optional)'; COMMENT ON COLUMN "task_config"."is_active" IS 'Whether this configuration is active'; COMMENT ON COLUMN "task_config"."display_order" IS 'Display order for tasks within the same phase'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "task_config"`);
  }
}
