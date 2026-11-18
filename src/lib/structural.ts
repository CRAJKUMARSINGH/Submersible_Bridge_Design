/**
 * structural.ts — C.3 STRUCTURAL DESIGN engine (Tasks 11–17).
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure, side-effect-free implementation of the abutment / causeway structural
 * design checks. No React, no I/O, no randomness — so the UI, the head-less CLI
 * harnesses and the unit tests all consume one single source of truth.
 *
 * Engineering basis (all values cross-checked against):
 *   data/extracted/TYPE_document.md  — "Design of Abutments for causeway"
 *   IRC:6-2000, IRC:78-2000, IRC SP:82-2007, IRC:SP20-2002, IS 456 (SP:16)
 *
 * The document works in kN/m³ (RCC 25, PCC 24, backfill 18, water 10) whereas the
 * app `Inputs` carry concrete / water density in kg/m³ (2500, 1000). Dividing the
 * kg/m³ input by 100 reproduces the document's exact kN/m³ unit weights.
 */

import type { ComputedResults, Inputs } from './calculations';

// ─── Named design constants (clause thresholds) ──────────────────────────────
// NOTE: the source document used FOS 1.25 (sliding) / 1.5 (overturning). This
// module deliberately applies the stricter specification thresholds below.
export const FOS_SLIDING_MIN = 1.5;
export const FOS_OVERTURNING_MIN = 2.0;
export const SLIDING_FRICTION_COEFFICIENT = 0.5;
export const NO_TENSION_LIMIT = 1.0; // 6e/b must be < 1 (IRC:78-2000 Cl.706.3.3.1)
export const BAR_DIAMETER_MM = 12; // assumed bar diameter (stated per Task 15)
export const REINFORCEMENT_COVER_MM = 50; // source "Cover to reinforcement = 50 mm"
export const FCK_VRCC = 25; // M25 VRCC (beam / abutment) — E18
export const FCK_PCC = 20; // M20 PCC — E18
export const STEEL_FY = 415; // Fe415 — E18
// NOTE (E18 / Task 22): M15 appears only in the source bearing-pressure tables and is
// deliberately NOT used for any design check — design uses M20 (PCC) / M25 (VRCC).
export const MIN_STEEL_SLAB_PCT = 0.12; // IS456 Cl.26.5.2.1 (slab/abutment stem)
export const MIN_STEEL_FOOTING_PCT = 0.15; // IS456 Cl.26.5.2.1 (footings)
export const KG_PER_M3_TO_KN_PER_M3 = 100;

// Task 16 constants
export const BRAKING_PERCENT_OF_LIVE_LOAD = 0.2; // IRC:6-2000 Cl.214.2
export const BRAKING_DISTRIBUTION_TO_SUPPORT = 0.5; // IRC:6-2000 Cl.214.5.1.3 (no bearings)

// ─── Result shapes ───────────────────────────────────────────────────────────

export interface DeadLoadResults {
  /** Self weight of the deck slab (per abutment share). */
  deckSlab: number;
  /** Self weight of the dirt wall over the abutment (IRC:SP20-2002 Plate 7.25). */
  dirtWall: number;
  /** Self weight of the wearing coat. */
  wearingCoat: number;
  superstructureTotal: number;
  abutmentShaft: number;
  footing1: number;
  footing2: number;
  footing3: number;
  footing4: number;
  substructureTotal: number;
  totalDeadLoad: number;
  /** Location of the dead-load resultant from the toe, 4 loading cases (m). */
  resultantsFromToe: number[];
  /** Eccentricity wrt the centre of the governing base, 4 loading cases (m). */
  eccentricities: number[];
}

export interface EarthPressureResults {
  /** Coulomb coefficient of active earth pressure. */
  ka: number;
  /** Passive coefficient (Kp = 1/Ka); passive resistance is not mobilised here. */
  kp: number;
  activePressureBase: number; // kN/m² — triangular base pressure γ·H·Ka
  surchargePressure: number; // kN/m² — rectangular surcharge γ·h3·Ka
  rectangularArea: number; // kN/m — surcharge diagram area
  triangularArea: number; // kN/m — active diagram area
  totalThrust: number; // kN — total active earth pressure P
  horizontalComponent: number; // kN — Ph = P·cos(δ)
  verticalComponent: number; // kN — Pv = P·sin(δ)
  leverArmFromBase: number; // m
  momentAboutToe: number; // kNm
}

