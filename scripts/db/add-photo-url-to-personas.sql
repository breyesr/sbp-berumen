-- Migration: Add photo_url to personas table
-- Epic 20 Task 20.8

ALTER TABLE "personas" ADD COLUMN IF NOT EXISTS "photo_url" TEXT;
