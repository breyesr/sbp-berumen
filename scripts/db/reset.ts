import { db } from "../../src/lib/clients";
import fs from "fs";
import path from "path";

async function main() {
  const tablesToDrop = [
    "accounts",
    "sessions",
    "users",
    "verification_tokens",
    "roles",
    "user_roles",
    "applications",
    "role_applications",
    "user_personas",
    "usage_logs", // Existing project tables
    "documents",  // Existing project tables
  ];

  try {
    console.log('Starting database reset...');
    // Drop tables in reverse order to handle foreign key dependencies
    for (const table of tablesToDrop.reverse()) {
      console.log(`Dropping table "${table}"...`);
      await db.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
    }
    console.log('All specified tables dropped successfully.');
  } catch (error) {
    console.error('Error resetting the database:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
