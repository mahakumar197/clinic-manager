import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769071111312 implements MigrationInterface {
  name = 'Migration1769071111312';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "app_home_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "app_name" character varying(150) NOT NULL, "home_desc" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0663f85ef7bb66ce20cafe37a3c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "home_carousels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "home_config_id" uuid NOT NULL, "image_url" text NOT NULL, "title" character varying(150) NOT NULL, "description" text NOT NULL, "cta_text" character varying(50) NOT NULL, "cta_action" character varying(100) NOT NULL, "cta_type" character varying(20) NOT NULL, "order_index" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1ea0f30857acd7d85309d2b2774" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "home_carousels" ADD CONSTRAINT "FK_4cea47333598c62f74c683f46c3" FOREIGN KEY ("home_config_id") REFERENCES "app_home_config"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "home_carousels" DROP CONSTRAINT "FK_4cea47333598c62f74c683f46c3"`,
    );
    await queryRunner.query(`DROP TABLE "home_carousels"`);
    await queryRunner.query(`DROP TABLE "app_home_config"`);
  }
}
