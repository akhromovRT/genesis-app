CREATE TABLE IF NOT EXISTS "early_access_leads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL DEFAULT '',
  "main_pain" text NOT NULL DEFAULT '',
  "source" text NOT NULL DEFAULT 'roundtable',
  "utm" jsonb DEFAULT '{}'::jsonb,
  "status" text NOT NULL DEFAULT 'new',
  "notes" text DEFAULT '',
  "created_at" timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_early_access_leads_email" ON "early_access_leads" ("email");
CREATE INDEX IF NOT EXISTS "idx_early_access_leads_status" ON "early_access_leads" ("status");
CREATE INDEX IF NOT EXISTS "idx_early_access_leads_created_at" ON "early_access_leads" ("created_at");
