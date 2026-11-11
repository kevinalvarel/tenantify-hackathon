CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"association_code" text UNIQUE,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booth_slots" (
	"id" text PRIMARY KEY,
	"zone_id" text NOT NULL,
	"booth_number" text NOT NULL,
	"tenant_id" text,
	"status" text DEFAULT 'available' NOT NULL,
	"size" text DEFAULT '3x3 m' NOT NULL,
	"price_monthly" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY,
	"seller_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"phone" text,
	"zone" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"rating" text DEFAULT '0.0' NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"is_open" boolean DEFAULT false NOT NULL,
	"avatar" text,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zones" (
	"id" text PRIMARY KEY,
	"code" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"description" text,
	"category_focus" text,
	"total_booths" integer DEFAULT 0 NOT NULL,
	"occupied_booths" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_recommendations" (
	"id" text PRIMARY KEY,
	"source_product_id" text NOT NULL,
	"target_product_id" text NOT NULL,
	"pairing_reason" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY,
	"tenant_id" text NOT NULL,
	"sku" text,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"price" integer NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_popular" boolean DEFAULT false NOT NULL,
	"rating" text DEFAULT '0.0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" text PRIMARY KEY,
	"tenant_order_id" text NOT NULL,
	"product_id" text,
	"product_name" text NOT NULL,
	"price" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY,
	"customer_id" text,
	"pickup_code" text NOT NULL,
	"order_type" text NOT NULL,
	"table_number" text,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"platform_fee" integer DEFAULT 1000 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"payment_method" text NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_orders" (
	"id" text PRIMARY KEY,
	"order_id" text,
	"tenant_id" text NOT NULL,
	"customer_name" text,
	"table_number" text,
	"type" text NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"tax" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'Masuk' NOT NULL,
	"payment_method" text NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "booth_slots_zoneId_idx" ON "booth_slots" ("zone_id");--> statement-breakpoint
CREATE INDEX "booth_slots_tenantId_idx" ON "booth_slots" ("tenant_id");--> statement-breakpoint
CREATE INDEX "tenants_sellerId_idx" ON "tenants" ("seller_id");--> statement-breakpoint
CREATE INDEX "tenants_status_idx" ON "tenants" ("status");--> statement-breakpoint
CREATE INDEX "rec_sourceProductId_idx" ON "product_recommendations" ("source_product_id");--> statement-breakpoint
CREATE INDEX "rec_targetProductId_idx" ON "product_recommendations" ("target_product_id");--> statement-breakpoint
CREATE INDEX "products_tenantId_idx" ON "products" ("tenant_id");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" ("category");--> statement-breakpoint
CREATE INDEX "products_isActive_idx" ON "products" ("is_active");--> statement-breakpoint
CREATE INDEX "order_items_tenantOrderId_idx" ON "order_items" ("tenant_order_id");--> statement-breakpoint
CREATE INDEX "order_items_productId_idx" ON "order_items" ("product_id");--> statement-breakpoint
CREATE INDEX "orders_customerId_idx" ON "orders" ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_pickupCode_idx" ON "orders" ("pickup_code");--> statement-breakpoint
CREATE INDEX "orders_paymentStatus_idx" ON "orders" ("payment_status");--> statement-breakpoint
CREATE INDEX "tenant_orders_orderId_idx" ON "tenant_orders" ("order_id");--> statement-breakpoint
CREATE INDEX "tenant_orders_tenantId_idx" ON "tenant_orders" ("tenant_id");--> statement-breakpoint
CREATE INDEX "tenant_orders_status_idx" ON "tenant_orders" ("status");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "booth_slots" ADD CONSTRAINT "booth_slots_zone_id_zones_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "booth_slots" ADD CONSTRAINT "booth_slots_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_seller_id_user_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "product_recommendations" ADD CONSTRAINT "product_recommendations_source_product_id_products_id_fkey" FOREIGN KEY ("source_product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "product_recommendations" ADD CONSTRAINT "product_recommendations_target_product_id_products_id_fkey" FOREIGN KEY ("target_product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_tenant_order_id_tenant_orders_id_fkey" FOREIGN KEY ("tenant_order_id") REFERENCES "tenant_orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_user_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tenant_orders" ADD CONSTRAINT "tenant_orders_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tenant_orders" ADD CONSTRAINT "tenant_orders_tenant_id_tenants_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE;