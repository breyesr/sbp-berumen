-- Epic 21: Persona Synchronization & Data Integrity
-- Adds last_synced_at to track when a persona was last updated by the system sync.

ALTER TABLE "personas" 
ADD COLUMN IF NOT EXISTS "last_synced_at" TIMESTAMP(3);

COMMENT ON COLUMN "personas"."last_synced_at" IS 'Timestamp of the last successful automated filesystem synchronization.';
