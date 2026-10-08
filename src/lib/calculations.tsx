import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

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

  // Step 3
  wSelf: number;
  wSilt: number;
  wLive: number;
  totalVerticalLoad: number;

  fDrag: number;
  fUplift: number;
  fAnchor: number;
  fDragTotal: number;
};

export type CalculationsContextType = {
  inputs: Inputs;
  updateInput: <K extends keyof Inputs>(key: K, value: Inputs[K]) => void;
  mergeInputs: (patch: Partial<Inputs>) => void;
  resetInputs: () => void;
  results: ComputedResults;
};

export const defaultInputs: Inputs = {
  projectName: "Bridge #42 — Rural Connect",
  streamName: "Kaveri Tributary",
  location: "District XYZ",
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

  deckWidth: 4.5,
  deckSpan: 2.0,
  deckThickness: 0.25,
  numSpans: 6,
  liveLoadType: "IRC Class A",
  waterDensity: 1000,
  concreteDensity: 2500,
  dragCoefficient: 2.0,
  siltLoadDeck: 1.2,
  sbc_kN_m2: 98,
  d_LBL_depth_m: 2.0,
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

  const results = useMemo<ComputedResults>(() => {
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
    const wLive = inputs.liveLoadType === "IRC Class 70R" ? 900 : inputs.liveLoadType === "IRC Class AA" ? 700 : 554;
    /* [PLACEHOLDER E1 — IRC Class 70R wLive=900kN is DEFAULT ESTIMATE pending E1 decision (IRC 6 axle table). RED-FLAGGED — OVERRIDE.] */
    const totalVerticalLoad = wSelf + wSilt + (wLive / inputs.numSpans);

    const fDrag = (inputs.dragCoefficient * 0.5 * inputs.waterDensity * Math.pow(velocityHFL, 2) * (inputs.deckWidth * inputs.deckThickness)) / 1000;
    const fUplift = (inputs.waterDensity * 9.81 * (inputs.deckWidth * inputs.deckSpan * inputs.deckThickness)) / 1000;
    const fAnchor = fUplift - wSelf;
    const fDragTotal = fDrag * inputs.numSpans;

    return {
      qRational, qWeir, qVelocity, qDesign, governingMethod,
      designDischarge, aVent, effectiveWidth, aRTL, aHFL,
      pctObsRTL, pctObsHFL, passRTL, passHFL,
      velocityHFL, hAfflux,
      laceyPerimeter, laceyScourDepth, maxScourDepth, fbl, recommendedDepth, scourSafe,
      passMinCarriageWidth_m, minCarriageWidthNote,
      wSelf, wSilt, wLive, totalVerticalLoad,
      fDrag, fUplift, fAnchor, fDragTotal,
    };
  }, [inputs]);

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
