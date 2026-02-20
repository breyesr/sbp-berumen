import { db } from "@/lib/clients";
import fs from "fs";
import path from "path";

async function main() {
  try {
    console.log("Reading auth-schema.sql file...");
    const sqlFilePath = path.join(process.cwd(), "scripts", "db", "auth-schema.sql");
    const sql = fs.readFileSync(sqlFilePath, "utf-8");

    console.log("Executing auth-schema.sql...");
    await db.query(sql);

    console.log("Auth.js and RBAC schema setup complete.");
  } catch (error) {
    console.error("Error setting up the database schema:", error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
