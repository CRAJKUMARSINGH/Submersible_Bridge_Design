import { createRequire } from 'module';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';

const require = createRequire(import.meta.url);
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default;

const data = {
  project: 'B.T to the R/f KB Road to P.Bheemavaram',
  location: 'Type design sample based on the shared submersible causeway reference',
  codes: 'IRC SP:82-2008, IRC 6:2000, IRC SP:13-2004, IRC 78-2000, IRC:5-1985',
  hfl: 6.235,
  ofl: 5.015,
  lbl: 3.965,
  slope: 0.0152,
  manningN: 0.05,
  rtl: 5.645,
  bottomDeck: 5.165,
  carriageWidth: 6.0,
  sections: [
    { location: 'At bridge site', area: 11.74, perimeter: 10.99, radius: 1.07, velocity: 2.58, discharge: 30.28 },
    { location: '300m upstream', area: 12.29, perimeter: 14.22, radius: 0.86, velocity: 2.23, discharge: 27.41 },
    { location: '300m downstream', area: 14.82, perimeter: 14.22, radius: 1.04, velocity: 2.53, discharge: 37.49 },
  ],
  catchmentArea: 1.38,
  dickensC: 11.5,
  dischargeDickens: 21.65,
  weirHead: 0.45,
  weirLength: 22.75,
  weirCd: 4.1,
  dischargeWeir: 15.47,
  designDischarge: 45.75,
  designVelocity: 2.58,
  ventArea: 26.21,
  ventPercentRTL: 39.4,
  areaHFL: 79.33,
  areaRTLToHFL: 30.06,
  totalFlowAreaHFL: 56.27,
  obstructionHFL: 29.07,
  downstreamDepth: 0.8,
  affluxOrifice: 0.131,
  affluxWeir: 0.137,
  laceyPerimeter: 32.12,
  laceyScour: 2.63,
  foundationDepth: 3.83,
  foundationLevel: 2.315,
  sbc: 15.0,
  apronThickness: 0.236,
  stoneSize: 0.3,
  span: 6.0,
  slabThickness: 0.48,
  liveLoad: 478.41,
  deckDeadLoad: 338.55,
  uplift: 195.48,
  faceWalls: [
    { id: 'BIT-I', height: 2.4, maxStress: 11468, minStress: 4915, fsSliding: 1.81, fsOverturning: 3.27 },
    { id: 'BIT-II', height: 1.8, maxStress: 8640, minStress: 4160, fsSliding: 1.81, fsOverturning: 3.36 },
    { id: 'BIT-III', height: 1.2, maxStress: 5958, minStress: 3208, fsSliding: 1.69, fsOverturning: 3.05 },
    { id: 'BIT-IV', height: 0.8, maxStress: 4171, minStress: 2557, fsSliding: 1.51, fsOverturning: 2.56 },
  ],
};

const outputArg = process.argv[2];
const outputPath = resolve(outputArg || process.env.CAUSEWAY_OUTPUT || '/workspace/Causeway_Design_Report_Compact.pdf');
mkdirSync(dirname(outputPath), { recursive: true });

const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
const pageW = doc.internal.pageSize.getWidth();
const pageH = doc.internal.pageSize.getHeight();

const f = (n, d = 2) => Number(n).toFixed(d);

function frame() {
  doc.setDrawColor(25, 35, 60);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, pageW - 20, pageH - 20);
}

function heading(title, subtitle) {
  frame();
  doc.setFillColor(18, 33, 64);
  doc.rect(10, 10, pageW - 20, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, 14, 19.5);
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(90);
    doc.text(subtitle, 14, 30);
  }
  doc.setTextColor(0);
}

function addFooter() {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(90);
    doc.text('Compact design report generated from repo sample data', 14, pageH - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageW - 14, pageH - 8, { align: 'right' });
  }
  doc.setTextColor(0);
}

heading('Vented Submersible Causeway', 'Readable compact report replacing the broken long-form generator');
doc.setFont('helvetica', 'bold');
doc.setFontSize(18);
doc.text('Design Summary Report', pageW / 2, 55, { align: 'center' });
doc.setFont('helvetica', 'normal');
doc.setFontSize(10);
doc.text(data.project, pageW / 2, 66, { align: 'center' });
doc.text(data.location, pageW / 2, 73, { align: 'center' });
doc.setFontSize(9);
doc.text(`Applicable codes: ${data.codes}`, pageW / 2, 84, { align: 'center', maxWidth: 160 });

autoTable(doc, {
  startY: 98,
  margin: { left: 18, right: 18 },
  head: [['Section', 'What it covers']],
  body: [
    ['1', 'Project basis and governing criteria'],
    ['2', 'Observed hydraulic section data and discharge comparison'],
    ['3', 'Ventway, obstruction, afflux, scour, and foundation checks'],
    ['4', 'Structural summary and face wall stability'],
    ['5', 'Key findings and readability improvements'],
  ],
  theme: 'grid',
  headStyles: { fillColor: [18, 33, 64], textColor: [255, 255, 255], fontSize: 9 },
  bodyStyles: { fontSize: 9, cellPadding: 3 },
  columnStyles: { 0: { cellWidth: 18, halign: 'center', fontStyle: 'bold' } },
});

