/**
 * word-export.ts — Task 10 / R9: Word (.docx) report generator.
 * ─────────────────────────────────────────────────────────────────────────────
 * Template-driven mapping of the spec.md Section 18 report outline to `docx`
 * section objects. The thirteen top-level (Heading 1) blocks are listed once in
 * `WORD_TOP_LEVEL_SECTIONS` so the generator and the V8 conformance test agree
 * on the outline by construction.
 *
 * Populated from the same single source of truth as the PDF report: the
 * `Inputs` / `ComputedResults` pair produced by `computeResults()`. Engineering
 * drawings are placeholders here — they are vector-embedded in Task C.4.
 */

import {
  AlignmentType,
  Document,
  HeadingLevel,
  PageBreak,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import type { Inputs, ComputedResults } from './calculations';
import { COVER_DISCLAIMER_HEADING, COVER_DISCLAIMER_LINES } from './pdf-export';

const f = (n: number, d = 2) => n.toFixed(d);

/**
 * The thirteen Heading-1 blocks of the Section 18 outline. Note the source
 * outline numbers its narrative sections 1–8 then 10–12 (there is no Section 9),
 * giving Title + 11 narrative sections + Appendices = 13 top-level blocks.
 */
export const WORD_TOP_LEVEL_SECTIONS = [
  'Report Title Page',
  'Section 1 — Design Philosophy',
  'Section 2 — Site and Hydrological Data',
  'Section 3 — Design Discharge (Step 1)',
  'Section 4 — Hydraulic Design (Step 2)',
  'Section 5 — Structural Geometry & Materials',
  'Section 6 — Structural Loads & Combinations',
  'Section 7 — Abutment & Pier Design',
  'Section 8 — Deck Slab Design',
  'Section 10 — Anchors & Thrust Blocks',
  'Section 11 — Compliance & Code-Certificate Summary',
  'Section 12 — Engineering Drawings',
  'Appendices (A–S)',
] as const;

const APPENDICES = [
  'A — Raw hydrological data (daily rainfall sheets, Gumbel plots)',
  'B — Soil investigation report (bore logs, SPT N-values, lab test results)',
  'C — IRC code clause extracts (the exact clauses cited, with page numbers)',
  'D — Detailed calculation spreadsheets (formulas visible)',
  'E — Hand calculation verification sheets (signed)',
  'F — Load combination sub-tables for each combination',
  'G — Bearing calculation + manufacturer data sheet',
  'H — Stainless steel anchor data + pull-out test procedure',
  'I — Materials test certificate requirements',
  'J — Independent Reviewer / Checker report (V1–V10, non-conformance log)',
  'K — Variances from code with PE approval records',
  'L — Bill of Quantities (BOQ)',
  'M — Construction methodology / sequence',
  'N — Quality Control Plan',
  'O — Health & Safety Plan',
  'P — Maintenance manual',
  'Q — As-built drawing template',
  'R — V&V Test Results (Section 14 V1–V10)',
  'S — PE Sign-off Page (Designer / Checker / Approver)',
];

const DRAWING_SHEETS = [
  'Sheet 5/12 — Cross Section A-A (Transverse): dimensions, HFL/GL/FBL/RTL, vents, abutments, piers, footings, reinforcement cage outline, D_max scour profile, title block',
  'Sheet 6/12 — Longitudinal Section B-B: abutments, piers, spans, approach lengths, expansion joints, levels, scour profile, cut line A-A, flow arrow',
  'Sheet 7/12 — Plan View: vent layout, true site north, bank lines, approach roads, expansion joints, drainage',
  'Sheet 8/12 — Abutment Reinforcement Details: stem steel, footing steel, bent bars, Ld annotations, bar schedule',
  'Sheet 9/12 — Deck Slab Reinforcement: plan + section, main/distribution/cranked bars, bar schedule',
  'Sheet 10/12 — Pier + Pier Cap Details (when N_spans > 1)',
  'Sheet 11/12 — Anchor + Thrust Block Details',
];

// ─── Paragraph / table helpers ───────────────────────────────────────────────
function heading(text: string): Paragraph {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1 });
}
function sub(text: string): Paragraph {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2 });
}
function body(text: string): Paragraph {
  return new Paragraph({ children: [new TextRun(text)] });
}
function bullet(text: string): Paragraph {
  return new Paragraph({ text, bullet: { level: 0 } });
}
/** A "Label: value" line — the value is emitted in its own run so the V8 test can locate it verbatim. */
function kv(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun(value)],
  });
}
function cell(text: string, bold = false): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold })] })],
  });
}
function table(header: string[], rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: header.map((h) => cell(h, true)) }),
      ...rows.map((r) => new TableRow({ children: r.map((c) => cell(c)) })),
    ],
  });
}

