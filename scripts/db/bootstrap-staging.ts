import { db } from "../../src/lib/clients";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

/**
 * STAGING BOOTSTRAP SCRIPT
 * Run this ONCE to initialize a new database.
 * 
 * Usage: 
 * ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword npx tsx scripts/db/bootstrap-staging.ts
 */

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("❌ ERROR: ADMIN_PASSWORD environment variable is required.");
    process.exit(1);
  }

  console.log("🚀 Starting Staging Database Bootstrap...");

  try {
    // 1. Run Reset (Drop tables)
    console.log("--- Phase 1: Cleaning Database ---");
    const tablesToDrop = [
      "user_cluster_access",
      "user_personas",
      "role_applications",
      "user_roles",
      "roles",
      "applications",
      "accounts",
      "sessions",
      "verification_tokens",
      "users",
      "clusters",
      "personas",
      "documents",
      "usage_logs"
    ];

    for (const table of tablesToDrop) {
      console.log(`Dropping table "${table}" if exists...`);
      await db.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
    }

    // 2. Run SQL Schemas
    console.log("\n--- Phase 2: Creating Schemas ---");
    const sqlFiles = [
      "auth-schema.sql",
      "personas-schema.sql",
      "clusters-schema.sql",
      "clusters-access-schema.sql"
    ];

    for (const file of sqlFiles) {
      const filePath = path.join(process.cwd(), "scripts", "db", file);
      if (fs.existsSync(filePath)) {
        console.log(`Executing ${file}...`);
        const sql = fs.readFileSync(filePath, "utf-8");
        await db.query(sql);
      }
    }

    // 3. Create Admin User
    console.log("\n--- Phase 3: Creating Admin User ---");
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await db.query(
      `INSERT INTO "users" (id, email, password, name, locale) VALUES ($1, $2, $3, $4, $5)`,
      [userId, adminEmail, hashedPassword, "Admin User", "en-US"]
    );
    console.log(`✅ User created: ${adminEmail}`);

    // Assign Admin Role (Role ID 1 is admin per auth-schema.sql)
    await db.query(
      `INSERT INTO "user_roles" ("userId", "roleId") VALUES ($1, $2)`,
      [userId, 1]
    );
    console.log(`✅ Admin role assigned to ${adminEmail}`);

    // Assign all initial clusters to the admin
    const clusters = await db.query(`SELECT id FROM "clusters"`);
    for (const cluster of clusters.rows) {
      await db.query(
        `INSERT INTO "user_cluster_access" ("userId", "clusterId") VALUES ($1, $2)`,
        [userId, cluster.id]
      );
    }
    console.log(`✅ Access to all initial clusters granted.`);

    console.log("\n✨ Bootstrap Complete! Staging database is ready.");

  } catch (error) {
    console.error("❌ Bootstrap failed:", error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
