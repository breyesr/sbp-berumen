-- Epic 21 Phase 2: Timezone Standardization
-- Converts persona timestamps to TIMESTAMPTZ to ensure UTC consistency across environments.

ALTER TABLE "personas" 
ALTER COLUMN "created_at" TYPE TIMESTAMPTZ,
ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ,
ALTER COLUMN "last_synced_at" TYPE TIMESTAMPTZ;

-- Ensure default values remain consistent
ALTER TABLE "personas" 
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

COMMENT ON COLUMN "personas"."last_synced_at" IS 'UTC Timestamp of the last successful automated filesystem synchronization.';
