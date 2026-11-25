import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const tests = readdirSync(new URL('./', import.meta.url))
  .filter((name) => name.endsWith('.test.ts'))
  .sort()
  .map((name) => `scripts/${name}`);
const packageManager = process.env.npm_execpath;
if (!packageManager || tests.length === 0) {
  throw new Error('Run the launch gate through the package manager with the repository test files present.');
}

const steps = [
  ['Typecheck', [packageManager, 'run', 'typecheck']],
  ['Unit and verification tests', ['--import', 'tsx', '--test', '--test-reporter=tap', ...tests]],
  ['Production build', [packageManager, 'run', 'build']],
];

const outcomes = steps.map(([label, args]) => {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
  if (result.error) console.error(result.error.message);
  return [label, result.status === 0];
});

for (const [label, passed] of outcomes) console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}`);
process.exitCode = outcomes.every(([, passed]) => passed) ? 0 : 1;
