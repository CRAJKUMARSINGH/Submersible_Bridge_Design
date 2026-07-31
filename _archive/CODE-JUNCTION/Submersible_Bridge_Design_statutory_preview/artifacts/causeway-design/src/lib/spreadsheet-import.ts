import type { Inputs } from './calculations';
import { defaultInputs } from './calculations';

export type InputFieldType = 'string' | 'number' | 'nullable-number' | 'enum';

export type InputFieldDefinition = {
  key: keyof Inputs;
  label: string;
  section: string;
  type: InputFieldType;
  description: string;
  unit?: string;
  aliases?: string[];
};

export const INPUT_FIELD_DEFINITIONS: InputFieldDefinition[] = [
  { key: 'projectName', label: 'Project Name', section: 'Metadata', type: 'string', description: 'Project or work title', aliases: ['project', 'name_of_work'] },
  { key: 'streamName', label: 'Stream Name', section: 'Metadata', type: 'string', description: 'River, stream, or crossing name', aliases: ['stream', 'nallah_name'] },
  { key: 'location', label: 'Location', section: 'Metadata', type: 'string', description: 'Village, district, or site location' },
  { key: 'date', label: 'Date', section: 'Metadata', type: 'string', description: 'Report or design date in YYYY-MM-DD', aliases: ['report_date'] },
  { key: 'catchmentArea', label: 'Catchment Area', section: 'Step 1', type: 'number', description: 'Catchment area', unit: 'km²' },
  { key: 'runoffCoefficient', label: 'Runoff Coefficient', section: 'Step 1', type: 'number', description: 'Runoff coefficient C', aliases: ['runoff_coefficient', 'c'] },
  { key: 'rainfallIntensity', label: 'Rainfall Intensity', section: 'Step 1', type: 'number', description: 'Rainfall intensity I', unit: 'mm/hr', aliases: ['rainfall', 'intensity'] },
  { key: 'surplusWeirLength', label: 'Surplus Weir Length', section: 'Step 1', type: 'number', description: 'Broad-crested weir length', unit: 'm', aliases: ['weir_length', 'lw'] },
  { key: 'heightOfFallWeir', label: 'Head over Weir', section: 'Step 1', type: 'number', description: 'Head over weir crest', unit: 'm', aliases: ['weir_head', 'hw'] },
  { key: 'streamAreaHFL', label: 'Stream Area at HFL', section: 'Step 1', type: 'number', description: 'Measured stream area at HFL', unit: 'm²', aliases: ['stream_area', 'a_stream'] },
  { key: 'meanVelocityHFL', label: 'Mean Velocity at HFL', section: 'Step 1', type: 'number', description: 'Observed stream velocity at HFL', unit: 'm/s', aliases: ['stream_velocity', 'v_mean'] },
  { key: 'customDesignDischarge', label: 'Custom Design Discharge', section: 'Step 2', type: 'nullable-number', description: 'Optional override of computed discharge', unit: 'm³/s', aliases: ['design_discharge_override', 'q_override'] },
  { key: 'hfl', label: 'Highest Flood Level', section: 'Step 2', type: 'number', description: 'Highest flood level', unit: 'm' },
  { key: 'gl', label: 'Ground Level', section: 'Step 2', type: 'number', description: 'Ground or bed level', unit: 'm', aliases: ['ground_level', 'bed_level'] },
  { key: 'rtl', label: 'Road Top Level', section: 'Step 2', type: 'number', description: 'Road top level', unit: 'm' },
  { key: 'numVents', label: 'Number of Vents', section: 'Step 2', type: 'number', description: 'Count of vents', aliases: ['vents', 'number_of_vents'] },
  { key: 'ventWidth', label: 'Vent Width', section: 'Step 2', type: 'number', description: 'Clear width of each vent', unit: 'm', aliases: ['vent_width', 'b'] },
  { key: 'ventHeight', label: 'Vent Height', section: 'Step 2', type: 'number', description: 'Clear height of each vent', unit: 'm', aliases: ['vent_height', 'hv'] },
  { key: 'approachVelocity', label: 'Approach Velocity', section: 'Step 2', type: 'number', description: 'Approach flow velocity', unit: 'm/s', aliases: ['approach_velocity', 'v_app'] },
  { key: 'siltFactor', label: 'Silt Factor', section: 'Step 2', type: 'number', description: 'Lacey silt factor', aliases: ['lacey_silt_factor', 'f'] },
  { key: 'cdVent', label: 'Vent Discharge Coefficient', section: 'Step 2', type: 'number', description: 'Vent discharge coefficient', aliases: ['cd', 'cd_vent'] },
  { key: 'deckWidth', label: 'Deck Width', section: 'Step 3', type: 'number', description: 'Deck width', unit: 'm' },
  { key: 'deckSpan', label: 'Deck Span', section: 'Step 3', type: 'number', description: 'Span length', unit: 'm' },
  { key: 'deckThickness', label: 'Deck Thickness', section: 'Step 3', type: 'number', description: 'Deck slab thickness', unit: 'm' },
  { key: 'numSpans', label: 'Number of Spans', section: 'Step 3', type: 'number', description: 'Count of spans', aliases: ['spans', 'number_of_spans'] },
  { key: 'liveLoadType', label: 'Live Load Type', section: 'Step 3', type: 'enum', description: 'Allowed values: IRC Class A or IRC Class AA', aliases: ['live_load', 'live_load_type'] },
  { key: 'waterDensity', label: 'Water Density', section: 'Step 3', type: 'number', description: 'Water density', unit: 'kg/m³' },
  { key: 'concreteDensity', label: 'Concrete Density', section: 'Step 3', type: 'number', description: 'Concrete density', unit: 'kg/m³' },
  { key: 'dragCoefficient', label: 'Drag Coefficient', section: 'Step 3', type: 'number', description: 'Hydrodynamic drag coefficient', aliases: ['drag_coefficient', 'cd_drag'] },
  { key: 'siltLoadDeck', label: 'Silt Load on Deck', section: 'Step 3', type: 'number', description: 'Additional silt load on deck', unit: 'kN/m²', aliases: ['silt_load', 'silt_load_deck'] },
];

