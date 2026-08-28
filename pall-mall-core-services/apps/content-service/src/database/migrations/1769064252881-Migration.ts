import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769064252881 implements MigrationInterface {
  name = 'Migration1769064252881';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."content_users_status_enum" AS ENUM('active', 'suspended', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "content_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "password_hash" character varying, "role" character varying, "department" character varying, "phone" character varying, "join_date" TIMESTAMP, "additional_notes" text, "two_fa_enabled" boolean NOT NULL DEFAULT false, "suspended_until" TIMESTAMP, "suspension_reason" character varying, "token_version" integer NOT NULL DEFAULT '0', "status" "public"."content_users_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_227424c047b01edffd3a549c1c2" UNIQUE ("email"), CONSTRAINT "PK_f50b2b19c2b41a463473726be62" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "content_role_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" character varying NOT NULL, "module" character varying NOT NULL, "enabled" boolean NOT NULL DEFAULT false, "updated_by" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f3c95f67a440c34ca7b9e888e9b" UNIQUE ("role", "module"), CONSTRAINT "PK_1de6005a8ba0689c0351d675057" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "content_role_permissions"`);
    await queryRunner.query(`DROP TABLE "content_users"`);
    await queryRunner.query(`DROP TYPE "public"."content_users_status_enum"`);
  }
}
