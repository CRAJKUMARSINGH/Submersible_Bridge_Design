import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import engineeringInputs from './engineering_inputs.json';
import { computeStructural, type StructuralResults } from './structural';

// Helper to get traced input value
const getTraceableInput = (id: string, fallback: number) => {
  const item = engineeringInputs.find(i => i.parameter_id === id);
  return item && typeof item.value === 'number' ? item.value : fallback;
};

const calculateObstructionPercent = (ventArea: number, flowArea: number) => {
  if (flowArea <= 0) return 0;
  const obstruction = (1 - (ventArea / flowArea)) * 100;
  return Math.min(100, Math.max(0, obstruction));
};

export type Inputs = {
  // Metadata
  projectName: string;
  streamName: string;
  location: string;
  date: string;

  // Step 1
  catchmentArea: number;
  runoffCoefficient: number;
  rainfallIntensity: number;
  surplusWeirLength: number;
  heightOfFallWeir: number;
  streamAreaHFL: number;
  meanVelocityHFL: number;

  // Step 2
  customDesignDischarge: number | null;
  hfl: number;
  gl: number;
  rtl: number;
  ofl_m: number;
  lbl_m: number;
  bottomDeck_m: number;
  carriageWidth_m: number;
  numVents: number;
  ventWidth: number;
  ventHeight: number;
  approachVelocity: number;
  siltFactor: number;
  cdVent: number;

  // Step 3
  deckWidth: number;
  deckSpan: number;
  deckThickness: number;
  numSpans: number;
  liveLoadType: "IRC Class A" | "IRC Class AA" | "IRC Class 70R";
  waterDensity: number;
  concreteDensity: number;
  dragCoefficient: number;
  siltLoadDeck: number;
  sbc_kN_m2: number;
  d_LBL_depth_m: number;

  // ─── Step 3 (C.3 structural design — Tasks 11–17) ──────────────────────────
  // All new fields are optional so existing Inputs literals keep compiling;
  // computeStructural() applies the same fallbacks when a field is absent.
  // Geometry of the abutment / footing assembly (TYPE_document.md §I).
  deckSlabLength?: number;
  wearingCoatThickness?: number;
  dirtWallArea_m2?: number;
  substructureUnitWeight_kN_m3?: number;
  abutmentSectionArea_m2?: number;
  footingThickness_m?: number;
  footing1Width_m?: number;
  footing2Width_m?: number;
  footing3Width_m?: number;
  abutmentHeight_m?: number;
  abutmentTopWidth_m?: number;
  abutmentBottomWidth_m?: number;
  foundationWidth_m?: number;
  foundationLength_m?: number;

  // Task 12 — Coulomb earth pressure parameters (TYPE_document.md §8).
  backfillPhi?: number;
  wallAngleAlpha?: number;
  backfillSlopeBeta?: number;
  wallFrictionDelta?: number;
  surchargeHeightH3_m?: number;
  backfillUnitWeight_kN_m3?: number;

  // Task 16 — accidental / transient loads (IRC:6-2000 Cl.212/214/222).
  brakingLiveLoad_kN?: number;
  brakingHeight_m?: number;
  windPressureDeck_kg_m2?: number;
  deckExposedHeight_m?: number;
  deckExposedBreadth_m?: number;
  windPerforationFactor?: number;
  windLivePressure_kg_m?: number;
  windLiveHeight_m?: number;
  seismicZone?: string;
};

export type ComputedResults = {
  // Step 1
  qRational: number;
  qWeir: number;
  qVelocity: number;
  qDesign: number;
  governingMethod: string;

  // Step 2
  designDischarge: number;
  aVent: number;
  effectiveWidth: number;
  aRTL: number;
  aHFL: number;
  pctObsRTL: number;
  pctObsHFL: number;
  passRTL: boolean;
  passHFL: boolean;

  velocityHFL: number;
  hAfflux: number;

  laceyPerimeter: number;
  laceyScourDepth: number;
  maxScourDepth: number;
  fbl: number;
  recommendedDepth: number;
  scourSafe: boolean;
  passMinCarriageWidth_m: boolean;
  minCarriageWidthNote: string;
  sanityWarnings: string[];

  // Step 3
  wSelf: number;
  wSilt: number;
  wLive: number;
  totalVerticalLoad: number;

  fDrag: number;
  fUplift: number;
  fAnchor: number;
  fDragTotal: number;

  // Step 3 — C.3 structural design (Tasks 11–17).
  structural: StructuralResults;
};

