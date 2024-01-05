#!/usr/bin/env node
/**
 * Validate and force-push main only. Closes PRs and deletes feature branches.
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSchedule } from './lib/dates.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));
const MANIFEST_PATH = join(__dirname, 'generated-manifest.json');

function run(cmd, opts = {}) {
  return execSync(cmd, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: opts.silent ? 'pipe' : 'inherit',
    shell: true,
  });
}

function runOut(cmd) {
  return run(cmd, { silent: true }).trim();
}

function parseRemoteUrl(url) {
  const m = url.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
  if (!m) throw new Error(`Cannot parse GitHub URL: ${url}`);
  return { owner: m[1], repo: m[2].replace(/\.git$/, '') };
}

async function getToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  try {
    return runOut('gh auth token');
  } catch {
    /* skip */
  }
  try {
    const input = 'protocol=https\nhost=github.com\n\n';
    const out = execSync('git credential fill', {
      input,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const match = out.match(/^password=(.+)$/m);
    if (match) return match[1].trim();
  } catch {
    /* skip */
  }
  throw new Error('No GitHub token found. Set GITHUB_TOKEN or GH_TOKEN.');
}

async function ghApi(token, method, path, body) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`GitHub API ${method} ${path}: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

function preflightValidate() {
  console.log('=== Pre-push validation ===');
  const range = config.dateRange;
  const log = runOut(`git log main --format=\"%aI\" --reverse`);
  const lines = log.split('\n').filter(Boolean);

  const timestamps = [];
  const byDay = new Map();
  for (const iso of lines) {
    const day = iso.slice(0, 10);
    if (day >= range.start && day <= range.end) {
      timestamps.push(new Date(iso).getTime());
      byDay.set(day, (byDay.get(day) || 0) + 1);
    }
  }

  const schedule = validateSchedule(timestamps, config);
  if (!schedule.ok) {
    console.error(`ABORT: ${schedule.error}`);
    process.exit(1);
  }
  const expected = config.targetCommits ?? config.limits.maxTotalCommits;
  if (timestamps.length !== expected) {
    console.error(
      `ABORT: ${timestamps.length} commits on main, expected exactly ${expected}`
    );
    process.exit(1);
  }
  if (timestamps.length > config.limits.maxTotalCommits) {
    console.error(
      `ABORT: ${timestamps.length} commits exceeds max ${config.limits.maxTotalCommits}`
    );
    process.exit(1);
  }

  let maxDay = 0;
  for (const cnt of byDay.values()) maxDay = Math.max(maxDay, cnt);

  console.log(`Total commits in range: ${timestamps.length}`);
  console.log(`Max/day:                ${maxDay}`);
  console.log(`Active days:            ${byDay.size}`);
  console.log('Validation passed.\n');
  return { total: timestamps.length, maxDay, activeDays: byDay.size };
}

function ensureRemote() {
  const remotes = runOut('git remote');
  if (!remotes.split('\n').includes(config.remote)) {
    if (remotes.includes('origing')) {
      run(`git remote rename origing ${config.remote}`);
    } else {
      run(`git remote add ${config.remote} ${config.remoteUrl}`);
    }
  } else {
    run(`git remote set-url ${config.remote} ${config.remoteUrl}`);
  }
}

async function wipeAndRecreateRepo(token, owner, repo) {
  console.log('=== Wiping remote repo (removes stale contribution history) ===');
  try {
    await ghApi(token, 'DELETE', `/repos/${owner}/${repo}`);
    console.log(`  Deleted ${owner}/${repo}`);
  } catch (err) {
    if (!String(err.message).includes('404')) throw err;
    console.log('  Repo already absent.');
  }

  // Brief pause for GitHub to process deletion
  await new Promise((r) => setTimeout(r, 3000));

  await ghApi(token, 'POST', '/user/repos', {
    name: repo,
    private: false,
    auto_init: false,
  });
  console.log(`  Recreated ${owner}/${repo}`);
  await new Promise((r) => setTimeout(r, 2000));
}

async function cleanupRemote(token, owner, repo) {
  console.log('=== Closing open pull requests ===');
  try {
    const open = await ghApi(
      token,
      'GET',
      `/repos/${owner}/${repo}/pulls?state=open&per_page=100`
    );
    for (const pr of open) {
      console.log(`  Closing PR #${pr.number}: ${pr.head.ref}`);
      await ghApi(token, 'PATCH', `/repos/${owner}/${repo}/pulls/${pr.number}`, {
        state: 'closed',
      });
    }
  } catch (err) {
    console.log(`  Skipped PR cleanup: ${err.message}`);
  }

  console.log('=== Deleting remote feature branches ===');
  let refs;
  try {
    refs = await ghApi(token, 'GET', `/repos/${owner}/${repo}/git/refs/heads?per_page=100`);
  } catch {
    console.log('  No remote branches to clean.');
    return;
  }
  for (const ref of refs) {
    const branch = ref.ref.replace('refs/heads/', '');
    if (branch !== config.baseBranch && branch.startsWith('feat/')) {
      console.log(`  Deleting ${branch}`);
      await ghApi(token, 'DELETE', `/repos/${owner}/${repo}/git/refs/heads/${branch}`);
    }
  }
}

async function main() {
  if (!existsSync(MANIFEST_PATH)) {
    console.error('ERROR: Run generate-history.mjs first.');
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const stats = preflightValidate();
  ensureRemote();

  const token = await getToken();
  const { owner, repo } = parseRemoteUrl(config.remoteUrl);

  if (config.wipeRemoteRepo) {
    await wipeAndRecreateRepo(token, owner, repo);
  } else {
    await cleanupRemote(token, owner, repo);
  }

  console.log('\n=== Pushing main only ===');
  run('git checkout main');
  run(`git push -u ${config.remote} main`);

  const report = {
    ...stats,
    author: manifest.author,
    pushedAt: new Date().toISOString(),
    remote: config.remoteUrl,
    branch: 'main',
    mode: 'main-only',
  };
  const reportPath = join(__dirname, 'push-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n========================================');
  console.log('              PUSH REPORT');
  console.log('========================================');
  console.log(`Total commits (2024): ${stats.total}`);
  console.log(`Max/day:              ${stats.maxDay}`);
  console.log(`Active days:          ${stats.activeDays}`);
  console.log(`Author:               ${manifest.author}`);
  console.log(`Pushed:               ${config.remoteUrl} (main only)`);
  console.log(`Report:               ${reportPath}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
