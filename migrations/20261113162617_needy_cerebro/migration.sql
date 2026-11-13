CREATE TABLE "rent_invoices" (
	"id" text PRIMARY KEY,
	"tenant_id" text NOT NULL,
	"invoice_number" text NOT NULL,
	"period" text NOT NULL,
	"association_name" text NOT NULL,
	"bank_name" text,
	"bank_account_number" text,
	"bank_account_holder" text,
	"base_rent" integer DEFAULT 0 NOT NULL,
	"maintenance_fee" integer DEFAULT 0 NOT NULL,
	"electricity_fee" integer DEFAULT 0 NOT NULL,
	"total_amount" integer DEFAULT 0 NOT NULL,
	"due_date" timestamp NOT NULL,
	"status" text DEFAULT 'unpaid' NOT NULL,
	"paid_at" timestamp,
	"payment_method" text,
	"receipt_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "association_profiles" ADD COLUMN "bank_name" text;--> statement-breakpoint
ALTER TABLE "association_profiles" ADD COLUMN "bank_account_number" text;--> statement-breakpoint
ALTER TABLE "association_profiles" ADD COLUMN "bank_account_holder" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "image" text;--> statement-breakpoint
CREATE INDEX "rent_invoices_tenantId_idx" ON "rent_invoices" ("tenant_id");--> statement-breakpoint
CREATE INDEX "rent_invoices_status_idx" ON "rent_invoices" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "rent_invoices_number_idx" ON "rent_invoices" ("invoice_number");--> statement-breakpoint
ALTER TABLE "rent_invoices" ADD CONSTRAINT "rent_invoices_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;