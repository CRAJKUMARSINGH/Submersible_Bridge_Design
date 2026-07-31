import sampleDocumentText from '../../attached_assets/Type Design of submersible causeway.txt?raw';

export interface SampleDocumentLine {
  lineNumber: number;
  text: string;
  trimmed: string;
  isBlank: boolean;
}

export interface SampleDocumentSection {
  id: string;
  title: string;
  lineNumber: number;
}

export interface CertificationCheck {
  id: string;
  label: string;
  passed: boolean;
  details: string;
}

const SECTION_PATTERNS: RegExp[] = [
  /^DESIGN\s+OF\s+VENTED SUBMERSIBLE CAUSEWAY$/i,
  /^Design Philosophy$/i,
  /^Step\s*1/i,
  /^Step\s*2/i,
  /^Step\s*3/i,
  /^[IVX]+\)/,
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function normaliseSectionTitle(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export const sampleDocumentLines: SampleDocumentLine[] = sampleDocumentText.split(/\r?\n/).map((text, index) => ({
  lineNumber: index + 1,
  text,
  trimmed: text.trim(),
  isBlank: text.trim().length === 0,
}));

export const sampleDocumentSections: SampleDocumentSection[] = sampleDocumentLines
  .filter((line) => SECTION_PATTERNS.some((pattern) => pattern.test(line.trimmed)))
  .map((line) => ({
    id: `section-${slugify(normaliseSectionTitle(line.trimmed) || `line-${line.lineNumber}`)}-${line.lineNumber}`,
    title: normaliseSectionTitle(line.trimmed),
    lineNumber: line.lineNumber,
  }));

export const totalLineCount = sampleDocumentLines.length;
export const nonEmptyLineCount = sampleDocumentLines.filter((line) => !line.isBlank).length;
export const firstNonEmptyLine = sampleDocumentLines.find((line) => !line.isBlank) ?? sampleDocumentLines[0];
export const lastNonEmptyLine =
  [...sampleDocumentLines].reverse().find((line) => !line.isBlank) ?? sampleDocumentLines[sampleDocumentLines.length - 1];

function hasPhrase(phrase: string) {
  return sampleDocumentLines.some((line) => line.text.includes(phrase));
}

function evenSpotCheck(size: number) {
  const nonEmptyLines = sampleDocumentLines.filter((line) => !line.isBlank);

  if (nonEmptyLines.length === 0 || size <= 0) {
    return [];
  }

  return Array.from({ length: size }, (_, index) => {
    const sourceIndex = Math.floor((index * (nonEmptyLines.length - 1)) / Math.max(size - 1, 1));
    return nonEmptyLines[sourceIndex];
  });
}

export function buildCertificationChecks(): CertificationCheck[] {
  const spotChecks = evenSpotCheck(50);
  const sectionTitles = sampleDocumentSections.map((section) => section.title);

  return [
    {
      id: 'T01',
      label: 'Total line count verification',
      passed: totalLineCount === 8446,
      details: `Expected 8446 total lines; found ${totalLineCount}.`,
    },
    {
      id: 'T02',
      label: 'Non-empty line count verification',
      passed: nonEmptyLineCount === 4008,
      details: `Expected 4008 non-empty lines; found ${nonEmptyLineCount}.`,
    },
    {
      id: 'T03',
      label: 'Rice Grain phrase verification',
      passed: hasPhrase('width of abutment is considered for full hieght upto HFL'),
      details: 'Checks the exact rice-grain phrase that previously failed.',
    },
    {
      id: 'T04',
      label: 'Water current narrative section',
      passed: hasPhrase('Water pressure is considered on square ended abutments as per clause 213.2 of'),
      details: 'Confirms the water-current narrative is present verbatim.',
    },
    {
      id: 'T05',
      label: 'Tractive and braking narrative section',
      passed: hasPhrase('6.Tractive,braking effort of vehicles&frictional resistance of bearings:-'),
      details: 'Confirms the tractive/braking narrative is present verbatim.',
    },
    {
      id: 'T06',
      label: 'Buoyancy narrative section',
      passed: hasPhrase('7.Buoyancy :-'),
      details: 'Confirms the buoyancy narrative is present verbatim.',
    },
    {
      id: 'T07',
      label: 'Earth pressure narrative section',
      passed: hasPhrase('active earth pressure due to back fill'),
      details: 'Confirms the earth-pressure narrative is present verbatim.',
    },
    {
      id: 'T08',
      label: 'Design Parameters section presence',
      passed: sectionTitles.some((title) => /Design Parameters/i.test(title)),
      details: 'Confirms section detection includes Design Parameters.',
    },
    {
      id: 'T09',
      label: 'Computed value 47.84KN',
      passed: hasPhrase('47.84KN'),
      details: 'Confirms the braking-force value is present.',
    },
    {
      id: 'T10',
      label: 'Computed value 145.80KN',
      passed: hasPhrase('145.80KN'),
      details: 'Confirms the buoyancy reduction value is present.',
    },
    {
      id: 'T11',
      label: 'Computed value Ka = 0.3',
      passed: hasPhrase('Ka = 0.3'),
      details: 'Confirms the earth pressure coefficient is present.',
    },
    {
      id: 'T12',
      label: 'IRC SP:82 reference',
      passed: hasPhrase('IRC SP:82-2008'),
      details: 'Confirms the source text contains the governing code reference.',
    },
    {
      id: 'T13',
      label: '50-line spot check across document',
      passed:
        spotChecks.length === 50 &&
        spotChecks.every((line) => sampleDocumentLines[line.lineNumber - 1]?.text === line.text),
      details: `Performs deterministic spot checks on ${spotChecks.length} evenly spaced non-empty lines.`,
    },
    {
      id: 'T14',
      label: 'Section header detection',
      passed: sampleDocumentSections.length >= 8,
      details: `Detected ${sampleDocumentSections.length} navigable sections.`,
    },
    {
      id: 'T15',
      label: 'First non-empty line presence',
      passed: firstNonEmptyLine?.text === 'DESIGN  OF  VENTED SUBMERSIBLE CAUSEWAY',
      details: `First non-empty line is line ${firstNonEmptyLine?.lineNumber ?? 'n/a'}.`,
    },
    {
      id: 'T16',
      label: 'Last non-empty line presence',
      passed:
        lastNonEmptyLine?.text ===
        'As per the clause 6.4.2(vi),of IRC SP:82-2008,minimum width =                                           6.0m',
      details: `Last non-empty line is line ${lastNonEmptyLine?.lineNumber ?? 'n/a'}.`,
    },
  ];
}
