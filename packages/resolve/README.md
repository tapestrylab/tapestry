# @tapestrylab/resolve

> Unified system for resolving component, docs, and dependency references across the Tapestry ecosystem

## Overview

The `@tapestrylab/resolve` package provides a flexible, plugin-based resolution system for locating modules, components, and dependencies. It abstracts away where things live—whether in a local filesystem, fetched from a CDN, or retrieved from a remote registry.

Perfect for:

- **Playground environments** that need to resolve user-uploaded components and npm dependencies
- **Build tools** that need consistent module resolution across different sources
- **Design system tooling** that needs to locate components and documentation

## Features

### Module Resolution
- **Multiple Resolution Strategies**: Local filesystem, CDN (esm.sh, jsDelivr, unpkg), and remote registries
- **Alias Support**: Map short names (e.g., `@ui/Button`) to actual paths
- **Browser & Node Compatible**: Works in both environments
- **Caching**: Built-in caching for fast repeated resolutions
- **Extensible**: Easy to add custom resolution strategies

### Component Documentation
- **Server-Side Rendering**: Pre-render component previews at build time
- **Metadata Extraction**: Integration with `@tapestrylab/extract` for props, types, and JSDoc
- **Interactive Sandboxes**: Optional sandbox configuration generation for live examples
- **Static Site Compatible**: Zero-config deployable documentation
- **TypeScript**: Fully typed with extensive type definitions

## Installation

```bash
pnpm add @tapestrylab/resolve
```

## Quick Start

```typescript
import { createResolver, strategies } from "@tapestrylab/resolve"

const resolver = createResolver({
  strategies: [
    // Try local files first
    strategies.local({
      root: "/src",
      alias: {
        "@ui": "components/ui",
        "@core": "components/core",
      },
    }),
    // Fall back to CDN for npm packages
    strategies.cdn({
      provider: "esm.sh",
      versionMap: {
        react: "18.3.1",
      },
    }),
  ],
})

// Resolve a local component
const button = await resolver.resolve("@ui/Button")
console.log(button)
// { id: '@ui/Button', path: '/src/components/ui/Button.tsx', source: 'local' }

// Resolve an npm package
const react = await resolver.resolve("react")
console.log(react)
// { id: 'react', path: 'https://esm.sh/react@18.3.1', source: 'cdn' }
```

### Component Documentation with SSR

```typescript
import { createComponentResolver, strategies } from '@tapestrylab/resolve';

const docResolver = createComponentResolver({
  strategies: [
    strategies.local({
      root: '/src',
      alias: { '@ui': 'components/ui' }
    })
  ]
});

// Resolve component documentation with SSR preview and sandbox config
const docs = await docResolver.resolve({
  entry: '/src/components/Button.tsx',
  renderPreview: true,  // Generate SSR HTML preview
  sandbox: true          // Generate sandbox configuration
});

console.log(docs);
// {
//   name: "Button",
//   description: "A customizable button component",
//   filePath: "/src/components/Button.tsx",
//   props: [
//     {
//       name: "variant",
//       type: "'primary' | 'secondary'",
//       required: false,
//       defaultValue: "'primary'"
//     }
//   ],
//   previewHtml: "<div class=\"tapestry-preview\">...</div>",
//   sandbox: {
//     code: "...",
//     dependencies: { "react": "latest" },
//     files: { "Button.tsx": "...", "App.tsx": "..." }
//   }
// }
```

## API

### Module Resolution

#### `createResolver(config)`

Create a new module resolver instance.

```typescript
const resolver = createResolver({
  strategies: [strategies.local(), strategies.cdn()],
  cache: true, // Enable caching (default: true)
  context: {
    root: "/project",
    metadata: {
      /* custom data */
    },
  },
})
```

#### `resolver.resolve(id, context?)`

Resolve a single module identifier.

```typescript
const result = await resolver.resolve("@ui/Button")
// Returns: ResolvedEntry | null

const result = await resolver.resolve("./Button", {
  importer: "/src/components/index.ts",
})
```

### `resolver.resolveMany(ids, context?)`

Resolve multiple identifiers in parallel.

```typescript
const results = await resolver.resolveMany(["@ui/Button", "@ui/Input", "react", "lodash/debounce"])
// Returns: Map<string, ResolvedEntry | null>
```

### `resolver.clearCache()`

Clear all cached resolutions.

```typescript
resolver.clearCache()
```

### `resolver.addStrategy(strategy, prepend?)`

Add a new strategy dynamically.

```typescript
resolver.addStrategy(strategies.remote(), false) // Add to end
resolver.addStrategy(strategies.local(), true) // Add to beginning
```

### Component Documentation

#### `createComponentResolver(config, options?)`

Create a component documentation resolver.

```typescript
const docResolver = createComponentResolver(
  {
    strategies: [strategies.local({ root: '/src' })]
  },
  {
    renderFunction: (component, props) => {
      // Custom SSR rendering logic
      return customRender(component, props);
    }
  }
);
```

#### `docResolver.resolve(options)`

Resolve component documentation with optional SSR preview and sandbox config.

