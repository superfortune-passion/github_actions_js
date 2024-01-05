#!/usr/bin/env node
/**
 * Generate dense 2024 git history on main from current codebase.
 * Splits files into incremental commits for a natural contribution graph.
 */
import { execSync } from 'node:child_process';
import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
  statSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assignCommitDates, validateSchedule } from './lib/dates.mjs';
import { buildCommitPlan } from './lib/chunks.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));
const groups = JSON.parse(readFileSync(join(__dirname, 'feature-groups.json'), 'utf8'));

const STAGING_DIR = join(__dirname, '.staging');
const MANIFEST_PATH = join(__dirname, 'generated-manifest.json');
const TARGET = config.targetCommits ?? config.limits.maxTotalCommits;
if (TARGET !== config.limits.maxTotalCommits) {
  console.error(`ABORT: targetCommits (${TARGET}) must equal maxTotalCommits (${config.limits.maxTotalCommits})`);
  process.exit(1);
}

const gitEnv = () => ({
  ...process.env,
  GIT_AUTHOR_NAME: config.authorName,
  GIT_AUTHOR_EMAIL: config.authorEmail,
  GIT_COMMITTER_NAME: config.authorName,
  GIT_COMMITTER_EMAIL: config.authorEmail,
});

function run(cmd) {
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', env: gitEnv(), shell: true });
}

function runOut(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', env: gitEnv(), shell: true }).trim();
}

function formatGitDate(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} +0000`
  );
}

function commitAt(message, ts) {
  const date = formatGitDate(ts);
  const env = { ...gitEnv(), GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date };
  const escaped = message.replace(/"/g, '\\"');
  execSync(`git commit -m "${escaped}"`, {
    cwd: ROOT,
    env,
    stdio: 'inherit',
    shell: true,
  });
}

function snapshotWorkspace() {
  if (existsSync(STAGING_DIR)) rmSync(STAGING_DIR, { recursive: true, force: true });
  mkdirSync(STAGING_DIR, { recursive: true });

  const exclude = new Set(config.excludePaths);
  const manifest = [];

  function collectFromDisk(dir, relPath = '') {
    for (const name of readdirSync(dir)) {
      if (name === '.git' || name === 'node_modules') continue;
      const full = join(dir, name);
      const rel = relPath ? `${relPath}/${name}` : name;
      if (rel === '_automation' || rel.startsWith('_automation/')) continue;
      if (exclude.has(rel) || exclude.has(name)) continue;
      const st = statSync(full);
      if (st.isDirectory()) {
        collectFromDisk(full, rel);
      } else {
        const dest = join(STAGING_DIR, rel);
        mkdirSync(dirname(dest), { recursive: true });
        copyFileSync(full, dest);
        manifest.push({ rel, staged: dest });
      }
    }
  }

  collectFromDisk(ROOT);

  const gitignorePath = join(STAGING_DIR, '.gitignore');
  if (existsSync(gitignorePath)) {
    let gi = readFileSync(gitignorePath, 'utf8');
    if (!gi.includes('_automation/')) {
      gi += '\n_automation/\n';
      writeFileSync(gitignorePath, gi);
    }
  }

  return manifest;
}

function clearProjectFiles(manifest) {
  for (const { rel } of manifest) {
    const p = join(ROOT, rel);
    if (existsSync(p)) rmSync(p, { force: true });
  }
}

function restoreWorkspace(manifest) {
  for (const { rel, staged } of manifest) {
    const dest = join(ROOT, rel);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(staged, dest);
  }
}

function flattenFiles() {
  const files = [];
  for (const group of groups) {
    for (const file of group.files) {
      if (existsSync(join(STAGING_DIR, file.path))) files.push(file);
      else console.error(`WARN: Missing staged file ${file.path}, skipping`);
    }
  }
  return files;
}

function main() {
  const force = process.argv.includes('--force');
  if (!force && existsSync(join(ROOT, '.git'))) {
    console.error('ERROR: .git exists. Pass --force to delete and regenerate.');
    process.exit(1);
  }

  console.log('=== Snapshotting current workspace ===');
  const manifest = snapshotWorkspace();
  const files = flattenFiles();
  const plan = buildCommitPlan(files, STAGING_DIR, TARGET);

  if (plan.length !== TARGET) {
    console.error(`ABORT: Planned ${plan.length} commits, expected ${TARGET}`);
    process.exit(1);
  }

  // Drop no-op steps where file content unchanged
  const deduped = [];
  const seen = new Map();
  for (const step of plan) {
    if (seen.get(step.path) === step.content) continue;
    seen.set(step.path, step.content);
    deduped.push(step);
  }
  if (deduped.length !== TARGET) {
    console.error(`ABORT: After dedup ${deduped.length} commits, expected ${TARGET}`);
    process.exit(1);
  }

  const commitDates = assignCommitDates(deduped.length, config);
  const scheduleCheck = validateSchedule(commitDates, config);
  if (!scheduleCheck.ok) {
    console.error(`ABORT: ${scheduleCheck.error}`);
    process.exit(1);
  }

  console.log('\n=== Regenerating git history on main ===');
  console.log(`Target commits (2024): ${deduped.length}`);
  console.log(`Active days:           ${scheduleCheck.activeDays}`);
  console.log(`Max/day (planned):     ${scheduleCheck.maxDay}`);

  if (existsSync(join(ROOT, '.git'))) {
    console.log('Removing existing .git ...');
    rmSync(join(ROOT, '.git'), { recursive: true, force: true });
  }

  clearProjectFiles(manifest);

  run('git init -b main');
  run(`git config user.name "${config.authorName}"`);
  run(`git config user.email "${config.authorEmail}"`);

  writeFileSync(join(ROOT, '.gitignore'), '_automation/\nnode_modules/\nlib/\ndist/\n');

  const fileState = new Map();
  let dateIdx = 0;
  let lastPath = null;

  for (const step of deduped) {
    const dest = join(ROOT, step.path);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, step.content);
    fileState.set(step.path, step.content);

    run('git add --all');
    commitAt(step.message, commitDates[dateIdx++]);

    if (step.path !== lastPath) {
      process.stdout.write(`\r  Commits: ${dateIdx}/${deduped.length}  (${step.path})          `);
      lastPath = step.path;
    }
  }
  console.log(`\r  Commits: ${deduped.length}/${deduped.length}  done.                    `);

  console.log('\n=== Restoring working tree ===');
  restoreWorkspace(manifest);

  const report = {
    generatedAt: new Date().toISOString(),
    author: `${config.authorName} <${config.authorEmail}>`,
    branch: 'main',
    totalCommits2024: deduped.length,
    schedule: scheduleCheck,
    head: runOut('git rev-parse HEAD'),
  };
  writeFileSync(MANIFEST_PATH, JSON.stringify(report, null, 2));

  console.log('\n=== Generation Complete ===');
  console.log(`Total commits (2024): ${deduped.length}`);
  console.log(`Max/day (planned):    ${scheduleCheck.maxDay}`);
  console.log(`Active days:          ${scheduleCheck.activeDays}`);
  console.log(`Branch:               main`);
  console.log(`Manifest:             ${MANIFEST_PATH}`);
}

main();
