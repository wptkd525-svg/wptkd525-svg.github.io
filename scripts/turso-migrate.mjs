import "dotenv/config";
import { createClient } from "@libsql/client";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

async function runLocalMigrate() {
  const { execSync } = await import("node:child_process");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  if (process.env.VERCEL) {
    console.warn(
      "Turso env not set on Vercel — skipping migration (set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN).",
    );
    process.exit(0);
  }
  console.log("Turso env not set — running local SQLite migration.");
  await runLocalMigrate();
  process.exit(0);
}

const client = createClient({ url, authToken });
const migrationsDir = path.join(process.cwd(), "prisma", "migrations");

await client.execute(`
  CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checksum" TEXT NOT NULL,
    "finished_at" DATETIME,
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" DATETIME,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER UNSIGNED NOT NULL DEFAULT 0
  )
`);

const entries = await readdir(migrationsDir, { withFileTypes: true });
const migrationNames = entries
  .filter((e) => e.isDirectory() && e.name !== "migration_lock.toml")
  .map((e) => e.name)
  .sort();

for (const name of migrationNames) {
  const applied = await client.execute({
    sql: `SELECT id FROM "_prisma_migrations" WHERE migration_name = ?`,
    args: [name],
  });

  if (applied.rows.length > 0) {
    console.log(`Already applied: ${name}`);
    continue;
  }

  const sqlPath = path.join(migrationsDir, name, "migration.sql");
  const sql = await readFile(sqlPath, "utf8");
  const checksum = createHash("sha256").update(sql).digest("hex");
  const id = crypto.randomUUID();

  console.log(`Applying: ${name}`);
  await client.executeMultiple(sql);
  await client.execute({
    sql: `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count)
          VALUES (?, ?, datetime('now'), ?, 1)`,
    args: [id, checksum, name],
  });
}

console.log("Turso migrations complete.");
