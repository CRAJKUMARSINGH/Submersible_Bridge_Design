// Submersible causeway data schema — Section 12 ERD (PROJECT → DESIGN_SET →
// COMPUTED_RESULTS / REPORT_ARTIFACT / VERIFICATION_CHECK).
import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  numeric,
  char,
  jsonb,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// PROJECT — metadata + versioning root.
// ---------------------------------------------------------------------------
export const projectTable = pgTable("project", {
  projectId: serial("project_id").primaryKey(),
  name: text("name").notNull(),
  streamName: text("stream_name"),
  location: text("location"),
  designDate: text("design_date"),
  designCodeEdition: text("design_code_edition"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by"),
  status: text("status").default("DRAFT").notNull(),
  revisionNumber: integer("revision_number").default(1).notNull(),
});

// ---------------------------------------------------------------------------
// DESIGN_SET — one complete design iteration for a given input set.
// ---------------------------------------------------------------------------
export const designSetTable = pgTable("design_set", {
  designSetId: serial("design_set_id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projectTable.projectId),
  setLabel: text("set_label"),
  isBaseline: boolean("is_baseline").default(false).notNull(),
  supersededBy: integer("superseded_by").references(
    (): AnyPgColumn => designSetTable.designSetId,
  ),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),

  // Hydrological levels (m)
  hfl: numeric("hfl"),
  ofl: numeric("ofl"),
  lbl: numeric("lbl"),
  gl: numeric("gl"),
  rtl: numeric("rtl"),
  bottomDeck: numeric("bottom_deck"),

  // Step 1 — discharge inputs
  catchmentArea: numeric("catchment_area"),
  runoffCoeff: numeric("runoff_coeff"),
  rainfallIntensity: numeric("rainfall_intensity"),
  surplusWeirLength: numeric("surplus_weir_length"),
  weirHead: numeric("weir_head"),
  streamAreaHfl: numeric("stream_area_hfl"),
  meanVelHfl: numeric("mean_vel_hfl"),
  qDesignOverride: numeric("q_design_override"),

  // Step 2 — hydraulic geometry
  numVents: integer("num_vents"),
  ventWidth: numeric("vent_width"),
  ventHeight: numeric("vent_height"),
  approachVel: numeric("approach_vel"),
  laceySiltF: numeric("lacey_silt_f"),
  cdVent: numeric("cd_vent"),

  // Step 3 — superstructure
  deckWidth: numeric("deck_width"),
  carriageWidth: numeric("carriage_width"),
  deckSpan: numeric("deck_span"),
  deckThickness: numeric("deck_thickness"),
  numSpans: integer("num_spans"),
  liveLoadClass: text("live_load_class"),
  waterDensity: numeric("water_density"),
  concreteDensity: numeric("concrete_density"),
  dragCoefficient: numeric("drag_coefficient"),
  siltLoadDeck: numeric("silt_load_deck"),

  // Geotechnical / materials
  sbcKNm2: numeric("sbc_kN_m2"),
  backfillPhiDeg: numeric("backfill_phi_deg"),
  backfillBetaDeg: numeric("backfill_beta_deg"),
  wallFrictionDelta: numeric("wall_friction_delta"),
  surchargeHM: numeric("surcharge_h_m"),
  fckVrccMpa: numeric("fck_vrcc_Mpa"),
  fckPccMpa: numeric("fck_pcc_Mpa"),
  fyMpa: numeric("fy_Mpa"),
  coverMm: numeric("cover_mm"),
  gammaRcKNm3: numeric("gamma_rc_kN_m3"),
  gammaPcKNm3: numeric("gamma_pc_kN_m3"),
  gammaBackfillKNm3: numeric("gamma_backfill_kN_m3"),
  gammaWKNm3: numeric("gamma_w_kN_m3"),

  // Abutment / pier geometry
  pierWidthM: numeric("pier_width_m"),
  abutTopWidthM: numeric("abut_top_width_m"),
  abutBotWidthM: numeric("abut_bot_width_m"),
  footingExtM: numeric("footing_ext_m"),
  approachLengthM: numeric("approach_length_m"),

  // Bearing
  bearingType: text("bearing_type"),
  bearingStiffness: numeric("bearing_stiffness"),
});

// ---------------------------------------------------------------------------
// COMPUTED_RESULTS — immutable engine output. 1:1 with DESIGN_SET.
// ---------------------------------------------------------------------------
export const computedResultsTable = pgTable("computed_results", {
  crId: serial("cr_id").primaryKey(),
  designSetId: integer("design_set_id")
    .notNull()
    .unique()
    .references(() => designSetTable.designSetId),
  calcEngineVersion: text("calc_engine_version").notNull(),
  calcTimestamp: timestamp("calc_timestamp").defaultNow().notNull(),
  resultsHash: char("results_hash", { length: 64 }).notNull(),

  // Step 1
  qRational: numeric("q_rational"),
  qWeir: numeric("q_weir"),
  qVelocity: numeric("q_velocity"),
  qDesign: numeric("q_design"),
  governingMethod: text("governing_method"),

  // Step 2
  designDischarge: numeric("design_discharge"),
  aVent: numeric("a_vent"),
  effectiveWidth: numeric("effective_width"),
  aRtl: numeric("a_rtl"),
  aHfl: numeric("a_hfl"),
  pctObsRtl: numeric("pct_obs_rtl"),
  pctObsHfl: numeric("pct_obs_hfl"),
  passRtl: boolean("pass_rtl"),
  passHfl: boolean("pass_hfl"),
  velocityHfl: numeric("velocity_hfl"),
  hAfflux: numeric("h_afflux"),
  laceyPerimeter: numeric("lacey_perimeter"),
  laceyScourDepth: numeric("lacey_scour_depth"),
  maxScourDepth: numeric("max_scour_depth"),
  fbl: numeric("fbl"),
  recommendedDepth: numeric("recommended_depth"),
  scourSafe: boolean("scour_safe"),

  // Step 3
  wSelf: numeric("w_self"),
  wSelfDeck: numeric("w_self_deck"),
  wSelfDirtwall: numeric("w_self_dirtwall"),
  wSelfWearingcoat: numeric("w_self_wearingcoat"),
  wSelfAbutmentTotal: numeric("w_self_abutment_total"),
  wSilt: numeric("w_silt"),
  wLiveTotal: numeric("w_live_total"),
  wLivePerSpan: numeric("w_live_per_span"),
  wImpact: numeric("w_impact"),
  wBrakingKN: numeric("w_braking_kN"),
  wWindKN: numeric("w_wind_kN"),
  fDragPerSpan: numeric("f_drag_per_span"),
  fUpliftPerSpan: numeric("f_uplift_per_span"),
  fAnchorRequiredKN: numeric("f_anchor_required_kN"),
  fDragTotal: numeric("f_drag_total"),
  pActiveEarthKN: numeric("p_active_earth_kN"),
  pPassiveEarthKN: numeric("p_passive_earth_kN"),
  slidingFos: numeric("sliding_fos"),
  overturningFos: numeric("overturning_fos"),
  bearingPressureMaxKpa: numeric("bearing_pressure_max_kPa"),
  bearingEccM: numeric("bearing_ecc_m"),
  anchorCountRequired: integer("anchor_count_required"),
  anchorDiaMm: numeric("anchor_dia_mm"),
  reinforcementAstMm2PerM: numeric("reinforcement_ast_mm2_per_m"),
  minReinforcementSatisfied: boolean("min_reinforcement_satisfied"),
});

// ---------------------------------------------------------------------------
// REPORT_ARTIFACT — every generated deliverable, hashed and version-stamped.
// ---------------------------------------------------------------------------
export const reportArtifactTable = pgTable("report_artifact", {
  artifactId: serial("artifact_id").primaryKey(),
  designSetId: integer("design_set_id")
    .notNull()
    .references(() => designSetTable.designSetId),
  artifactType: text("artifact_type").notNull(),
  filePath: text("file_path"),
  fileHashSha256: char("file_hash_sha256", { length: 64 }).notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  generatorVersion: text("generator_version"),
  qaScoreJson: jsonb("qa_score_json"),
});

// ---------------------------------------------------------------------------
// VERIFICATION_CHECK — V&V evidence per design set (Section 14 items).
// ---------------------------------------------------------------------------
export const verificationCheckTable = pgTable("verification_check", {
  checkId: serial("check_id").primaryKey(),
  designSetId: integer("design_set_id")
    .notNull()
    .references(() => designSetTable.designSetId),
  checkType: text("check_type").notNull(),
  checkRef: text("check_ref"),
  status: text("status").default("PENDING").notNull(),
  actualValue: numeric("actual_value"),
  expectedValue: numeric("expected_value"),
  verifiedBy: text("verified_by"),
  verifiedAt: timestamp("verified_at"),
  evidencePath: text("evidence_path"),
  discrepancyNote: text("discrepancy_note"),
});

// ---------------------------------------------------------------------------
// Zod insert schemas + inferred types.
// ---------------------------------------------------------------------------
export const insertProjectSchema = createInsertSchema(projectTable).omit({
  projectId: true,
  createdAt: true,
});
export const insertDesignSetSchema = createInsertSchema(designSetTable).omit({
  designSetId: true,
});
export const insertComputedResultsSchema = createInsertSchema(
  computedResultsTable,
).omit({ crId: true, calcTimestamp: true });
export const insertReportArtifactSchema = createInsertSchema(
  reportArtifactTable,
).omit({ artifactId: true, generatedAt: true });
export const insertVerificationCheckSchema = createInsertSchema(
  verificationCheckTable,
).omit({ checkId: true });

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertDesignSet = z.infer<typeof insertDesignSetSchema>;
export type InsertComputedResults = z.infer<typeof insertComputedResultsSchema>;
export type InsertReportArtifact = z.infer<typeof insertReportArtifactSchema>;
export type InsertVerificationCheck = z.infer<
  typeof insertVerificationCheckSchema
>;

export type Project = typeof projectTable.$inferSelect;
export type DesignSet = typeof designSetTable.$inferSelect;
export type ComputedResultsRow = typeof computedResultsTable.$inferSelect;
export type ReportArtifact = typeof reportArtifactTable.$inferSelect;
export type VerificationCheck = typeof verificationCheckTable.$inferSelect;
