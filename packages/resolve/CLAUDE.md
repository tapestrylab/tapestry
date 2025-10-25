# @tapestrylab/resolve - Claude Code Instructions

This file provides guidance to Claude Code when working with the `@tapestrylab/resolve` package.

## Package Overview

**@tapestrylab/resolve** is a unified system for resolving component, docs, and dependency references across the Tapestry ecosystem. It provides a flexible, plugin-based resolution system for locating modules, components, and dependencies from multiple sources (local filesystem, CDN, remote registries).

**Version:** 0.1.0
**Status:** Fully implemented
**Main Use Cases:**
- Playground environments that need to resolve user-uploaded components and npm dependencies
- Build tools that need consistent module resolution across different sources
- Design system tooling that needs to locate components and documentation

## Architecture

### Core Components

```
src/
├── index.ts                    # Public API exports
├── Resolver.ts                 # Main Resolver class
├── types.ts                    # Core type definitions
├── strategies/                 # Resolution strategies
│   ├── local.ts               # Local filesystem resolution
│   ├── local.test.ts          # Local strategy tests
│   ├── cdn.ts                 # CDN resolution (esm.sh, jsDelivr, unpkg)
│   ├── cdn.test.ts            # CDN strategy tests
│   └── remote.ts              # Remote registry (stub)
└── utils/                      # Shared utilities
    └── normalizePath.ts        # Path normalization and detection
```

### Design Patterns

**Strategy Pattern:**
- The package uses a strategy pattern for resolution
- Each strategy (`local`, `cdn`, `remote`) implements the `ResolverStrategy` interface
- The `Resolver` class coordinates multiple strategies in a pipeline
- Strategies are tried in order until one succeeds (first-match-wins)

**Builder Pattern:**
- `createResolver(config)` factory function for creating resolver instances
- Fluent configuration with strategy composition

**Caching:**
- Built-in caching for successful and failed resolutions
- Cache can be cleared with `resolver.clearCache()`
- Disabled with `cache: false` in config

## Key Implementation Details

### Resolver Class (Resolver.ts)

The `Resolver` class is the core orchestrator:

```typescript
class Resolver {
  // Resolves a single module identifier
  async resolve(id: string, context?: ResolutionContext): Promise<ResolvedEntry | null>

  // Resolves multiple identifiers in parallel
  async resolveMany(ids: string[], context?: ResolutionContext): Promise<Map<string, ResolvedEntry | null>>

  // Dynamically add strategies
  addStrategy(strategy: ResolverStrategy, prepend?: boolean): void

  // Clear resolution cache
  clearCache(): void
}
```

**Resolution Flow:**
1. Check cache for previously resolved entry
2. Try each strategy in order
3. First successful resolution is returned
4. Cache the result (success or failure)
5. Return `null` if all strategies fail

### Strategies

#### Local Strategy (strategies/local.ts)

Resolves local filesystem paths with alias support.

**Features:**
- Alias mapping (`@ui/Button` → `components/ui/Button`)
- Relative imports (`./Button`, `../utils/helper`)
- Absolute paths (`/usr/local/lib/module`)
- Extension resolution (`.ts`, `.tsx`, `.js`, `.jsx`)
- Index file resolution (`./components` → `./components/index.ts`)
- Optional filesystem existence check (`checkExists` flag)

**Configuration:**
```typescript
local({
  root: '/project/src',
  alias: {
    '@ui': 'components/ui',
    '@core': 'components/core'
  },
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  checkExists: true // Set to false for browser environments
})
```

**Browser Compatibility:**
- Set `checkExists: false` to disable filesystem checks in browser environments
- Relies on path logic only (no `fs` module usage)

#### CDN Strategy (strategies/cdn.ts)

Resolves npm packages from CDN providers.

**Supported Providers:**
- `esm.sh` (default) - Modern ESM CDN
- `jsdelivr` - Fast, reliable CDN
- `unpkg` - Popular npm CDN

**Features:**
- Scoped packages (`@radix-ui/react-popover`)
- Subpath imports (`lodash/debounce`)
- Version pinning via `versionMap`
- Availability verification with HEAD requests (optional)
- Configurable timeout for availability checks