doc.setFontSize(9);
doc.setTextColor(80);
doc.text(
  'This script intentionally generates a shorter, clearer PDF because the previous long-form script was incomplete, crashed at runtime, and produced unreadable output patterns.',
  18,
  176,
  { maxWidth: pageW - 36 }
);
doc.setTextColor(0);

doc.addPage();
heading('1. Project basis', 'Core site and design inputs used by the compact report');

autoTable(doc, {
  startY: 36,
  margin: { left: 14, right: 14 },
  head: [['Parameter', 'Value']],
  body: [
    ['Highest Flood Level (HFL)', `${f(data.hfl)} m`],
    ['Ordinary Flood Level (OFL)', `${f(data.ofl)} m`],
    ['Lowest Bed Level (LBL)', `${f(data.lbl)} m`],
    ['Road Top Level (RTL)', `${f(data.rtl)} m`],
    ['Bottom of deck', `${f(data.bottomDeck)} m`],
    ['Carriage width', `${f(data.carriageWidth)} m`],
    ['Bed slope', `${f(data.slope, 5)}`],
    ['Manning roughness n', `${f(data.manningN, 3)}`],
    ['Safe bearing capacity', `${f(data.sbc, 1)} t/m²`],
  ],
  theme: 'striped',
  headStyles: { fillColor: [18, 33, 64], textColor: [255, 255, 255], fontSize: 9 },
  bodyStyles: { fontSize: 9, cellPadding: 3 },
  columnStyles: { 0: { fontStyle: 'bold', cellWidth: 72 } },
});

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.text('Design intent', 14, 132);
doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.text(
  'The structure is intended to remain economical, pass design flood with controlled obstruction, and maintain foundation safety below the computed scour level while using IRC-referenced checks.',
  14,
  140,
  { maxWidth: pageW - 28 }
);

doc.addPage();
heading('2. Hydraulic observations', 'Measured sections and discharge comparison');

autoTable(doc, {
  startY: 36,
  margin: { left: 12, right: 12 },
  head: [['Location', 'Area (m²)', 'Perimeter (m)', 'R (m)', 'Velocity (m/s)', 'Discharge (m³/s)']],
  body: data.sections.map((row) => [
    row.location,
    f(row.area),
    f(row.perimeter),
    f(row.radius),
    f(row.velocity),
    f(row.discharge),
  ]),
  theme: 'grid',
  headStyles: { fillColor: [18, 33, 64], textColor: [255, 255, 255], fontSize: 8.5 },
  bodyStyles: { fontSize: 8.5, cellPadding: 2.6 },
  columnStyles: { 0: { cellWidth: 48, fontStyle: 'bold' }, 5: { halign: 'right', fontStyle: 'bold' } },
});

autoTable(doc, {
  startY: doc.lastAutoTable.finalY + 10,
  margin: { left: 12, right: 12 },
  head: [['Method', 'Formula basis', 'Result (m³/s)', 'Use in design']],
  body: [
    ['Area-velocity', 'Observed section with Manning velocity', f(data.sections[2].discharge), 'Hydraulic comparison'],
    ["Dickens formula", `C × A^(3/4), C=${data.dickensC}, A=${data.catchmentArea}`, f(data.dischargeDickens), 'Catchment check'],
    ['Broad-crested weir', `Cd × L × h^(3/2), Cd=${data.weirCd}`, f(data.dischargeWeir), 'Tank surplus contribution'],
    ['Adopted design discharge', 'Stream discharge plus weir contribution', f(data.designDischarge), 'Governing value'],
  ],
  theme: 'striped',
  headStyles: { fillColor: [40, 60, 96], textColor: [255, 255, 255], fontSize: 8.5 },
  bodyStyles: { fontSize: 8.5, cellPadding: 2.8 },
  columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
});

doc.addPage();
heading('3. Ventway and foundation checks', 'Readability-focused summary of the governing hydraulic checks');

