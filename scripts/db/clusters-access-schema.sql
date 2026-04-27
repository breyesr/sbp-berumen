-- Migration: Create user_cluster_access junction table
CREATE TABLE IF NOT EXISTS "user_cluster_access" (
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "clusterId" TEXT NOT NULL REFERENCES "clusters"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_cluster_access_pkey" PRIMARY KEY ("userId", "clusterId")
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_user_cluster_access_userId" ON "user_cluster_access"("userId");
