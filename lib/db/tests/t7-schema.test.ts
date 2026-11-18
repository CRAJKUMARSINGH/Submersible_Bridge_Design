import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getTableConfig } from "drizzle-orm/pg-core";

import {
  projectTable,
  designSetTable,
  computedResultsTable,
  reportArtifactTable,
  verificationCheckTable,
  insertProjectSchema,
  insertDesignSetSchema,
  insertComputedResultsSchema,
  insertReportArtifactSchema,
  insertVerificationCheckSchema,
} from "../src/schema/index.ts";
import {
  sha256Hex,
  hashFileSha256,
  canonicalJson,
  hashComputedResults,
  getEngineVersion,
  buildComputedResultsRow,
  buildReportArtifactRow,
} from "../src/artifacts.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

function readMigrationSql(): string {
  const dir = resolve(__dirname, "../drizzle");
  const sqlFiles = readdirSync(dir).filter((n) => n.endsWith(".sql"));
  assert.equal(sqlFiles.length >= 1, true, "expected a generated migration .sql");
  return sqlFiles
    .sort()
    .map((n) => readFileSync(join(dir, n), "utf8"))
    .join("\n");
}

const TABLES = {
  project: projectTable,
  design_set: designSetTable,
  computed_results: computedResultsTable,
  report_artifact: reportArtifactTable,
  verification_check: verificationCheckTable,
};

test("T7-01 the five Section-12 tables exist, each with a primary key", () => {
  const expectedPk = {
    project: "project_id",
    design_set: "design_set_id",
    computed_results: "cr_id",
    report_artifact: "artifact_id",
    verification_check: "check_id",
  } as const;

  for (const [name, table] of Object.entries(TABLES)) {
    const cfg = getTableConfig(table as never);
    assert.equal(cfg.name, name, `table name mismatch for ${name}`);
    const pk = cfg.columns.filter((c) => c.primary);
    assert.equal(pk.length, 1, `${name} must have exactly one PK column`);
    assert.equal(pk[0].name, expectedPk[name as keyof typeof expectedPk]);
  }
});

test("T7-02 foreign keys wire DESIGN_SET to PROJECT and children to DESIGN_SET", () => {
  const sql = readMigrationSql();

  const fk = (table: string, column: string, refTable: string, refColumn: string) =>
    new RegExp(
      `ALTER TABLE "${table}" ADD CONSTRAINT "[^"]+" FOREIGN KEY \\("${column}"\\) ` +
        `REFERENCES "public"\\."${refTable}"\\("${refColumn}"\\)`,
    );

  assert.match(sql, fk("design_set", "project_id", "project", "project_id"));
  assert.match(sql, fk("design_set", "superseded_by", "design_set", "design_set_id"));
  assert.match(sql, fk("computed_results", "design_set_id", "design_set", "design_set_id"));
  assert.match(sql, fk("report_artifact", "design_set_id", "design_set", "design_set_id"));
  assert.match(sql, fk("verification_check", "design_set_id", "design_set", "design_set_id"));
});

test("T7-03 COMPUTED_RESULTS is 1:1 with DESIGN_SET (unique design_set_id)", () => {
  const cfg = getTableConfig(computedResultsTable);
  const col = cfg.columns.find((c) => c.name === "design_set_id")!;
  assert.ok(col, "computed_results.design_set_id must exist");
  assert.equal(col.notNull, true);
  assert.equal(
    col.isUnique,
    true,
    "design_set_id must be UNIQUE so a DESIGN_SET can have at most one COMPUTED_RESULTS row",
  );
});

test("T7-04 generated migration declares 5 tables with PK, the 1:1 UNIQUE and FKs", () => {
  const sql = readMigrationSql();

  for (const name of Object.keys(TABLES)) {
    assert.match(sql, new RegExp(`CREATE TABLE "${name}"`), `missing CREATE TABLE ${name}`);
  }
  assert.equal((sql.match(/PRIMARY KEY/g) ?? []).length, 5, "each table needs a PRIMARY KEY");
  assert.match(
    sql,
    /CONSTRAINT "computed_results_design_set_id_unique" UNIQUE\("design_set_id"\)/,
    "the 1:1 constraint must be emitted as UNIQUE(design_set_id)",
  );
  assert.equal((sql.match(/ADD CONSTRAINT .* FOREIGN KEY/g) ?? []).length, 5, "expected 5 FK constraints");
});

