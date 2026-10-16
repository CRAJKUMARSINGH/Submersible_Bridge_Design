import type { ComputedResults, Inputs } from './calculations';

export type FormulaTraceSection = 'Step 1 — Discharge' | 'Step 2 — Hydraulic' | 'Step 3 — Structural';

export interface DesignFormulaTraceRow {
  id: string;
  section: FormulaTraceSection;
  equation: string;
  substitution: string;
  result: string;
  unit: string;
  prototypeReference: string;
}

const n = (value: number, digits = 3) => Number.isFinite(value) ? value.toFixed(digits) : 'N/A';

/**
 * Build an auditable, live trace for equations implemented in the app.
 * The source report contains additional foundation and structural equations
 * that are not represented by the current Inputs model; those are deliberately
 * not inferred or recalculated here.
 */
export function buildDesignFormulaTrace(inputs: Inputs, results: ComputedResults): DesignFormulaTraceRow[] {
  const appVelocity = inputs.approachVelocity > 0 ? inputs.approachVelocity : 0.01;
  const siltFactor = inputs.siltFactor > 0 ? inputs.siltFactor : 0.1;
  const dischargeRef = 'Prototype discharge section, lines 8105–8213 (method/coefficient differences must be reviewed)';
  const hydraulicRef = 'Prototype hydraulic narrative, lines 58–69 and 742–821';
  const structuralRef = 'Prototype load/design narrative, lines 79–84 and 824 onward';

  return [
    {
      id: 'Q_RATIONAL', section: 'Step 1 — Discharge',
      equation: 'Q = C × I × A / 3.6',
      substitution: `${n(inputs.runoffCoefficient, 3)} × ${n(inputs.rainfallIntensity, 2)} × ${n(inputs.catchmentArea, 3)} / 3.6`,
      result: n(results.qRational), unit: 'm³/s', prototypeReference: dischargeRef,
    },
    {
      id: 'Q_WEIR', section: 'Step 1 — Discharge',
      equation: 'Q = 1.705 × Lw × Hw^1.5',
      substitution: `1.705 × ${n(inputs.surplusWeirLength, 3)} × ${n(inputs.heightOfFallWeir, 3)}^1.5`,
      result: n(results.qWeir), unit: 'm³/s', prototypeReference: dischargeRef,
    },
    {
      id: 'Q_AREA_VELOCITY', section: 'Step 1 — Discharge',
      equation: 'Q = A_stream × V_mean',
      substitution: `${n(inputs.streamAreaHFL, 3)} × ${n(inputs.meanVelocityHFL, 3)}`,
      result: n(results.qVelocity), unit: 'm³/s', prototypeReference: dischargeRef,
    },
    {
      id: 'Q_GOVERNING', section: 'Step 1 — Discharge',
      equation: 'Q_design = max(Q_rational, Q_weir, Q_area-velocity)',
      substitution: `max(${n(results.qRational)}, ${n(results.qWeir)}, ${n(results.qVelocity)}) — ${results.governingMethod}`,
      result: n(results.qDesign), unit: 'm³/s', prototypeReference: dischargeRef,
    },
    {
      id: 'Q_SELECTED', section: 'Step 1 — Discharge',
      equation: 'Q = custom Q, when supplied; otherwise Q_design',
      substitution: inputs.customDesignDischarge === null
        ? `no override → ${n(results.qDesign)}`
        : `custom override = ${n(inputs.customDesignDischarge)}`,
      result: n(results.designDischarge), unit: 'm³/s', prototypeReference: dischargeRef,
    },
    {
      id: 'A_VENT', section: 'Step 2 — Hydraulic',
      equation: 'A_vent = N × b × h_v',
      substitution: `${n(inputs.numVents, 0)} × ${n(inputs.ventWidth)} × ${n(inputs.ventHeight)}`,
      result: n(results.aVent), unit: 'm²', prototypeReference: hydraulicRef,
    },
    {
      id: 'B_EFFECTIVE', section: 'Step 2 — Hydraulic',
      equation: 'B_effective = Q / max(V_approach, 0.01)',
      substitution: `${n(results.designDischarge)} / max(${n(inputs.approachVelocity)}, 0.01)`,
      result: n(results.effectiveWidth), unit: 'm', prototypeReference: hydraulicRef,
    },
    {
      id: 'A_RTL', section: 'Step 2 — Hydraulic',
      equation: 'A_RTL = max(0, RTL − GL) × B_effective',
      substitution: `max(0, ${n(inputs.rtl)} − ${n(inputs.gl)}) × ${n(results.effectiveWidth)}`,
      result: n(results.aRTL), unit: 'm²', prototypeReference: hydraulicRef,
    },
    {
      id: 'A_HFL', section: 'Step 2 — Hydraulic',
      equation: 'A_HFL = max(0, HFL − GL) × B_effective',
      substitution: `max(0, ${n(inputs.hfl)} − ${n(inputs.gl)}) × ${n(results.effectiveWidth)}`,
      result: n(results.aHFL), unit: 'm²', prototypeReference: hydraulicRef,
    },
    {
      id: 'OBS_RTL', section: 'Step 2 — Hydraulic',
      equation: '%Obs_RTL = (1 − A_vent/A_RTL) × 100',
      substitution: `A_RTL > 0 ? (1 − ${n(results.aVent)}/${n(results.aRTL)}) × 100 : 0`,
      result: n(results.pctObsRTL, 1), unit: '%', prototypeReference: hydraulicRef,
    },
    {
      id: 'OBS_HFL', section: 'Step 2 — Hydraulic',
      equation: '%Obs_HFL = (1 − A_vent/A_HFL) × 100',
      substitution: `A_HFL > 0 ? (1 − ${n(results.aVent)}/${n(results.aHFL)}) × 100 : 0`,
      result: n(results.pctObsHFL, 1), unit: '%', prototypeReference: hydraulicRef,
    },
    {
      id: 'V_HFL', section: 'Step 2 — Hydraulic',
      equation: 'V_HFL = Q / A_HFL',
      substitution: `A_HFL > 0 ? ${n(results.designDischarge)}/${n(results.aHFL)} : 0`,
      result: n(results.velocityHFL), unit: 'm/s', prototypeReference: hydraulicRef,
    },
    {
      id: 'AFFLUX', section: 'Step 2 — Hydraulic',
      equation: 'h_f = (V²/17.88 + 0.015) × ((A_HFL/A_vent)² − 1)',
      substitution: results.aVent > 0 && results.aHFL > results.aVent
        ? `(${n(results.velocityHFL)}²/17.88 + 0.015) × ((${n(results.aHFL)}/${n(results.aVent)})² − 1)`
        : '0 (area condition not met)',
      result: n(results.hAfflux, 4), unit: 'm', prototypeReference: hydraulicRef,
    },
    {
      id: 'LACEY_P', section: 'Step 2 — Hydraulic',
      equation: 'P = 4.75 × √Q',
      substitution: `4.75 × √${n(results.designDischarge)}`,
      result: n(results.laceyPerimeter), unit: 'm', prototypeReference: hydraulicRef,
    },
    {
      id: 'LACEY_R', section: 'Step 2 — Hydraulic',
      equation: 'R = 0.473 × (Q / f)^1/3',
      substitution: `0.473 × (${n(results.designDischarge)} / ${n(siltFactor)})^1/3`,
      result: n(results.laceyScourDepth), unit: 'm', prototypeReference: hydraulicRef,
    },
    {
      id: 'SCOUR_MAX', section: 'Step 2 — Hydraulic',
      equation: 'D_max = 1.27 × R',
      substitution: `1.27 × ${n(results.laceyScourDepth)}`,
      result: n(results.maxScourDepth), unit: 'm', prototypeReference: hydraulicRef,
    },
    {
      id: 'FBL', section: 'Step 2 — Hydraulic',
      equation: 'FBL = HFL − D_max',
      substitution: `${n(inputs.hfl)} − ${n(results.maxScourDepth)}`,
      result: n(results.fbl), unit: 'm', prototypeReference: hydraulicRef,
    },
    {
      id: 'FOUNDATION_DEPTH', section: 'Step 2 — Hydraulic',
      equation: 'D_foundation = GL − FBL',
      substitution: `${n(inputs.gl)} − ${n(results.fbl)}`,
      result: n(results.recommendedDepth), unit: 'm', prototypeReference: hydraulicRef,
    },
    {
      id: 'W_SELF', section: 'Step 3 — Structural',
      equation: 'W_self = ρ_c × g × W_dk × L_sp × t_sl / 1000',
      substitution: `${n(inputs.concreteDensity)} × 9.81 × ${n(inputs.deckWidth)} × ${n(inputs.deckSpan)} × ${n(inputs.deckThickness)} / 1000`,
      result: n(results.wSelf), unit: 'kN', prototypeReference: structuralRef,
    },
    {
      id: 'W_SILT', section: 'Step 3 — Structural',
      equation: 'W_silt = w_silt × W_deck × L_span',
      substitution: `${n(inputs.siltLoadDeck)} × ${n(inputs.deckWidth)} × ${n(inputs.deckSpan)}`,
      result: n(results.wSilt), unit: 'kN', prototypeReference: structuralRef,
    },
    {
      id: 'W_LIVE', section: 'Step 3 — Structural',
      equation: 'W_live = app constant: 554 kN (Class A), 700 kN (Class AA)',
      substitution: `${inputs.liveLoadType} → ${n(results.wLive, 0)} kN`,
      result: n(results.wLive, 0), unit: 'kN', prototypeReference: structuralRef,
    },
    {
      id: 'W_TOTAL', section: 'Step 3 — Structural',
      equation: 'W_total = W_self + W_silt + W_live/N_spans',
      substitution: `${n(results.wSelf)} + ${n(results.wSilt)} + ${n(results.wLive)}/${n(inputs.numSpans, 0)}`,
      result: n(results.totalVerticalLoad), unit: 'kN/span', prototypeReference: structuralRef,
    },
    {
      id: 'F_DRAG', section: 'Step 3 — Structural',
      equation: 'F_drag = Cd × 0.5 × ρ_w × V² × (W_dk × t_sl) / 1000',
      substitution: `${n(inputs.dragCoefficient)} × 0.5 × ${n(inputs.waterDensity)} × ${n(results.velocityHFL)}² × (${n(inputs.deckWidth)} × ${n(inputs.deckThickness)}) / 1000`,
      result: n(results.fDrag), unit: 'kN/span', prototypeReference: structuralRef,
    },
    {
      id: 'F_DRAG_TOTAL', section: 'Step 3 — Structural',
      equation: 'F_drag,total = F_drag × N_spans',
      substitution: `${n(results.fDrag)} × ${n(inputs.numSpans, 0)}`,
      result: n(results.fDragTotal), unit: 'kN', prototypeReference: structuralRef,
    },
    {
      id: 'F_UPLIFT', section: 'Step 3 — Structural',
      equation: 'F_uplift = ρ_w × g × W_dk × L_sp × t_sl / 1000',
      substitution: `${n(inputs.waterDensity)} × 9.81 × ${n(inputs.deckWidth)} × ${n(inputs.deckSpan)} × ${n(inputs.deckThickness)} / 1000`,
      result: n(results.fUplift), unit: 'kN/span', prototypeReference: structuralRef,
    },
    {
      id: 'F_ANCHOR', section: 'Step 3 — Structural',
      equation: 'F_anchor = F_uplift − W_self',
      substitution: `${n(results.fUplift)} − ${n(results.wSelf)}`,
      result: n(results.fAnchor), unit: 'kN', prototypeReference: structuralRef,
    },
  ];
}