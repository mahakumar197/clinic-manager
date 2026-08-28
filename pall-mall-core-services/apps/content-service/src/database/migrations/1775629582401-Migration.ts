import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1775629582401 implements MigrationInterface {
    name = 'Migration1775629582401'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "form_field_mapping" ("id" SERIAL NOT NULL, "form_name" character varying(255) NOT NULL, "zoho_field_name" character varying(255) NOT NULL, "question" character varying(255) NOT NULL, "status" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "form_id" uuid, CONSTRAINT "PK_cdc9d8689afc15298e493540587" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "form_field_mapping" ADD CONSTRAINT "FK_2d6c06e181c46ef5a031d9f9a7e" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_field_mapping" DROP CONSTRAINT "FK_2d6c06e181c46ef5a031d9f9a7e"`);
        await queryRunner.query(`DROP TABLE "form_field_mapping"`);
    }

}
