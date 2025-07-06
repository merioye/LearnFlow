import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentTables1751775691555 implements MigrationInterface {
  name = 'CreatePaymentTables1751775691555';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "tbl_payment_transactions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "payment_id" integer NOT NULL, "transaction_type" character varying(50) NOT NULL, "provider" character varying NOT NULL, "provider_transaction_id" character varying, "amount_cents" bigint NOT NULL, "amount" numeric(12,2) NOT NULL, "currency" character varying(3) NOT NULL, "status" character varying NOT NULL DEFAULT \'PENDING\', "request_payload" jsonb, "response_payload" jsonb, "error_code" character varying, "error_message" character varying(1000), "provider_fee_cents" bigint, "provider_fee" numeric(10,2), "idempotency_key" character varying, "processing_duration_ms" integer, "retry_attempt" integer NOT NULL DEFAULT \'0\', "parent_transaction_id" integer, "metadata" jsonb, "started_at" TIMESTAMP, "completed_at" TIMESTAMP, CONSTRAINT "UQ_40e4473b97cf490ca3dc5826e43" UNIQUE ("idempotency_key"), CONSTRAINT "PK_519299ffdd9012a63164c54d660" PRIMARY KEY ("id")); COMMENT ON COLUMN "tbl_payment_transactions"."transaction_type" IS \'Transaction type (attempt, refund, capture, etc.)\'; COMMENT ON COLUMN "tbl_payment_transactions"."provider" IS \'Payment provider used for this transaction\'; COMMENT ON COLUMN "tbl_payment_transactions"."provider_transaction_id" IS \'Provider-specific transaction ID\'; COMMENT ON COLUMN "tbl_payment_transactions"."amount_cents" IS \'Transaction amount in cents\'; COMMENT ON COLUMN "tbl_payment_transactions"."amount" IS \'Transaction amount in standard currency unit\'; COMMENT ON COLUMN "tbl_payment_transactions"."currency" IS \'Currency code\'; COMMENT ON COLUMN "tbl_payment_transactions"."status" IS \'Transaction status\'; COMMENT ON COLUMN "tbl_payment_transactions"."request_payload" IS \'Request payload sent to provider\'; COMMENT ON COLUMN "tbl_payment_transactions"."response_payload" IS \'Response received from provider\'; COMMENT ON COLUMN "tbl_payment_transactions"."error_code" IS \'Error details if transaction failed\'; COMMENT ON COLUMN "tbl_payment_transactions"."error_message" IS \'Error message if transaction failed\'; COMMENT ON COLUMN "tbl_payment_transactions"."provider_fee_cents" IS \'Provider fees in cents for this transaction\'; COMMENT ON COLUMN "tbl_payment_transactions"."provider_fee" IS \'Provider fees in standard currency unit for this transaction\'; COMMENT ON COLUMN "tbl_payment_transactions"."idempotency_key" IS \'Idempotency key for this transaction\'; COMMENT ON COLUMN "tbl_payment_transactions"."processing_duration_ms" IS \'Processing duration in milliseconds\'; COMMENT ON COLUMN "tbl_payment_transactions"."retry_attempt" IS \'Retry attempt number (0 for first attempt)\'; COMMENT ON COLUMN "tbl_payment_transactions"."parent_transaction_id" IS \'Parent transaction ID for retries/related transactions\'; COMMENT ON COLUMN "tbl_payment_transactions"."metadata" IS \'Additional metadata\'; COMMENT ON COLUMN "tbl_payment_transactions"."started_at" IS \'Timestamp when transaction started\'; COMMENT ON COLUMN "tbl_payment_transactions"."completed_at" IS \'Timestamp when transaction completed\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_2da92dc51e51df8e1ccadfe68c" ON "tbl_payment_transactions" ("payment_id") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_b7c2323e4c241582ac9497d1a4" ON "tbl_payment_transactions" ("transaction_type") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_a720e1fb36c8899a746fff0f67" ON "tbl_payment_transactions" ("provider") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_a217c46cd6560ae4aacf38ba8f" ON "tbl_payment_transactions" ("provider_transaction_id") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_9749baefdf313769d3d2d0bd19" ON "tbl_payment_transactions" ("status") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_6a29e22a0bb2647942f46bcd9b" ON "tbl_payment_transactions" ("parent_transaction_id") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_21a1e8c071afb76bd6c1e8ef8f" ON "tbl_payment_transactions" ("status", "created_at") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_4ffaa826da4e0d2c4af269e65b" ON "tbl_payment_transactions" ("payment_id", "created_at") '
    );
    await queryRunner.query(
      'CREATE TABLE "tbl_refund_requests" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "refund_id" character varying NOT NULL, "payment_id" integer NOT NULL, "requested_amount_cents" bigint NOT NULL, "requested_amount" numeric(10,2) NOT NULL, "approved_amount_cents" bigint, "approved_amount" numeric(10,2), "processed_amount_cents" bigint, "processed_amount" numeric(10,2), "currency" character varying NOT NULL DEFAULT \'USD\', "refund_reason" character varying NOT NULL, "refund_description" text, "customer_note" text, "internal_note" text, "status" character varying NOT NULL DEFAULT \'PENDING\', "requires_approval" boolean NOT NULL DEFAULT false, "is_partial_refund" boolean NOT NULL DEFAULT false, "refund_method" character varying NOT NULL DEFAULT \'MANUAL\', "requested_by_id" integer, "approved_by_id" integer, "processed_by_id" integer, "provider_refund_id" character varying, "provider_response" text, "processing_fee_cents" bigint NOT NULL DEFAULT \'0\', "processing_fee" numeric(10,2) NOT NULL DEFAULT \'0\', "approved_at" TIMESTAMP, "processed_at" TIMESTAMP, "completed_at" TIMESTAMP, "rejected_at" TIMESTAMP, "expires_at" TIMESTAMP, "error_message" character varying, "retry_count" integer NOT NULL DEFAULT \'0\', "next_retry_at" TIMESTAMP, "affects_settlement" boolean NOT NULL DEFAULT false, "settlement_adjustment_id" integer, "metadata" jsonb, "attachments" jsonb, CONSTRAINT "UQ_1c2627fec0246bb4b80a1acd2f0" UNIQUE ("refund_id"), CONSTRAINT "PK_3e925cef20d3257d8ce4abff6f2" PRIMARY KEY ("id")); COMMENT ON COLUMN "tbl_refund_requests"."refund_id" IS \'Refund identification (Human-readable refund ID)\'; COMMENT ON COLUMN "tbl_refund_requests"."payment_id" IS \'Payment reference ID\'; COMMENT ON COLUMN "tbl_refund_requests"."requested_amount_cents" IS \'Requested refund amount in cents\'; COMMENT ON COLUMN "tbl_refund_requests"."requested_amount" IS \'Requested refund amount\'; COMMENT ON COLUMN "tbl_refund_requests"."approved_amount_cents" IS \'Approved refund amount in cents\'; COMMENT ON COLUMN "tbl_refund_requests"."approved_amount" IS \'Approved refund amount\'; COMMENT ON COLUMN "tbl_refund_requests"."processed_amount_cents" IS \'Processed refund amount in cents\'; COMMENT ON COLUMN "tbl_refund_requests"."processed_amount" IS \'Processed refund amount\'; COMMENT ON COLUMN "tbl_refund_requests"."currency" IS \'Currency of the refund\'; COMMENT ON COLUMN "tbl_refund_requests"."refund_reason" IS \'Refund reason\'; COMMENT ON COLUMN "tbl_refund_requests"."refund_description" IS \'Detailed reason\'; COMMENT ON COLUMN "tbl_refund_requests"."customer_note" IS \'Note of the customer\'; COMMENT ON COLUMN "tbl_refund_requests"."internal_note" IS \'Internal processing note\'; COMMENT ON COLUMN "tbl_refund_requests"."status" IS \'Refund request status\'; COMMENT ON COLUMN "tbl_refund_requests"."requires_approval" IS \'Whether the refund request requires approval\'; COMMENT ON COLUMN "tbl_refund_requests"."is_partial_refund" IS \'Whether the refund request is partial\'; COMMENT ON COLUMN "tbl_refund_requests"."refund_method" IS \'Refund method\'; COMMENT ON COLUMN "tbl_refund_requests"."provider_refund_id" IS \'Provider refund transaction ID\'; COMMENT ON COLUMN "tbl_refund_requests"."provider_response" IS \'Provider response message\'; COMMENT ON COLUMN "tbl_refund_requests"."processing_fee_cents" IS \'Processing fee charged for refund in cents\'; COMMENT ON COLUMN "tbl_refund_requests"."processing_fee" IS \'Processing fee charged for refund\'; COMMENT ON COLUMN "tbl_refund_requests"."expires_at" IS \'Refund request expiration\'; COMMENT ON COLUMN "tbl_refund_requests"."affects_settlement" IS \'Whether this impacts vendor settlement\'; COMMENT ON COLUMN "tbl_refund_requests"."settlement_adjustment_id" IS \'Reference to settlement adjustment\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_1c2627fec0246bb4b80a1acd2f" ON "tbl_refund_requests" ("refund_id") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_05b2b83fa3e75a7255777a3fe1" ON "tbl_refund_requests" ("payment_id") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_ec1925a6e2095e5abeef014196" ON "tbl_refund_requests" ("status") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_4e6c3dc5c49391f4d74d1e1bd5" ON "tbl_refund_requests" ("status", "created_at") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_dc210a886c3c7d402718167aa3" ON "tbl_refund_requests" ("requested_by_id", "created_at") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_c509d25694d32014f051e9cabb" ON "tbl_refund_requests" ("payment_id", "status") '
    );
    await queryRunner.query(
      'CREATE TABLE "tbl_payment_method_configs" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "provider" character varying NOT NULL, "supported_methods" text NOT NULL DEFAULT \'[]\', "is_active" boolean NOT NULL DEFAULT true, "configuration" jsonb NOT NULL, "supported_currencies" text NOT NULL DEFAULT \'[]\', "amount_limits" jsonb, "fee_structure" jsonb, "webhook_config" jsonb, "settings" jsonb, "priority" integer NOT NULL DEFAULT \'0\', "rate_limit_config" jsonb, CONSTRAINT "UQ_b3dccd30874cc6f56328f5b8b0d" UNIQUE ("provider"), CONSTRAINT "PK_8564e34b2cf431ccd5dada727da" PRIMARY KEY ("id")); COMMENT ON COLUMN "tbl_payment_method_configs"."provider" IS \'Payment provider\'; COMMENT ON COLUMN "tbl_payment_method_configs"."supported_methods" IS \'Payment methods supported by this provider\'; COMMENT ON COLUMN "tbl_payment_method_configs"."is_active" IS \'Whether this provider is active\'; COMMENT ON COLUMN "tbl_payment_method_configs"."configuration" IS \'Configuration for the provider\'; COMMENT ON COLUMN "tbl_payment_method_configs"."supported_currencies" IS \'Supported currencies by this provider\'; COMMENT ON COLUMN "tbl_payment_method_configs"."amount_limits" IS \'Minimum and maximum amounts per currency\'; COMMENT ON COLUMN "tbl_payment_method_configs"."fee_structure" IS \'Processing fees configuration\'; COMMENT ON COLUMN "tbl_payment_method_configs"."webhook_config" IS \'Webhook configuration\'; COMMENT ON COLUMN "tbl_payment_method_configs"."settings" IS \'Additional provider-specific settings\'; COMMENT ON COLUMN "tbl_payment_method_configs"."priority" IS \'Priority order for provider selection\'; COMMENT ON COLUMN "tbl_payment_method_configs"."rate_limit_config" IS \'Rate limiting configuration\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_b3dccd30874cc6f56328f5b8b0" ON "tbl_payment_method_configs" ("provider") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_6fa79b3450573f3d20649e0659" ON "tbl_payment_method_configs" ("is_active") '
    );
    await queryRunner.query(
      'CREATE TABLE "tbl_teacher_payment_configs" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "teacher_id" integer NOT NULL, "provider" character varying NOT NULL, "provider_account_id" character varying NOT NULL, "account_credentials" jsonb, "is_default" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "commission_rate" numeric(5,2), "settlement_config" jsonb, "payout_config" jsonb, "supported_currencies" text NOT NULL DEFAULT \'[]\', "webhook_config" jsonb, "settings" jsonb, "verification_status" character varying NOT NULL DEFAULT \'PENDING\', "verification_data" jsonb, "activated_at" TIMESTAMP, "last_payout_at" TIMESTAMP, "total_payout_amount" numeric(15,2) NOT NULL DEFAULT \'0\', CONSTRAINT "UQ_aa511ca0cd0c2189003bb617056" UNIQUE ("teacher_id", "provider"), CONSTRAINT "PK_3dc65fb927f0ba131d918b0b046" PRIMARY KEY ("id")); COMMENT ON COLUMN "tbl_teacher_payment_configs"."provider" IS \'Payment provider\'; COMMENT ON COLUMN "tbl_teacher_payment_configs"."provider_account_id" IS \'Teacher account ID with the payment provider\'; COMMENT ON COLUMN "tbl_teacher_payment_configs"."account_credentials" IS \'Account credentials or tokens (encrypted)\'; COMMENT ON COLUMN "tbl_teacher_payment_configs"."is_default" IS \'Whether this is the teacher default payment provider\'; COMMENT ON COLUMN "tbl_teacher_payment_configs"."is_active" IS \'Whether this configuration is active\'; COMMENT ON COLUMN "tbl_teacher_payment_configs"."commission_rate" IS \'Custom commission rate for this teacher (overrides system default)\'; COMMENT ON COLUMN "tbl_teacher_payment_configs"."settlement_config" IS \'Settlement configuration\'; COMMENT ON COLUMN "tbl_teacher_payment_configs"."payout_config" IS \'Payout configuration\'; COMMENT ON COLUMN "tbl_teacher_payment_configs"."supported_currencies" IS \'Supported currencies for this teacher-provider combination\'; COMMENT ON COLUMN "tbl_teacher_payment_configs"."webhook_config" IS \'Webhook configuration for this teacher\'; COMMENT ON COLUMN "tbl_teacher_payment_configs"."settings" IS \'Additional provider-specific settings\'; COMMENT ON COLUMN "tbl_teacher_payment_configs"."verification_status" IS \'KYC/Verification status\'; COMMENT ON COLUMN "tbl_teacher_payment_configs"."verification_data" IS \'Verification documents or details\'; COMMENT ON COLUMN "tbl_teacher_payment_configs"."activated_at" IS \'Configuration activation date\'; COMMENT ON COLUMN "tbl_teacher_payment_configs"."last_payout_at" IS \'Last successful payout date\'; COMMENT ON COLUMN "tbl_teacher_payment_configs"."total_payout_amount" IS \'Total amount paid out to this teacher\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_18610d87a5c3995697a223643e" ON "tbl_teacher_payment_configs" ("teacher_id") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_48fdf8fb31f13ea23bc6ff12d1" ON "tbl_teacher_payment_configs" ("provider") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_c2fe02b7688ac1d7c0973fc527" ON "tbl_teacher_payment_configs" ("is_default") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_089bce6415b1ec3fec343ecbcc" ON "tbl_teacher_payment_configs" ("is_active") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_10d617242a34170072d352d354" ON "tbl_teacher_payment_configs" ("teacher_id", "is_default") '
    );
    await queryRunner.query(
      'CREATE TABLE "tbl_payment_settlements" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "settlement_id" character varying NOT NULL, "payment_id" integer NOT NULL, "teacher_id" integer NOT NULL, "teacher_config_id" integer NOT NULL, "gross_amount_cents" bigint NOT NULL, "gross_amount" numeric(12,2) NOT NULL, "commission_cents" bigint NOT NULL, "commission_amount" numeric(12,2) NOT NULL, "net_amount_cents" bigint NOT NULL, "net_amount" numeric(12,2) NOT NULL, "currency" character varying(3) NOT NULL, "commission_rate" numeric(5,2) NOT NULL, "processing_fees_cents" bigint NOT NULL, "processing_fees" numeric(12,2) NOT NULL, "adjustments_cents" bigint NOT NULL, "adjustments" numeric(12,2) NOT NULL, "status" character varying NOT NULL DEFAULT \'PENDING\', "settlement_date" TIMESTAMP NOT NULL, "processed_at" TIMESTAMP, "completed_at" TIMESTAMP, "failed_at" TIMESTAMP, "provider_transaction_id" character varying, "period_start" TIMESTAMP NOT NULL, "period_end" TIMESTAMP NOT NULL, "payout_method" character varying, "payout_transaction_id" integer, "payout_reference" character varying, "settlement_items" jsonb, "error_message" text, "retry_count" integer NOT NULL DEFAULT \'0\', "next_retry_at" TIMESTAMP, "metadata" jsonb, CONSTRAINT "UQ_b67a1dfd2825caa66e97040d7e9" UNIQUE ("settlement_id"), CONSTRAINT "PK_6822953c847dd5ebaaede0505e2" PRIMARY KEY ("id")); COMMENT ON COLUMN "tbl_payment_settlements"."settlement_id" IS \'Settlement identification (Human-readable settlement ID)\'; COMMENT ON COLUMN "tbl_payment_settlements"."payment_id" IS \'Payment reference ID\'; COMMENT ON COLUMN "tbl_payment_settlements"."teacher_id" IS \'Teacher reference ID\'; COMMENT ON COLUMN "tbl_payment_settlements"."teacher_config_id" IS \'Teacher payment config ID\'; COMMENT ON COLUMN "tbl_payment_settlements"."gross_amount_cents" IS \'Total sales amount in cents\'; COMMENT ON COLUMN "tbl_payment_settlements"."gross_amount" IS \'Total sales amount\'; COMMENT ON COLUMN "tbl_payment_settlements"."commission_cents" IS \'Admin commission in cents\'; COMMENT ON COLUMN "tbl_payment_settlements"."commission_amount" IS \'Admin commission amount\'; COMMENT ON COLUMN "tbl_payment_settlements"."net_amount_cents" IS \'Net amount in cents\'; COMMENT ON COLUMN "tbl_payment_settlements"."net_amount" IS \'Amount to be paid to teacher\'; COMMENT ON COLUMN "tbl_payment_settlements"."currency" IS \'Currency of the settlement\'; COMMENT ON COLUMN "tbl_payment_settlements"."commission_rate" IS \'Commission rate applied\'; COMMENT ON COLUMN "tbl_payment_settlements"."processing_fees_cents" IS \'Payment processing fees in cents\'; COMMENT ON COLUMN "tbl_payment_settlements"."processing_fees" IS \'Payment processing fees\'; COMMENT ON COLUMN "tbl_payment_settlements"."adjustments_cents" IS \'Any adjustments in cents (refunds, chargebacks)\'; COMMENT ON COLUMN "tbl_payment_settlements"."adjustments" IS \'Any adjustments (refunds, chargebacks)\'; COMMENT ON COLUMN "tbl_payment_settlements"."status" IS \'Settlement status\'; COMMENT ON COLUMN "tbl_payment_settlements"."settlement_date" IS \'Scheduled settlement date\'; COMMENT ON COLUMN "tbl_payment_settlements"."processed_at" IS \'When actually processed\'; COMMENT ON COLUMN "tbl_payment_settlements"."completed_at" IS \'When funds transferred\'; COMMENT ON COLUMN "tbl_payment_settlements"."failed_at" IS \'When settlement failed\'; COMMENT ON COLUMN "tbl_payment_settlements"."provider_transaction_id" IS \'Provider transaction ID for the settlement\'; COMMENT ON COLUMN "tbl_payment_settlements"."period_start" IS \'Start of the settlement period\'; COMMENT ON COLUMN "tbl_payment_settlements"."period_end" IS \'End of the settlement period\'; COMMENT ON COLUMN "tbl_payment_settlements"."payout_method" IS \'Payout method used\'; COMMENT ON COLUMN "tbl_payment_settlements"."payout_transaction_id" IS \'Payout transaction ID\'; COMMENT ON COLUMN "tbl_payment_settlements"."payout_reference" IS \'Bank reference or similar\'; COMMENT ON COLUMN "tbl_payment_settlements"."settlement_items" IS \'Breakdown of settlement items\'; COMMENT ON COLUMN "tbl_payment_settlements"."error_message" IS \'Error message\'; COMMENT ON COLUMN "tbl_payment_settlements"."retry_count" IS \'Number of retries\'; COMMENT ON COLUMN "tbl_payment_settlements"."next_retry_at" IS \'When to retry\'; COMMENT ON COLUMN "tbl_payment_settlements"."metadata" IS \'Additional metadata\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_b67a1dfd2825caa66e97040d7e" ON "tbl_payment_settlements" ("settlement_id") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_9d79cf1796986c8600479e9478" ON "tbl_payment_settlements" ("payment_id") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_0c6f39473cccb87bcafe8e78b7" ON "tbl_payment_settlements" ("teacher_id") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_7552eb9ae5d63ce833c27135a2" ON "tbl_payment_settlements" ("status") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_8cf7442ae93a8c60c73d489621" ON "tbl_payment_settlements" ("settlement_date") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_ee26ddef34b227978a9c9f5d65" ON "tbl_payment_settlements" ("status", "created_at") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_71f86c4997f21a4862c8fd6c2f" ON "tbl_payment_settlements" ("teacher_id", "status") '
    );
    await queryRunner.query(
      'CREATE TABLE "tbl_payments" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "user_id" integer NOT NULL, "payment_type" text NOT NULL DEFAULT \'ONE_TIME\', "flow_type" text NOT NULL DEFAULT \'ADMIN_FEE_MODEL\', "item_id" integer, "subscription_tier_id" integer, "teacher_id" integer, "amount_cents" bigint NOT NULL, "amount" numeric(12,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT \'USD\', "payment_method" text NOT NULL, "provider_transaction_id" character varying, "provider_customer_id" character varying, "status" text NOT NULL DEFAULT \'PENDING\', "description" character varying(500), "payment_reference" character varying NOT NULL, "success_url" character varying(2048), "cancel_url" character varying(2048), "client_secret" character varying, "metadata" jsonb, "failure_reason" character varying(1000), "provider_error_code" character varying, "commission_rate" numeric(5,2), "commission_cents" bigint, "commission_amount" numeric(12,2), "net_amount_cents" bigint, "net_amount" numeric(12,2), "processed_at" TIMESTAMP, "failed_at" TIMESTAMP, "refunded_at" TIMESTAMP, "expires_at" TIMESTAMP, CONSTRAINT "UQ_1c318eab2c0e2d2ea696957b5c2" UNIQUE ("payment_reference"), CONSTRAINT "PK_3ee25dec0079cccaccc9cbf1cfd" PRIMARY KEY ("id")); COMMENT ON COLUMN "tbl_payments"."user_id" IS \'User who initiated the payment\'; COMMENT ON COLUMN "tbl_payments"."payment_type" IS \'Payment type classification\'; COMMENT ON COLUMN "tbl_payments"."flow_type" IS \'Payment flow type for routing decisions\'; COMMENT ON COLUMN "tbl_payments"."item_id" IS \'Reference to the item being purchased (courseId, subscriptionId, etc.)\'; COMMENT ON COLUMN "tbl_payments"."subscription_tier_id" IS \'Reference to the subscription being purchased\'; COMMENT ON COLUMN "tbl_payments"."teacher_id" IS \'Reference to the teacher being paid (for multi-vendor scenarios)\'; COMMENT ON COLUMN "tbl_payments"."amount_cents" IS \'Payment amount in the smallest currency unit\'; COMMENT ON COLUMN "tbl_payments"."amount" IS \'Payment amount in standard currency unit (for convenience)\'; COMMENT ON COLUMN "tbl_payments"."currency" IS \'Currency code (ISO 4217)\'; COMMENT ON COLUMN "tbl_payments"."payment_method" IS \'Payment method used\'; COMMENT ON COLUMN "tbl_payments"."provider_transaction_id" IS \'Payment provider transaction ID\'; COMMENT ON COLUMN "tbl_payments"."provider_customer_id" IS \'Payment provider customer ID\'; COMMENT ON COLUMN "tbl_payments"."status" IS \'Current payment status\'; COMMENT ON COLUMN "tbl_payments"."description" IS \'Payment description\'; COMMENT ON COLUMN "tbl_payments"."payment_reference" IS \'Unique payment reference for tracking\'; COMMENT ON COLUMN "tbl_payments"."success_url" IS \'Success URL for redirect-based payments\'; COMMENT ON COLUMN "tbl_payments"."cancel_url" IS \'Cancel URL for redirect-based payments\'; COMMENT ON COLUMN "tbl_payments"."client_secret" IS \'Client secret for client-side completion\'; COMMENT ON COLUMN "tbl_payments"."metadata" IS \'Additional metadata\'; COMMENT ON COLUMN "tbl_payments"."failure_reason" IS \'Failure reason if payment failed\'; COMMENT ON COLUMN "tbl_payments"."provider_error_code" IS \'Provider-specific error code\'; COMMENT ON COLUMN "tbl_payments"."commission_rate" IS \'Commission rate applied (for multi-vendor)\'; COMMENT ON COLUMN "tbl_payments"."commission_cents" IS \'Commission amount in cents\'; COMMENT ON COLUMN "tbl_payments"."commission_amount" IS \'Commission amount in standard currency unit\'; COMMENT ON COLUMN "tbl_payments"."net_amount_cents" IS \'Net amount after commission (teacher receives this)\'; COMMENT ON COLUMN "tbl_payments"."net_amount" IS \'Net amount in standard currency unit\'; COMMENT ON COLUMN "tbl_payments"."processed_at" IS \'Timestamp when payment was processed\'; COMMENT ON COLUMN "tbl_payments"."failed_at" IS \'Timestamp when payment failed\'; COMMENT ON COLUMN "tbl_payments"."refunded_at" IS \'Timestamp when payment was refunded\'; COMMENT ON COLUMN "tbl_payments"."expires_at" IS \'Timestamp when payment expires\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_5d5f33f8a22dba9442f4d56d48" ON "tbl_payments" ("user_id") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_632714037cc700ca3726253a58" ON "tbl_payments" ("payment_type") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_2f793e1680924441f6a93f4a03" ON "tbl_payments" ("item_id") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_70d931a37aed299a650bae0b05" ON "tbl_payments" ("teacher_id") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_a6ec82518a9310aecabee6f582" ON "tbl_payments" ("currency") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_50769932bf19e2c417f1a87247" ON "tbl_payments" ("payment_method") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_b856fcab0eb44a73d467b50268" ON "tbl_payments" ("status") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_1c318eab2c0e2d2ea696957b5c" ON "tbl_payments" ("payment_reference") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_9bfd7fb182f7ba3232e56181c2" ON "tbl_payments" ("expires_at") '
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_a048b9e45fb2590d7cf86203f7" ON "tbl_payments" ("provider_transaction_id") WHERE provider_transaction_id IS NOT NULL'
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_a58c74e674dfe7738f4f2f46b0" ON "tbl_payments" ("created_at") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_77d23fa7d532203cef3d09434d" ON "tbl_payments" ("payment_method", "status") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_2a7f2c9c618fb2564b5a915b0c" ON "tbl_payments" ("user_id", "status") '
    );
    await queryRunner.query(
      'CREATE TABLE "tbl_webhook_logs" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "provider" character varying NOT NULL, "provider_event_id" character varying NOT NULL, "event_type" character varying NOT NULL, "status" character varying NOT NULL DEFAULT \'PENDING\', "payload" jsonb NOT NULL, "headers" jsonb NOT NULL, "signature" text NOT NULL, "signature_verified" boolean NOT NULL DEFAULT false, "payment_id" integer, "attempts" integer NOT NULL DEFAULT \'0\', "max_attempts" integer NOT NULL DEFAULT \'3\', "last_attempt_at" TIMESTAMP, "next_retry_at" TIMESTAMP, "last_error" text, "last_error_stack" text, "processing_duration_ms" integer, "processing_started_at" TIMESTAMP, "processing_completed_at" TIMESTAMP, "metadata" jsonb, "source_ip" character varying(45), "user_agent" character varying(500), "ignored" boolean NOT NULL DEFAULT false, "ignored_reason" text, "processed" boolean NOT NULL DEFAULT false, "provider_event_timestamp" TIMESTAMP, "webhook_url" text, "http_method" character varying(10) NOT NULL DEFAULT \'POST\', "response_status_code" integer, "response_body" text, "paymentId" integer, CONSTRAINT "PK_b681ff66bd5cfe7b2bbdda4377c" PRIMARY KEY ("id")); COMMENT ON COLUMN "tbl_webhook_logs"."provider" IS \'Payment provider that sent the webhook\'; COMMENT ON COLUMN "tbl_webhook_logs"."provider_event_id" IS \'Unique event ID from the payment provider\'; COMMENT ON COLUMN "tbl_webhook_logs"."event_type" IS \'Type of webhook event (e.g., payment.succeeded, subscription.updated)\'; COMMENT ON COLUMN "tbl_webhook_logs"."status" IS \'Current processing status of the webhook\'; COMMENT ON COLUMN "tbl_webhook_logs"."payload" IS \'Raw webhook payload as received from provider\'; COMMENT ON COLUMN "tbl_webhook_logs"."headers" IS \'HTTP headers from the webhook request\'; COMMENT ON COLUMN "tbl_webhook_logs"."signature" IS \'Webhook signature for verification\'; COMMENT ON COLUMN "tbl_webhook_logs"."signature_verified" IS \'Whether the webhook signature was verified successfully\'; COMMENT ON COLUMN "tbl_webhook_logs"."payment_id" IS \'Associated payment ID if applicable\'; COMMENT ON COLUMN "tbl_webhook_logs"."attempts" IS \'Number of processing attempts\'; COMMENT ON COLUMN "tbl_webhook_logs"."max_attempts" IS \'Maximum number of retry attempts allowed\'; COMMENT ON COLUMN "tbl_webhook_logs"."last_attempt_at" IS \'Timestamp of the last processing attempt\'; COMMENT ON COLUMN "tbl_webhook_logs"."next_retry_at" IS \'Timestamp for the next retry attempt\'; COMMENT ON COLUMN "tbl_webhook_logs"."last_error" IS \'Error message from the last failed processing attempt\'; COMMENT ON COLUMN "tbl_webhook_logs"."last_error_stack" IS \'Stack trace from the last failed processing attempt\'; COMMENT ON COLUMN "tbl_webhook_logs"."processing_duration_ms" IS \'Processing duration in milliseconds\'; COMMENT ON COLUMN "tbl_webhook_logs"."processing_started_at" IS \'Timestamp when processing started\'; COMMENT ON COLUMN "tbl_webhook_logs"."processing_completed_at" IS \'Timestamp when processing completed\'; COMMENT ON COLUMN "tbl_webhook_logs"."metadata" IS \'Additional metadata for the webhook processing\'; COMMENT ON COLUMN "tbl_webhook_logs"."source_ip" IS \'IP address from which the webhook was received\'; COMMENT ON COLUMN "tbl_webhook_logs"."user_agent" IS \'User agent from the webhook request\'; COMMENT ON COLUMN "tbl_webhook_logs"."ignored" IS \'Whether this webhook event should be ignored (for duplicate or invalid events)\'; COMMENT ON COLUMN "tbl_webhook_logs"."ignored_reason" IS \'Reason for ignoring the webhook event\'; COMMENT ON COLUMN "tbl_webhook_logs"."processed" IS \'Whether this webhook event was processed successfully\'; COMMENT ON COLUMN "tbl_webhook_logs"."provider_event_timestamp" IS \'Event timestamp from the payment provider\'; COMMENT ON COLUMN "tbl_webhook_logs"."webhook_url" IS \'Webhook endpoint URL that received the event\'; COMMENT ON COLUMN "tbl_webhook_logs"."http_method" IS \'HTTP method used for the webhook request\'; COMMENT ON COLUMN "tbl_webhook_logs"."response_status_code" IS \'HTTP status code returned to the webhook sender\'; COMMENT ON COLUMN "tbl_webhook_logs"."response_body" IS \'Response body returned to the webhook sender\''
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_4d07d442f497d282bc6eae7660" ON "tbl_webhook_logs" ("payment_id", "event_type") '
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_4789c1192f7d33d6aaf827e64a" ON "tbl_webhook_logs" ("provider_event_id", "provider") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_53d5a1de6953a62d044bf47d5d" ON "tbl_webhook_logs" ("status", "created_at") '
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_7e2c3c62b67aaad5ab7311c5eb" ON "tbl_webhook_logs" ("provider", "event_type", "created_at") '
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_transactions" ADD CONSTRAINT "FK_2da92dc51e51df8e1ccadfe68c9" FOREIGN KEY ("payment_id") REFERENCES "tbl_payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ADD CONSTRAINT "FK_05b2b83fa3e75a7255777a3fe13" FOREIGN KEY ("payment_id") REFERENCES "tbl_payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ADD CONSTRAINT "FK_ec96a9c374ae40da208a7047063" FOREIGN KEY ("requested_by_id") REFERENCES "tbl_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ADD CONSTRAINT "FK_4e82bb5e986a094aec2042ab8f0" FOREIGN KEY ("approved_by_id") REFERENCES "tbl_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" ADD CONSTRAINT "FK_a5c8e671134b83fbc8786b9a7fa" FOREIGN KEY ("processed_by_id") REFERENCES "tbl_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_teacher_payment_configs" ADD CONSTRAINT "FK_18610d87a5c3995697a223643e7" FOREIGN KEY ("teacher_id") REFERENCES "tbl_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ADD CONSTRAINT "FK_9d79cf1796986c8600479e94784" FOREIGN KEY ("payment_id") REFERENCES "tbl_payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ADD CONSTRAINT "FK_0c6f39473cccb87bcafe8e78b7f" FOREIGN KEY ("teacher_id") REFERENCES "tbl_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" ADD CONSTRAINT "FK_b146301a5fe4d3b4047ab198331" FOREIGN KEY ("teacher_config_id") REFERENCES "tbl_teacher_payment_configs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" ADD CONSTRAINT "FK_5d5f33f8a22dba9442f4d56d480" FOREIGN KEY ("user_id") REFERENCES "tbl_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" ADD CONSTRAINT "FK_bacbf29744a3926f0057079c421" FOREIGN KEY ("subscription_tier_id") REFERENCES "tbl_subscription_tiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_webhook_logs" ADD CONSTRAINT "FK_b1724d9136f3cf8634a90045014" FOREIGN KEY ("paymentId") REFERENCES "tbl_payments"("id") ON DELETE SET NULL ON UPDATE NO ACTION'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "tbl_webhook_logs" DROP CONSTRAINT "FK_b1724d9136f3cf8634a90045014"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" DROP CONSTRAINT "FK_bacbf29744a3926f0057079c421"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payments" DROP CONSTRAINT "FK_5d5f33f8a22dba9442f4d56d480"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" DROP CONSTRAINT "FK_b146301a5fe4d3b4047ab198331"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" DROP CONSTRAINT "FK_0c6f39473cccb87bcafe8e78b7f"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_settlements" DROP CONSTRAINT "FK_9d79cf1796986c8600479e94784"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_teacher_payment_configs" DROP CONSTRAINT "FK_18610d87a5c3995697a223643e7"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" DROP CONSTRAINT "FK_a5c8e671134b83fbc8786b9a7fa"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" DROP CONSTRAINT "FK_4e82bb5e986a094aec2042ab8f0"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" DROP CONSTRAINT "FK_ec96a9c374ae40da208a7047063"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_refund_requests" DROP CONSTRAINT "FK_05b2b83fa3e75a7255777a3fe13"'
    );
    await queryRunner.query(
      'ALTER TABLE "tbl_payment_transactions" DROP CONSTRAINT "FK_2da92dc51e51df8e1ccadfe68c9"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_7e2c3c62b67aaad5ab7311c5eb"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_53d5a1de6953a62d044bf47d5d"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_4789c1192f7d33d6aaf827e64a"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_4d07d442f497d282bc6eae7660"'
    );
    await queryRunner.query('DROP TABLE "tbl_webhook_logs"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_2a7f2c9c618fb2564b5a915b0c"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_77d23fa7d532203cef3d09434d"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_a58c74e674dfe7738f4f2f46b0"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_a048b9e45fb2590d7cf86203f7"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_9bfd7fb182f7ba3232e56181c2"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_1c318eab2c0e2d2ea696957b5c"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_b856fcab0eb44a73d467b50268"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_50769932bf19e2c417f1a87247"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_a6ec82518a9310aecabee6f582"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_70d931a37aed299a650bae0b05"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_2f793e1680924441f6a93f4a03"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_632714037cc700ca3726253a58"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_5d5f33f8a22dba9442f4d56d48"'
    );
    await queryRunner.query('DROP TABLE "tbl_payments"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_71f86c4997f21a4862c8fd6c2f"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_ee26ddef34b227978a9c9f5d65"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_8cf7442ae93a8c60c73d489621"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_7552eb9ae5d63ce833c27135a2"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_0c6f39473cccb87bcafe8e78b7"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_9d79cf1796986c8600479e9478"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_b67a1dfd2825caa66e97040d7e"'
    );
    await queryRunner.query('DROP TABLE "tbl_payment_settlements"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_10d617242a34170072d352d354"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_089bce6415b1ec3fec343ecbcc"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_c2fe02b7688ac1d7c0973fc527"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_48fdf8fb31f13ea23bc6ff12d1"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_18610d87a5c3995697a223643e"'
    );
    await queryRunner.query('DROP TABLE "tbl_teacher_payment_configs"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_6fa79b3450573f3d20649e0659"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_b3dccd30874cc6f56328f5b8b0"'
    );
    await queryRunner.query('DROP TABLE "tbl_payment_method_configs"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_c509d25694d32014f051e9cabb"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_dc210a886c3c7d402718167aa3"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_4e6c3dc5c49391f4d74d1e1bd5"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_ec1925a6e2095e5abeef014196"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_05b2b83fa3e75a7255777a3fe1"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_1c2627fec0246bb4b80a1acd2f"'
    );
    await queryRunner.query('DROP TABLE "tbl_refund_requests"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_4ffaa826da4e0d2c4af269e65b"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_21a1e8c071afb76bd6c1e8ef8f"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_6a29e22a0bb2647942f46bcd9b"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_9749baefdf313769d3d2d0bd19"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_a217c46cd6560ae4aacf38ba8f"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_a720e1fb36c8899a746fff0f67"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_b7c2323e4c241582ac9497d1a4"'
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_2da92dc51e51df8e1ccadfe68c"'
    );
    await queryRunner.query('DROP TABLE "tbl_payment_transactions"');
  }
}