function passFail(ok: boolean, detail = ''): string {
  return `${ok ? 'PASS' : 'FAIL'}${detail ? ` — ${detail}` : ''}`;
}

// ─── Outline builder ─────────────────────────────────────────────────────────
function buildChildren(inputs: Inputs, results: ComputedResults): (Paragraph | Table)[] {
  const s = results.structural;
  const a: (Paragraph | Table)[] = [];

  // ── 1. Report Title Page (§18.1) ──────────────────────────────────────────
  a.push(heading(WORD_TOP_LEVEL_SECTIONS[0]));
  a.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'DESIGN OF VENTED SUBMERSIBLE CAUSEWAY', bold: true, size: 32 })] }));
  a.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'HYDRAULIC & STRUCTURAL DESIGN REPORT', size: 22 })] }));
  a.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Government of India — Ministry of Road Transport & Highways', size: 18 })] }));
  a.push(table(['Field', 'Value'], [
    ['Name of Work', inputs.projectName],
    ['Stream / Road', inputs.streamName],
    ['Location', inputs.location],
    ['Date', inputs.date || '(not provided)'],
  ]));
  a.push(sub('Revision Block'));
  a.push(table(['Revision', 'Date', 'By', 'Checked', 'Approved'], [['R0', inputs.date || '—', '—', '—', '—']]));
  a.push(sub('Design Codes'));
  a.push(bullet('IRC SP:82-2008 — Guidelines for Design of Causeways and Submersible Bridges (+ Amendment)'));
  a.push(bullet('IRC 6:2000 — Standard Specifications and Code of Practice for Road Bridges, Section II: Loads and Load Combinations'));
  a.push(bullet('IRC SP:20-2002 — Rural Roads Manual'));
  a.push(bullet('IRC 83 — Bearings'));
  a.push(bullet('IS 456:2000 — Plain and Reinforced Concrete'));
  a.push(bullet('IS 1893 — Seismic (where applicable)'));
  a.push(bullet('IRC 103 — Wind (where applicable)'));
  a.push(sub(COVER_DISCLAIMER_HEADING));
  for (const line of COVER_DISCLAIMER_LINES) a.push(body(line));
  a.push(sub('Contents'));
  for (const sec of WORD_TOP_LEVEL_SECTIONS) a.push(body(sec));
  a.push(new Paragraph({ children: [new PageBreak()] }));

  // ── 2. Section 1 — Design Philosophy (§18.2) ──────────────────────────────
  a.push(heading(WORD_TOP_LEVEL_SECTIONS[1]));
  a.push(sub('1.1 Scope and objectives'));
  a.push(body('Hydraulic and structural design of a vented submersible causeway designed to IRC SP:82-2008 and IRC 6:2000.'));
  a.push(sub('1.2 Applicable codes'));
  a.push(body('IRC SP:82-2008, IRC 6:2000, IRC SP:20-2002, IRC 83, IS 456:2000, IS 1893, IRC 103. See the clause matrix (Appendix C).'));
  a.push(sub('1.3 Design flood return period / risk level'));
  a.push(body('Design discharge derived by the envelope of the Rational, Broad-Crested Weir and Area-Velocity methods (Section 3).'));
  a.push(sub('1.4 Submergence philosophy'));
  a.push(body('Road crest level (RTL) is held below the high flood level (HFL); the ventway is proportioned against the IRC SP:82-2008 obstruction limits of 70% at RTL and 30% at HFL.'));
  a.push(sub('1.5 Limitations and exclusions'));
  a.push(body('Automated tool output; subject to site-specific soil investigation and statutory approvals.'));

  // ── 3. Section 2 — Site and Hydrological Data (§18.3) ─────────────────────
  a.push(heading(WORD_TOP_LEVEL_SECTIONS[2]));
  a.push(kv('Stream / Road', inputs.streamName));
  a.push(kv('Location', inputs.location));
  a.push(sub('2.3 Hydrological levels'));
  a.push(table(['Level', 'Symbol', 'Value (m)'], [
    ['High Flood Level', 'HFL', f(inputs.hfl, 3)],
    ['Ordinary Flood Level', 'OFL', f(inputs.ofl_m, 3)],
    ['Low Bed Level', 'LBL', f(inputs.lbl_m, 3)],
    ['Ground Level', 'GL', f(inputs.gl, 3)],
    ['Road Crest Level', 'RTL', f(inputs.rtl, 3)],
  ]));
  a.push(sub('2.4 Catchment'));
  a.push(kv('Catchment area (km²)', f(inputs.catchmentArea)));
  a.push(kv('Runoff coefficient', f(inputs.runoffCoefficient)));
  a.push(kv('Rainfall intensity (mm/hr)', f(inputs.rainfallIntensity)));
  a.push(sub('2.7 Soil investigation summary'));
  a.push(kv('Safe bearing capacity (kN/m²)', f(inputs.sbc_kN_m2)));
  a.push(kv('Backfill unit weight (kN/m³)', f(inputs.backfillUnitWeight_kN_m3 ?? 0)));
  a.push(kv('Backfill friction angle φ (°)', f(inputs.backfillPhi ?? 0)));

  // ── 4. Section 3 — Design Discharge, Step 1 (§18.4) ───────────────────────
  a.push(heading(WORD_TOP_LEVEL_SECTIONS[3]));
  a.push(sub('3.1–3.3 Method comparison'));
  a.push(table(['Method', 'Discharge (m³/s)'], [
    ['Rational Method', f(results.qRational)],
    ['Broad-Crested Weir', f(results.qWeir)],
    ['Area-Velocity', f(results.qVelocity)],
  ]));
  a.push(sub('3.4 Governing method'));
  a.push(kv('Governing method', results.governingMethod));
  a.push(sub('3.5 Design discharge'));
  a.push(kv('Design Discharge Q (m³/s)', f(results.designDischarge)));

  // ── 5. Section 4 — Hydraulic Design, Step 2 (§18.5) ───────────────────────
  a.push(heading(WORD_TOP_LEVEL_SECTIONS[4]));
  a.push(sub('4.1 Ventway geometry'));
  a.push(table(['Parameter', 'Symbol', 'Value'], [
    ['Number of vents', 'N', String(inputs.numVents)],
    ['Vent width (m)', 'b', f(inputs.ventWidth)],
    ['Vent height (m)', 'h_v', f(inputs.ventHeight)],
    ['Vent area (m²)', 'A_vent', f(results.aVent)],
  ]));
  a.push(sub('4.2–4.4 Obstruction and velocity at HFL'));
  a.push(table(['Check', 'Value', 'Limit', 'Status'], [
    ['Flow area @ RTL (m²)', f(results.aRTL), '—', '—'],
    ['Flow area @ HFL (m²)', f(results.aHFL), '—', '—'],
    ['Obstruction @ RTL (%)', f(results.pctObsRTL), '< 70%', passFail(results.passRTL)],
    ['Obstruction @ HFL (%)', f(results.pctObsHFL), '< 30%', passFail(results.passHFL)],
    ['Velocity at HFL (m/s)', f(results.velocityHFL), '—', '—'],
  ]));
  a.push(sub('4.5 Afflux'));
  a.push(kv('Afflux h_f (m)', f(results.hAfflux)));
  a.push(sub('4.6–4.7 Lacey scour and foundation depth'));
  a.push(table(['Parameter', 'Symbol', 'Value'], [
    ['Regime perimeter (m)', 'P', f(results.laceyPerimeter)],
    ['Silt factor', 'f', f(inputs.siltFactor)],
    ['Normal scour depth (m)', 'R', f(results.laceyScourDepth)],
    ['Maximum scour depth (m)', 'D_max', f(results.maxScourDepth)],
    ['Foundation bed level (m)', 'FBL', f(results.fbl)],
    ['Recommended foundation depth (m)', 'D_fdn', f(results.recommendedDepth)],
  ]));
  a.push(kv('Foundation depth check (FBL ≥ 0.5 m below GL)', passFail(results.scourSafe)));

  // ── 6. Section 5 — Structural Geometry & Materials (§18.6) ────────────────
  a.push(heading(WORD_TOP_LEVEL_SECTIONS[5]));
  a.push(sub('5.1 Superstructure'));
  a.push(table(['Parameter', 'Value'], [
    ['Deck span (m)', f(inputs.deckSpan)],
    ['Deck width (m)', f(inputs.deckWidth)],
    ['Deck thickness (m)', f(inputs.deckThickness)],
    ['Wearing coat thickness (m)', f(inputs.wearingCoatThickness ?? 0, 3)],
    ['Number of spans', String(inputs.numSpans)],
  ]));
  a.push(sub('5.2 Substructure'));
  a.push(table(['Parameter', 'Value (m)'], [
    ['Abutment top width', f(inputs.abutmentTopWidth_m ?? 0)],
    ['Abutment bottom width', f(inputs.abutmentBottomWidth_m ?? 0)],
    ['Footing 1 width', f(inputs.footing1Width_m ?? 0)],
    ['Footing 2 width', f(inputs.footing2Width_m ?? 0)],
    ['Footing 3 width', f(inputs.footing3Width_m ?? 0)],
    ['Footing thickness', f(inputs.footingThickness_m ?? 0)],
  ]));
  a.push(sub('5.4 Materials'));
  a.push(table(['Material', 'Value'], [
    ['Concrete grade (VRCC)', `M${s.reinforcement.stem.fck}`],
    ['Steel grade (fy, N/mm²)', f(s.reinforcement.stem.fy, 0)],
    ['Bar diameter (mm)', f(s.reinforcement.barDiameterMm, 0)],
    ['Cover to reinforcement (mm)', f(s.reinforcement.coverMm, 0)],
  ]));

  // ── 7. Section 6 — Structural Loads & Combinations (§18.7) ────────────────
  a.push(heading(WORD_TOP_LEVEL_SECTIONS[6]));
  a.push(sub('6.1 Dead loads'));
  a.push(table(['Component', 'Value (kN)'], [
    ['Deck slab', f(s.deadLoads.deckSlab)],
    ['Dirt wall', f(s.deadLoads.dirtWall)],
    ['Wearing coat', f(s.deadLoads.wearingCoat)],
    ['Abutment shaft', f(s.deadLoads.abutmentShaft)],
    ['Total dead load', f(s.deadLoads.totalDeadLoad)],
  ]));
  a.push(sub('6.2 Live load'));
  a.push(kv('Live load class', inputs.liveLoadType));
  a.push(sub('6.6 Hydraulic loads'));
  a.push(table(['Load', 'Value'], [
    ['Live load per span (kN)', f(results.wLive)],
    ['Silt load on deck (kN)', f(results.wSilt)],
    ['Self weight W_self (kN)', f(results.wSelf)],
    ['Total vertical load (kN)', f(results.totalVerticalLoad)],
    ['Drag force per span F_drag (kN)', f(results.fDrag)],
    ['Total drag force F_drag_T (kN)', f(results.fDragTotal)],
    ['Uplift F_uplift (kN)', f(results.fUplift)],
    ['Required anchor force F_anchor (kN)', f(results.fAnchor)],
  ]));
  a.push(sub('6.7 Tractive / braking effort'));
  a.push(kv('Braking force (kN)', f(s.transient.brakingForce)));
  a.push(sub('6.8 Load combination matrix (IRC 6:2000 Cl.202)'));
  const combos = s.loadCombinations;
  const fosText = (n: number) => (Number.isFinite(n) ? f(n) : '∞');
  a.push(table(
    ['ID', 'Combination', 'V (kN)', 'H (kN)', 'FOS sliding', 'FOS overturning', 'Status'],
    combos.cases.map((c) => [
      c.id,
      c.description,
      f(c.vertical, 1),
      f(c.horizontal, 1),
      fosText(c.fosSliding),
      fosText(c.fosOverturning),
      combos.exemptIds.includes(c.id) ? 'EXEMPT (Zone-I)' : passFail(c.safe),
    ]),
  ));
  a.push(kv(
    'Applicable Cl.202 combinations evaluated',
    `${combos.requiredCount} of ${combos.requiredCount}${combos.exemptIds.length ? ` (${combos.exemptIds.join(', ')} exempt — seismic not required at this site)` : ''}`,
  ));

  // ── 8. Section 7 — Abutment & Pier Design (§18.8) ─────────────────────────
  a.push(heading(WORD_TOP_LEVEL_SECTIONS[7]));
  a.push(sub('7.1 Earth pressures (Coulomb)'));
  a.push(table(['Parameter', 'Symbol', 'Value'], [
    ['Active pressure coefficient', 'K_a', f(s.earthPressure.ka)],
    ['Passive pressure coefficient', 'K_p', f(s.earthPressure.kp)],
    ['Total active thrust (kN)', 'P', f(s.earthPressure.totalThrust)],
  ]));
  a.push(sub('7.3 Bearing pressure check'));
  a.push(table(['Parameter', 'Value'], [
    ['Base area (m²)', f(s.bearing.area)],
    ['Eccentricity e (m)', f(s.bearing.eccentricity)],
    ['p_max (kN/m²)', f(s.bearing.pMax)],
    ['p_min (kN/m²)', f(s.bearing.pMin)],
    ['6e/B', f(s.bearing.sixEOverB)],
    ['SBC (kN/m²)', f(s.bearing.sbc)],
    ['Status', passFail(s.bearing.bearingSafe)],
  ]));
  a.push(sub('7.4 Stability analysis'));
  a.push(table(['Check', 'Value', 'Limit', 'Status'], [
    ['Sliding FOS', f(s.stability.fosSliding), '≥ 1.5', passFail(s.stability.slidingSafe)],
    ['Overturning FOS', f(s.stability.fosOverturning), '≥ 2.0', passFail(s.stability.overturningSafe)],
  ]));
  a.push(sub('7.5 Abutment stem reinforcement'));
  a.push(table(['Parameter', 'Value'], [
    ['Ultimate moment M_u (kNm/m)', f(s.reinforcement.stem.ultimateMoment)],
    ['Ast required (mm²/m)', f(s.reinforcement.stem.astRequired)],
    ['Ast minimum (mm²/m)', f(s.reinforcement.stem.astMin)],
    ['Ast governs (mm²/m)', f(s.reinforcement.stem.astGoverns)],
  ]));

  // ── 9. Section 8 — Deck Slab Design (§18.9) ───────────────────────────────
  a.push(heading(WORD_TOP_LEVEL_SECTIONS[8]));
  a.push(sub('8.1 Slab configuration'));
  a.push(table(['Parameter', 'Value'], [
    ['Span (m)', f(inputs.deckSpan)],
    ['Width (m)', f(inputs.deckWidth)],
    ['Thickness (m)', f(inputs.deckThickness)],
  ]));
  a.push(sub('8.3–8.4 Moments and reinforcement'));
  a.push(table(['Parameter', 'Value'], [
    ['Service moment (kNm/m)', f(s.reinforcement.deckSlab.serviceMoment)],
    ['Ultimate moment M_u (kNm/m)', f(s.reinforcement.deckSlab.ultimateMoment)],
    ['Ast required (mm²/m)', f(s.reinforcement.deckSlab.astRequired)],
    ['Ast minimum (mm²/m)', f(s.reinforcement.deckSlab.astMin)],
    ['Ast governs (mm²/m)', f(s.reinforcement.deckSlab.astGoverns)],
  ]));
  a.push(sub('8.5–8.6 Shear and deflection'));
  a.push(body('Shear and deflection checks per IS 456:2000 — see Appendix D/E calculation sheets.'));

  // ── 10. Section 10 — Anchors & Thrust Blocks (§18.10) ─────────────────────
  a.push(heading(WORD_TOP_LEVEL_SECTIONS[9]));
  a.push(sub('10.1 Uplift and anchor requirement'));
  a.push(table(['Parameter', 'Value'], [
    ['Submerged volume (m³)', f(s.uplift.submergedVolume)],
    ['Uplift force (kN)', f(s.uplift.upliftForce)],
    ['Submerged dead weight (kN)', f(s.uplift.submergedDeadWeight)],
    ['Anchor resistance required (kN)', f(s.uplift.anchorResistanceRequired)],
    ['Anchor FOS', f(s.uplift.fosAnchor)],
    ['Anchors required', String(s.uplift.anchorsRequired)],
  ]));
  a.push(sub('10.4 Thrust block'));
  a.push(table(['Parameter', 'Value'], [
    ['Design thrust force (kN)', f(s.uplift.thrustBlockDragForce)],
    ['Safety ratio', f(s.uplift.thrustBlockSafetyRatio)],
  ]));

  // ── 11. Section 11 — Compliance & Code-Certificate Summary (§18.11) ───────
  a.push(heading(WORD_TOP_LEVEL_SECTIONS[10]));
  a.push(sub('11.1 PASS/FAIL checklist'));
  a.push(table(['Item', 'Limit', 'Status'], [
    ['Obstruction @ RTL (IRC SP:82-2008)', '< 70%', passFail(results.passRTL)],
    ['Obstruction @ HFL', '< 30%', passFail(results.passHFL)],
    ['Min carriageway width', '≥ 6.0 m', passFail(results.passMinCarriageWidth_m)],
    ['Foundation below max scour + 0.5 m', 'FBL ≤ GL − 0.5', passFail(results.scourSafe)],
    ['Bearing p_max ≤ SBC', 'p_max ≤ SBC', passFail(s.bearing.bearingSafe)],
    ['No tension zone (6e/B rule)', '6e/B < 1', passFail(s.bearing.noTension)],
    ['Sliding FOS', '≥ 1.5', passFail(s.stability.slidingSafe)],
    ['Overturning FOS', '≥ 2.0', passFail(s.stability.overturningSafe)],
    ['Deck uplift (anchors or self-weight)', 'W_self > F_uplift', passFail(results.fAnchor <= 0)],
  ]));
  a.push(sub('11.3 Overall verdict'));
  a.push(body('Suitable for construction subject to the items above and to PE V&V sign-off (V10).'));

  // ── 12. Section 12 — Engineering Drawings (§18.12) ────────────────────────
  a.push(heading(WORD_TOP_LEVEL_SECTIONS[11]));
  a.push(body('Drawing placeholders — vector sheets are embedded in Phase C.4. Each sheet carries a title block with Project, Stream, Location, Date, Drawing Title, DRG NO., computed SCALE and SHEET x/y.'));
  for (const sheet of DRAWING_SHEETS) a.push(bullet(sheet));

  // ── 13. Appendices (A–S) (§18.13) ────────────────────────────────────────
  a.push(heading(WORD_TOP_LEVEL_SECTIONS[12]));
  for (const ap of APPENDICES) a.push(bullet(ap));

  return a;
}

/** Build the Word report as a `docx` Document object (single source for both the UI and the V8 test). */
export function buildDesignDocument(inputs: Inputs, results: ComputedResults): Document {
  return new Document({
    creator: 'CSWY-CALC 82',
    title: 'Vented Submersible Causeway Design Report',
    description: 'IRC SP:82-2008 & IRC 6:2000 compliant design report',
    sections: [{ children: buildChildren(inputs, results) }],
  });
}

/** Serialise the report to a .docx buffer (Node / test harness). */
export function buildDesignDocxBuffer(inputs: Inputs, results: ComputedResults): Promise<Buffer> {
  return Packer.toBuffer(buildDesignDocument(inputs, results));
}

/** Convenience wrapper for the UI: build the report and trigger a browser download. */
export async function downloadDesignWord(inputs: Inputs, results: ComputedResults): Promise<void> {
  const blob = await Packer.toBlob(buildDesignDocument(inputs, results));
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Causeway_Design_${inputs.projectName.replace(/[^a-z0-9]/gi, '_')}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
