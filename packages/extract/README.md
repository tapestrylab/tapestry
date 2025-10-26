# @tapestrylab/extract

A powerful, fast component metadata extractor for component libraries. Parse React components and automatically extract structured metadata including names, props, types, defaults, and documentation.

## Features

- **⚡ Lightning Fast**: Built on `oxc-parser` (Rust-based parser for blazing-fast AST parsing)
- **📦 Component Extraction**: Automatically finds and analyzes React components
- **🏷️ Prop Detection**: Extracts prop names, types, defaults, and descriptions from JSDoc
- **🔤 TypeScript Support**: Full TypeScript type information and complex type serialization
- **🎯 Flexible Matching**: Include/exclude patterns for fine-grained file selection
- **📝 Multiple Formats**: Outputs structured metadata JSON for use in dev/design tools
- **🔌 Plugin Architecture**: Extensible system for adding custom extractors

## Quick Start

### Installation

```bash
npm install @tapestrylab/extract
# or
pnpm add @tapestrylab/extract
```

### Usage

#### Command Line

```bash
# Extract metadata from your components
npx tapestry extract --root ./src --output ./metadata.json

# With custom configuration
npx tapestry extract --root ./components --include "**/*.tsx" --exclude "**/*.test.tsx"
```

#### Programmatic API

```typescript
import { extract } from "@tapestrylab/extract";

// Simple usage - includes and excludes use smart defaults
const result = await extract({
  root: "./src",
});

console.log(result.metadata); // Component metadata
console.log(result.stats); // Extraction statistics

// Or with custom patterns
const customResult = await extract({
  root: "./src",
  include: ["**/*.tsx"], // Optional - defaults to common patterns
  exclude: ["**/*.test.tsx"], // Optional - defaults exclude tests, node_modules, etc.
});
```

**Convenience Functions:**

```typescript
import { extractComponent, extractFromPattern, extractFromDirectory } from "@tapestrylab/extract";

// Extract a single component
const button = await extractComponent('./src/components/Button.tsx');

// Extract components matching a pattern
const components = await extractFromPattern('**/*.tsx', {
  root: './src'
});

// Extract from a directory (non-recursive by default)
const allComponents = await extractFromDirectory('./src/components');

// Extract recursively
const recursive = await extractFromDirectory('./src/components', {
  recursive: true
});
```

## Configuration

Create a `tapestry.config.js` in your project root:

```javascript
export default {
  root: "./src",
  include: ["**/*.tsx", "**/*.jsx"],
  exclude: ["**/*.test.tsx", "**/*.stories.tsx"],
  output: "./metadata.json",
};
```

Or use other config file formats:

- `.tapestryrc`
- `.tapestryrc.json`
- `.tapestryrc.js`
- `tapestry.config.mjs`
- `tapestry.config.cjs`

## Example Output

```json
{
  "metadata": [
    {
      "name": "Button",
      "filePath": "src/components/Button.tsx",
      "exportType": "default",
      "description": "A customizable button component",
      "props": [
        {
          "name": "label",
          "type": "string",
          "required": true,
          "description": "Button label text"
        },
        {
          "name": "variant",
          "type": "primary | secondary | danger",
          "required": false,
          "defaultValue": "primary",
          "description": "Button style variant"
        }
      ]
    }
  ],
  "stats": {
    "filesScanned": 15,
    "filesProcessed": 15,
    "componentsFound": 8,
    "duration": 245
  }
}
```

## Development

### Requirements

- **Node 22+** (use `fnm use` to switch to the correct version)
- **pnpm** (fast, disk space efficient package manager)

### Setup

```bash
# Install dependencies
pnpm install

# Watch mode development
pnpm dev

# Type checking
pnpm type-check
```

### Testing

```bash
# Run extraction on test fixtures
pnpm test:extract

# Run full test suite
pnpm test:ci
```

### Building

```bash
# Build the project
pnpm build
```

## Architecture

The extraction pipeline consists of three main stages:

1. **Configuration**: Loads settings from config files or CLI arguments using `cosmiconfig`
2. **Scanning**: Uses `fast-glob` to find matching files based on include/exclude patterns
3. **Extraction**: Routes files to appropriate extractors via the plugin system

### Plugin System

@tapestrylab/extract uses a flexible plugin architecture. The current React extractor handles TypeScript and JavaScript files:

- Parses files into an Abstract Syntax Tree (AST)
- Identifies components using PascalCase naming conventions
- Validates JSX return statements
- Extracts typed props with defaults
- Parses JSDoc comments for descriptions

### Supported Component Patterns

```typescript
// Function declarations
export function Button({ label }: { label: string }) {
  return <button>{label}</button>;
}

// Arrow functions
export const Card = ({ title }: Props) => {
  return <div>{title}</div>;
};

// Default exports
export default function Modal() {
  return <div role="dialog" />;
}

// With JSDoc
/**
 * A reusable button component
 * @param {string} label - Display text
 */
export function Button({ label }) {
  return <button>{label}</button>;
}
```

## Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation, your help makes this project better.

For detailed instructions on how to contribute, including step-by-step commands for every phase of the process, see [CONTRIBUTING.md](./CONTRIBUTING.md).

Quick start:

```bash
git checkout -b feat/your-feature
pnpm install
pnpm dev
# ... make your changes ...
pnpm build && pnpm test:ci
pnpm changeset
git add . && git commit -m "feat: describe your changes"
git push origin feat/your-feature
```

Then open a pull request on GitHub!

## License

MIT

## Support

- 📖 [Documentation](./CLAUDE.md) - Architecture and implementation details
- 🐛 [Report Issues](https://github.com/tapistrylab/extract/issues)
- 💬 [Discussions](https://github.com/tapistrylab/extract/discussions)