**Configuration:**
```typescript
cdn({
  provider: 'esm.sh',
  versionMap: {
    'react': '18.3.1',
    '@radix-ui/react-popover': '1.0.7'
  },
  verifyAvailability: true,
  timeout: 5000
})
```

**CDN URL Patterns:**
- esm.sh: `https://esm.sh/{package}@{version}`
- jsdelivr: `https://cdn.jsdelivr.net/npm/{package}@{version}/+esm`
- unpkg: `https://unpkg.com/{package}@{version}?module`

#### Remote Strategy (strategies/remote.ts)

Placeholder for future remote registry support.

**Future Use Cases:**
- Tapestry Cloud component registry
- Figma API for design tokens
- Private component registries

**Current Implementation:**
- Stub that always returns `null`
- Type definitions in place
- Ready for future implementation

### Types (types.ts)

Core type definitions:

```typescript
interface ResolvedEntry {
  id: string;              // Original identifier
  path: string;            // Resolved path or URL
  source?: 'local' | 'cdn' | 'remote';
}

interface ResolutionContext {
  root?: string;           // Project root
  importer?: string;       // Current file (for relative imports)
  metadata?: Record<string, unknown>;
}

interface ResolverStrategy {
  name: string;
  resolve(id: string, context?: ResolutionContext): Promise<ResolvedEntry | null>;
}

interface ResolverConfig {
  strategies?: ResolverStrategy[];
  cache?: boolean;
  context?: ResolutionContext;
}
```

### Utilities (utils/normalizePath.ts)

Path detection and normalization utilities:

```typescript
// Detect path types
isRelativePath(path: string): boolean     // ./foo, ../bar
isAbsolutePath(path: string): boolean     // /foo/bar, C:/foo/bar
isUrl(path: string): boolean              // https://, http://
isBareModuleSpecifier(path: string): boolean  // react, @radix-ui/react-popover

// Normalize paths
normalizePath(path: string): string       // Converts backslashes to forward slashes
```

## Testing

### Test Structure

All tests use **Vitest** with colocated test files:

- `src/index.test.ts` - Public API tests
- `src/Resolver.test.ts` - Resolver class tests
- `src/strategies/local.test.ts` - Local strategy tests
- `src/strategies/cdn.test.ts` - CDN strategy tests

### Test Fixtures

Test fixtures are in `/test-fixtures/`:

```
test-fixtures/
├── simple/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   └── index.ts
└── (other test projects)
```

### Running Tests

```bash
pnpm test                    # Watch mode
pnpm test:ci                 # CI mode (single run)
pnpm test:ui                 # Interactive UI
pnpm test:coverage           # Generate coverage report
```

### Test Categories

**Unit Tests:**
- Strategy-specific behavior (alias resolution, CDN URL generation)
- Path normalization utilities
- Cache behavior

**Integration Tests:**
- Multi-strategy resolution pipelines
- Parallel resolution with `resolveMany()`
- Context propagation

**Edge Cases:**
- Invalid identifiers
- Missing files
- Circular dependencies
- Network failures (CDN)

## Build Configuration

### Build Tool: tsdown

The package uses **tsdown** for bundling (configured in `tsdown.config.ts`):

**Key Settings:**
- Entry: `src/index.ts`
- Output: `dist/` directory
- Format: ESM only (`type: "module"`)
- Generates TypeScript declarations (`.d.ts`)
- Tree-shaking enabled

**Build Commands:**
```bash
pnpm build                   # Build once
pnpm dev                     # Watch mode
```

**Output Files:**
- `dist/index.js` - Main ESM bundle
- `dist/index.d.ts` - TypeScript declarations

### Package Exports

```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./package.json": "./package.json"
  }
}
```

## Dependencies

**Production:**
- `zod` (^4.1.12) - Runtime validation (currently unused, reserved for future schema validation)

**Dev Dependencies:**
- Inherited from monorepo root (TypeScript, Vitest, tsdown)

**No Runtime Node Dependencies:**
- Package is browser-compatible
- No `fs`, `path`, or other Node-specific modules in production code
- Node utilities used only in tests

## Development Workflow

