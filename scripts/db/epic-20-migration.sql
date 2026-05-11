-- Epic 20: Persona ID Migration & Table Normalization
-- Objective: Rename personas.id to id_text, add numerical SERIAL id as PK, and split into persona_intelligence.

BEGIN;

-- 1. Create the new intelligence table for heavy data
CREATE TABLE IF NOT EXISTS "persona_intelligence" (
    "persona_id" INTEGER PRIMARY KEY,
    "metadata" JSONB NOT NULL,
    "voice" JSONB,
    "context" TEXT
);

-- 2. Refactor the 'personas' table
-- First, rename the existing ID to id_text
ALTER TABLE "personas" RENAME COLUMN "id" TO "id_text";

-- Drop the existing primary key constraint (this will drop the FK from user_personas if CASCADE is used)
ALTER TABLE "personas" DROP CONSTRAINT IF EXISTS "personas_pkey" CASCADE;

-- Add the new numerical SERIAL id
ALTER TABLE "personas" ADD COLUMN "id" SERIAL PRIMARY KEY;

-- Ensure id_text is unique so we can still use it for lookups
ALTER TABLE "personas" ADD CONSTRAINT "personas_id_text_key" UNIQUE ("id_text");

-- 3. Populate persona_intelligence with data from personas
-- Note: 'id' in persona_intelligence will match the new SERIAL 'id' in personas
INSERT INTO "persona_intelligence" ("persona_id", "metadata", "voice", "context")
SELECT "id", "metadata", "voice", "context" FROM "personas";

-- 4. Migrate 'user_personas' to use numerical IDs
-- Create a temporary column to hold the new integer ID
ALTER TABLE "user_personas" ADD COLUMN "persona_id_int" INTEGER;

-- Update the temporary column by joining with the personas table on the text ID
UPDATE "user_personas" up
SET "persona_id_int" = p."id"
FROM "personas" p
WHERE up."personaId" = p."id_text";

-- Clean up user_personas
-- Drop the old primary key (which includes the text ID)
ALTER TABLE "user_personas" DROP CONSTRAINT IF EXISTS "user_personas_pkey";

-- Drop the old text column
ALTER TABLE "user_personas" DROP COLUMN "personaId";

-- Rename the new column
ALTER TABLE "user_personas" RENAME COLUMN "persona_id_int" TO "personaId";

-- Re-apply Primary Key and Foreign Key constraints
ALTER TABLE "user_personas" ADD CONSTRAINT "user_personas_pkey" PRIMARY KEY ("userId", "personaId");
ALTER TABLE "user_personas" ADD CONSTRAINT "user_personas_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE;

-- 5. Drop the heavy columns from the 'personas' table (Normalization)
ALTER TABLE "personas" DROP COLUMN "metadata";
ALTER TABLE "personas" DROP COLUMN "voice";
ALTER TABLE "personas" DROP COLUMN "context";

COMMIT;
