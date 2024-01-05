#!/usr/bin/env node
/**
 * Push feature branches and open PRs to main.
 * main on remote stays at initial commit only until PRs are merged manually.
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSchedule } from './lib/dates.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));
const groups = JSON.parse(readFileSync(join(__dirname, 'feature-groups.json'), 'utf8'));
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

  // Try gh CLI
  try {
    return runOut('gh auth token');
  } catch {
    /* not available */
  }

  // Try git credential manager
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
    /* not available */
  }

  throw new Error(
    'No GitHub token found. Set GITHUB_TOKEN or GH_TOKEN, or authenticate gh/git credential manager.'
  );
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
  const log = runOut(`git log --all --format=\"%aI\" --reverse`);
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
    // Rename origing if present
    if (remotes.includes('origing')) {
      run(`git remote rename origing ${config.remote}`);
    } else {
      run(`git remote add ${config.remote} ${config.remoteUrl}`);
    }
  } else {
    run(`git remote set-url ${config.remote} ${config.remoteUrl}`);
  }
}

async function closeStalePullRequests(token, owner, repo, keepHeads) {
  console.log('=== Closing stale open pull requests ===');
  const open = await ghApi(
    token,
    'GET',
    `/repos/${owner}/${repo}/pulls?state=open&per_page=100`
  );
  const keep = new Set(keepHeads);

  for (const pr of open) {
    if (!keep.has(pr.head.ref)) {
      console.log(`  Closing PR #${pr.number}: ${pr.head.ref}`);
      await ghApi(token, 'PATCH', `/repos/${owner}/${repo}/pulls/${pr.number}`, {
        state: 'closed',
      });
    }
  }
}

async function deleteStaleBranches(token, owner, repo, keepBranches) {
  console.log('=== Cleaning stale remote feature branches ===');
  let refs;
  try {
    refs = await ghApi(token, 'GET', `/repos/${owner}/${repo}/git/refs/heads?per_page=100`);
  } catch (err) {
    if (String(err.message).includes('409') || String(err.message).includes('empty')) {
      console.log('  Remote repository is empty — nothing to clean.');
      return;
    }
    throw err;
  }
  const keep = new Set([config.baseBranch, ...keepBranches]);

  for (const ref of refs) {
    const branch = ref.ref.replace('refs/heads/', '');
    if (branch.startsWith('feat/') && !keep.has(branch)) {
      console.log(`  Deleting stale branch: ${branch}`);
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

  const maxPRs = config.maxPullRequests ?? groups.length;
  if (groups.length !== maxPRs) {
    console.error(
      `ABORT: feature-groups.json defines ${groups.length} branches but maxPullRequests is ${maxPRs}`
    );
    process.exit(1);
  }

  const branchNames = groups.map((g) => g.branch);
  await closeStalePullRequests(token, owner, repo, branchNames);
  await deleteStaleBranches(token, owner, repo, branchNames);

  // Force-push main to initial commit only
  console.log('\n=== Pushing main (initial commit only) ===');
  run('git checkout main');
  run(`git push --force ${config.remote} main`);

  // Push each feature branch
  console.log('\n=== Pushing feature branches ===');
  for (const group of groups) {
    console.log(`  ${group.branch}`);
    run(`git push --force ${config.remote} ${group.branch}`);
  }

  // Create or update PRs (exactly maxPullRequests)
  console.log(`\n=== Creating pull requests (${maxPRs} total) ===`);
  const prResults = [];

  for (const group of groups) {
    const title = group.title;
    const head = group.branch;
    const base = config.baseBranch;
    const body = [
      `## Summary`,
      `Adds ${group.title.toLowerCase()} (${group.files.length} commits).`,
      '',
      `Part of automated 2024 history generation.`,
      '',
      `## Merge order`,
      `See automation report for recommended merge sequence.`,
    ].join('\n');

    // Check for existing open PR
    const existing = await ghApi(
      token,
      'GET',
      `/repos/${owner}/${repo}/pulls?head=${owner}:${head}&base=${base}&state=open`
    );

    let pr;
    if (existing.length > 0) {
      pr = existing[0];
      console.log(`  PR already open: #${pr.number} ${head}`);
    } else {
      pr = await ghApi(token, 'POST', `/repos/${owner}/${repo}/pulls`, {
        title,
        head,
        base,
        body,
      });
      console.log(`  Created PR #${pr.number}: ${head}`);
    }

    prResults.push({
      mergeOrder: groups.indexOf(group) + 1,
      branch: head,
      title,
      prNumber: pr.number,
      url: pr.html_url,
    });
  }

  const report = {
    ...stats,
    author: manifest.author,
    pushedAt: new Date().toISOString(),
    remote: config.remoteUrl,
    pullRequests: prResults,
  };

  const reportPath = join(__dirname, 'push-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n========================================');
  console.log('           PUSH & PR REPORT');
  console.log('========================================');
  console.log(`Total commits (2024): ${stats.total}`);
  console.log(`Max/day:              ${stats.maxDay}`);
  console.log(`Active days:          ${stats.activeDays}`);
  console.log(`Author:               ${manifest.author}`);
  console.log('\n--- Merge Order (merge on GitHub manually) ---');
  for (const pr of prResults) {
    console.log(`${pr.mergeOrder}. [${pr.branch}] ${pr.title}`);
    console.log(`   ${pr.url}`);
  }
  console.log(`\nReport saved: ${reportPath}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
