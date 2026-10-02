// Snapshots every table in the database to JSON (one file per table) plus a
// _metadata.json recording the current git commit, so the snapshot can be
// paired with the matching code revision. Not a pg_dump-style SQL file —
// restore.mjs reads this same JSON format back in.
//
// Usage:
//   node --env-file=.env.local backups/backup.mjs
import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

const { rows: tableRows } = await db.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  ORDER BY table_name
`);
const tables = tableRows.map((r) => r.table_name);

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outDir = path.join("backups", `${stamp}_full-backup`);
fs.mkdirSync(outDir, { recursive: true });

const counts = {};
for (const table of tables) {
  const { rows } = await db.query(`SELECT * FROM "${table}"`);
  fs.writeFileSync(path.join(outDir, `${table}.json`), JSON.stringify(rows, null, 2));
  counts[table] = rows.length;
}

const gitCommit = execSync("git rev-parse HEAD").toString().trim();
const gitBranch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();

const metadata = {
  createdAt: new Date().toISOString(),
  gitCommit,
  gitBranch,
  tableRowCounts: counts,
  note: "Database snapshot taken as JSON (one file per table) via pg, not pg_dump (not available in this environment). Restore with backups/restore.mjs.",
};
fs.writeFileSync(path.join(outDir, "_metadata.json"), JSON.stringify(metadata, null, 2));

console.log("Backup written to:", outDir);
console.log(JSON.stringify(counts, null, 2));

await db.end();
