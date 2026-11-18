// Artifact / result stamping helpers (Section 12, R10).
//
// Every persisted COMPUTED_RESULTS row carries a deterministic hash of the
// engine output plus the engine version string (git sha + package version), and
// every REPORT_ARTIFACT row carries the sha256 of the generated file so a report
// on disk can be proven to match the row that produced it.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

/** sha256 hex digest of a string or raw bytes. */
export function sha256Hex(data: string | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

/** sha256 hex digest of a file on disk. */
export function hashFileSha256(filePath: string): string {
  return sha256Hex(readFileSync(filePath));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    const src = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(src).sort()) out[key] = sortValue(src[key]);
    return out;
  }
  return value;
}

/** JSON with recursively sorted object keys — stable across key insertion order. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

/** Engine version stamp: "<package version>+<git sha (7)>". */
export function getEngineVersion(opts: {
  gitSha?: string;
  packageVersion?: string;
} = {}): string {
  const sha =
    opts.gitSha ?? process.env.GIT_SHA ?? process.env.VITE_GIT_SHA ?? "unknown";
  const version =
    opts.packageVersion ?? process.env.npm_package_version ?? "0.0.0";
  return `${version}+${sha.slice(0, 7)}`;
}

/** Deterministic hash of a computation result set. */
export function hashComputedResults(results: unknown): string {
  return sha256Hex(canonicalJson(results));
}

/** COMPUTED_RESULTS insert payload for one design set. */
export function buildComputedResultsRow(args: {
  designSetId: number;
  results: unknown;
  engineVersion?: string;
}) {
  return {
    designSetId: args.designSetId,
    calcEngineVersion: args.engineVersion ?? getEngineVersion(),
    resultsHash: hashComputedResults(args.results),
  };
}

export type ReportArtifactType =
  | "7-SHEET-PDF"
  | "169-PAGE-PDF"
  | "WORD-REPORT"
  | "DRAWING-DWG";

/** REPORT_ARTIFACT insert payload, with the file hash taken from the bytes. */
export function buildReportArtifactRow(args: {
  designSetId: number;
  artifactType: ReportArtifactType;
  filePath?: string | null;
  fileBytes: string | Uint8Array;
  generatorVersion?: string;
  qaScoreJson?: unknown;
}) {
  return {
    designSetId: args.designSetId,
    artifactType: args.artifactType,
    filePath: args.filePath ?? null,
    fileHashSha256: sha256Hex(args.fileBytes),
    generatorVersion: args.generatorVersion ?? getEngineVersion(),
    qaScoreJson: args.qaScoreJson ?? null,
  };
}
