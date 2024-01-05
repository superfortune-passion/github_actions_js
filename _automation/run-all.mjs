#!/usr/bin/env node
/**
 * Run full pipeline: generate → validate → push main only
 */
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function run(script, args = '') {
  execSync(`node ${join(__dirname, script)} ${args}`, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  });
}

const force = process.argv.includes('--force') ? '--force' : '';

console.log('Step 1/3: Generate history\n');
run('generate-history.mjs', force);

console.log('\nStep 2/3: Validate history\n');
run('validate-history.mjs');

console.log('\nStep 3/3: Push main only\n');
run('push-main.mjs');

console.log('\nPipeline complete.');
