import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationTable1750008778702
  implements MigrationInterface
{
  name = 'CreateNotificationTable1750008778702';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "tbl_notifications" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "title" character varying NOT NULL, "message" text NOT NULL, "status" text NOT NULL DEFAULT \'unread\', "type" text NOT NULL, "priority" text NOT NULL DEFAULT \'low\', "read_at" TIMESTAMP, "expires_at" TIMESTAMP, "action_url" text, "image_path" text, "related_id" integer, "user_id" integer NOT NULL, "metadata" jsonb, CONSTRAINT "PK_864f5e52afeed73fdfd87ba738b" PRIMARY KEY ("id"))'
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_25723949cc4398372add4b8e3c" ON "tbl_notifications" ("type", "user_id") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_470c55ca237a8d337a83c32a00" ON "tbl_notifications" ("user_id", "created_at") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_9a1fcf4c2183326c67becdb488" ON "tbl_notifications" ("user_id", "status") '
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_notifications" ADD CONSTRAINT "FK_56001df7788b445c35c286b15bb" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("id") ON DELETE CASCADE ON UPDATE CASCADE'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "tbl_notifications" DROP CONSTRAINT "FK_56001df7788b445c35c286b15bb"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_9a1fcf4c2183326c67becdb488"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_470c55ca237a8d337a83c32a00"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_25723949cc4398372add4b8e3c"'
    );
    await queryRunner.query('DROP TABLE "tbl_notifications"');
  }
}
