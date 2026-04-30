-- Migration: Add is_active column to personas table and ensure existing rows are active
ALTER TABLE "personas" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true;
UPDATE "personas" SET "is_active" = true WHERE "is_active" IS NULL;
