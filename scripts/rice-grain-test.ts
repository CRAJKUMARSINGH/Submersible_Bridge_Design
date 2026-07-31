import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
// @ts-ignore
const pdf = require('pdf-parse');

const ROOT = resolve(process.cwd());
const SAMPLE_PDF = resolve(ROOT, 'attached_assets', 'Type Design of submersible causeway.pdf');
const OUTPUT_PDF = resolve(ROOT, '169-PAGE-SUBMERSIBLE-CAUSEWAY-DESIGN-REPORT.pdf');

async function extractPageText(pdfPath: string, pageNum: number): Promise<string[]> {
  const dataBuffer = readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  
  // pdf-parse returns all text; we need to split by pages
  // Since pdf-parse doesn't give page-by-page text directly, we'll use the text content
  // and split by page markers if available, or return all text
  const text = data.text;
  const lines = text.split('\n').filter(l => l.trim());
  
  // For now, return all lines since pdf-parse doesn't provide page-level extraction
  // We'll need to find the specific line based on context
  return lines;
}

async function runRiceGrainTest() {
  console.log('=== RICE GRAIN TEST ===\n');
  
  const sampleData = await pdf(readFileSync(SAMPLE_PDF));
  const outputData = await pdf(readFileSync(OUTPUT_PDF));
  
  console.log(`Sample PDF: ${sampleData.numpages} pages`);
  console.log(`Output PDF: ${outputData.numpages} pages\n`);
  
  // Test pages: 1, 15, 50, 100, 169
  const testPages = [1, 15, 50, 100, 169];
  
  for (const pageNum of testPages) {
    console.log(`--- Page ${pageNum} ---`);
    
    // Extract text from both PDFs
    const sampleLines = (await pdf(readFileSync(SAMPLE_PDF))).text.split('\n');
    const outputLines = (await pdf(readFileSync(OUTPUT_PDF))).text.split('\n');
    
    // Since we can't extract page-specific text with pdf-parse easily,
    // we'll search for the known phrase from sample line 619
    const targetPhrase = 'width of abutment is considered for full hieght upto HFL';
    
    const sampleHasPhrase = sampleLines.some(l => l.includes(targetPhrase));
    const outputHasPhrase = outputLines.some(l => l.includes(targetPhrase));
    
    console.log(`Sample contains target phrase: ${sampleHasPhrase}`);
    console.log(`Output contains target phrase: ${outputHasPhrase}`);
    
    if (outputHasPhrase) {
      const matchingLine = outputLines.find(l => l.includes(targetPhrase));
      console.log(`Output line: "${matchingLine}"`);
    }
    
    console.log('');
  }
  
  // Check if the water current force section is present
  console.log('=== WATER CURRENT FORCE SECTION CHECK ===');
  const sampleText = (await pdf(readFileSync(SAMPLE_PDF))).text;
  const outputText = (await pdf(readFileSync(OUTPUT_PDF))).text;
  
  const phrases = [
    'Water pressure is considered on square ended abutments',
    'width of abutment is considered for full hieght upto HFL',
    'water current force',
    'tractive,braking effort',
    '47.84KN',
    'Buoyancy'
  ];
  
  for (const phrase of phrases) {
    const inSample = sampleText.includes(phrase);
    const inOutput = outputText.includes(phrase);
    console.log(`"${phrase}": Sample=${inSample}, Output=${inOutput} ${inSample === inOutput ? '✓' : '✗'}`);
  }
}

runRiceGrainTest().catch(console.error);
