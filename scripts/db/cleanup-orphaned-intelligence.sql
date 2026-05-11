-- Cleanup Orphaned Intelligence Records
-- Objective: Remove records from persona_intelligence that no longer have a matching persona.
-- Created: 2026-05-11

BEGIN;
DELETE FROM persona_intelligence 
WHERE persona_id NOT IN (SELECT id FROM personas);
COMMIT;
