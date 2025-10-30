# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

`@tapestrylab/cli` is a **unified CLI** that provides a single entrypoint for all Tapestry tools. It's a thin delegation layer built with Commander.js that routes commands to underlying packages.

**Current version:** 0.1.0
**Node requirement:** >=22.0.0
**Package manager:** pnpm

## Commands

### Development

```bash
# Build the CLI
pnpm build

# Watch mode (rebuild on changes)
pnpm dev

# Type checking (no emit)
pnpm type-check

# Run tests
pnpm test

# Run tests in CI mode (single run)
pnpm test:ci

# Run tests with UI
pnpm test:ui
```

### Running the CLI Locally

Since this package has a `bin` entry, you can test it locally:

```bash
# After building
node dist/index.js <command>

# Or link it globally
pnpm link --global
tapestry <command>
```

## Architecture

### Command Delegation Pattern

The CLI uses a **delegation architecture** where each command is implemented in its own module under `src/commands/`:

- `src/index.ts` - Main entrypoint, sets up Commander.js program with version and help
- `src/commands/extract.ts` - `tapestry extract` → delegates to `@tapestrylab/extract`
- `src/commands/template.ts` - `tapestry generate|list|init` → delegates to `@tapestrylab/template`

### Command Structure

All commands follow this pattern:

1. **Command factory function** - Returns a `Command` instance (e.g., `createExtractCommand()`)
2. **Option parsing** - Uses Commander.js `.option()` to define CLI flags
3. **Action handler** - Async function that:
   - Validates inputs
   - Loads configuration/templates
   - Calls the underlying package API
   - Formats output with `picocolors`
   - Handles errors and exits with appropriate code

### Module Resolution for Templates

The `template.ts` commands need to resolve paths to the template package's resources:

- Built-in templates: `../../../template/templates/*.taptpl.json`
- This works because the packages are in a monorepo with predictable structure
- Uses `fileURLToPath` and `import.meta.url` for ESM compatibility

### ESM Compatibility

The CLI is fully ESM:

- `"type": "module"` in package.json
- Shebang `#!/usr/bin/env node` in src/index.ts
- Import specifiers include `.js` extensions (e.g., `./commands/extract.js`)
- Uses `import.meta.url` for path resolution

## Dependencies

### Production Dependencies

- **commander** (^14.0.1) - CLI framework for parsing arguments and building commands
- **picocolors** (^1.1.1) - Lightweight terminal colors for output formatting
- **@tapestrylab/extract** (workspace:*) - Component extraction engine
- **@tapestrylab/template** (workspace:*) - Documentation generation engine

### Build System

- **tsdown** - TypeScript bundler for building the CLI
- Configured in `tsdown.config.ts`:
  - Entry: `src/index.ts`
  - Format: ESM only
  - Generates `.d.ts` types
  - Enables shims for Node.js compatibility

## Testing

Tests use **Vitest**:

- Test files: `*.test.ts` colocated with source
- Current tests: Basic smoke test in `src/index.test.ts`
- Integration testing is done through actual command execution (not currently automated)

## Build Output

Build artifacts go to `dist/`:

- `dist/index.js` - Bundled CLI entrypoint (ESM)
- `dist/index.d.ts` - TypeScript declarations

The `dist/` directory is what gets published to npm, specified in the `files` field of package.json.

## Key Implementation Details

### Version Reading

The CLI reads its version from `package.json` at runtime:

```typescript
const packageJson = JSON.parse(await fs.readFile(path.join(__dirname, "../package.json"), "utf-8"))
```

This requires the package.json to be accessible relative to the built `dist/` directory.

### Template Loading Strategy

In `template.ts`, the `loadTemplateOption()` function uses a two-tier resolution:

1. **Path-based** - If the option contains `/` or `\`, treat it as a file path
2. **Built-in** - Otherwise, look for `<name>.taptpl.json` in the template package's templates directory

This allows users to use either:
- `--template component-docs` (built-in)
- `--template ./my-custom.taptpl.json` (custom file)

### Init Command Templates

The `init` command writes three files:

- `tapestry.config.js` - Configuration file
- `templates/custom.taptpl.json` - Example custom template
- `custom.theme.js` - Example custom theme

These are embedded as string constants (`CONFIG_TEMPLATE`, `EXAMPLE_TEMPLATE`, `THEME_TEMPLATE`) in `template.ts`.

## Common Development Tasks

### Adding a New Command

1. Create a new command module in `src/commands/` (e.g., `src/commands/new-command.ts`)
2. Export a factory function that returns a `Command` instance
3. Import and add it to the program in `src/index.ts` using `.addCommand()`
4. Build and test locally

### Modifying Command Options

Edit the relevant command file in `src/commands/`:
- Add/remove `.option()` calls
- Update the action handler to use the new options
- Update the README.md to document the new options

### Updating Template/Config Scaffolds

Edit the string constants in `src/commands/template.ts`:
- `CONFIG_TEMPLATE` - Default configuration
- `EXAMPLE_TEMPLATE` - Example custom template
- `THEME_TEMPLATE` - Example theme

## Relationship to Other Packages

This CLI package has **workspace dependencies** on:

- `@tapestrylab/extract` - For component metadata extraction
- `@tapestrylab/template` - For documentation generation

When working in the monorepo:

1. Build dependencies first: `pnpm --filter @tapestrylab/extract build`
2. Then build the CLI: `pnpm --filter @tapestrylab/cli build`

Or use Turbo to handle the build order: `pnpm turbo run build --filter=@tapestrylab/cli`

## Publishing Notes

The CLI is published to npm as `@tapestrylab/cli` with a `bin` entry pointing to `dist/index.js`. Users can install it globally:

```bash
npm install -g @tapestrylab/cli
# or
pnpm add -g @tapestrylab/cli
```

This makes the `tapestry` command available system-wide.
