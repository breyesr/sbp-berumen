import { db } from "@/lib/clients";

async function main() {
  try {
    console.log("Starting locale migration...");

    await db.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locale" TEXT;');

    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'users_locale_check'
        ) THEN
          ALTER TABLE "users"
          ADD CONSTRAINT "users_locale_check"
          CHECK ("locale" IN ('es-MX', 'en-US'));
        END IF;
      END $$;
    `);

    await db.query(`
      UPDATE "users"
      SET "locale" = NULL
      WHERE "locale" IS NOT NULL
        AND "locale" NOT IN ('es-MX', 'en-US');
    `);

    console.log("Locale migration complete.");
  } catch (error) {
    console.error("Locale migration failed:", error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();

