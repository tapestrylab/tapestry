# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the `@tapestrylab/extract` package.

**Note:** This package is part of the Tapestry monorepo. See `/CLAUDE.md` in the repository root for general monorepo setup, git workflow, and versioning instructions.

## Project Overview

`@tapestrylab/extract` is a fast, plugin-based tool for extracting component metadata from component library source files. It parses React components (TypeScript/JavaScript) using `oxc-parser` (Rust-based parser) and extracts structured metadata including:

- Component names and export types (default/named)
- Props with TypeScript types, default values, and descriptions
- JSDoc documentation (descriptions, examples, deprecation notices)
- Type relationships (extends, intersections, unions)

**Current Version:** 0.1.2

## Extract-Specific Commands

> **Note**: This package is now library-only. For CLI usage, see `@tapestrylab/cli`.

For general build, test, and type-check commands, see the root `/CLAUDE.md`.

## Project Structure

```
extract/
├── src/
│   ├── index.ts              # Main programmatic API entry point
│   ├── config.ts             # Configuration loading (cosmiconfig)
│   ├── scanner.ts            # File scanning (fast-glob)
│   ├── extractor.ts          # Extraction orchestration
│   ├── types.ts              # Core type definitions & Zod schemas
│   └── extractors/
│       └── react/            # React extractor plugin (modular architecture)
├── test/                     # Test fixtures for integration testing
├── CLAUDE.md                 # Package-specific guidance
└── README.md                 # User-facing documentation
```

For contribution guidelines, see `/CONTRIBUTING.md` in the repository root.

## Architecture

### Core Pipeline

The extraction process follows a three-stage pipeline:

1. **Configuration (`config.ts`)**: Loads configuration from cosmiconfig-compatible files (e.g., `tapestry.config.js`, `.tapestryrc`) or programmatic arguments. Merges defaults with file-based config and programmatic overrides using `deepmerge-ts`.

2. **Scanning (`scanner.ts`)**: Uses `fast-glob` to find files matching include/exclude patterns from the config. Returns absolute file paths.

3. **Extraction (`extractor.ts`)**: Orchestrates the extraction process by:
   - Reading each scanned file
   - Routing files to appropriate extractors via the plugin system
   - Collecting metadata and errors
   - Returning structured results with stats

### Plugin System

The tool uses a flexible extractor plugin architecture defined in `types.ts`:

```typescript
interface ExtractorPlugin {
  name: string;
  test: (filePath: string) => boolean; // Match files by extension/pattern
  extract: (filePath: string, content: string) => Promise<ExtractedMetadata[]>;
}
```

**Current Plugins:**

- **React Extractor** (`extractors/react/`): Handles `.tsx`, `.jsx`, `.ts`, `.js` files

### React Extractor Details

The React extractor is the most complex plugin and has been refactored into a modular, concern-based architecture:

```
extractors/react/
├── index.ts                    # Entry point, plugin factory, parsing orchestration
├── README.md                   # Detailed extractor documentation
├── extraction/                 # Component & props extraction logic
│   ├── components.ts          # Component detection, AST traversal (Visitor pattern)
│   ├── components.test.ts
│   ├── props.ts               # Props metadata extraction
│   └── props.test.ts
├── serialization/             # AST-to-string conversion
│   ├── types.ts               # TypeScript type & value serialization
│   └── types.test.ts
└── utils/                     # Shared utilities
    ├── type-guards.ts         # React/JSX detection predicates
    ├── type-guards.test.ts
    ├── type-resolver.ts       # Type reference resolution
    ├── jsdoc.ts               # JSDoc comment parsing
    └── jsdoc.test.ts
```

**Key Capabilities:**

- **Parser**: Uses `oxc-parser` for extremely fast TypeScript/JSX parsing (Rust-based)
- **Component Detection**: PascalCase functions returning JSX (function declarations, arrow functions, default/named exports)
- **Props Extraction**: Supports destructured params, type annotations, inline types, and default values
- **Type Serialization**: Handles complex TypeScript types (unions, intersections, generics, mapped types, conditionals, indexed access)
- **Type Resolution**: Resolves type references and expands type definitions
- **JSDoc Parsing**: Extracts descriptions, `@param` tags, `@deprecated`, `@see`, `@since`, `@example`, `@returns`

For detailed implementation information, see `src/extractors/react/README.md`.

### Entry Points

- **Programmatic API** (`index.ts`): `extract(config?)` function for library usage with file system access
- **Core API** (`core.ts`): Browser-compatible extraction API without Node.js dependencies (for edge runtimes, browsers, Convex, etc.)

### Output Format

The tool produces `ExtractResult` containing:

