#!/usr/bin/env node
/**
 * Validate generated git history against commit rules.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSchedule } from './lib/dates.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));

function git(args) {
  return execSync(`git ${args}`, { encoding: 'utf8', cwd: join(__dirname, '..') }).trim();
}

function parseGitDate(raw) {
  // git log --format=%aI returns ISO 8601
  return new Date(raw).getTime();
}

function main() {
  const range = `${config.dateRange.start}..${config.dateRange.end}`;
  let log;
  try {
    log = git(`log --all --format=\"%aI|%an|%ae\" --reverse`);
  } catch {
    console.error('ERROR: No git repository found. Run generate-history.mjs first.');
    process.exit(1);
  }

  if (!log) {
    console.error('ERROR: No commits found.');
    process.exit(1);
  }

  const lines = log.split('\n').filter(Boolean);
  const timestamps = [];
  const authors = new Set();
  const byDay = new Map();

  for (const line of lines) {
    const [dateIso, name, email] = line.split('|');
    const ts = parseGitDate(dateIso);
    const day = dateIso.slice(0, 10);

    if (day >= config.dateRange.start && day <= config.dateRange.end) {
      timestamps.push(ts);
      byDay.set(day, (byDay.get(day) || 0) + 1);
    }

    authors.add(`${name} <${email}>`);
  }

  const expectedAuthor = `${config.authorName} <${config.authorEmail}>`;
  const foreignAuthors = [...authors].filter((a) => a !== expectedAuthor);

  const schedule = validateSchedule(timestamps, config);

  let maxDay = 0;
  for (const cnt of byDay.values()) maxDay = Math.max(maxDay, cnt);

  console.log('=== History Validation Report ===');
  console.log(`Total commits in range: ${timestamps.length}`);
  console.log(`Max commits/day:        ${maxDay}`);
  console.log(`Active days:            ${byDay.size}`);
  console.log(`Authors:                ${[...authors].join(', ')}`);

  let failed = false;

  if (foreignAuthors.length > 0) {
    console.error(`FAIL: Unexpected authors: ${foreignAuthors.join(', ')}`);
    failed = true;
  }

  if (!schedule.ok) {
    console.error(`FAIL: ${schedule.error}`);
    failed = true;
  } else {
    console.log('PASS: Date schedule within limits');
  }

  if (timestamps.length > config.limits.maxTotalCommits) {
    console.error(
      `FAIL: ${timestamps.length} commits exceeds max ${config.limits.maxTotalCommits}`
    );
    failed = true;
  }

  // Verify author date = committer date
  const dateCheck = git(`log --all --format=\"%aI|%cI\" --reverse`);
  for (const row of dateCheck.split('\n').filter(Boolean)) {
    const [author, committer] = row.split('|');
    if (author !== committer) {
      console.error(`FAIL: Author date ${author} != committer date ${committer}`);
      failed = true;
      break;
    }
  }
  if (!failed) console.log('PASS: Author date equals committer date');

  if (failed) {
    process.exit(1);
  }

  console.log('\nValidation passed.');
}

main();
