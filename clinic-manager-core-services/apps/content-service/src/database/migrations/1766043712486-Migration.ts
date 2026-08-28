import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766043712486 implements MigrationInterface {
  name = 'Migration1766043712486';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_activity" DROP COLUMN "isActive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" DROP COLUMN "performedBy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" DROP COLUMN "performedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP COLUMN "commentedBy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP COLUMN "isActive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP COLUMN "commentedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP COLUMN "attachmentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP COLUMN "isActive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP COLUMN "uploadedBy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP COLUMN "uploadedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP COLUMN "mimeType"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."task_attachments_mimetype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP COLUMN "inComment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP COLUMN "s3Key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP COLUMN "assigneeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP COLUMN "isActive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP COLUMN "assignedBy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP COLUMN "assignedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "patientId"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "taskTemplate"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "contentId"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "assignedTo"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "dueDate"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "isActive"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "procedureType"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "taskName"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP COLUMN "taskDescription"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "defaultPhase"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."task_templates_defaultphase_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "defaultCategory"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."task_templates_defaultcategory_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "formId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "contentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "createdBy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "isActive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ADD "task_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ADD "is_active" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ADD "performed_by" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ADD "performed_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD "task_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD "attachment_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD "commented_by" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD "is_active" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD "commented_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD "task_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD "s3_key" text NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."task_attachments_mime_type_enum" AS ENUM('image/jpeg', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint', 'text/plain', 'text/csv', 'video/mp4', 'video/mpeg', 'audio/mpeg', 'audio/wav')`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD "mime_type" "public"."task_attachments_mime_type_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD "in_comment" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD "is_active" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD "uploaded_by" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD "uploaded_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD "task_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD "assignee_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD "is_active" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD "assigned_by" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD "assigned_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "patient_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "procedure_type" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" ADD "task_template" uuid`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "task_name" text NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" ADD "task_description" text`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "content_id" uuid`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "assigned_to" uuid`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "due_date" date`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "is_active" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."task_templates_default_phase_enum" AS ENUM('Pre-Op', 'Post-Op', 'Consultation')`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "default_phase" "public"."task_templates_default_phase_enum" NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."task_templates_default_category_enum" AS ENUM('Form Response', 'Watch Content', 'E Signature', 'File Upload')`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "default_category" "public"."task_templates_default_category_enum" NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "task_templates" ADD "form_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "content_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "created_by" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "is_active" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" DROP CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ALTER COLUMN "taskId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP CONSTRAINT "FK_ba265816ca1d93f51083e06c520"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ALTER COLUMN "taskId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP CONSTRAINT "FK_47d3c46e4edb30cdaf97ccdb8d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ALTER COLUMN "taskId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP CONSTRAINT "FK_8b1600551063c485554bca74c13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ALTER COLUMN "taskId" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "phase"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "phase" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "category"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "category" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "status" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ADD CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD CONSTRAINT "FK_ba265816ca1d93f51083e06c520" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD CONSTRAINT "FK_47d3c46e4edb30cdaf97ccdb8d8" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD CONSTRAINT "FK_8b1600551063c485554bca74c13" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP CONSTRAINT "FK_8b1600551063c485554bca74c13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP CONSTRAINT "FK_47d3c46e4edb30cdaf97ccdb8d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP CONSTRAINT "FK_ba265816ca1d93f51083e06c520"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" DROP CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "status"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "status" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "category"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "category" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "phase"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "phase" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ALTER COLUMN "taskId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD CONSTRAINT "FK_8b1600551063c485554bca74c13" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ALTER COLUMN "taskId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD CONSTRAINT "FK_47d3c46e4edb30cdaf97ccdb8d8" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ALTER COLUMN "taskId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD CONSTRAINT "FK_ba265816ca1d93f51083e06c520" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ALTER COLUMN "taskId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ADD CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "is_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "content_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "form_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "default_category"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."task_templates_default_category_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" DROP COLUMN "default_phase"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."task_templates_default_phase_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "is_active"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "due_date"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "assigned_to"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "content_id"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP COLUMN "task_description"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "task_name"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "task_template"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "procedure_type"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "patient_id"`);
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP COLUMN "assigned_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP COLUMN "assigned_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP COLUMN "is_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP COLUMN "assignee_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP COLUMN "task_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP COLUMN "uploaded_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP COLUMN "uploaded_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP COLUMN "is_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP COLUMN "in_comment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP COLUMN "mime_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."task_attachments_mime_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP COLUMN "s3_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" DROP COLUMN "task_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP COLUMN "commented_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP COLUMN "is_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP COLUMN "commented_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP COLUMN "attachment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP COLUMN "task_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" DROP COLUMN "performed_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" DROP COLUMN "performed_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" DROP COLUMN "is_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" DROP COLUMN "task_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "isActive" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "createdBy" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "contentId" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "task_templates" ADD "formId" uuid`);
    await queryRunner.query(
      `CREATE TYPE "public"."task_templates_defaultcategory_enum" AS ENUM('Form Response', 'Watch Content', 'E Signature', 'File Upload')`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "defaultCategory" "public"."task_templates_defaultcategory_enum" NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."task_templates_defaultphase_enum" AS ENUM('Pre-Op', 'Post-Op', 'Consultation')`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_templates" ADD "defaultPhase" "public"."task_templates_defaultphase_enum" NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" ADD "taskDescription" text`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "taskName" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "procedureType" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "isActive" boolean NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" ADD "dueDate" date`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "assignedTo" uuid`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "contentId" uuid`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "taskTemplate" uuid`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "patientId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD "assignedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD "assignedBy" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD "isActive" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD "assigneeId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD "s3Key" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD "inComment" boolean NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."task_attachments_mimetype_enum" AS ENUM('image/jpeg', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint', 'text/plain', 'text/csv', 'video/mp4', 'video/mpeg', 'audio/mpeg', 'audio/wav')`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD "mimeType" "public"."task_attachments_mimetype_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD "uploadedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD "uploadedBy" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_attachments" ADD "isActive" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD "attachmentId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD "commentedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD "isActive" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD "commentedBy" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ADD "performedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ADD "performedBy" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ADD "isActive" boolean NOT NULL`,
    );
  }
}
