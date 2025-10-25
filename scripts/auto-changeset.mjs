#!/usr/bin/env node

/**
 * Auto-generate changesets based on conventional commits
 *
 * This script:
 * 1. Detects which packages have source changes since branch diverged from main
 * 2. Parses commit messages to infer bump types (major/minor/patch)
 * 3. Generates changeset files automatically
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const WORKSPACE_ROOT = process.cwd();
const CHANGESET_DIR = path.join(WORKSPACE_ROOT, '.changeset');

// Commit types and their corresponding bump levels
const BUMP_TYPES = {
  feat: 'minor',
  fix: 'patch',
  perf: 'patch',
  refactor: 'patch', // Will be filtered later if no API changes
  build: 'patch',
};

const NO_CHANGESET_TYPES = new Set(['docs', 'test', 'chore', 'style', 'ci']);

function exec(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    }).trim();
  } catch (error) {
    return '';
  }
}

function getBaseBranch() {
  // Try to find main or master branch
  const branches = exec('git branch -r').split('\n').map(b => b.trim());
  if (branches.some(b => b.includes('origin/main'))) return 'origin/main';
  if (branches.some(b => b.includes('origin/master'))) return 'origin/master';
  return 'main'; // Fallback
}

function getCurrentBranch() {
  return exec('git rev-parse --abbrev-ref HEAD');
}

function getCommitsSinceBase() {
  const currentBranch = getCurrentBranch();
  const baseBranch = getBaseBranch();

  // If we're on main/master, just get uncommitted changes
  if (currentBranch === 'main' || currentBranch === 'master') {
    return [];
  }

  // Get merge base and commits since then
  const mergeBase = exec(`git merge-base HEAD ${baseBranch}`);
  if (!mergeBase) return [];

  const commits = exec(`git log ${mergeBase}..HEAD --format="%H|||%s"`);
  if (!commits) return [];

  return commits.split('\n').map(line => {
    const [hash, message] = line.split('|||');
    return { hash, message };
  });
}

function getChangedPackages() {
  const currentBranch = getCurrentBranch();
  const baseBranch = getBaseBranch();

  let changedFiles;
  if (currentBranch === 'main' || currentBranch === 'master') {
    // Get staged and unstaged changes
    changedFiles = exec('git diff --name-only HEAD');
  } else {
    const mergeBase = exec(`git merge-base HEAD ${baseBranch}`);
    if (!mergeBase) return new Set();
    changedFiles = exec(`git diff --name-only ${mergeBase}..HEAD`);
  }

  if (!changedFiles) return new Set();

  const packages = new Set();
  const lines = changedFiles.split('\n');

  for (const file of lines) {
    // Match packages/*/src/** or apps/*/src/**
    const match = file.match(/^(?:packages|apps)\/([^/]+)\/src\//);
    if (match) {
      const packageName = match[1];
      // Read package.json to get the scoped name
      const pkgJsonPath = path.join(WORKSPACE_ROOT, match[0].split('/src/')[0], 'package.json');
      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        if (pkgJson.name) {
          packages.add(pkgJson.name);
        }
      } catch (e) {
        // Package.json not found or invalid, skip
      }
    }
  }

  return packages;
}

function parseCommitMessage(message) {
  // Parse conventional commit format: type(scope)!: subject
  const conventionalPattern = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/;
  const match = message.match(conventionalPattern);

  if (!match) {
    return { type: null, scope: null, breaking: false, subject: message };
  }

  const [, type, scope, breaking, subject] = match;
  return {
    type,
    scope: scope || null,
    breaking: breaking === '!',
    subject,
  };
}

function inferBumpType(commits) {
  let highestBump = null;

  for (const { message } of commits) {
    const { type, breaking } = parseCommitMessage(message);

    // Breaking change = major
    if (breaking || message.includes('BREAKING CHANGE')) {
      return 'major';
    }

    // Check if this type triggers a changeset
    if (NO_CHANGESET_TYPES.has(type)) {
      continue;
    }

    const bump = BUMP_TYPES[type];
    if (!bump) continue;

    // Track highest bump: major > minor > patch
    if (!highestBump || (bump === 'minor' && highestBump === 'patch')) {
      highestBump = bump;
    }
  }

  return highestBump;
}

function getChangesetSummary(commits, packages) {
  // Collect all non-chore commit subjects
  const subjects = commits
    .filter(({ message }) => {
      const { type } = parseCommitMessage(message);
      return !NO_CHANGESET_TYPES.has(type);
    })
    .map(({ message }) => {
      const { subject } = parseCommitMessage(message);
      return subject;
    });

  if (subjects.length === 0) {
    return `Changes to ${Array.from(packages).join(', ')}`;
  }

  if (subjects.length === 1) {
    return subjects[0];
  }

  // Multiple commits: create a bulleted list
  return subjects.map(s => `- ${s}`).join('\n');
}

function checkExistingChangesets() {
  if (!fs.existsSync(CHANGESET_DIR)) return false;

  const files = fs.readdirSync(CHANGESET_DIR)
    .filter(f => f.endsWith('.md') && f !== 'README.md');

  return files.length > 0;
}

function generateChangesetFile(packages, bumpType, summary) {
  // Generate a random changeset ID
  const id = crypto.randomBytes(4).toString('hex');
  const filename = `${id}.md`;
  const filepath = path.join(CHANGESET_DIR, filename);

  // Build the changeset content
  let content = '---\n';
  for (const pkg of packages) {
    content += `"${pkg}": ${bumpType}\n`;
  }
  content += '---\n\n';
  content += summary + '\n';

  fs.writeFileSync(filepath, content, 'utf8');
  return filename;
}

function main() {
  const currentBranch = getCurrentBranch();

  // Check if we're on main/master - don't auto-generate on main
  if (currentBranch === 'main' || currentBranch === 'master') {
    console.log('On main/master branch - skipping automatic changeset generation');
    console.log('Create changesets manually with: pnpm changeset');
    return;
  }

  // Check if changesets already exist
  if (checkExistingChangesets()) {
    console.log('✓ Changesets already exist for this branch');
    return;
  }

  // Get changed packages
  const changedPackages = getChangedPackages();
  if (changedPackages.size === 0) {
    console.log('No source changes detected in packages/ or apps/');
    return;
  }

  // Get commits since branch diverged
  const commits = getCommitsSinceBase();
  if (commits.length === 0) {
    console.log('No commits found since branch diverged');
    console.log('Changed packages:', Array.from(changedPackages).join(', '));
    console.log('Create changeset manually with: pnpm changeset');
    return;
  }

  // Infer bump type from commits
  const bumpType = inferBumpType(commits);
  if (!bumpType) {
    console.log('No changeset-triggering commits found (all docs/test/chore)');
    return;
  }

  // Generate changeset summary
  const summary = getChangesetSummary(commits, changedPackages);

  // Create changeset directory if it doesn't exist
  if (!fs.existsSync(CHANGESET_DIR)) {
    fs.mkdirSync(CHANGESET_DIR, { recursive: true });
  }

  // Generate the changeset file
  const filename = generateChangesetFile(changedPackages, bumpType, summary);

  console.log('✓ Generated changeset:', filename);
  console.log('  Packages:', Array.from(changedPackages).join(', '));
  console.log('  Bump type:', bumpType);
  console.log('  Summary:', summary.split('\n')[0]);

  // Stage the changeset file
  exec(`git add ${path.join(CHANGESET_DIR, filename)}`);
  console.log('✓ Staged changeset file');
}

main();
