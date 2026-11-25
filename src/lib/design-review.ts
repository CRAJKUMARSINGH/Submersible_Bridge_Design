import type { ComputedResults, Inputs } from './calculations';
import { INPUT_FIELD_DEFINITIONS } from './spreadsheet-import';
import { FOS_OVERTURNING_MIN, FOS_SLIDING_MIN } from './structural';

export const DRAFT_STATUS = 'DRAFT - Engineering sign-off required';

export function validateDesignInputs(inputs: Inputs): string[] {
  const errors: string[] = [];
  for (const field of INPUT_FIELD_DEFINITIONS) {
    const value = inputs[field.key];
    if (typeof value === 'number' && !Number.isFinite(value)) errors.push(`${field.label} must be finite.`);
  }

  if (inputs.runoffCoefficient < 0 || inputs.runoffCoefficient > 1) {
    errors.push('Runoff coefficient must be between 0 and 1.');
  }
  if (inputs.hfl <= inputs.gl) errors.push('Highest flood level must exceed ground level for a wetted flow area.');
  if (!Number.isSafeInteger(inputs.numVents) || inputs.numVents < 1) {
    errors.push('Number of vents must be a positive whole number.');
  }
  if (!Number.isSafeInteger(inputs.numSpans) || inputs.numSpans < 1) {
    errors.push('Number of spans must be a positive whole number.');
  }
  if ([inputs.ventWidth, inputs.ventHeight, inputs.deckWidth, inputs.deckSpan, inputs.deckThickness, inputs.carriageWidth_m]
    .some((value) => value <= 0)) {
    errors.push('Vent dimensions, deck dimensions, and carriageway width must be positive.');
  }
  if ([inputs.approachVelocity, inputs.siltFactor, inputs.cdVent, inputs.dragCoefficient].some((value) => value <= 0)) {
    errors.push('Approach velocity, silt factor, and the vent and drag coefficients must be positive.');
  }
  if ([inputs.waterDensity, inputs.concreteDensity, inputs.sbc_kN_m2].some((value) => value <= 0)) {
    errors.push('Water and concrete densities and safe bearing capacity must be positive.');
  }
  if ([inputs.catchmentArea, inputs.rainfallIntensity, inputs.surplusWeirLength, inputs.heightOfFallWeir,
    inputs.streamAreaHFL, inputs.meanVelocityHFL, inputs.customDesignDischarge ?? 0, inputs.siltLoadDeck]
    .some((value) => value < 0)) {
    errors.push('Discharge inputs and additional silt load cannot be negative.');
  }
  return errors;
}

export function getDesignChecks(inputs: Inputs, results: ComputedResults) {
  const { bearing, stability, uplift, loadCombinations } = results.structural;
  const applicableCases = loadCombinations.cases.filter((item) => !loadCombinations.exemptIds.includes(item.id));
  const failedCases = applicableCases.filter((item) => !item.safe);
  return [
    { check: 'Ventway obstruction @ RTL', val: `${results.pctObsRTL.toFixed(1)}%`, limit: '< 70%', pass: results.passRTL },
    { check: 'Ventway obstruction @ HFL', val: `${results.pctObsHFL.toFixed(1)}%`, limit: '< 30%', pass: results.passHFL },
    { check: 'Min carriageway width', val: `${inputs.carriageWidth_m.toFixed(2)} m`, limit: '≥ 6.0m (IRC SP:82-2008 Cl.6.4.2(vi))', pass: results.passMinCarriageWidth_m },
    { check: 'Foundation level', val: `${results.fbl.toFixed(2)} m`, limit: 'More than 0.5 m below GL', pass: results.scourSafe },
    { check: 'Deck uplift resistance', val: `${results.fAnchor.toFixed(2)} kN anchor requirement`, limit: 'No anchor demand', pass: results.fAnchor <= 0 },
    { check: 'Submerged uplift', val: `${uplift.anchorResistanceRequired.toFixed(2)} kN anchor demand`, limit: 'No anchor demand', pass: !uplift.anchorsRequired },
    { check: 'Foundation bearing', val: `${bearing.pMax.toFixed(2)} kN/m²`, limit: `Full contact and ≤ ${bearing.sbc.toFixed(2)} kN/m²`, pass: bearing.bearingSafe },
    { check: 'Foundation sliding', val: stability.fosSliding.toFixed(2), limit: `FOS ≥ ${FOS_SLIDING_MIN}`, pass: stability.slidingSafe },
    { check: 'Foundation overturning', val: stability.fosOverturning.toFixed(2), limit: `FOS ≥ ${FOS_OVERTURNING_MIN}`, pass: stability.overturningSafe },
    {
      check: 'Applicable load combinations',
      val: failedCases.length ? `Review ${failedCases.map((item) => item.id).join(', ')}` : `${applicableCases.length} passed`,
      limit: `${loadCombinations.requiredCount} required`,
      pass: failedCases.length === 0 && applicableCases.length === loadCombinations.requiredCount,
    },
  ];
}
