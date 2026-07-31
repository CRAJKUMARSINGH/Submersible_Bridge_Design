export interface SourceLine {
  lineNumber: number;
  rawText: string;
}

export type LineKind = 'title' | 'section' | 'body';

export interface LineStyle {
  fontName: 'courier';
  fontStyle: 'normal' | 'bold';
  fontSize: number;
  lineHeight: number;
}

export interface RenderableLine extends SourceLine {
  kind: LineKind;
  style: LineStyle;
  renderedSegments: string[];
}

export function parseNonEmptySourceLines(content: string): SourceLine[] {
  return content
    .split(/\r?\n/)
    .map((rawText, index) => ({ lineNumber: index + 1, rawText }))
    .filter((line) => line.rawText.trim().length > 0);
}

export function classifyLine(rawText: string): LineKind {
  const trimmed = rawText.trim();

  if (trimmed === 'DESIGN OF VENTED SUBMERSIBLE CAUSEWAY') {
    return 'title';
  }

  if (/^(Step\d+|[IVX]+\)|[A-Z][A-Z\s,&\-().:]+)$/.test(trimmed)) {
    return 'section';
  }

  if (/Design Philosophy/i.test(trimmed)) {
    return 'section';
  }

  return 'body';
}

export function getLineStyle(kind: LineKind): LineStyle {
  if (kind === 'title') {
    return { fontName: 'courier', fontStyle: 'bold', fontSize: 10, lineHeight: 5.2 };
  }

  if (kind === 'section') {
    return { fontName: 'courier', fontStyle: 'bold', fontSize: 8, lineHeight: 4.6 };
  }

  return { fontName: 'courier', fontStyle: 'normal', fontSize: 7, lineHeight: 4.0 };
}

function splitOversizedToken(
  token: string,
  maxWidth: number,
  measureWidth: (text: string) => number,
): string[] {
  const segments: string[] = [];
  let current = '';

  for (const char of token) {
    const candidate = current + char;
    if (current && measureWidth(candidate) > maxWidth) {
      segments.push(current);
      current = char;
      continue;
    }
    current = candidate;
  }

  if (current) {
    segments.push(current);
  }

  return segments.length > 0 ? segments : [token];
}

export function wrapLineVerbatim(
  rawText: string,
  maxWidth: number,
  measureWidth: (text: string) => number,
): string[] {
  if (rawText.length === 0) {
    return [''];
  }

  if (measureWidth(rawText) <= maxWidth) {
    return [rawText];
  }

  const tokens = rawText.match(/\S+\s*|\s+/g) ?? [rawText];
  const segments: string[] = [];
  let current = '';

  const pushCurrent = () => {
    if (current.length > 0) {
      segments.push(current);
      current = '';
    }
  };

  for (const token of tokens) {
    const candidate = current + token;
    if (current && measureWidth(candidate) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) {
      pushCurrent();
    }

    if (measureWidth(token) <= maxWidth) {
      current = token;
      continue;
    }

    const splitTokenSegments = splitOversizedToken(token, maxWidth, measureWidth);
    if (splitTokenSegments.length > 1) {
      segments.push(...splitTokenSegments.slice(0, -1));
    }
    current = splitTokenSegments[splitTokenSegments.length - 1] ?? '';
  }

  pushCurrent();
  return segments.length > 0 ? segments : [rawText];
}

export function reconstructRenderedLine(renderedSegments: string[]): string {
  return renderedSegments.join('');
}

export function isNarrativeLine(rawText: string): boolean {
  const trimmed = rawText.trim();

  if (trimmed.length === 0) {
    return false;
  }

  if (classifyLine(rawText) !== 'body') {
    return false;
  }

  if (trimmed.includes('=')) {
    return false;
  }

  if (trimmed.includes('S.No') || trimmed.includes('Load in KN') || trimmed.includes('Moment')) {
    return false;
  }

  if (/^\d+\s{2,}/.test(trimmed)) {
    return false;
  }

  return /[A-Za-z]/.test(trimmed);
}

export function buildRenderPlan(
  sourceLines: SourceLine[],
  buildSegments: (line: SourceLine, style: LineStyle, kind: LineKind) => string[],
): RenderableLine[] {
  return sourceLines.map((line) => {
    const kind = classifyLine(line.rawText);
    const style = getLineStyle(kind);

    return {
      ...line,
      kind,
      style,
      renderedSegments: buildSegments(line, style, kind),
    };
  });
}