export type CalculationsContextType = {
  inputs: Inputs;
  updateInput: <K extends keyof Inputs>(key: K, value: Inputs[K]) => void;
  mergeInputs: (patch: Partial<Inputs>) => void;
  resetInputs: () => void;
  results: ComputedResults;
};

export const defaultInputs: Inputs = {
  projectName: "Type Design of Submersible Causeway",
  streamName: "Not Specified",
  location: "B.T to the R/f KB Road to P.Bheemavaram",
  date: "",

  catchmentArea: 12.5,
  runoffCoefficient: 0.45,
  rainfallIntensity: 80,
  surplusWeirLength: 15,
  heightOfFallWeir: 0.6,
  streamAreaHFL: 45,
  meanVelocityHFL: 1.2,

  customDesignDischarge: null,
  hfl: 102.5,
  gl: 100.0,
  rtl: 101.2,
  ofl_m: 5.1,
  lbl_m: 4.2,
  bottomDeck_m: 5.5,
  carriageWidth_m: 7.5,
  numVents: 4,
  ventWidth: 1.5,
  ventHeight: 0.9,
  approachVelocity: 1.2,
  siltFactor: 1.0,
  cdVent: 0.9,

  deckWidth: getTraceableInput("carriage_way_width", 4.5),
  deckSpan: getTraceableInput("clear_right_span", 2.0),
  deckThickness: getTraceableInput("deck_slab_thickness", 0.25),
  numSpans: 6,
  liveLoadType: "IRC Class A",
  waterDensity: getTraceableInput("unit_weight_water", 10) * 100, // converted back to kg/m3 if needed, or formula adjusted
  concreteDensity: getTraceableInput("unit_weight_rcc", 25) * 100,
  dragCoefficient: 2.0,
  siltLoadDeck: 1.2,
  sbc_kN_m2: 98,
  d_LBL_depth_m: 2.0,

  // ─── Step 3 (C.3 structural design — Tasks 11–17) ──────────────────────────
  // Preliminarily-assumed abutment / footing section (TYPE_document.md §I).
  deckSlabLength: 6.8,
  wearingCoatThickness: 0.075,
  dirtWallArea_m2: 0.37,
  substructureUnitWeight_kN_m3: 24,
  abutmentSectionArea_m2: 1.08,
  footingThickness_m: 0.3,
  footing1Width_m: 1.35,
  footing2Width_m: 1.5,
  footing3Width_m: 1.65,
  abutmentHeight_m: 1.2,
  abutmentTopWidth_m: 0.75,
  abutmentBottomWidth_m: 1.05,
  foundationWidth_m: 1.65,
  foundationLength_m: 6.0,

  // Coulomb earth-pressure parameters (TYPE_document.md §8): φ=30°, α=90°, β=0°, δ=15°.
  backfillPhi: 30,
  wallAngleAlpha: 90,
  backfillSlopeBeta: 0,
  wallFrictionDelta: 15,
  surchargeHeightH3_m: 1.2,
  backfillUnitWeight_kN_m3: 18,

  // Accidental / transient loads (IRC:6-2000 Cl.212/214/222).
  brakingLiveLoad_kN: 478.41,
  brakingHeight_m: 1.2,
  windPressureDeck_kg_m2: 59.48,
  deckExposedHeight_m: 1.755,
  deckExposedBreadth_m: 7.4,
  windPerforationFactor: 0.5,
  windLivePressure_kg_m: 300,
  windLiveHeight_m: 1.5,
  seismicZone: "I",
};

export const DEFAULT_GEOMETRY = {
  PIER_W_M: 0.4,
  ABUT_W_M: 0.8,
  FEXT_M: 0.4,
  APP_M: 3.0,
  PMARG_M: 2.0,
  BANK_MULT: 1.6,
} as const;

export type Geometry = typeof DEFAULT_GEOMETRY;

const CalculationsContext = createContext<CalculationsContextType | null>(null);

/**
 * Pure computation core — single source of truth for all derived results.
 * Deliberately free of React so the UI, unit tests and head-less CLI harnesses
 * (e.g. scripts/generate-11span-gad.ts) all share one implementation and can
 * never silently drift apart.
 */
