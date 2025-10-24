# Contributing to Tapestry

We welcome contributions! This guide will walk you through every step of the process with exact commands to use.

## Prerequisites

Make sure you have the right Node version:

```bash
# Check that you're on Node 22+
node --version

# If not, use fnm to switch
fnm use
```

## Step-by-Step Guide

### 1. Fork and Clone

Start by forking the repository on GitHub, then clone your fork:

```bash
# Clone your forked repository
git clone https://github.com/YOUR_USERNAME/tapestrylab.git
cd tapestrylab

# Add the upstream repository as a remote
git remote add upstream https://github.com/tapestrylab/tapestrylab.git
```

### 2. Install Dependencies

```bash
# Install pnpm globally if you don't have it
npm install -g pnpm

# Install all workspace dependencies
pnpm install
```

### 3. Create a Feature Branch

Use a descriptive branch name following conventional commits:

```bash
# For new features
git checkout -b feat/your-feature-name

# For bug fixes
git checkout -b fix/bug-description

# For documentation
git checkout -b docs/documentation-topic

# For refactoring
git checkout -b refactor/enhancement-description
```

### 4. Make Your Changes

Edit the code in the appropriate package's `src/` directory. Use these commands while developing:

```bash
# Start development in watch mode (for specific package)
pnpm --filter @tapestrylab/PACKAGE_NAME dev

# Type check all packages
pnpm turbo run type-check

# Run tests for specific package
pnpm --filter @tapestrylab/PACKAGE_NAME test

# Run all tests across workspace
pnpm turbo run test:ci
```

### 5. Build and Verify

Ensure your changes compile and pass all checks:

```bash
# Build all packages
pnpm build

# Run type checking across all packages
pnpm turbo run type-check

# Run all tests
pnpm turbo run test:ci
```

If any checks fail, fix the issues before proceeding.

### 6. Create a Changeset

Document your changes for the changelog:

```bash
# Run the interactive changeset creator
pnpm changeset
```

You'll be prompted to:
1. **Select which packages changed** — choose the package(s) you modified (e.g., `@tapestrylab/extract`)
2. **Choose the type of change**:
   - `patch` — Bug fixes and small improvements
   - `minor` — New features that are backward compatible
   - `major` — Breaking changes
3. **Write a summary** — Describe what changed (1-2 sentences)

A new file will be created in `.changeset/` with a random name like `.changeset/happy-pandas-12345.md`.

#### When to Create Changesets

- ✅ **Create changesets for**: Bug fixes, new features, breaking changes, dependency updates, and API changes
- ❌ **Skip changesets for**: Documentation-only changes, CI/CD improvements, internal refactoring without API changes

#### Changeset Examples

Good:
- "Add support for Vue component extraction"
- "Fix TypeScript generic type serialization bug"
- "Improve error messages for invalid configurations"

Bad:
- "Updated code"
- "Fixed stuff"
- "Changes"

### 7. Commit Your Changes

Stage and commit your changes with a clear message:

```bash
# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "feat: add new feature description"
```

Use conventional commit prefixes:

| Prefix      | Usage                                    |
|-------------|------------------------------------------|
| `feat:`     | A new feature                            |
| `fix:`      | A bug fix                                |
| `docs:`     | Documentation only                       |
| `style:`    | Changes that don't affect code meaning   |
| `refactor:` | Code change without feature or bug fix   |
| `test:`     | Adding or updating tests                 |
| `chore:`    | Build, dependency, or tooling changes    |

Examples:

```bash
# Feature commit
git commit -m "feat: add Svelte component extraction support"

# Bug fix commit
git commit -m "fix: handle edge case in type serialization"

# Documentation commit
git commit -m "docs: update contributing guidelines"
```

### 8. Push Your Branch

```bash
# Push your branch to your fork
git push origin feat/your-feature-name

# If you need to update your fork later
git push origin feat/your-feature-name --force-with-lease
```

### 9. Create a Pull Request

Visit GitHub to create a pull request:
```
https://github.com/tapestrylab/tapestrylab/pull/new/feat/your-feature-name
```

