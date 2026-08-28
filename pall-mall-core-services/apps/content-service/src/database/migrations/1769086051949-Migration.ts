import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769086051949 implements MigrationInterface {
  name = 'Migration1769086051949';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."attachments_file_type_enum" RENAME TO "attachments_file_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."attachments_file_type_enum" AS ENUM('image', 'pdf', 'doc', 'audio', 'video', 'audio/mpeg', 'video/mp4', 'voice_note')`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" ALTER COLUMN "file_type" TYPE "public"."attachments_file_type_enum" USING "file_type"::"text"::"public"."attachments_file_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."attachments_file_type_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."attachments_file_type_enum_old" AS ENUM('image', 'pdf', 'doc', 'audio')`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" ALTER COLUMN "file_type" TYPE "public"."attachments_file_type_enum_old" USING "file_type"::"text"::"public"."attachments_file_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."attachments_file_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."attachments_file_type_enum_old" RENAME TO "attachments_file_type_enum"`,
    );
  }
}