export interface StabilityResults {
  totalVertical: number;
  totalHorizontal: number;
  slidingResistance: number;
  fosSliding: number;
  slidingSafe: boolean;
  restoringMoment: number;
  overturningMoment: number;
  fosOverturning: number;
  overturningSafe: boolean;
}

export interface BearingResults {
  area: number;
  totalLoad: number;
  eccentricity: number;
  pMax: number;
  pMin: number;
  sixEOverB: number;
  noTension: boolean;
  sbc: number;
  sbcUtilisation: number; // %
  bearingSafe: boolean;
}

export interface ReinforcementSection {
  thicknessMm: number;
  effectiveDepthMm: number;
  serviceMoment: number; // kNm/m
  ultimateMoment: number; // kNm/m (1.5 × service)
  fck: number;
  fy: number;
  astRequired: number; // mm²/m — from the IS456 quadratic
  astMin: number; // mm²/m — minimum steel
  astGoverns: number; // mm²/m — the larger of the two
}

export interface ReinforcementResults {
  stem: ReinforcementSection;
  deckSlab: ReinforcementSection;
  barDiameterMm: number;
  coverMm: number;
}

export interface TransientResults {
  brakingForce: number; // kN
  brakingHeight: number; // m
  windOnDeck: number; // kN
  windOnLiveLoad: number; // kN
  seismicZone: string;
  seismicRequired: boolean;
  seismicForce: number;
}

export interface UpliftResults {
  submergedVolume: number; // m³
  upliftForce: number; // kN — buoyancy reduction
  submergedDeadWeight: number; // kN — 0.9 × resisting dead weight
  anchorResistanceRequired: number; // kN
  fosAnchor: number;
  anchorsRequired: boolean;
  thrustBlockDragForce: number; // kN
  thrustBlockSafetyRatio: number;
}

export interface StructuralResults {
  deadLoads: DeadLoadResults;
  earthPressure: EarthPressureResults;
  stability: StabilityResults;
  bearing: BearingResults;
  reinforcement: ReinforcementResults;
  transient: TransientResults;
  uplift: UpliftResults;
  warnings: string[];
}

// ─── Pure helpers ────────────────────────────────────────────────────────────

