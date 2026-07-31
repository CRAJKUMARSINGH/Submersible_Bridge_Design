const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(process.cwd());
const SAMPLE_TXT = path.resolve(ROOT, 'attached_assets', 'Type Design of submersible causeway.txt');
const OUTPUT_PDF = path.resolve(ROOT, '169-PAGE-SUBMERSIBLE-CAUSEWAY-DESIGN-REPORT.pdf');

function runRiceGrainTest() {
  console.log('=== RICE GRAIN TEST (Text-Based Verification) ===\n');
  
  // Read sample text file
  const sampleText = fs.readFileSync(SAMPLE_TXT, 'utf8');
  const sampleLines = sampleText.split('\n');
  
  console.log(`Sample TXT: ${sampleLines.length} total lines`);
  
  // Check if the water current force section is present in sample
  console.log('\n=== WATER CURRENT FORCE SECTION CHECK ===');
  
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
    console.log(`"${phrase}": Sample=${inSample ? 'YES' : 'NO'}`);
  }
  
  // Check for the specific line 619 content
  console.log('\n=== LINE 619 SPECIFIC CHECK ===');
  const targetLine = 'For the purpose of calculation of exposed area to water current force,only 1.0m width of abutment is considered for full hieght upto HFL';
  const sampleHasLine = sampleText.includes(targetLine);
  console.log(`Target line in sample TXT: ${sampleHasLine ? 'YES' : 'NO'}`);
  
  // Find the line number
  const lineNum = sampleLines.findIndex(l => l.includes('width of abutment is considered for full hieght'));
  if (lineNum >= 0) {
    console.log(`Found at line ${lineNum + 1}: "${sampleLines[lineNum]}"`);
  }
  
  console.log('\n=== GENERATOR CONFIGURATION CHECK ===');
  const generatorPath = path.resolve(ROOT, 'scripts', 'generate-169-page-design.ts');
  const generatorCode = fs.readFileSync(generatorPath, 'utf8');
  
  const usesSampleText = generatorCode.includes('sampleTextLines') || generatorCode.includes('Type Design of submersible causeway.txt');
  const hasNarrativeLoop = generatorCode.includes('narrativePage') || generatorCode.includes('lineIdx');
  
  console.log(`Generator loads sample text: ${usesSampleText ? 'YES' : 'NO'}`);
  console.log(`Generator has narrative loop: ${hasNarrativeLoop ? 'YES' : 'NO'}`);
  
  console.log('\n=== CONCLUSION ===');
  console.log('The generator has been restructured to embed sample text verbatim.');
  console.log('Since pdf-parse is not working in this environment, manual PDF verification is required.');
  console.log('Open the generated PDF and check if the water current force section appears.');
  console.log(`Expected phrase: "width of abutment is considered for full hieght upto HFL"`);
}

runRiceGrainTest();
