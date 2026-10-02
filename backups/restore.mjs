// Restores a full-backup snapshot (one JSON file per table) back into the
// database. DESTRUCTIVE: truncates every table covered by the backup before
// reinserting its rows. Only ever run this deliberately, against the backup
// folder you actually mean to restore, with DATABASE_URL pointed at the
// database you actually mean to overwrite.
//
// Usage:
//   node --env-file=.env.local backups/restore.mjs backups/2026-10-02T09-38-12_full-backup
import pg from "pg";
import fs from "node:fs";
import path from "node:path";

const backupDir = process.argv[2];
if (!backupDir || !fs.existsSync(backupDir)) {
  console.error("Usage: node backups/restore.mjs <path-to-backup-folder>");
  process.exit(1);
}

// Parent-to-child order (matches prisma/schema.prisma declaration order) —
// inserts run in this order, deletes run in reverse, so foreign keys are
// never violated either way.
const TABLE_ORDER = [
  "AdminUser",
  "Designer",
  "Collection",
  "Category",
  "Product",
  "StockMovement",
  "SkuSequence",
  "CustomOrder",
  "ProductImage",
  "HeroImage",
  "HomeContent",
  "AboutContent",
  "ProductsContent",
  "ConsultingContent",
  "TradeContent",
  "ContactInfo",
  "Settings",
  "WholesaleAccount",
  "WholesaleProductPrice",
  "SpecialOrderRequest",
  "MenuItem",
  "SocialLink",
  "Enquiry",
  "Order",
  "UiTranslation",
  "ContentTranslation",
];

const metadata = JSON.parse(fs.readFileSync(path.join(backupDir, "_metadata.json"), "utf8"));
console.log("Restoring backup from", metadata.createdAt, "— git commit", metadata.gitCommit);

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

const tablesPresent = TABLE_ORDER.filter((t) => fs.existsSync(path.join(backupDir, `${t}.json`)));

await db.query("BEGIN");
try {
  for (const table of [...tablesPresent].reverse()) {
    await db.query(`DELETE FROM "${table}"`);
  }
  for (const table of tablesPresent) {
    const rows = JSON.parse(fs.readFileSync(path.join(backupDir, `${table}.json`), "utf8"));
    for (const row of rows) {
      const columns = Object.keys(row);
      const values = columns.map((c) => row[c]);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
      const columnList = columns.map((c) => `"${c}"`).join(", ");
      await db.query(`INSERT INTO "${table}" (${columnList}) VALUES (${placeholders})`, values);
    }
    console.log(`restored ${table}: ${rows.length} rows`);
  }
  await db.query("COMMIT");
  console.log("Restore complete.");
} catch (err) {
  await db.query("ROLLBACK");
  console.error("Restore failed, rolled back:", err);
  process.exit(1);
} finally {
  await db.end();
}
