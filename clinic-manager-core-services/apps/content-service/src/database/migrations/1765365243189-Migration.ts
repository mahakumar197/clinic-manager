import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765365243189 implements MigrationInterface {
  name = 'Migration1765365243189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "message_stars" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message_id" uuid NOT NULL, "user_id" uuid NOT NULL, "starred_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_50091b6ef0bee3ae13e7bba6e00" UNIQUE ("message_id", "user_id"), CONSTRAINT "PK_bebacf73d5ded10bbf4014d9e94" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "message_stars" ADD CONSTRAINT "FK_830c3bc7d08fa6a808ea25092e2" FOREIGN KEY ("message_id") REFERENCES "messages"("message_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "message_stars" DROP CONSTRAINT "FK_830c3bc7d08fa6a808ea25092e2"`,
    );
    await queryRunner.query(`DROP TABLE "message_stars"`);
  }
}
