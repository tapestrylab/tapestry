# Automated Changeset Generation

This repository uses automated changeset generation based on conventional commits.

## How It Works

When you create a pull request:

1. **GitHub Action runs** (`.github/workflows/auto-changeset.yml`)
2. **Detects changed packages** by analyzing files in `packages/*/src/` and `apps/*/src/`
3. **Parses your commit messages** to determine bump type (major/minor/patch)
4. **Generates a changeset file** in `.changeset/`
5. **Commits it back to your PR**

## What You Need to Do

### 1. Use Conventional Commits

Format your commit messages using the conventional commit pattern:

```
<type>(<scope>): <subject>
```

**Examples:**
```bash
feat(extract): add Vue component support
fix(resolve): handle circular dependencies
perf(graph): optimize query performance
docs: update README
```

### 2. Choose the Right Type

| Type | Bump | Use When |
|------|------|----------|
| `feat` | **minor** | Adding new features |
| `fix` | **patch** | Fixing bugs |
| `perf` | **patch** | Performance improvements |
| `feat!` | **major** | Breaking changes |
| `docs` | none | Documentation only |
| `test` | none | Tests only |
| `chore` | none | Maintenance/tooling |

**See:** `.github/COMMIT_CONVENTIONS.md` for complete guide

### 3. Push Your Branch and Create a PR

The automation handles the rest!

## Skipping Auto-Generation

Add `[skip changeset]` to your PR title:

```
[skip changeset] docs: update contributing guide
```

Use this for:
- Documentation-only PRs
- Internal refactoring without API changes
- Changes you want to manually create a changeset for

## Manual Changesets

You can still create changesets manually:

```bash
pnpm changeset
```

If a changeset already exists, the automation won't create a duplicate.

## How the Action Works

### Trigger
- Runs on `pull_request` events (opened, synchronize, reopened)
- Only on PRs targeting `main`

### Detection Logic
1. Gets the merge base between your branch and `main`
2. Finds all changed files since the merge base
3. Identifies packages with changes in their `src/` directories
4. Parses commit messages to infer bump type

### Bump Type Inference
- **Major**: Commit message contains `!` after type (e.g., `feat!:`) or `BREAKING CHANGE:` in body
- **Minor**: Any `feat:` commit
- **Patch**: Any `fix:`, `perf:`, or `refactor:` commit with API changes
- **None**: `docs:`, `test:`, `chore:`, `ci:`, `style:` commits

### Changeset Format

Generated changesets look like:

```markdown
---
"@tapestrylab/extract": minor
"@tapestrylab/resolve": minor
---

- Add Vue component support
- Handle circular dependencies
```

The summary is built from your commit subjects.

## Troubleshooting

### Changeset wasn't generated

Check if:
1. Your commits use conventional format
2. Your commits aren't all `docs`/`test`/`chore` types
3. You modified files in `packages/*/src/` or `apps/*/src/`
4. Your PR title doesn't contain `[skip changeset]`

### Wrong bump type

The automation infers bump type from commits:
- Multiple commits: highest bump wins (major > minor > patch)
- Check your commit types match your intent
- You can manually edit the generated changeset file

### Need to customize the changeset

After the action generates the changeset:
1. Edit the `.changeset/*.md` file in your PR
2. Update the bump types or summary as needed
3. Commit the changes

## Implementation Details

**Script:** `scripts/auto-changeset.mjs`
- Node.js script that handles detection and generation logic
- Uses git commands to analyze repository state
- Writes standard changeset markdown files

**Workflow:** `.github/workflows/auto-changeset.yml`
- Sets up Node.js and pnpm
- Runs the detection script
- Commits and pushes changeset if generated
- Comments on the PR

## Benefits

✅ **No manual work** - Focus on code, not changesets
✅ **Consistent versioning** - Conventional commits enforce clarity
✅ **Visible in PRs** - Changesets are part of the review
✅ **Flexible** - Can still create/edit changesets manually
✅ **Team-friendly** - Works for all contributors automatically