autoTable(doc, {
  startY: 36,
  margin: { left: 12, right: 12 },
  head: [['Check', 'Value', 'Limit / basis', 'Status']],
  body: [
    ['Total vent area', `${f(data.ventArea)} m²`, 'Provided vent opening', 'INFO'],
    ['Vent opening at RTL', `${f(data.ventPercentRTL, 2)}%`, 'Practical adequacy trial', 'OK'],
    ['Obstruction at HFL', `${f(data.obstructionHFL, 2)}%`, '< 30%', data.obstructionHFL < 30 ? 'PASS' : 'REVIEW'],
    ['Orifice-method afflux', `${f(data.affluxOrifice, 3)} m`, 'Primary adopted method', 'PASS'],
    ['Weir-method afflux', `${f(data.affluxWeir, 3)} m`, 'Cross-check only', 'INFO'],
    ['Lacey scour depth', `${f(data.laceyScour, 2)} m`, 'IRC / Lacey basis', 'PASS'],
    ['Foundation depth below GL', `${f(data.foundationDepth, 2)} m`, 'Below max scour level', 'PASS'],
    ['Foundation level', `${f(data.foundationLevel, 3)} m`, 'Final adopted level', 'PASS'],
  ],
  theme: 'grid',
  headStyles: { fillColor: [18, 33, 64], textColor: [255, 255, 255], fontSize: 8.5 },
  bodyStyles: { fontSize: 8.5, cellPadding: 2.8 },
  didParseCell: ({ cell, column, section }) => {
    if (section !== 'body' || column.index !== 3) return;
    if (cell.raw === 'PASS' || cell.raw === 'OK') cell.styles.textColor = [0, 120, 0];
    if (cell.raw === 'REVIEW') cell.styles.textColor = [180, 0, 0];
  },
});

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.text('Interpretation', 14, doc.lastAutoTable.finalY + 14);
doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.text(
  `The selected arrangement provides ${f(data.totalFlowAreaHFL)} m² of effective flow area at HFL against ${f(data.areaHFL)} m² unobstructed area, which keeps the reported obstruction just under the 30% acceptance limit.`,
  14,
  doc.lastAutoTable.finalY + 22,
  { maxWidth: pageW - 28 }
);

doc.addPage();
heading('4. Structural summary', 'Condensed values from the worked design');

autoTable(doc, {
  startY: 36,
  margin: { left: 12, right: 12 },
  head: [['Item', 'Value', 'Remarks']],
  body: [
    ['Typical span', `${f(data.span)} m`, 'Vented span length'],
    ['Slab thickness', `${f(data.slabThickness, 3)} m`, 'RCC deck slab'],
    ['Deck dead load', `${f(data.deckDeadLoad, 2)} kN`, 'Combined dead load'],
    ['IRC live load', `${f(data.liveLoad, 2)} kN`, 'Design live loading'],
    ['Estimated uplift', `${f(data.uplift, 2)} kN`, 'Deck uplift check'],
    ['Apron thickness', `${f(data.apronThickness, 3)} m`, 'Protection work'],
    ['Stone size', `${f(data.stoneSize, 2)} m`, 'Launching apron stone'],
  ],
  theme: 'striped',
  headStyles: { fillColor: [18, 33, 64], textColor: [255, 255, 255], fontSize: 8.5 },
  bodyStyles: { fontSize: 8.5, cellPadding: 3 },
  columnStyles: { 0: { cellWidth: 48, fontStyle: 'bold' }, 1: { halign: 'right', fontStyle: 'bold' } },
});

autoTable(doc, {
  startY: doc.lastAutoTable.finalY + 10,
  margin: { left: 12, right: 12 },
  head: [['Face wall', 'Height (m)', 'Max stress', 'Min stress', 'FS sliding', 'FS overturning']],
  body: data.faceWalls.map((row) => [
    row.id,
    f(row.height, 2),
    f(row.maxStress, 0),
    f(row.minStress, 0),
    f(row.fsSliding, 2),
    f(row.fsOverturning, 2),
  ]),
  theme: 'grid',
  headStyles: { fillColor: [40, 60, 96], textColor: [255, 255, 255], fontSize: 8.5 },
  bodyStyles: { fontSize: 8.5, cellPadding: 2.6 },
  columnStyles: { 0: { fontStyle: 'bold' }, 4: { halign: 'right' }, 5: { halign: 'right', fontStyle: 'bold' } },
});

doc.addPage();
heading('5. Readability improvements', 'What changed compared with the broken long-form script');

autoTable(doc, {
  startY: 36,
  margin: { left: 12, right: 12 },
  head: [['Problem in old output', 'Improvement in this version']],
  body: [
    ['Script crashed before writing a PDF', 'Uses `autoTable(doc, ...)` correctly and writes a real PDF file'],
    ['Hardcoded Windows output path', 'Accepts CLI/env output path and defaults to a portable workspace path'],
    ['Long unreadable narrative blocks', 'Replaced with concise tables and short interpretation paragraphs'],
    ['Static footer with wrong page total', 'Writes dynamic page numbers after the document is assembled'],
    ['Incomplete file content', 'Replaced by a finished deterministic generator'],
  ],
  theme: 'grid',
  headStyles: { fillColor: [18, 33, 64], textColor: [255, 255, 255], fontSize: 8.5 },
  bodyStyles: { fontSize: 8.5, cellPadding: 3 },
  columnStyles: { 0: { cellWidth: 72, fontStyle: 'bold' } },
});

addFooter();

const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
writeFileSync(outputPath, pdfBuffer);
console.log(`Wrote compact causeway report to ${outputPath}`);