test("T7-05 REPORT_ARTIFACT.file_hash_sha256 matches the hash of the file on disk", () => {
  const dir = mkdtempSync(join(tmpdir(), "sbd-t7-"));
  const file = join(dir, "report.pdf");
  const bytes = Buffer.from("%PDF-1.4 test artifact bytes\n%%EOF", "utf8");
  writeFileSync(file, bytes);

  const onDisk = hashFileSha256(file);
  const independently = createHash("sha256").update(bytes).digest("hex");
  assert.equal(onDisk, independently, "helper must equal a plain sha256 of the bytes");
  assert.match(onDisk, /^[0-9a-f]{64}$/);

  const row = buildReportArtifactRow({
    designSetId: 7,
    artifactType: "7-SHEET-PDF",
    filePath: file,
    fileBytes: readFileSync(file),
    generatorVersion: "test",
  });
  assert.equal(row.fileHashSha256, onDisk, "artifact row hash must match the on-disk file");
});

test("T7-06 result hashing is deterministic and order-independent; version is stamped", () => {
  const a = { qDesign: 125, governing: "Rational", pass: true };
  const b = { pass: true, governing: "Rational", qDesign: 125 };
  assert.equal(canonicalJson(a), canonicalJson(b));
  assert.equal(hashComputedResults(a), hashComputedResults(b));
  assert.match(hashComputedResults(a), /^[0-9a-f]{64}$/);

  const row = buildComputedResultsRow({
    designSetId: 1,
    results: a,
    engineVersion: getEngineVersion({ gitSha: "abcdef1234567", packageVersion: "1.0.0" }),
  });
  assert.equal(row.calcEngineVersion, "1.0.0+abcdef1");
  assert.equal(row.resultsHash, hashComputedResults(a));
  assert.notEqual(hashComputedResults(a), hashComputedResults({ ...a, qDesign: 126 }));
  assert.equal(sha256Hex("x").length, 64);
});

test("T7-07 insert schemas accept a valid row and reject a bad one", () => {
  assert.equal(insertProjectSchema.safeParse({ name: "Bridge-01" }).success, true);
  assert.equal(insertProjectSchema.safeParse({}).success, false);

  assert.equal(
    insertDesignSetSchema.safeParse({ projectId: 1 }).success,
    true,
    "design_set only requires project_id",
  );

  const cr = { designSetId: 1, calcEngineVersion: "1.0.0+abc", resultsHash: "a".repeat(64) };
  assert.equal(insertComputedResultsSchema.safeParse(cr).success, true);

  const ra = {
    designSetId: 1,
    artifactType: "7-SHEET-PDF",
    fileHashSha256: "b".repeat(64),
  };
  assert.equal(insertReportArtifactSchema.safeParse(ra).success, true);

  const vc = { designSetId: 1, checkType: "UNIT", status: "PASS" };
  assert.equal(insertVerificationCheckSchema.safeParse(vc).success, true);
});

// Requires a provisioned PostgreSQL (DATABASE_URL) with the migration applied.
// Skipped otherwise; the 1:1 guarantee is asserted at the DDL level in T7-03/T7-04.
test(
  "T7-08 (live DB) a second COMPUTED_RESULTS for the same DESIGN_SET is rejected",
  { skip: !process.env.DATABASE_URL },
  async () => {
    const { default: pg } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const schema = await import("../src/schema/index.ts");

    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });
    try {
      const [project] = await db
        .insert(schema.projectTable)
        .values({ name: "T7 live check" })
        .returning();
      const [ds] = await db
        .insert(schema.designSetTable)
        .values({ projectId: project.projectId })
        .returning();

      const row = {
        designSetId: ds.designSetId,
        calcEngineVersion: "1.0.0+live",
        resultsHash: "a".repeat(64),
      };
      await db.insert(schema.computedResultsTable).values(row);
      await assert.rejects(async () => {
        await db.insert(schema.computedResultsTable).values(row);
      }, "the second COMPUTED_RESULTS for the same DESIGN_SET must violate UNIQUE");
    } finally {
      await pool.end();
    }
  },
);
