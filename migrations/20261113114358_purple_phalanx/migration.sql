ALTER TABLE "booth_slots" ADD COLUMN "label" text;--> statement-breakpoint
ALTER TABLE "booth_slots" ADD COLUMN "layout" jsonb;--> statement-breakpoint
ALTER TABLE "zones" ADD COLUMN "layout" jsonb;--> statement-breakpoint
CREATE UNIQUE INDEX "booth_slots_zone_number_idx" ON "booth_slots" ("zone_id","booth_number");