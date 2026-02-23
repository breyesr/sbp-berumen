-- Drop tables if they exist to ensure a clean slate
DROP TABLE IF EXISTS "user_personas" CASCADE;
DROP TABLE IF EXISTS "role_applications" CASCADE;
DROP TABLE IF EXISTS "user_roles" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;
DROP TABLE IF EXISTS "applications" CASCADE;
DROP TABLE IF EXISTS "accounts" CASCADE;
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "verification_tokens" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Auth.js Core Tables
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "locale" TEXT,
    "two_factor_secret" TEXT,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "current_session_token" TEXT,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_locale_check" CHECK ("locale" IN ('es-MX', 'en-US'))
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "accounts" (
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("provider","providerAccountId")
);

CREATE TABLE "sessions" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("sessionToken")
);

CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
);

-- RBAC (Role-Based Access Control) Tables
CREATE TABLE "roles" (
    "id" SERIAL,
    "name" TEXT NOT NULL,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

CREATE TABLE "user_roles" (
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "roleId" INTEGER NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

CREATE TABLE "applications" (
    "id" SERIAL,
    "name" TEXT NOT NULL,
    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "applications_name_key" ON "applications"("name");

CREATE TABLE "role_applications" (
    "roleId" INTEGER NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    "applicationId" INTEGER NOT NULL REFERENCES "applications"("id") ON DELETE CASCADE,
    CONSTRAINT "role_applications_pkey" PRIMARY KEY ("roleId","applicationId")
);

CREATE TABLE "user_personas" (
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "personaId" TEXT NOT NULL,
    CONSTRAINT "user_personas_pkey" PRIMARY KEY ("userId","personaId")
);

-- Seed initial data
INSERT INTO "roles" (id, name) VALUES (1, 'admin'), (2, 'user') ON CONFLICT DO NOTHING;
INSERT INTO "applications" (id, name) VALUES (1, 'idea-tester'), (2, 'copywriter') ON CONFLICT DO NOTHING;
INSERT INTO "role_applications" ("roleId", "applicationId") VALUES (1, 1), (1, 2), (2, 1), (2, 2) ON CONFLICT DO NOTHING;
