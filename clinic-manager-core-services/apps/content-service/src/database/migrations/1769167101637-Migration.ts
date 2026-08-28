import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769167101637 implements MigrationInterface {
  name = 'Migration1769167101637';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task_tracks" ADD "taskId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "task_uploads" ADD CONSTRAINT "FK_0fdc2926eb58b8ab68648ed44c4" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_tracks" ADD CONSTRAINT "FK_9f062d6cd4c8f6bb1f7d9d7d80b" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_tracks" DROP CONSTRAINT "FK_9f062d6cd4c8f6bb1f7d9d7d80b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_uploads" DROP CONSTRAINT "FK_0fdc2926eb58b8ab68648ed44c4"`,
    );
    await queryRunner.query(`ALTER TABLE "task_tracks" DROP COLUMN "taskId"`);
    await queryRunner.query(`DROP TABLE "task_uploads"`);
  }
}
