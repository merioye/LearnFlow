import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoursesTable1751102476180 implements MigrationInterface {
  name = 'CreateCoursesTable1751102476180';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "tbl_courses" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "teacher_id" integer NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL DEFAULT \'\', "category" character varying NOT NULL, "price_usd_cents" integer NOT NULL DEFAULT \'0\', "level" text NOT NULL DEFAULT \'BEGINNER\', "status" text NOT NULL DEFAULT \'DRAFT\', "thumbnail_path" text, "published_at" TIMESTAMP, "tags" text NOT NULL DEFAULT \'\', "total_enrollments" integer NOT NULL DEFAULT \'0\', CONSTRAINT "PK_9481d2c4e251d3fe9f4f42ac261" PRIMARY KEY ("id")); COMMENT ON COLUMN "tbl_courses"."price_usd_cents" IS \'Price in USD cents\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_1263d27ee1fda7ed22b850442b" ON "tbl_courses" ("teacher_id") '
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_courses" ADD CONSTRAINT "FK_1263d27ee1fda7ed22b850442b7" FOREIGN KEY ("teacher_id") REFERENCES "tbl_users"("id") ON DELETE CASCADE ON UPDATE CASCADE'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "tbl_courses" DROP CONSTRAINT "FK_1263d27ee1fda7ed22b850442b7"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_1263d27ee1fda7ed22b850442b"'
    );
    await queryRunner.query('DROP TABLE "tbl_courses"');
  }
}