export function computeResults(inputs: Inputs): ComputedResults {
  // ─── STEP 1 ───────────────────────────────────────────────────────────────
  const qRational = (inputs.runoffCoefficient * inputs.rainfallIntensity * inputs.catchmentArea) / 3.6;
  const qWeir = 1.705 * inputs.surplusWeirLength * Math.pow(inputs.heightOfFallWeir, 1.5);
  const qVelocity = inputs.streamAreaHFL * inputs.meanVelocityHFL;

  let qDesign = qRational;
  let governingMethod = "Rational Method";
  if (qWeir > qDesign) { qDesign = qWeir; governingMethod = "Weir Formula"; }
  if (qVelocity > qDesign) { qDesign = qVelocity; governingMethod = "Area-Velocity"; }

  // ─── STEP 2 ───────────────────────────────────────────────────────────────
  const designDischarge = inputs.customDesignDischarge !== null ? inputs.customDesignDischarge : qDesign;

  const aVent = inputs.numVents * inputs.ventWidth * inputs.ventHeight;
  const appVel = inputs.approachVelocity > 0 ? inputs.approachVelocity : 0.01;
  const effectiveWidth = designDischarge / appVel;

  const depthRTL = Math.max(0, inputs.rtl - inputs.gl);
  const aRTL = depthRTL * effectiveWidth;
  const depthHFL = Math.max(0, inputs.hfl - inputs.gl);
  const aHFL = depthHFL * effectiveWidth;

  const pctObsRTL = calculateObstructionPercent(aVent, aRTL);
  const pctObsHFL = calculateObstructionPercent(aVent, aHFL);

  const passRTL = pctObsRTL < 70;
  const passHFL = pctObsHFL < 30;

  const velocityHFL = aHFL > 0 ? designDischarge / aHFL : 0;

  let hAfflux = 0;
  if (aVent > 0 && aHFL > aVent) {
    hAfflux = (Math.pow(velocityHFL, 2) / 17.88 + 0.015) * (Math.pow(aHFL / aVent, 2) - 1);
  }

  const laceyPerimeter = 4.75 * Math.sqrt(designDischarge);
  const sf = inputs.siltFactor > 0 ? inputs.siltFactor : 0.1;
  const laceyScourDepth = 0.473 * Math.pow(designDischarge / sf, 1 / 3);
  const maxScourDepth = 1.27 * laceyScourDepth;
  const fbl = inputs.hfl - maxScourDepth;
  const recommendedDepth = inputs.gl - fbl;
  const scourSafe = fbl < (inputs.gl - 0.5);
  const passMinCarriageWidth_m = inputs.carriageWidth_m >= 6.0;
  const minCarriageWidthNote = inputs.carriageWidth_m < 6.0 ? `FAIL: Carriageway ${inputs.carriageWidth_m.toFixed(3)}m < 6.0m (IRC SP:82-2008 Cl.6.4.2(vi))` : `PASS: ${inputs.carriageWidth_m.toFixed(3)}m ≥ 6.0m minimum`;

  // ─── STEP 3 ───────────────────────────────────────────────────────────────
  const wSelf = (inputs.concreteDensity * 9.81 * inputs.deckWidth * inputs.deckSpan * inputs.deckThickness) / 1000;
  const wSilt = inputs.siltLoadDeck * inputs.deckWidth * inputs.deckSpan;

  // IRC Class A live load — axle-table derivation (E1; IRC:6-2000 Cl.207.1.3 & 207.4).
  // Replaces the previous unsourced 554 kN constant. Wheel point loads from the Class A
  // train placed on the deck slab plus the distributed load on the remaining loaded area
  // (source: TYPE_document.md L274-280):
  //   wheels = 4 × 57.00 kN (11.4 t axle) + 2 × 34.00 kN (6.8 t axle) = 296.00 kN
  //   UDL    = (5.00 live + 2.25 silt) kN/m² × (0.45 + 3.25) m × L_deck = 182.41 kN
  //                                                        total      = 478.41 kN
  const CLASS_A_WHEEL_POINT_LOADS_kN = 4 * 57.0 + 2 * 34.0;
  const CLASS_A_LOADED_UDL_kN_m2 = 5.0 + 2.25;
  const CLASS_A_LOADED_WIDTH_m = 0.45 + 3.25;
  const classALiveLoad =
    CLASS_A_WHEEL_POINT_LOADS_kN +
    CLASS_A_LOADED_UDL_kN_m2 * CLASS_A_LOADED_WIDTH_m * (inputs.deckSlabLength ?? 6.8);

  // IRC:6-2000 Cl.204 — standard vehicle classes. Class AA and Class 70R are both
  // governed by the 700 kN tracked vehicle for these short spans; Class A governs
  // otherwise (no source-supported value exists for any other class).
  const wLive =
    inputs.liveLoadType === "IRC Class AA" || inputs.liveLoadType === "IRC Class 70R"
      ? 700
      : classALiveLoad;

  const totalVerticalLoad = wSelf + wSilt + (wLive / inputs.numSpans);

  const fDrag = (inputs.dragCoefficient * 0.5 * inputs.waterDensity * Math.pow(velocityHFL, 2) * (inputs.deckWidth * inputs.deckThickness)) / 1000;
  const fUplift = (inputs.waterDensity * 9.81 * (inputs.deckWidth * inputs.deckSpan * inputs.deckThickness)) / 1000;
  const fAnchor = fUplift - wSelf;
  const fDragTotal = fDrag * inputs.numSpans;

  // ─── SANITY GUARDS ────────────────────────────────────────────────────────
  // Emit explicit advisories instead of silently printing physically
  // implausible numbers (e.g. an afflux larger than the whole bridge height).
  const sanityWarnings: string[] = [];
  const freeboard_m = inputs.rtl - inputs.hfl;
  if (hAfflux > Math.max(freeboard_m, 0)) {
    sanityWarnings.push(`Afflux h_f = ${hAfflux.toFixed(2)} m exceeds available freeboard (RTL − HFL = ${freeboard_m.toFixed(2)} m) — revise levels or enlarge ventway.`);
  } else if (hAfflux > 0.5) {
    sanityWarnings.push(`Afflux h_f = ${hAfflux.toFixed(2)} m exceeds the 0.50 m indicative limit (IRC SP:82-2008).`);
  }
  if (!scourSafe) {
    sanityWarnings.push(`Scour: FBL ${fbl.toFixed(2)} m is not at least 0.50 m below GL ${inputs.gl.toFixed(2)} m — check foundation depth.`);
  }
  if (!passMinCarriageWidth_m) {
    sanityWarnings.push(minCarriageWidthNote);
  }

  const hydraulic: Omit<ComputedResults, 'structural'> = {
    qRational, qWeir, qVelocity, qDesign, governingMethod,
    designDischarge, aVent, effectiveWidth, aRTL, aHFL,
    pctObsRTL, pctObsHFL, passRTL, passHFL,
    velocityHFL, hAfflux,
    laceyPerimeter, laceyScourDepth, maxScourDepth, fbl, recommendedDepth, scourSafe,
    passMinCarriageWidth_m, minCarriageWidthNote, sanityWarnings,
    wSelf, wSilt, wLive, totalVerticalLoad,
    fDrag, fUplift, fAnchor, fDragTotal,
  };

  // ─── STEP 3 (C.3) — structural design, Tasks 11–17 ────────────────────────
  // Pure, additive extension: consumes the hydraulic results above and returns
  // the dead-load / earth-pressure / stability / bearing / reinforcement /
  // transient / uplift checks. No existing field is altered.
  const structural = computeStructural(inputs, hydraulic as ComputedResults);

  return { ...hydraulic, structural };
}

export function CalculationsProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<Inputs>(() => ({
    ...defaultInputs,
    date: defaultInputs.date || new Date().toISOString().split('T')[0],
  }));

  const updateInput = <K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const mergeInputs = (patch: Partial<Inputs>) => {
    setInputs((prev) => ({ ...prev, ...patch }));
  };

  const resetInputs = () => {
    setInputs({
      ...defaultInputs,
      date: new Date().toISOString().split('T')[0],
    });
  };

  const results = useMemo<ComputedResults>(() => computeResults(inputs), [inputs]);

  return (
    <CalculationsContext.Provider value={{ inputs, updateInput, mergeInputs, resetInputs, results }}>
      {children}
    </CalculationsContext.Provider>
  );
}

export function useCalculations() {
  const ctx = useContext(CalculationsContext);
  if (!ctx) throw new Error("Missing CalculationsProvider");
  return ctx;
}