### Adding a New Strategy

1. **Create strategy file**: `src/strategies/my-strategy.ts`
2. **Implement `ResolverStrategy` interface**:
   ```typescript
   export interface MyStrategyConfig {
     // Strategy-specific options
   }

   export function myStrategy(config: MyStrategyConfig): ResolverStrategy {
     return {
       name: 'my-strategy',
       async resolve(id, context) {
         // Resolution logic
         return { id, path: '...', source: 'my-strategy' };
       }
     };
   }
   ```
3. **Create tests**: `src/strategies/my-strategy.test.ts`
4. **Export from index.ts**: Add to `strategies` object
5. **Update README.md**: Document new strategy
6. **Update this CLAUDE.md**: Document implementation details

### Adding New Features

1. **Check types first**: Update `src/types.ts` if needed
2. **Implement in Resolver**: Add method to `Resolver` class
3. **Add tests**: Create or update test files
4. **Update exports**: Export from `src/index.ts`
5. **Document**: Update README.md and this file

### Debugging Tips

**Enable debug logging:**
```typescript
const resolver = createResolver({
  strategies: [
    local({ /* ... */ }),
    cdn({ /* ... */ })
  ]
});

// Add custom logging
const originalResolve = resolver.resolve.bind(resolver);
resolver.resolve = async (id, context) => {
  console.log('Resolving:', id);
  const result = await originalResolve(id, context);
  console.log('Result:', result);
  return result;
};
```

**Common Issues:**
- **Alias not working**: Check alias order (more specific aliases first)
- **CDN not resolving**: Verify `versionMap` has entry for package
- **Local file not found**: Ensure `root` is set correctly and file exists
- **Cache stale**: Call `resolver.clearCache()`

## Browser vs Node Environments

### Node Environment

```typescript
const resolver = createResolver({
  strategies: [
    local({
      root: '/absolute/path/to/project',
      checkExists: true // Verifies files exist
    })
  ]
});
```

### Browser Environment

```typescript
const resolver = createResolver({
  strategies: [
    local({
      root: '/virtual/filesystem',
      checkExists: false // Skip filesystem checks
    }),
    cdn({
      provider: 'esm.sh',
      verifyAvailability: false // Optional: skip HEAD requests
    })
  ]
});
```

## Performance Considerations

**Caching:**
- Enabled by default (`cache: true`)
- Caches both successful and failed resolutions
- Reduces redundant strategy calls

**Parallel Resolution:**
- Use `resolveMany()` for bulk resolution
- Internally uses `Promise.all()` for concurrency

**Strategy Order:**
- Put faster strategies first (e.g., `local` before `cdn`)
- Network-based strategies should be last

**CDN Optimization:**
- Set `verifyAvailability: false` to skip HEAD requests
- Pre-populate `versionMap` to avoid version resolution

## Type Checking

```bash
pnpm type-check                  # Type-check without building
```

**TypeScript Config:**
- Extends root `tsconfig.json`
- Strict mode enabled
- ES2022 target
- ESNext module resolution

## Common Tasks

### Test a specific strategy

```bash
pnpm vitest run src/strategies/local.test.ts
```

### Check which files will be published

```bash
pnpm pack --dry-run
```

### Verify exports work correctly

```bash
pnpm build
node -e "import('./dist/index.js').then(m => console.log(Object.keys(m)))"
```

## Integration with Other Packages

**Future Dependencies:**
- `@tapestrylab/extract` may use resolve to locate components
- `@tapestrylab/graph` may use resolve for dependency graph construction
- `@tapestrylab/studio` may use resolve for playground module resolution

**Current Status:**
- Standalone package with no internal dependencies
- Can be used independently

## Related Documentation

- **README.md**: Public API documentation and examples
- **Root CLAUDE.md**: Monorepo structure and workflow
- **Root README.md**: Tapestry ecosystem overview

## Versioning

**Current Version:** 0.1.0
**Versioning Strategy:** Independent (via Changesets)
**Changelog:** See `.changeset/` directory in monorepo root

When making changes:
1. Use conventional commits (see root `CLAUDE.md`)
2. Changesets auto-generated from commit messages
3. Version bumped on release