const num = (value: number | undefined, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const DEG = Math.PI / 180;

/**
 * Coulomb coefficient of active earth pressure (cohesionless backfill):
 *
 *   Ka = sin²(α+φ) / [ sin²α · sin(α−δ) · (1 + √( sin(φ+δ)·sin(φ−β) /
 *                                              (sin(α−δ)·sin(α+β)) ))² ]
 *
 * Reference: data/extracted/TYPE_document.md §8 "Earth pressure", IRC:6-2000 Cl.217.1.
 * With (φ=30°, α=90°, β=0°, δ=15°) this returns Ka ≈ 0.3014 → the document's Ka = 0.3.
 * (The document's substitution table lists α = 76.06°, which under this standard
 * Coulomb expression actually yields Ka ≈ 0.414 — see resolveAlpha() below.)
 */
export function coulombKa(phiDeg: number, alphaDeg: number, betaDeg: number, deltaDeg: number): number {
  const phi = phiDeg * DEG;
  const alpha = alphaDeg * DEG;
  const beta = betaDeg * DEG;
  const delta = deltaDeg * DEG;

  const numerator = Math.pow(Math.sin(alpha + phi), 2);
  const sqrtArg =
    (Math.sin(phi + delta) * Math.sin(phi - beta)) /
    (Math.sin(alpha - delta) * Math.sin(alpha + beta));
  const bracket = Math.pow(1 + Math.sqrt(Math.max(0, sqrtArg)), 2);
  const denominator = Math.pow(Math.sin(alpha), 2) * Math.sin(alpha - delta) * bracket;

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Reinforced-concrete flexural steel from the exact IS456 limit-state quadratic:
 *   Mu = 0.87·fy·Ast·d·(1 − Ast·fy/(b·d·fck))
 * solved for Ast. Returns 0 when the section is inadequate (negative discriminant).
 */
export function astFromMoment(
  muKnmPerMetre: number,
  bMm: number,
  dMm: number,
  fck: number,
  fy: number,
): number {
  if (muKnmPerMetre <= 0 || bMm <= 0 || dMm <= 0) return 0;
  const mu = muKnmPerMetre * 1e6; // kNm → N·mm
  const quadratic = (0.87 * fy * fy) / (bMm * fck);
  const linear = 0.87 * fy * dMm;
  const discriminant = linear * linear - 4 * quadratic * mu;
  if (discriminant <= 0) return 0;
  const ast = (linear - Math.sqrt(discriminant)) / (2 * quadratic);
  return ast > 0 ? ast : 0;
}

/** Bearing pressure with eccentricity: p = (P/A)(1 ± 6e/b). */
export function bearingPressure(
  totalLoad: number,
  area: number,
  eccentricity: number,
  widthB: number,
): { pMax: number; pMin: number; sixEOverB: number } {
  const base = area > 0 ? totalLoad / area : 0;
  const sixEOverB = widthB > 0 ? (6 * eccentricity) / widthB : 0;
  return {
    pMax: base * (1 + sixEOverB),
    pMin: base * (1 - sixEOverB),
    sixEOverB,
  };
}

// ─── Task 11 — dead-load subdivision & eccentricity ──────────────────────────

function computeDeadLoads(inputs: Inputs): DeadLoadResults {
  const deckWidth = inputs.deckWidth;
  const deckSlabLength = num(inputs.deckSlabLength, 6.8);
  const deckThickness = inputs.deckThickness;
  const wearingCoatThickness = num(inputs.wearingCoatThickness, 0.075);
  const dirtWallArea = num(inputs.dirtWallArea_m2, 0.37);

  const rccUnitWeight = inputs.concreteDensity / KG_PER_M3_TO_KN_PER_M3; // 2500 → 25 kN/m³
  const subUnitWeight = num(inputs.substructureUnitWeight_kN_m3, 24); // source substructure γ = 24 kN/m³

  // (i)+(iii) superstructure dead load — half is carried by each of the two
  // abutments of a simply-supported span (TYPE_document.md §III.1 i,iii).
  const deckSlab = 0.5 * deckThickness * deckWidth * deckSlabLength * rccUnitWeight; // 244.80
  const wearingCoat = 0.5 * wearingCoatThickness * deckWidth * deckSlabLength * rccUnitWeight; // 38.25
  // (ii) dirt wall over the abutment (Plate 7.25 of IRC:SP20-2002).
  const dirtWall = dirtWallArea * deckWidth * rccUnitWeight; // 55.50
  const superstructureTotal = deckSlab + dirtWall + wearingCoat; // 338.55

  // (iv)–(viii) abutment shaft + footings (TYPE_document.md §III.1 iv–viii).
  const abutmentArea = num(inputs.abutmentSectionArea_m2, 1.08);
  const footingThickness = num(inputs.footingThickness_m, 0.3);
  const f1Width = num(inputs.footing1Width_m, 1.35);
  const f2Width = num(inputs.footing2Width_m, 1.5);
  const f3Width = num(inputs.footing3Width_m, 1.65);

  const abutmentShaft = abutmentArea * deckWidth * subUnitWeight; // 155.52
  const footing1 = f1Width * footingThickness * deckWidth * subUnitWeight; // 58.32
  const footing2 = f2Width * footingThickness * deckWidth * subUnitWeight; // 64.80
  const footing3 = f3Width * footingThickness * deckWidth * subUnitWeight; // 71.28
  const footing4 = 0; // no 4th footing in the assumed preliminary section
  const substructureTotal = abutmentShaft + footing1 + footing2 + footing3 + footing4; // 349.92
  const totalDeadLoad = superstructureTotal + substructureTotal; // 688.47

  // ─── Resultant location (moment about the toe) — 4 loading cases ───────────
  // Abutment members, lever arms measured from the abutment toe (canal/front edge).
  const abutmentHeight = num(inputs.abutmentHeight_m, 1.2);
  const topWidth = num(inputs.abutmentTopWidth_m, 0.75);
  const bottomWidth = num(inputs.abutmentBottomWidth_m, 1.05);
  const frontBatter = Math.max(0, bottomWidth - topWidth); // 0.30 m
  const backBatter = 0; // "Bank side batter of abutment = 0.000 m"

  const wBackBatter = 0.5 * backBatter * abutmentHeight * deckWidth * subUnitWeight;
  const wCentre = topWidth * abutmentHeight * deckWidth * subUnitWeight; // 129.60
  const wFrontBatter = 0.5 * frontBatter * abutmentHeight * deckWidth * subUnitWeight; // 25.92

  const xBackBatter = bottomWidth - backBatter / 3; // undefined when backBatter = 0 → w = 0
  const xCentre = frontBatter + topWidth / 2; // 0.675
  const xFrontBatter = (2 / 3) * frontBatter; // 0.20

  const canalOffsets = [0, 0.15, 0.3, 0.45]; // canal-side offsets of 1st/2nd/3rd footing
  const bankOffsets = [0, 0.15, 0.15, 0.15]; // bank-side offsets
  const footingLoads = [0, footing1, footing2, footing3];
  const footingWidths = [bottomWidth, f1Width, f2Width, f3Width];

  const members = [
    { load: wBackBatter, x: xBackBatter },
    { load: wCentre, x: xCentre },
    { load: wFrontBatter, x: xFrontBatter },
  ];

  const resultantsFromToe: number[] = [];
  const eccentricities: number[] = [];

  for (let k = 0; k < 4; k++) {
    const caseMembers = members.slice(0, 3);
    let sumLoad = 0;
    let sumMoment = 0;
    for (const m of caseMembers) {
      sumLoad += m.load;
      sumMoment += m.load * m.x;
    }
    // Add footings 1..k (case 1 has none, case 2 has 1st, …).
    for (let j = 1; j <= k; j++) {
      const load = footingLoads[j];
      const width = footingWidths[j];
      // Centroid of footing j measured from the ABUTMENT toe.
      const xFromAbutmentToe = (width - canalOffsets[j] - bankOffsets[j]) / 2 - canalOffsets[j] + canalOffsets[j];
      const x = xFromAbutmentToe + canalOffsets[j];
      sumLoad += load;
      sumMoment += load * x;
    }
    const resultant = sumLoad > 0 ? sumMoment / sumLoad : 0;
    const baseWidth = footingWidths[k];
    resultantsFromToe.push(resultant);
    eccentricities.push(Math.abs(resultant - baseWidth / 2));
  }

  return {
    deckSlab,
    dirtWall,
    wearingCoat,
    superstructureTotal,
    abutmentShaft,
    footing1,
    footing2,
    footing3,
    footing4,
    substructureTotal,
    totalDeadLoad,
    resultantsFromToe,
    eccentricities,
  };
}

// ─── Task 12 — earth pressures (Coulomb, blocking) ───────────────────────────

/**
 * The document's Coulomb substitution table uses α = 76.06°, but that produces
 * Ka ≈ 0.414, not the Ka = 0.3 the same document uses for design. The design
 * value reproduces exactly with the Design-Parameters wall angle α = 90°
 * ("Angle of face of wall supporting earth with horizontal = 90"). We therefore
 * default the wall angle to 90° so the default Ka (≈ 0.301) and all downstream
 * pressures match the source design.
 */
export function resolveWallAngle(inputs: Inputs): number {
  return num(inputs.wallAngleAlpha, 90);
}

function computeEarthPressure(inputs: Inputs): EarthPressureResults {
  const phi = num(inputs.backfillPhi, 30);
  const alpha = resolveWallAngle(inputs);
  const beta = num(inputs.backfillSlopeBeta, 0);
  const delta = num(inputs.wallFrictionDelta, 15);
  const h3 = num(inputs.surchargeHeightH3_m, 1.2);
  const gamma = num(inputs.backfillUnitWeight_kN_m3, 18);
  const H = num(inputs.abutmentHeight_m, 1.2);

  const ka = coulombKa(phi, alpha, beta, delta);
  const kp = ka > 0 ? 1 / ka : 0; // passive coefficient (not mobilised in this check)

  const activePressureBase = gamma * H * ka; // triangular base pressure (kN/m²)
  const surchargePressure = gamma * h3 * ka; // rectangular surcharge pressure (kN/m²)
  const triangularArea = 0.5 * gamma * H * H * ka; // kN/m
  const rectangularArea = surchargePressure * H; // kN/m

  const totalPressurePerMetre = triangularArea + rectangularArea; // kN/m
  const totalThrust = totalPressurePerMetre * inputs.deckWidth; // kN
  const horizontalComponent = totalThrust * Math.cos(delta * DEG);
  const verticalComponent = totalThrust * Math.sin(delta * DEG);

  const totalArea = rectangularArea + triangularArea;
  const leverArmFromBase =
    totalArea > 0
      ? (rectangularArea * (H / 2) + triangularArea * (H / 3)) / totalArea
      : 0;

  const momentAboutToe = horizontalComponent * leverArmFromBase;

  return {
    ka,
    kp,
    activePressureBase,
    surchargePressure,
    rectangularArea,
    triangularArea,
    totalThrust,
    horizontalComponent,
    verticalComponent,
    leverArmFromBase,
    momentAboutToe,
  };
}

// ─── Task 13/14 — stability & bearing ────────────────────────────────────────

export function computeStructural(inputs: Inputs, hydraulic: ComputedResults): StructuralResults {
  const warnings: string[] = [];

  // ── Task 11 ───────────────────────────────────────────────────────────────
  const deadLoads = computeDeadLoads(inputs);

  // ── Task 12 ───────────────────────────────────────────────────────────────
  const earthPressure = computeEarthPressure(inputs);

  // ── Task 16 (needed before stability) ─────────────────────────────────────
  const waterUnitWeight = inputs.waterDensity / KG_PER_M3_TO_KN_PER_M3; // 1000 → 10 kN/m³
  const brakingLiveLoad = num(inputs.brakingLiveLoad_kN, 478.41); // source deck live load
  const brakingForce = BRAKING_PERCENT_OF_LIVE_LOAD * brakingLiveLoad * BRAKING_DISTRIBUTION_TO_SUPPORT; // 47.84
  const brakingHeight = num(inputs.brakingHeight_m, 1.2);

  const windPressureDeck = num(inputs.windPressureDeck_kg_m2, 59.48);
  const deckExposedHeight = num(inputs.deckExposedHeight_m, 1.755);
  const deckExposedBreadth = num(inputs.deckExposedBreadth_m, 7.4);
  const windPerforation = num(inputs.windPerforationFactor, 0.5);
  const windOnDeck = (windPressureDeck * deckExposedHeight * deckExposedBreadth * windPerforation) / 100; // 3.86

  const windLivePressure = num(inputs.windLivePressure_kg_m, 300);
  const windOnLiveLoad = (windLivePressure * inputs.deckWidth) / 100; // 18.00

  const seismicZone = inputs.seismicZone ?? 'I';
  const seismicRequired = seismicZone !== 'I' && seismicZone !== 'II'; // IRC:6-2000 Cl.222.1
  const seismicForce = 0; // Zone-I: seismic design not required

  // ── Task 13 — stability ───────────────────────────────────────────────────
  const liveLoadReaction = hydraulic.wLive / Math.max(1, inputs.numSpans);
  const totalVertical =
    deadLoads.totalDeadLoad + earthPressure.verticalComponent + liveLoadReaction;
  const totalHorizontal =
    earthPressure.horizontalComponent + brakingForce + windOnLiveLoad;

  const slidingResistance = SLIDING_FRICTION_COEFFICIENT * totalVertical;
  const fosSliding = totalHorizontal > 0 ? slidingResistance / totalHorizontal : Infinity;
  const slidingSafe = fosSliding >= FOS_SLIDING_MIN;

  // Vertical resultant on the foundation base (dead load acts at the deepest-case
  // dead-load resultant; the earth-pressure vertical component and the live-load
  // reaction are taken at the base centre).
  const foundationWidth = num(inputs.foundationWidth_m, num(inputs.footing3Width_m, 1.65));
  const foundationLength = num(inputs.foundationLength_m, 6.0);
  const deadResultantFromToe = deadLoads.resultantsFromToe[3];
  const verticalMomentAboutToe =
    deadLoads.totalDeadLoad * deadResultantFromToe +
    (earthPressure.verticalComponent + liveLoadReaction) * (foundationWidth / 2);
  const verticalResultantFromToe = totalVertical > 0 ? verticalMomentAboutToe / totalVertical : 0;
  const foundationEccentricity = verticalResultantFromToe - foundationWidth / 2;

  const restoringMoment = totalVertical * verticalResultantFromToe;
  const overturningMoment =
    earthPressure.momentAboutToe +
    brakingForce * brakingHeight +
    windOnLiveLoad * num(inputs.windLiveHeight_m, 1.5);
  const fosOverturning = overturningMoment > 0 ? restoringMoment / overturningMoment : Infinity;
  const overturningSafe = fosOverturning >= FOS_OVERTURNING_MIN;

  // ── Task 14 — bearing pressure ────────────────────────────────────────────
  const foundationArea = foundationWidth * foundationLength; // 1.65 × 6.0 = 9.9 m²
  const bearingRaw = bearingPressure(totalVertical, foundationArea, foundationEccentricity, foundationWidth);
  const sbc = inputs.sbc_kN_m2;
  const noTension = bearingRaw.sixEOverB < NO_TENSION_LIMIT;
  const bearingSafe = bearingRaw.pMax <= sbc;
  const sbcUtilisation = sbc > 0 ? (bearingRaw.pMax / sbc) * 100 : 0;

  const bearing: BearingResults = {
    area: foundationArea,
    totalLoad: totalVertical,
    eccentricity: foundationEccentricity,
    pMax: bearingRaw.pMax,
    pMin: bearingRaw.pMin,
    sixEOverB: bearingRaw.sixEOverB,
    noTension,
    sbc,
    sbcUtilisation,
    bearingSafe,
  };

  // ── Task 15 — reinforcement (limit state, IS456) ──────────────────────────
  const barDiameter = BAR_DIAMETER_MM;
  const cover = REINFORCEMENT_COVER_MM;

  // Stem (abutment): flexure from the earth-pressure thrust per metre width.
  const stemThicknessMm = num(inputs.abutmentTopWidth_m, 0.75) * 1000;
  const stemEffectiveDepth = stemThicknessMm - cover - barDiameter / 2;
  const stemServiceMoment =
    (earthPressure.totalThrust / inputs.deckWidth) * earthPressure.leverArmFromBase; // kNm/m
  const stemUltimateMoment = 1.5 * stemServiceMoment;
  const stemAstRequired = astFromMoment(
    stemUltimateMoment,
    1000,
    stemEffectiveDepth,
    FCK_VRCC,
    STEEL_FY,
  );
  const stemAstMin = (MIN_STEEL_SLAB_PCT / 100) * 1000 * stemThicknessMm;

  // Deck slab: simply-supported one-way slab carrying the span UDL.
  const deckThicknessMm = inputs.deckThickness * 1000;
  const deckEffectiveDepth = deckThicknessMm - cover - barDiameter / 2;
  const deckLineLoad = hydraulic.totalVerticalLoad / inputs.deckWidth; // kN/m width
  const deckServiceMoment = (deckLineLoad * inputs.deckSpan * inputs.deckSpan) / 8; // kNm/m
  const deckUltimateMoment = 1.5 * deckServiceMoment;
  const deckAstRequired = astFromMoment(
    deckUltimateMoment,
    1000,
    deckEffectiveDepth,
    FCK_VRCC,
    STEEL_FY,
  );
  const deckAstMin = (MIN_STEEL_SLAB_PCT / 100) * 1000 * deckThicknessMm;

  const reinforcement: ReinforcementResults = {
    stem: {
      thicknessMm: stemThicknessMm,
      effectiveDepthMm: stemEffectiveDepth,
      serviceMoment: stemServiceMoment,
      ultimateMoment: stemUltimateMoment,
      fck: FCK_VRCC,
      fy: STEEL_FY,
      astRequired: stemAstRequired,
      astMin: stemAstMin,
      astGoverns: Math.max(stemAstRequired, stemAstMin),
    },
    deckSlab: {
      thicknessMm: deckThicknessMm,
      effectiveDepthMm: deckEffectiveDepth,
      serviceMoment: deckServiceMoment,
      ultimateMoment: deckUltimateMoment,
      fck: FCK_VRCC,
      fy: STEEL_FY,
      astRequired: deckAstRequired,
      astMin: deckAstMin,
      astGoverns: Math.max(deckAstRequired, deckAstMin),
    },
    barDiameterMm: barDiameter,
    coverMm: cover,
  };

  const transient: TransientResults = {
    brakingForce,
    brakingHeight,
    windOnDeck,
    windOnLiveLoad,
    seismicZone,
    seismicRequired,
    seismicForce,
  };

  // ── Task 17 — uplift / anchor / thrust block ──────────────────────────────
  const abutmentArea = num(inputs.abutmentSectionArea_m2, 1.08);
  const footingThickness = num(inputs.footingThickness_m, 0.3);
  const footingAreas =
    abutmentArea +
    num(inputs.footing1Width_m, 1.35) * footingThickness +
    num(inputs.footing2Width_m, 1.5) * footingThickness +
    num(inputs.footing3Width_m, 1.65) * footingThickness;
  const submergedVolume = footingAreas * inputs.deckWidth; // 2.43 × 6.0 = 14.58 m³
  const upliftForce = submergedVolume * waterUnitWeight; // 145.80 kN (IRC:6-2000 Cl.216.4)

  const submergedDeadWeight = 0.9 * deadLoads.totalDeadLoad; // 0.9 × resisting dead weight
  const anchorResistanceRequired = Math.max(0, upliftForce - submergedDeadWeight);
  const fosAnchor = upliftForce > 0 ? submergedDeadWeight / upliftForce : Infinity;

  // Thrust block: mobilised passive resistance against the drag force.
  const kp = earthPressure.kp;
  const thrustBlockHeight = num(inputs.abutmentHeight_m, 1.2);
  const passiveResistance =
    0.5 * num(inputs.backfillUnitWeight_kN_m3, 18) * thrustBlockHeight * thrustBlockHeight * kp;
  const thrustBlockDragForce = hydraulic.fDragTotal;
  const thrustBlockSafetyRatio =
    thrustBlockDragForce > 0 ? passiveResistance / thrustBlockDragForce : Infinity;

  const uplift: UpliftResults = {
    submergedVolume,
    upliftForce,
    submergedDeadWeight,
    anchorResistanceRequired,
    fosAnchor,
    anchorsRequired: anchorResistanceRequired > 0,
    thrustBlockDragForce,
    thrustBlockSafetyRatio,
  };

  // ── Advisories ────────────────────────────────────────────────────────────
  if (!slidingSafe) {
    warnings.push(
      `Sliding FOS ${fosSliding.toFixed(2)} < ${FOS_SLIDING_MIN} (IRC:6-2000).`,
    );
  }
  if (!overturningSafe) {
    warnings.push(
      `Overturning FOS ${fosOverturning.toFixed(2)} < ${FOS_OVERTURNING_MIN} (IRC:6-2000).`,
    );
  }
  if (!noTension) {
    warnings.push(
      `Bearing: 6e/b = ${bearing.sixEOverB.toFixed(3)} ≥ 1 — tension in the base (IRC:78-2000 Cl.706.3.3.1).`,
    );
  }
  if (!bearingSafe) {
    warnings.push(
      `Bearing: p_max ${bearing.pMax.toFixed(1)} kN/m² exceeds SBC ${sbc.toFixed(1)} kN/m² (${sbcUtilisation.toFixed(0)}% utilisation).`,
    );
  }

  return {
    deadLoads,
    earthPressure,
    stability: {
      totalVertical,
      totalHorizontal,
      slidingResistance,
      fosSliding,
      slidingSafe,
      restoringMoment,
      overturningMoment,
      fosOverturning,
      overturningSafe,
    },
    bearing,
    reinforcement,
    transient,
    uplift,
    warnings,
  };
}
