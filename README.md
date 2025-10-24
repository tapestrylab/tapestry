# Tapestry

Multi-package ecosystem for design system documentation, extraction, and developer experience tooling.

## Packages

- **[@tapestrylab/extract](packages/extract)** - Core package for code data extraction
- **[@tapestrylab/resolve](packages/resolve)** - Dependency and relationship resolver
- **[@tapestrylab/graph](packages/graph)** - Shared data model and querying utilities
- **[@tapestrylab/plugin-figma](packages/plugin-figma)** - Plugin for Figma integration
- **[@tapestrylab/plugin-vscode](packages/plugin-vscode)** - Plugin for IDE integration
- **[@tapestrylab/shared](packages/shared)** - Internal shared utilities

## Apps

- **[studio](apps/studio)** - Main Studio app for authoring and docs
- **[docs](apps/docs)** - Documentation site
- **[playground](apps/playground)** - Demo or sandbox environment

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

## Versioning

This monorepo uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

To create a changeset:

```bash
pnpm changeset
```

## License

TBD
