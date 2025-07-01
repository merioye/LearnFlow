import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFileTrackingAndDistributedLockTables1748767209168
  implements MigrationInterface
{
  name = 'CreateFileTrackingAndDistributedLockTables1748767209168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tbl_file_tracking" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "file_path" character varying NOT NULL, "owner_id" integer NOT NULL, "reference_count" integer NOT NULL DEFAULT '0', "status" text NOT NULL DEFAULT 'pending', "last_referenced_at" TIMESTAMP, CONSTRAINT "PK_449fabf2428f40b01ca8c096265" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e9da41d781577ef8440be2ff20" ON "tbl_file_tracking" ("file_path") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_86cd78af43f491de5a84e9c3e8" ON "tbl_file_tracking" ("owner_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "tbl_distributed_locks" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "name" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, CONSTRAINT "UQ_86c47a0b80860eec858ef676bea" UNIQUE ("name"), CONSTRAINT "PK_74d0cb7fa458f6655b5c661a3d5" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tbl_distributed_locks"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_86cd78af43f491de5a84e9c3e8"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e9da41d781577ef8440be2ff20"`
    );
    await queryRunner.query(`DROP TABLE "tbl_file_tracking"`);
  }
}
