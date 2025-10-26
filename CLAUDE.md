# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tapestry** is a monorepo ecosystem for design system documentation, extraction, and developer experience tooling. It uses Turborepo for orchestration, pnpm workspaces for dependency management, and Changesets for version management.

**Package Manager:** pnpm 10.19.0
**Node Requirement:** >=22.0.0
**Monorepo Tool:** Turborepo

## Monorepo Structure

```
tapestry/
├── packages/                    # Published npm packages
│   ├── extract/                # Core extraction engine (v0.1.2)
│   ├── resolve/                # Dependency/relationship resolver (stub)
│   ├── graph/                  # Data model and querying (stub)
│   ├── plugin-figma/           # Figma integration plugin (stub)
│   ├── plugin-vscode/          # VS Code integration plugin (stub)
│   └── shared/                 # Internal shared utilities (stub)
├── apps/                        # Applications
│   ├── studio/                 # Main Studio app (stub)
│   ├── docs/                   # Documentation site (stub)
│   └── playground/             # Demo/sandbox environment (stub)
├── turbo.json                   # Turborepo task pipeline configuration
├── .changeset/                  # Changesets for version management
└── pnpm-workspace.yaml          # pnpm workspace configuration
```

**Active Packages:**

- `@tapestrylab/extract` - Fully implemented component metadata extractor (see `packages/extract/CLAUDE.md`)

**Stub Packages:**

- All other packages/apps have placeholder package.json files with unimplemented scripts

## Development Commands

### Node Version Management

This project requires **Node 22 or higher**. Use the `.nvmrc` file with fnm:

```bash
fnm use    # Switch to Node 22
```

### Installation

```bash
pnpm install    # Install all dependencies across workspace
```

### Building

```bash
pnpm build                           # Build all packages (Turbo orchestrates)
pnpm --filter @tapestrylab/extract build    # Build specific package
turbo run build --filter=@tapestrylab/extract  # Alternative Turbo syntax
```

**Turbo Build Details:**

- Builds run in topological order (dependencies build first via `^build`)
- Build outputs cached in `.turbo/` and `dist/` directories
- Next.js apps output to `.next/` (excluded from cache)

### Testing

```bash
pnpm test                            # Run tests for all packages
pnpm turbo run test:ci               # Run all tests in CI mode
pnpm --filter @tapestrylab/extract test     # Test specific package
```

**Testing Notes:**

- Most packages use Vitest for unit tests
- Test files colocated with source using `.test.ts` extension
- Coverage outputs to `coverage/` directories

### Type Checking

```bash
pnpm turbo run type-check            # Type-check all packages
pnpm --filter @tapestrylab/extract type-check  # Check specific package
```

### Development Mode

```bash
pnpm dev                             # Run dev servers for all apps/packages
pnpm --filter @tapestrylab/extract dev  # Watch mode for specific package
```

### Linting and Formatting

```bash
pnpm lint                            # Lint all packages (when implemented)
pnpm format                          # Format all files with Prettier
```

## Versioning and Publishing

This monorepo uses **Changesets** for independent package versioning with **automated changeset generation**.

### How Changesets Work Here

**Changesets are automatically generated** from your commit messages when you create a PR. You don't need to run `pnpm changeset` manually!

The GitHub Action (`.github/workflows/auto-changeset.yml`) will:

1. Detect which packages have source changes
2. Parse your conventional commit messages
3. Infer the bump type (major/minor/patch)
4. Generate a changeset file
5. Commit it to your PR

**See:** `.github/COMMIT_CONVENTIONS.md` for commit message patterns

### Commit Message Format

Use **conventional commits** to trigger automatic changeset generation:

```bash
feat(extract): add support for Vue components      # → minor bump
fix(resolve): handle circular dependencies         # → patch bump
feat(graph)!: breaking API change                  # → major bump
docs: update README                                # → no changeset
```

**Key types:**

- `feat:` → minor (new features)
- `fix:` → patch (bug fixes)
- `perf:` → patch (performance improvements)
- `feat!:` or `BREAKING CHANGE:` → major (breaking changes)
- `docs:`, `test:`, `chore:` → no changeset (non-functional changes)

### Manual Changeset Creation (Optional)

If you need to create a changeset manually or want to customize the auto-generated one:

```bash
pnpm changeset                       # Interactive changeset creation
```

### Skipping Auto-Generation

Add `[skip changeset]` to your PR title to skip automatic changeset generation:

```
[skip changeset] docs: update contributing guide
```

### Version Bumping and Publishing

```bash
pnpm version-packages                # Apply changesets to package.json files
pnpm release                         # Build and publish to npm
```

**Changeset Configuration:**

- Base branch: `main`
- Access: `public` (all packages published publicly)
- Independent versioning (each package versioned separately)
- Auto-generation via GitHub Actions (see `.github/workflows/auto-changeset.yml`)

## Git Workflow

### Making Changes

1. **Create a feature branch**: `git checkout -b feat/your-feature` (or `fix/`, `docs/`, `refactor/`, etc.)
2. **Make your changes**: Edit code in package `src/` directories
3. **Ensure tests pass**: `pnpm turbo run test:ci`
4. **Type-check**: `pnpm turbo run type-check`
5. **Build**: `pnpm build`
6. **Commit**: Use conventional commit format (see below)
7. **Create PR**: Push your branch and open a pull request to `main`
8. **Changeset auto-generated**: The GitHub Action will automatically create a changeset from your commits

**No manual changeset creation needed!** The workflow detects your changes and generates changesets automatically.

