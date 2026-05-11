-- Migration: Create normalized personas and persona_intelligence tables

-- 1. Thin Table: Identity and Metadata
CREATE TABLE IF NOT EXISTS "personas" (
    "id" SERIAL PRIMARY KEY,
    "id_text" TEXT UNIQUE NOT NULL, -- The string slug (e.g., 'alejandro')
    "name" TEXT NOT NULL,
    "role" TEXT,
    "cluster" TEXT DEFAULT 'General',
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Fat Table: Intelligence and AI Context
CREATE TABLE IF NOT EXISTS "persona_intelligence" (
    "persona_id" INTEGER PRIMARY KEY REFERENCES "personas"("id") ON DELETE CASCADE,
    "metadata" JSONB NOT NULL, -- Stores goals, pains, channels, etc.
    "voice" JSONB,             -- Stores tone, style, phrases
    "context" TEXT             -- Combined context string for RAG grounding
);

-- Update user_personas to ensure it references the new numerical ID
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_personas') THEN
        -- If user_personas exists, it might still be using TEXT for personaId.
        -- We handle this during migration scripts, but for fresh setup:
        IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'user_personas' AND column_name = 'personaId') = 'text' THEN
            -- In a fresh setup where personas.id is SERIAL, user_personas.personaId must be INTEGER.
            -- This block is mostly for documentation as migrations handle existing data.
            RAISE NOTICE 'user_personas.personaId is text, needs conversion to integer for new schema.';
        END IF;
    END IF;
END $$;
