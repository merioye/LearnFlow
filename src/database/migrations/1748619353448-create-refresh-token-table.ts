import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokenTable1748619353448
  implements MigrationInterface
{
  name = 'CreateRefreshTokenTable1748619353448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "tbl_refresh_tokens" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "expires_at" TIMESTAMP NOT NULL, "user_id" integer NOT NULL, "is_revoked" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_80ecf9d3d7a1af92c155d9e412b" PRIMARY KEY ("id"))'
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_cdc9043779337a9447b5f93f0c" ON "tbl_refresh_tokens" ("user_id") '
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refresh_tokens" ADD CONSTRAINT "FK_cdc9043779337a9447b5f93f0cb" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("id") ON DELETE CASCADE ON UPDATE CASCADE'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "tbl_refresh_tokens" DROP CONSTRAINT "FK_cdc9043779337a9447b5f93f0cb"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_cdc9043779337a9447b5f93f0c"'
    );
    await queryRunner.query('DROP TABLE "tbl_refresh_tokens"');
  }
}
