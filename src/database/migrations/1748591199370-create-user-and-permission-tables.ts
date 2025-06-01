import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserAndPermissionTables1748591199370
  implements MigrationInterface
{
  name = 'CreateUserAndPermissionTables1748591199370';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "tbl_users" ("id" SERIAL NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "profile_url" text, "role" text NOT NULL DEFAULT \'student\', "status" text NOT NULL DEFAULT \'active\', "last_login_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_bb1d884179b3e42514b36c01e4e" PRIMARY KEY ("id"))'
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_d74ab662f9d3964f78b3416d5d" ON "tbl_users" ("email") '
    );
    await queryRunner.query(
      'CREATE TABLE "tbl_permissions" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "sort_order" integer NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "permissionGroupId" integer, "createdById" integer, "updatedById" integer, CONSTRAINT "PK_5a13bf078da14cd3e1a02c18f1f" PRIMARY KEY ("id"))'
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_ce6a3cb034c6340cdbf5b7a6bf" ON "tbl_permissions" ("name") '
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_87b330f301dddde665fe571010" ON "tbl_permissions" ("slug") '
    );
    await queryRunner.query(
      'CREATE TABLE "tbl_permission_groups" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "sort_order" integer NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "createdById" integer, "updatedById" integer, CONSTRAINT "PK_d6721fdc2c77cc96171184e78a8" PRIMARY KEY ("id"))'
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_eb16e03a58031f68c3a5ef8751" ON "tbl_permission_groups" ("name") '
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_aa16453f54d15927225a3b7ec0" ON "tbl_permission_groups" ("slug") '
    );
    await queryRunner.query(
      'CREATE TABLE "tbl_user_permissions" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "permission_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "createdById" integer, "updatedById" integer, CONSTRAINT "UQ_8d1027f6dbd134e73103f4ee467" UNIQUE ("user_id", "permission_id"), CONSTRAINT "PK_e159d1bf2c49f00e41018a90b8d" PRIMARY KEY ("id"))'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_permissions" ADD CONSTRAINT "FK_9de5e3ef061ecdf5e06b3070aa8" FOREIGN KEY ("permissionGroupId") REFERENCES "tbl_permission_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_permissions" ADD CONSTRAINT "FK_cf4be6d633967705cc924416046" FOREIGN KEY ("createdById") REFERENCES "tbl_users"("id") ON DELETE SET NULL ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_permissions" ADD CONSTRAINT "FK_e1543470655c78fe3a0413e8499" FOREIGN KEY ("updatedById") REFERENCES "tbl_users"("id") ON DELETE SET NULL ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_permission_groups" ADD CONSTRAINT "FK_6677f70da58b65bb33d1d8b42e1" FOREIGN KEY ("createdById") REFERENCES "tbl_users"("id") ON DELETE SET NULL ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_permission_groups" ADD CONSTRAINT "FK_b964f6e0c77d4d7311084a1f568" FOREIGN KEY ("updatedById") REFERENCES "tbl_users"("id") ON DELETE SET NULL ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_user_permissions" ADD CONSTRAINT "FK_f159277a1ce51e5eca3a6bcf911" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("id") ON DELETE CASCADE ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_user_permissions" ADD CONSTRAINT "FK_47c5cd4191d4acb782d92b61089" FOREIGN KEY ("permission_id") REFERENCES "tbl_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_user_permissions" ADD CONSTRAINT "FK_bc121287f05da1b40a537027542" FOREIGN KEY ("createdById") REFERENCES "tbl_users"("id") ON DELETE SET NULL ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_user_permissions" ADD CONSTRAINT "FK_2363c9666c660e0d31f413a182a" FOREIGN KEY ("updatedById") REFERENCES "tbl_users"("id") ON DELETE SET NULL ON UPDATE CASCADE'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "tbl_user_permissions" DROP CONSTRAINT "FK_2363c9666c660e0d31f413a182a"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_user_permissions" DROP CONSTRAINT "FK_bc121287f05da1b40a537027542"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_user_permissions" DROP CONSTRAINT "FK_47c5cd4191d4acb782d92b61089"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_user_permissions" DROP CONSTRAINT "FK_f159277a1ce51e5eca3a6bcf911"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_permission_groups" DROP CONSTRAINT "FK_b964f6e0c77d4d7311084a1f568"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_permission_groups" DROP CONSTRAINT "FK_6677f70da58b65bb33d1d8b42e1"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_permissions" DROP CONSTRAINT "FK_e1543470655c78fe3a0413e8499"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_permissions" DROP CONSTRAINT "FK_cf4be6d633967705cc924416046"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_permissions" DROP CONSTRAINT "FK_9de5e3ef061ecdf5e06b3070aa8"'
    );
    await queryRunner.query('DROP TABLE "tbl_user_permissions"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_aa16453f54d15927225a3b7ec0"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_eb16e03a58031f68c3a5ef8751"'
    );
    await queryRunner.query('DROP TABLE "tbl_permission_groups"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_87b330f301dddde665fe571010"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_ce6a3cb034c6340cdbf5b7a6bf"'
    );
    await queryRunner.query('DROP TABLE "tbl_permissions"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_d74ab662f9d3964f78b3416d5d"'
    );
    await queryRunner.query('DROP TABLE "tbl_users"');
  }
}
