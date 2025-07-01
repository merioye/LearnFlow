import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubscriptionTierTables1751386590281
  implements MigrationInterface
{
  name = 'CreateSubscriptionTierTables1751386590281';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "tbl_subscription_tiers" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "tier_code" text NOT NULL, "tier_name" character varying NOT NULL, "description" text, "sort_order" integer NOT NULL DEFAULT \'0\', "price_usd_cents" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "trial_days" integer NOT NULL DEFAULT \'0\', "is_popular" boolean NOT NULL DEFAULT false, "features_list" jsonb NOT NULL, "max_students" integer, "max_courses" integer, "max_storage_gb" integer, "max_video_upload_mb" integer NOT NULL DEFAULT \'100\', "max_assignments_per_course" integer, "max_quizzes_per_course" integer, "can_use_ai_features" boolean NOT NULL DEFAULT false, "support_level" text NOT NULL DEFAULT \'basic\', CONSTRAINT "UQ_ab1f20b75051dccbec88feab57e" UNIQUE ("tier_code"), CONSTRAINT "PK_f41bf07ac064a50123875f2aa62" PRIMARY KEY ("id")); COMMENT ON COLUMN "tbl_subscription_tiers"."tier_name" IS \'Display name for the subscription tier\'; COMMENT ON COLUMN "tbl_subscription_tiers"."description" IS \'Marketing description of the tier\'; COMMENT ON COLUMN "tbl_subscription_tiers"."sort_order" IS \'Display order (0 = highest priority)\'; COMMENT ON COLUMN "tbl_subscription_tiers"."price_usd_cents" IS \'Price in USD cents\'; COMMENT ON COLUMN "tbl_subscription_tiers"."trial_days" IS \'Number of trial days (0 if no trial)\'; COMMENT ON COLUMN "tbl_subscription_tiers"."is_popular" IS \'Show "Most Popular" badge\'; COMMENT ON COLUMN "tbl_subscription_tiers"."features_list" IS \'Marketing features to display ["Feature 1", "Feature 2"]\'; COMMENT ON COLUMN "tbl_subscription_tiers"."max_students" IS \'Maximum students a teacher can have (null = unlimited)\'; COMMENT ON COLUMN "tbl_subscription_tiers"."max_courses" IS \'Maximum courses a teacher can create (null = unlimited)\'; COMMENT ON COLUMN "tbl_subscription_tiers"."max_storage_gb" IS \'Storage limit in GB (null = unlimited)\'; COMMENT ON COLUMN "tbl_subscription_tiers"."max_video_upload_mb" IS \'Max video file size in MB\'; COMMENT ON COLUMN "tbl_subscription_tiers"."max_assignments_per_course" IS \'Maximum assignments per course (null = unlimited)\'; COMMENT ON COLUMN "tbl_subscription_tiers"."max_quizzes_per_course" IS \'Maximum quizzes per course (null = unlimited)\'; COMMENT ON COLUMN "tbl_subscription_tiers"."can_use_ai_features" IS \'Access to AI-powered content generation\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_ab1f20b75051dccbec88feab57" ON "tbl_subscription_tiers" ("tier_code") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_7cf1a6772e2192d563b46f61da" ON "tbl_subscription_tiers" ("is_active", "price_usd_cents", "sort_order") '
    );
    await queryRunner.query(
      'CREATE TABLE "tbl_subscription_tiers_permissions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "subscription_tier_id" integer NOT NULL, "permission_id" integer NOT NULL, CONSTRAINT "UQ_ac5173b0fb505c536711cce0e36" UNIQUE ("subscription_tier_id", "permission_id"), CONSTRAINT "PK_38059a5749b61a3fd29c2a9a88d" PRIMARY KEY ("id"))'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_subscription_tiers_permissions" ADD CONSTRAINT "FK_7afef604b073863c4a36110536a" FOREIGN KEY ("subscription_tier_id") REFERENCES "tbl_subscription_tiers"("id") ON DELETE CASCADE ON UPDATE CASCADE'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_subscription_tiers_permissions" ADD CONSTRAINT "FK_c78d8b87f96da542e2ae5cbf5f7" FOREIGN KEY ("permission_id") REFERENCES "tbl_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "tbl_subscription_tiers_permissions" DROP CONSTRAINT "FK_c78d8b87f96da542e2ae5cbf5f7"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_subscription_tiers_permissions" DROP CONSTRAINT "FK_7afef604b073863c4a36110536a"'
    );
    await queryRunner.query('DROP TABLE "tbl_subscription_tiers_permissions"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_7cf1a6772e2192d563b46f61da"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_ab1f20b75051dccbec88feab57"'
    );
    await queryRunner.query('DROP TABLE "tbl_subscription_tiers"');
  }
}