- **`metadata`**: Array of `ComponentMetadata` objects with:
  - `name`, `filePath`, `exportType` (default/named)
  - `props`: Array of `PropMetadata` with name, type, required, defaultValue, description, examples
  - **JSDoc fields**: `description`, `deprecated`, `returns`, `links` (@see), `since`, `examples`
  - `extends`: Type references that couldn't be expanded inline
- **`errors`**: Array of extraction errors with filePath, message, line, column
- **`stats`**: filesScanned, filesProcessed, componentsFound, duration (ms)

## Key Implementation Details

- **Parser**: `oxc-parser` for extremely fast TypeScript/JSX parsing (Rust-based)
- **Type System**: All types defined in `types.ts` with Zod schema validation for config
- **Configuration**: Cosmiconfig integration supporting `tapestry.config.{js,ts,mjs,cjs}` and `.tapestryrc{,.json,.js}`
- **Dependencies**: `fast-glob` (scanning), `deepmerge-ts` (config merging), `commander` (used by CLI package), `picocolors` (terminal output)

## Adding New Extractors

To add support for new component types (e.g., Vue, Svelte):

1. Create a new extractor in `src/extractors/` implementing the `ExtractorPlugin` interface from `types.ts`
2. Register it in `extractor.ts`'s `DEFAULT_EXTRACTORS` array or pass as a custom extractor
3. Custom extractors take precedence over built-in extractors when provided to `extract(config, customExtractors)`
4. Add unit tests colocated with your extractor code (`.test.ts` files)
5. Update the main README.md to document the new extractor

## Common Development Tasks

### Using the Core API (Browser-Compatible)

For edge runtimes or environments without Node.js (Convex, Cloudflare Workers, browsers):

```typescript
import { createReactExtractor } from '@tapestrylab/extract/core';

const extractor = createReactExtractor();

// Extract from in-memory code
const sourceCode = `
  export function Button({ label }: { label: string }) {
    return <button>{label}</button>;
  }
`;

const metadata = await extractor.extract('Button.tsx', sourceCode);
console.log(metadata); // [{ name: "Button", props: [...], ... }]
```

**Key differences:**
- No file system access (you provide the code as a string)
- No config file loading (all configuration is in-memory)
- No scanning/globbing (you handle file discovery)
- Pure extraction only (browser/edge compatible)

### Debugging Extraction Issues

Use the programmatic API for debugging:

```typescript
import { extract } from '@tapestrylab/extract';

const result = await extract({
  root: './test',
});

console.log(result.metadata);
console.log(result.errors);
```

Or use the unified CLI from `@tapestrylab/cli`:

```bash
npx tapestry extract --root ./test --output ./test/metadata.json
```

### Testing Specific Extractors

```bash
# Run tests for React extractor only
pnpm test src/extractors/react

# Run specific test file
pnpm test src/extractors/react/utils/type-guards.test.ts
```

### Verifying Type Serialization

When working on type serialization, test files in `src/extractors/react/serialization/types.test.ts` contain comprehensive test cases. Add new test cases there when supporting new TypeScript type patterns.

### Working with the AST

The React extractor uses `oxc-parser` for AST traversal. When debugging:

1. Add console.logs in `extraction/components.ts` to inspect AST nodes
2. Check the oxc-parser documentation for AST node types: https://oxc.rs/docs/
3. Use the Visitor pattern methods (e.g., `enter_function`, `enter_variable_declaration`) to hook into AST traversal

### Common Pitfalls

- **Type Resolution**: Remember that type references may need to be resolved using `type-resolver.ts`
- **JSX Detection**: Use the type guards in `utils/type-guards.ts` rather than writing custom detection logic
- **Default Values**: Default values from destructuring patterns need special handling in `extraction/props.ts`
- **Export Types**: Track whether components are default or named exports for correct metadata

## Quick Reference

### Key File Locations

- **Type Definitions**: `src/types.ts` - All core interfaces and Zod schemas
- **Main API**: `src/index.ts` - Programmatic API entry point
- **Config Loading**: `src/config.ts` - Configuration file loading and merging
- **File Scanning**: `src/scanner.ts` - File discovery using fast-glob
- **Extraction Orchestration**: `src/extractor.ts` - Main extraction coordinator
- **React Extractor**: `src/extractors/react/index.ts` - React plugin entry point
- **Component Detection**: `src/extractors/react/extraction/components.ts`
- **Props Extraction**: `src/extractors/react/extraction/props.ts`
- **Type Serialization**: `src/extractors/react/serialization/types.ts`
- **Type Resolution**: `src/extractors/react/utils/type-resolver.ts`
- **JSX Guards**: `src/extractors/react/utils/type-guards.ts`

### Important External Resources

- **oxc-parser docs**: https://oxc.rs/docs/ - For AST node types and API