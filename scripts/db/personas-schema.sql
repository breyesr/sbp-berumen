-- Migration: Create personas table and update user_personas reference

CREATE TABLE IF NOT EXISTS "personas" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "cluster" TEXT DEFAULT 'General',
    "is_active" BOOLEAN DEFAULT true,
    "metadata" JSONB NOT NULL, -- Stores goals, pains, channels, etc.
    "voice" JSONB,             -- Stores tone, style, phrases
    "context" TEXT,            -- Combined context string for RAG grounding
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Update user_personas to ensure it references the new table
-- We'll do this in two steps to avoid errors if the table already exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_personas') THEN
        -- Check if the foreign key already exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'user_personas_personaId_fkey'
        ) THEN
            ALTER TABLE "user_personas" 
            ADD CONSTRAINT "user_personas_personaId_fkey" 
            FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE;
        END IF;
    END IF;
END $$;