### Commit Messages

Use **conventional commit format** (short, one-line):

```bash
feat(extract): add Vue component support
fix(resolve): handle circular deps
docs: update README
test(graph): add query tests
```

**Format:** `<type>(<scope>): <subject>`

See `.github/COMMIT_CONVENTIONS.md` for complete guide.

## Architecture and Design Patterns

### Turborepo Task Pipeline

Tasks defined in `turbo.json` with dependency ordering:

- **`build`**: Depends on `^build` (dependencies build first)
- **`test`**, **`lint`**, **`type-check`**: All depend on `^build`
- **`dev`**: No cache, persistent (watch mode)
- **`test:ui`**: No cache, persistent (interactive UI)

### Package Dependency Flow

```
@tapestrylab/extract (standalone, no internal deps)
    ↓
@tapestrylab/resolve (future: depends on extract)
    ↓
@tapestrylab/graph (future: depends on resolve)
    ↓
@tapestrylab/studio (future: depends on graph)
```

Currently only `@tapestrylab/extract` is implemented. Other packages are placeholders.

### TypeScript Configuration

**Root `tsconfig.json`:**

- Strict mode enabled
- ES2022 target
- ESNext modules with bundler resolution
- Composite projects (for project references)

**Package-level configs:**

- Extend root config
- Add package-specific paths and includes

### Module System

All packages use **ES modules** (`"type": "module"` in package.json where applicable).

## Key Implementation Details

### Extract Package (Core)

The `@tapestrylab/extract` package is the only fully implemented package. For detailed information:

**See:** `packages/extract/CLAUDE.md`

**Quick summary:**

- Plugin-based architecture for component metadata extraction
- Uses `oxc-parser` (Rust-based) for fast TypeScript/JSX parsing
- Supports React components with TypeScript props, JSDoc, and complex types
- CLI tool: `tapestry-extract` (programmatic API also available)
- Built with `tsdown`, tested with Vitest

### Stub Packages

Packages `resolve`, `graph`, `plugin-figma`, `plugin-vscode`, and `shared` have:

- Skeleton `package.json` files
- Echo statements in scripts (e.g., `"build": "echo \"Build script not yet implemented\""`)
- No source code yet

When implementing these packages, follow the patterns from `extract`:

- Use `tsdown` for building (or appropriate bundler)
- Use Vitest for testing
- Colocate test files with source (`.test.ts`)
- Create package-level `README.md` and `CLAUDE.md` files
- Follow ES module conventions

## Working in This Codebase

### Adding a New Package

1. Create directory in `packages/` or `apps/`
2. Add `package.json` with scoped name (`@tapestrylab/package-name`)
3. Set up TypeScript config extending root
4. Implement build, test, and dev scripts
5. Add to workspace (automatic via `pnpm-workspace.yaml`)
6. Document in root README.md and this file

### Running Commands in Specific Packages

```bash
# Using pnpm filter
pnpm --filter @tapestrylab/extract build
pnpm --filter @tapestrylab/extract test

# Using Turbo filter
turbo run build --filter=@tapestrylab/extract
turbo run test --filter="@tapestrylab/extract"

# In package directory
cd packages/extract
pnpm build
pnpm test
```

### Running Tasks Across All Packages

```bash
turbo run build                      # Build all packages
turbo run test                       # Test all packages
turbo run type-check                 # Type-check all packages
```

### Common Debugging Commands

```bash
# View Turbo task graph
turbo run build --dry-run --graph

# Clear Turbo cache
turbo run build --force

# View pnpm workspace structure
pnpm list --recursive

# Check pnpm version
pnpm --version
```

## Development Tips

1. **Always run commands from monorepo root** unless working on a specific package
2. **Use Turbo for cross-package tasks** - it handles dependency order and caching
3. **Use pnpm filter for single-package tasks** - faster when you know the target
4. **Build before testing** - many packages depend on built artifacts (`^build` in turbo.json)
5. **Watch Turborepo cache** - if tests fail mysteriously, try `--force` to clear cache
6. **Use conventional commits** - changesets are auto-generated from your commit messages

## Package Naming Convention

All packages follow the `@tapestrylab/*` scope:

- Published packages: `@tapestrylab/extract`, `@tapestrylab/resolve`, etc.
- Private apps: `@tapestrylab/studio`, `@tapestrylab/docs`, etc.

## Key External Dependencies

**Monorepo Tools:**

- `turbo` - Task orchestration and caching
- `pnpm` - Fast, efficient package manager with workspace support
- `@changesets/cli` - Version management and publishing

**Build Tools:**

- `tsdown` - TypeScript bundler (used in extract package)
- `typescript` - Type checking

**Testing:**

- `vitest` - Fast unit test framework
- `@vitest/ui` - Interactive test UI

**Formatting:**

- `prettier` - Code formatting

## Important Files

- **`turbo.json`** - Turborepo pipeline configuration
- **`pnpm-workspace.yaml`** - Workspace package definitions
- **`.changeset/config.json`** - Changeset configuration
- **`package.json`** - Root package scripts and devDependencies
- **`tsconfig.json`** - Shared TypeScript configuration
- **`.nvmrc`** - Node version specification
- All file names for functions should be kebab case. Function names themselves should be pascalCase. Everything should be functional unless there is a clear beneft to Classes. All test file names should match the file names for the file they are testing.
- Commit after each step, phase, feature and fix is implemented and tested
- Always use typescript where possible
- Log any feedback as github issues
