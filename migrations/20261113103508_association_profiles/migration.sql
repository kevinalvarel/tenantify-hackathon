CREATE TABLE "association_profiles" (
	"id" text PRIMARY KEY,
	"name" text DEFAULT 'Area Bazaar' NOT NULL,
	"description" text,
	"address" text,
	"phone" text,
	"email" text,
	"notify_new_tenant" boolean DEFAULT true NOT NULL,
	"notify_new_review" boolean DEFAULT true NOT NULL,
	"notify_payment_due" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "association_profiles" ADD CONSTRAINT "association_profiles_id_user_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE CASCADE;