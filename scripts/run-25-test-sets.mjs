import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create date-time stamped output directory
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outputDir = path.join(__dirname, '..', 'test-runs', `test-run-${timestamp}`);

console.log(`Creating output directory: ${outputDir}`);
fs.mkdirSync(outputDir, { recursive: true });

// Read CSV file
const csvPath = path.join(__dirname, '..', 'test-variables-25-sets.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');
const dataRows = lines.slice(1).map(line => line.split(','));

console.log(`Loaded ${dataRows.length} test sets from CSV`);

// Create subdirectories for each test set
dataRows.forEach((row, index) => {
  const setId = row[0].padStart(2, '0');
  const projectName = row[1];
  const setDir = path.join(outputDir, `set-${setId}-${projectName.replace(/[^a-zA-Z0-9]/g, '_')}`);
  fs.mkdirSync(setDir, { recursive: true });

  // Create input JSON file
  const inputData = {};
  headers.forEach((header, i) => {
    const value = row[i];
    // Convert numeric values
    if (!isNaN(value) && value !== '') {
      inputData[header] = parseFloat(value);
    } else {
      inputData[header] = value;
    }
  });

  const inputPath = path.join(setDir, 'input.json');
  fs.writeFileSync(inputPath, JSON.stringify(inputData, null, 2));
  console.log(`Created input file: ${inputPath}`);
});

// Create README for this test run
const readmeContent = `# Test Run - ${timestamp}

## Test Configuration
- Total Sets: ${dataRows.length}
- Source: test-variables-25-sets.csv
- Output Directory: ${outputDir}

## Test Sets
${dataRows.map((row, index) => {
  const setId = row[0].padStart(2, '0');
  const projectName = row[1];
  return `- **Set ${setId}**: ${projectName}`;
}).join('\n')}

## QA Rubric Scoring
Each output will be scored against the QA rubric defined in qa-rubric.md.

## Status
- [ ] All 25 sets generated
- [ ] All outputs scored against QA rubric
- [ ] Regression checks passed
- [ ] Final sign-off completed

---
Generated: ${now.toISOString()}
`;

const readmePath = path.join(outputDir, 'README.md');
fs.writeFileSync(readmePath, readmeContent);
console.log(`Created README: ${readmePath}`);

console.log('\n=== Test Run Setup Complete ===');
console.log(`Output directory: ${outputDir}`);
console.log('Next steps:');
console.log('1. Run the canonical pipeline for each input.json');
console.log('2. Generate PDF outputs');
console.log('3. Score outputs against QA rubric');
console.log('4. Perform regression checks');