Or use the GitHub CLI:

```bash
# Create a PR interactively
gh pr create --title "feat: add Svelte support" --body "Description of changes"
```

In your PR description, include:
- **What problem does this solve?** (or what feature does it add?)
- **How did you implement the solution?**
- **What testing have you done?**
- **Any screenshots or examples** (if applicable)

### 10. Address Review Feedback

If reviewers request changes:

```bash
# Make the requested changes
# ... edit files ...

# Commit the changes
git add .
git commit -m "review: address feedback on PR"

# Push the updated branch
git push origin feat/your-feature-name
```

Your PR will automatically update.

## Complete Example Workflow

Here's a complete example from start to finish:

```bash
# 1. Switch to correct Node version
fnm use

# 2. Create and checkout feature branch
git checkout -b feat/add-svelte-support

# 3. Install dependencies (first time only)
pnpm install

# 4. Start development (for extract package example)
pnpm --filter @tapestrylab/extract dev

# 5. Make your changes...
# (edit files in packages/extract/src/)

# 6. Verify everything works
pnpm turbo run type-check
pnpm turbo run test:ci
pnpm build

# 7. Create changeset
pnpm changeset
# Answer the interactive prompts

# 8. Check what files you've changed
git status

# 9. Stage and commit changes
git add .
git commit -m "feat: add Svelte component extraction support"

# 10. Push to your fork
git push origin feat/add-svelte-support

# 11. Open PR on GitHub (via web UI or CLI)
gh pr create --title "feat: add Svelte support" --body "Adds extraction support for Svelte components"
```

## Development Tips

### Useful Commands

```bash
# See what changed in your branch
git diff origin/main

# See your recent commits
git log --oneline -10

# Sync your fork with upstream (after clone)
git fetch upstream
git rebase upstream/main

# Undo the last commit (keeps changes)
git reset --soft HEAD~1

# View workspace structure
pnpm list --recursive

# Clear Turbo cache
turbo run build --force
```

### Testing Your Changes

```bash
# Run tests for specific package
pnpm --filter @tapestrylab/extract test:ci

# Run all tests across workspace
pnpm turbo run test:ci

# Run type checking across all packages
pnpm turbo run type-check

# Build all packages
pnpm build

# Build specific package
pnpm --filter @tapestrylab/extract build
```

### Code Style

```bash
# Format code
pnpm format

# Type check
pnpm turbo run type-check
```

## Working with Specific Packages

Each package has a `CLAUDE.md` file with package-specific development guidance:

- **Extract Package**: See [packages/extract/CLAUDE.md](./packages/extract/CLAUDE.md)

## Troubleshooting

### "I made a mistake in my commit message"

```bash
# Fix the last commit message
git commit --amend -m "correct: new message"

# If already pushed
git push origin feat/your-feature-name --force-with-lease
```

### "I want to update my branch with the latest changes from main"

```bash
# Fetch the latest from upstream
git fetch upstream

# Rebase your branch on top of main
git rebase upstream/main

# Push the updated branch
git push origin feat/your-feature-name --force-with-lease
```

### "I forgot to create a changeset"

```bash
# No problem, create it now
pnpm changeset

# Commit the changeset file
git add .changeset/
git commit -m "chore: add changeset for PR"

# Push it
git push origin feat/your-feature-name
```

### "Turbo cache is causing issues"

```bash
# Force rebuild without cache
turbo run build --force

# Or clear specific task cache
turbo run test --force
```

## Getting Help

- 📖 **Architecture details**: See [CLAUDE.md](./CLAUDE.md)
- 💬 **Have questions?**: Open a [discussion](https://github.com/tapestrylab/tapestrylab/discussions)
- 🐛 **Found a bug?**: [Create an issue](https://github.com/tapestrylab/tapestrylab/issues)
- 📝 **General documentation**: Check the [README](./README.md)

## Code of Conduct

Please be respectful and professional in all interactions. We're here to help each other build something great!

Happy contributing! 🎉