const ALLOWED_LIVE_LOADS: Inputs['liveLoadType'][] = ['IRC Class A', 'IRC Class AA'];

const fieldByNormalizedKey = new Map<string, InputFieldDefinition>();
for (const field of INPUT_FIELD_DEFINITIONS) {
  fieldByNormalizedKey.set(normalizeKey(field.key), field);
  fieldByNormalizedKey.set(normalizeKey(field.label), field);
  for (const alias of field.aliases ?? []) {
    fieldByNormalizedKey.set(normalizeKey(alias), field);
  }
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function coerceValue(field: InputFieldDefinition, rawValue: string): Inputs[keyof Inputs] {
  const value = rawValue.trim();

  if (field.type === 'string') {
    return value;
  }

  if (field.type === 'nullable-number') {
    if (!value || ['null', 'none', 'auto', 'default'].includes(value.toLowerCase())) {
      return null;
    }
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      throw new Error(`Expected a number for ${field.label}`);
    }
    return numericValue;
  }

  if (field.type === 'number') {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      throw new Error(`Expected a number for ${field.label}`);
    }
    return numericValue;
  }

  if (field.type === 'enum') {
    const matchedValue = ALLOWED_LIVE_LOADS.find(
      (candidate) => normalizeKey(candidate) === normalizeKey(value),
    );
    if (!matchedValue) {
      throw new Error(`Expected one of: ${ALLOWED_LIVE_LOADS.join(', ')}`);
    }
    return matchedValue;
  }

  return value;
}

export type ParsedImportResult = {
  patch: Partial<Inputs>;
  importedKeys: (keyof Inputs)[];
  warnings: string[];
};

export function parseVariableTable(rows: string[][]): ParsedImportResult {
  const patch: Partial<Inputs> = {};
  const importedKeys: (keyof Inputs)[] = [];
  const warnings: string[] = [];

  for (const row of rows) {
    const [rawVariable, rawValue = ''] = row;
    if (!rawVariable || !String(rawVariable).trim()) continue;
    if (normalizeKey(String(rawVariable)) === 'variable') continue;

    const field = fieldByNormalizedKey.get(normalizeKey(String(rawVariable)));
    if (!field) {
      warnings.push(`Skipped unknown variable: ${rawVariable}`);
      continue;
    }

    try {
      const coerced = coerceValue(field, String(rawValue ?? ''));
      Object.assign(patch, { [field.key]: coerced });
      importedKeys.push(field.key);
    } catch (error) {
      warnings.push(`${field.label}: ${(error as Error).message}`);
    }
  }

  return { patch, importedKeys, warnings };
}

export function buildTemplateCsv(): string {
  const header = 'variable,value,section,label,description,unit';
  const rows = buildRowsFromInputs(defaultInputs).slice(1).map((cells) =>
    cells.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
  );
  return [header, ...rows].join('\n');
}

export function buildTemplateRows(): string[][] {
  return buildRowsFromInputs(defaultInputs);
}

export function buildRowsFromInputs(inputs: Inputs): string[][] {
  return [
    ['variable', 'value', 'section', 'label', 'description', 'unit'],
    ...INPUT_FIELD_DEFINITIONS.map((field) => [
      String(field.key),
      inputs[field.key] === null ? 'auto' : String(inputs[field.key]),
      field.section,
      field.label,
      field.description,
      field.unit ?? '',
    ]),
  ];
}