```typescript
const docs = await docResolver.resolve({
  entry: '/src/components/Button.tsx',
  renderPreview: true,     // Generate SSR HTML preview
  sandbox: true,            // Generate sandbox configuration
  previewProps: {           // Props to pass during preview render
    variant: 'primary'
  }
});

// Returns: ComponentDoc
// {
//   name: string;
//   description?: string;
//   filePath: string;
//   props?: PropDoc[];
//   examples?: ExampleDoc[];
//   imports?: string[];
//   previewHtml?: string;
//   sandbox?: SandboxConfig;
// }
```

#### `docResolver.resolveMany(entries, options?)`

Resolve multiple components in parallel.

```typescript
const allDocs = await docResolver.resolveMany(
  ['/src/components/Button.tsx', '/src/components/Input.tsx'],
  { renderPreview: true, sandbox: true }
);
```

## Strategies

### Local Strategy

Resolves local filesystem paths with alias support.

```typescript
strategies.local({
  root: "/project/src",
  alias: {
    "@ui": "components/ui",
    "@core": "components/core",
    "@utils": "lib/utils",
  },
  extensions: [".ts", ".tsx", ".js", ".jsx"],
  checkExists: true, // Set to false for browser environments
})
```

**Features:**

- Alias mapping (`@ui/Button` → `components/ui/Button`)
- Relative imports (`./Button`, `../utils/helper`)
- Absolute paths (`/usr/local/lib/module`)
- Extension resolution (tries `.ts`, `.tsx`, `.js`, `.jsx`)
- Index file resolution (`./components` → `./components/index.ts`)

### CDN Strategy

Resolves npm packages from CDN providers.

```typescript
strategies.cdn({
  provider: "esm.sh", // or 'jsdelivr', 'unpkg'
  versionMap: {
    react: "18.3.1",
    "react-dom": "18.3.1",
    "@radix-ui/react-popover": "1.0.7",
  },
  verifyAvailability: true, // Check with HEAD request
  timeout: 5000, // Timeout for availability check (ms)
})
```

**Providers:**

- `esm.sh` (default): Modern ESM CDN
- `jsdelivr`: Fast, reliable CDN
- `unpkg`: Popular npm CDN

**Features:**

- Scoped packages (`@radix-ui/react-popover`)
- Subpath imports (`lodash/debounce`)
- Version pinning via `versionMap`
- Availability verification (optional)

### Custom Strategies

Create your own resolution strategy:

```typescript
import type { ResolverStrategy } from "@tapestrylab/resolve"

const myStrategy: ResolverStrategy = {
  name: "my-custom-strategy",
  async resolve(id: string, context?) {
    // Your custom resolution logic
    if (shouldResolve(id)) {
      return {
        id,
        path: "/resolved/path",
        source: "local",
      }
    }
    return null // Pass to next strategy
  },
}

const resolver = createResolver({
  strategies: [myStrategy, strategies.cdn()],
})
```

## Use Cases

### Playground Environment

Resolve user-uploaded components and npm dependencies in the browser:

```typescript
const resolver = createResolver({
  strategies: [
    // User's uploaded components (in-memory filesystem)
    strategies.local({
      root: "/playground/uploads",
      checkExists: false, // Browser environment
      alias: {
        "@ui": "components/ui",
      },
    }),
    // External dependencies from CDN
    strategies.cdn({
      provider: "esm.sh",
      verifyAvailability: false, // Skip for faster resolution
    }),
  ],
})

// User imports in their code
const userButton = await resolver.resolve("@ui/Button")
const radix = await resolver.resolve("@radix-ui/react-popover")
```

### Monorepo support

Resolve internal packages and external dependencies:

```typescript
const resolver = createResolver({
  strategies: [
    strategies.local({
      root: "/monorepo",
      alias: {
        "@company/ui": "packages/ui/src",
        "@company/core": "packages/core/src",
      },
    }),
  ],
})

const component = await resolver.resolve("@company/ui/Button")
```

## Types

```typescript
interface ResolvedEntry {
  id: string // Original identifier
  path: string // Resolved path or URL
  source?: "local" | "cdn" | "remote"
}

interface ResolutionContext {
  root?: string // Project root
  importer?: string // Current file (for relative imports)
  metadata?: Record<string, unknown>
}

interface ResolverStrategy {
  name: string
  resolve(id: string, context?: ResolutionContext): Promise<ResolvedEntry | null>
}
```

## Performance

- **Caching**: Successful and failed resolutions are cached by default
- **Parallel Resolution**: `resolveMany()` resolves multiple identifiers concurrently
- **Lazy Verification**: CDN availability checks can be disabled for faster resolution
- **Early Exit**: Strategy pipeline stops at first successful resolution

## Browser Support

The package works in both Node.js and browser environments. For browser usage:

```typescript
const resolver = createResolver({
  strategies: [
    strategies.local({
      checkExists: false, // Disable filesystem checks
    }),
    strategies.cdn({
      verifyAvailability: false, // Optional: skip HEAD requests
    }),
  ],
})
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm dev

# Type check
pnpm type-check

# Try the interactive demo
pnpm demo
```

### Demo Script

The package includes an interactive demo script that showcases all resolver features using real fixtures:

```bash
pnpm demo
```

This will demonstrate:
- Local file resolution with and without aliases
- CDN package resolution from multiple providers
- Multi-strategy pipelines with fallbacks
- Parallel batch resolution
- Performance metrics

See `scripts/README.md` for more details.

## License

MIT
