# Tapestry

A multi-package ecosystem for component documentation, extraction, and developer experience tooling. Build better component documentation with automated component metadata extraction, dependency resolution, and powerful querying capabilities.

## Overview

Tapestry is a monorepo that provides a comprehensive toolkit for building, documenting, and maintaining design systems. It bridges the gap between design and development by automatically extracting component metadata, resolving dependencies, and providing powerful querying capabilities.

## Features

- **🏗️ Monorepo Architecture**: Built with Turborepo and pnpm workspaces for optimal developer experience
- **🔌 Plugin System**: Extensible architecture for custom extractors and integrations
- **🔤 TypeScript First**: Full TypeScript support across all packages
- **📦 Independent Versioning**: Each package versions independently using Changesets
- **🧪 Modern Testing**: Vitest for fast, modern unit testing across all packages

## Packages

### Published Packages

- **[@tapestrylab/extract](packages/extract)** - Component metadata extractor
- **@tapestrylab/resolve** - Dependency and relationship resolver (coming soon)
- **@tapestrylab/graph** - Data model and querying layer (coming soon)
- **@tapestrylab/shared** - Internal shared utilities (coming soon)

## Getting Started

### Prerequisites

- **Node.js >= 22.0.0** (use `fnm use` to switch to the correct version)
- **pnpm >= 8.0.0**

### Installation

```bash
# Install dependencies
pnpm install
```

## Development Commands

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @tapestrylab/extract build
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in CI mode
pnpm test:ci

# Test specific package
pnpm --filter @tapestrylab/extract test
```

### Type Checking

```bash
# Type-check all packages
pnpm type-check

# Type-check specific package
pnpm turbo run type-check --filter=@tapestrylab/extract
```

### Development Mode

```bash
# Watch mode for all packages
pnpm dev

# Watch mode for specific package
pnpm --filter @tapestrylab/extract dev
```

### Working with Specific Packages

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

## Architecture

Tapestry uses a modular monorepo architecture with independent packages that work together:

### Monorepo Structure

```
tapestry/
├── packages/                    # Published npm packages
│   ├── extract/                # Core extraction engine
└── turbo.json                   # Turborepo configuration
```

### Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces for optimal caching and task orchestration
- **Package Manager**: pnpm 10.19.0
- **Build**: tsdown for efficient TypeScript bundling
- **Testing**: Vitest for fast, modern unit testing
- **TypeScript**: Strict mode with composite projects
- **Versioning**: Changesets with automated generation from commits

### Turborepo Task Pipeline

Tasks defined in `turbo.json` with dependency ordering:

- **`build`**: Depends on `^build` (dependencies build first)
- **`test`**, **`type-check`**: All depend on `^build`
- **`dev`**: No cache, persistent (watch mode)
- **`test:ci`**: CI-optimized test runs

## Contributing

We welcome contributions! For detailed step-by-step instructions on how to contribute, including exact commands for every phase of the process, see **[CONTRIBUTING.md](./CONTRIBUTING.md)**.

## Versioning

This monorepo uses [Changesets](https://github.com/changesets/changesets) for version management and publishing. **Changesets are automatically generated** from your commit messages when you create a PR.

### Creating a Changeset

```bash
# Interactive changeset creation (optional)
pnpm changeset
```

The GitHub Action (`.github/workflows/auto-changeset.yml`) automatically generates changesets from conventional commit messages in your PRs.

### Publishing

```bash
# Apply changesets to bump versions
pnpm version-packages

# Build and publish to npm
pnpm release
```

## Debugging

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

## License

MIT

## Resources

- 📖 [Architecture Details](./CLAUDE.md) - Technical implementation and development guide
- 📦 [Extract Package](./packages/extract) - Component metadata extraction
- 🐛 [Report Issues](https://github.com/tapestrylab/tapestry/issues)
- 💬 [Discussions](https://github.com/tapestrylab/tapestry/discussions)
