import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePaymentTables1752431009393 implements MigrationInterface {
  name = 'UpdatePaymentTables1752431009393';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "public"."IDX_7cf1a6772e2192d563b46f61da"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" DROP COLUMN "gross_amount_cents"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" DROP COLUMN "commission_cents"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" DROP COLUMN "net_amount_cents"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" DROP COLUMN "processing_fees_cents"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" DROP COLUMN "adjustments_cents"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_transactions" DROP COLUMN "amount_cents"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_transactions" DROP COLUMN "provider_fee_cents"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" DROP COLUMN "requested_amount_cents"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" DROP COLUMN "approved_amount_cents"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" DROP COLUMN "processed_amount_cents"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" DROP COLUMN "processing_fee_cents"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_subscription_tiers" DROP COLUMN "price_usd_cents"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" DROP COLUMN "amount_cents"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" DROP COLUMN "commission_cents"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" DROP COLUMN "net_amount_cents"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_courses" DROP COLUMN "price_usd_cents"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_teacher_payment_configs" ADD "currency" character(3) NOT NULL DEFAULT \'USD\''
    );
    await queryRunner.query(
      'COMMENT ON COLUMN "tbl_teacher_payment_configs"."currency" IS \'ISO Currency code\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_subscription_tiers" ADD "price" numeric(19,4) NOT NULL'
    );
    await queryRunner.query(
      'COMMENT ON COLUMN "tbl_subscription_tiers"."price" IS \'Price of the subscription\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_subscription_tiers" ADD "currency" character(3) NOT NULL DEFAULT \'USD\''
    );
    await queryRunner.query(
      'COMMENT ON COLUMN "tbl_subscription_tiers"."currency" IS \'ISO Currency code\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_courses" ADD "currency" character(3) NOT NULL'
    );
    await queryRunner.query(
      'COMMENT ON COLUMN "tbl_courses"."currency" IS \'Currency code(ISO) of the course price\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_courses" ADD "price" numeric(19,4) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_teacher_payment_configs" ALTER COLUMN "total_payout_amount" TYPE numeric(19,4)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ALTER COLUMN "gross_amount" TYPE numeric(19,4)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ALTER COLUMN "commission_amount" TYPE numeric(19,4)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ALTER COLUMN "net_amount" TYPE numeric(19,4)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" DROP COLUMN "currency"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ADD "currency" character(3) NOT NULL'
    );
    await queryRunner.query(
      'COMMENT ON COLUMN "tbl_payment_settlements"."currency" IS \'Currency of the settlement\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ALTER COLUMN "processing_fees" TYPE numeric(19,4)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ALTER COLUMN "adjustments" TYPE numeric(19,4)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_transactions" ALTER COLUMN "amount" TYPE numeric(19,4)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_transactions" DROP COLUMN "currency"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_transactions" ADD "currency" character(3) NOT NULL'
    );
    await queryRunner.query(
      'COMMENT ON COLUMN "tbl_payment_transactions"."currency" IS \'Currency code\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_transactions" ALTER COLUMN "provider_fee" TYPE numeric(19,4)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ALTER COLUMN "requested_amount" TYPE numeric(19,4)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ALTER COLUMN "approved_amount" TYPE numeric(19,4)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ALTER COLUMN "processed_amount" TYPE numeric(19,4)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" DROP COLUMN "currency"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ADD "currency" character(3) NOT NULL DEFAULT \'USD\''
    );
    await queryRunner.query(
      'COMMENT ON COLUMN "tbl_refund_requests"."currency" IS \'Currency of the refund\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ALTER COLUMN "processing_fee" TYPE numeric(19,4)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" ALTER COLUMN "amount" TYPE numeric(19,4)'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_a6ec82518a9310aecabee6f582"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" DROP COLUMN "currency"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" ADD "currency" character(3) NOT NULL DEFAULT \'USD\''
    );
    await queryRunner.query(
      'COMMENT ON COLUMN "tbl_payments"."currency" IS \'Currency code (ISO 4217)\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" ALTER COLUMN "commission_amount" TYPE numeric(19,4)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" ALTER COLUMN "net_amount" TYPE numeric(19,4)'
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_a0d04f7d2842acdc1dc26fefc9" ON "tbl_subscription_tiers" ("is_active", "price", "sort_order") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_a6ec82518a9310aecabee6f582" ON "tbl_payments" ("currency") '
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "public"."IDX_a6ec82518a9310aecabee6f582"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_a0d04f7d2842acdc1dc26fefc9"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" ALTER COLUMN "net_amount" TYPE numeric(12,2)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" ALTER COLUMN "commission_amount" TYPE numeric(12,2)'
    );
    await queryRunner.query(
      'COMMENT ON COLUMN "tbl_payments"."currency" IS \'Currency code (ISO 4217)\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" DROP COLUMN "currency"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" ADD "currency" character varying(3) NOT NULL DEFAULT \'USD\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_a6ec82518a9310aecabee6f582" ON "tbl_payments" ("currency") '
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" ALTER COLUMN "amount" TYPE numeric(12,2)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ALTER COLUMN "processing_fee" TYPE numeric(10,2)'
    );
    await queryRunner.query(
      'COMMENT ON COLUMN "tbl_refund_requests"."currency" IS \'Currency of the refund\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" DROP COLUMN "currency"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ADD "currency" character varying NOT NULL DEFAULT \'USD\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ALTER COLUMN "processed_amount" TYPE numeric(10,2)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ALTER COLUMN "approved_amount" TYPE numeric(10,2)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ALTER COLUMN "requested_amount" TYPE numeric(10,2)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_transactions" ALTER COLUMN "provider_fee" TYPE numeric(10,2)'
    );
    await queryRunner.query(
      'COMMENT ON COLUMN "tbl_payment_transactions"."currency" IS \'Currency code\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_transactions" DROP COLUMN "currency"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_transactions" ADD "currency" character varying(3) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_transactions" ALTER COLUMN "amount" TYPE numeric(12,2)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ALTER COLUMN "adjustments" TYPE numeric(12,2)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ALTER COLUMN "processing_fees" TYPE numeric(12,2)'
    );
    await queryRunner.query(
      'COMMENT ON COLUMN "tbl_payment_settlements"."currency" IS \'Currency of the settlement\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" DROP COLUMN "currency"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ADD "currency" character varying(3) NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ALTER COLUMN "net_amount" TYPE numeric(12,2)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ALTER COLUMN "commission_amount" TYPE numeric(12,2)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ALTER COLUMN "gross_amount" TYPE numeric(12,2)'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_teacher_payment_configs" ALTER COLUMN "total_payout_amount" TYPE numeric(15,2)'
    );
    await queryRunner.query('ALTER TABLE "tbl_courses" DROP COLUMN "price"');
    await queryRunner.query(
      'COMMENT ON COLUMN "tbl_courses"."currency" IS \'Currency code(ISO) of the course price\''
    );
    await queryRunner.query('ALTER TABLE "tbl_courses" DROP COLUMN "currency"');
    await queryRunner.query(
      'COMMENT ON COLUMN "tbl_subscription_tiers"."currency" IS \'ISO Currency code\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_subscription_tiers" DROP COLUMN "currency"'
    );
    await queryRunner.query(
      'COMMENT ON COLUMN "tbl_subscription_tiers"."price" IS \'Price of the subscription\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_subscription_tiers" DROP COLUMN "price"'
    );
    await queryRunner.query(
      'COMMENT ON COLUMN "tbl_teacher_payment_configs"."currency" IS \'ISO Currency code\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_teacher_payment_configs" DROP COLUMN "currency"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_courses" ADD "price_usd_cents" integer NOT NULL DEFAULT \'0\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" ADD "net_amount_cents" bigint'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" ADD "commission_cents" bigint'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" ADD "amount_cents" bigint NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_subscription_tiers" ADD "price_usd_cents" integer NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ADD "processing_fee_cents" bigint NOT NULL DEFAULT \'0\''
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ADD "processed_amount_cents" bigint'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ADD "approved_amount_cents" bigint'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ADD "requested_amount_cents" bigint NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_transactions" ADD "provider_fee_cents" bigint'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_transactions" ADD "amount_cents" bigint NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ADD "adjustments_cents" bigint NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ADD "processing_fees_cents" bigint NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ADD "net_amount_cents" bigint NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ADD "commission_cents" bigint NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ADD "gross_amount_cents" bigint NOT NULL'
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_7cf1a6772e2192d563b46f61da" ON "tbl_subscription_tiers" ("sort_order", "price_usd_cents", "is_active") '
    );
  }
}
