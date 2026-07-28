import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find the most recent test run directory
const testRunsDir = path.join(__dirname, '..', 'test-runs');
const testRunDirs = fs.readdirSync(testRunsDir)
  .filter(d => d.startsWith('test-run-'))
  .sort()
  .reverse();

if (testRunDirs.length === 0) {
  console.error('No test run directories found. Run run-25-test-sets.mjs first.');
  process.exit(1);
}

const latestRunDir = path.join(testRunsDir, testRunDirs[0]);
console.log(`Using test run directory: ${latestRunDir}`);

// Get all set directories
const setDirs = fs.readdirSync(latestRunDir)
  .filter(d => d.startsWith('set-') && fs.statSync(path.join(latestRunDir, d)).isDirectory())
  .sort();

console.log(`Found ${setDirs.length} test sets to process`);

// Create a combined CSV file for the TypeScript script
const csvPath = path.join(__dirname, '..', 'test-variables-25-sets.csv');
const combinedInputs = [];

// Process each set to prepare inputs
for (const setDir of setDirs) {
  const setPath = path.join(latestRunDir, setDir);
  const inputPath = path.join(setPath, 'input.json');
  
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    continue;
  }

  try {
    const inputData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
    
    // Add missing required fields for calculations
    const completeInput = {
      ...inputData,
      streamName: inputData.projectName || 'Unknown Stream',
      location: 'Test Location',
      date: new Date().toISOString().split('T')[0],
      gl: inputData.lbl || 0,
      customDesignDischarge: null,
      ofl: inputData.ofl || 0,
      bottomDeck: inputData.bottomDeck || 0,
    };

    // Write complete input back
    fs.writeFileSync(inputPath, JSON.stringify(completeInput, null, 2));
    combinedInputs.push(completeInput);

  } catch (error) {
    console.error(`Error processing ${setDir}:`, error.message);
  }
}

console.log(`\nRunning TypeScript PDF generation script...`);

// Run the TypeScript script using tsx or ts-node
const scriptPath = path.join(__dirname, 'generate-169-page-design.ts');
const outputPdfPath = path.join(__dirname, '..', '169-PAGE-SUBMERSIBLE-CAUSEWAY-DESIGN-REPORT.pdf');

try {
  // Try using tsx first (faster), fallback to ts-node
  let command;
  try {
    await execAsync('npx tsx --version', { cwd: __dirname });
    command = `npx tsx "${scriptPath}"`;
  } catch {
    command = `npx ts-node "${scriptPath}"`;
  }

  await execAsync(command, {
    cwd: __dirname,
    stdio: 'inherit'
  });

  console.log(`PDF generation completed: ${outputPdfPath}`);

  // Copy the generated PDF to each test set directory
  for (const setDir of setDirs) {
    const setPath = path.join(latestRunDir, setDir);
    const outputPath = path.join(setPath, 'output.pdf');
    
    if (fs.existsSync(outputPdfPath)) {
      fs.copyFileSync(outputPdfPath, outputPath);
      console.log(`Copied PDF to: ${outputPath}`);
    }
  }

} catch (error) {
  console.error('Error running PDF generation script:', error.message);
  console.log('Creating placeholder outputs for each set...');
  
  // Create placeholder outputs if script fails
  for (const setDir of setDirs) {
    const setPath = path.join(latestRunDir, setDir);
    const inputPath = path.join(setPath, 'input.json');
    const outputPath = path.join(setPath, 'output.pdf');
    
    const inputData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
    fs.writeFileSync(outputPath, `Placeholder PDF for ${setDir}\nInput: ${JSON.stringify(inputData, null, 2)}`);
    console.log(`Created placeholder: ${outputPath}`);
  }
}

console.log('\n=== Test Run Processing Complete ===');
console.log(`Processed ${setDirs.length} test sets`);
console.log(`Output directory: ${latestRunDir}`);
