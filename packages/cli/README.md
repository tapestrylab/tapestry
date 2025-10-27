# @tapestrylab/cli

Unified command-line interface for all Tapestry design system tools.

## Installation

```bash
npm install -g @tapestrylab/cli
# or
pnpm add -g @tapestrylab/cli
```

## Usage

The `tapestry` CLI provides a single entrypoint for all Tapestry tools:

### Extract Component Metadata

Extract component metadata from source files:

```bash
tapestry extract --root ./src --output ./metadata.json
```

Options:
- `-c, --config <path>` - Path to config file
- `-r, --root <path>` - Project root directory
- `-o, --output <path>` - Output file path
- `-i, --include <patterns...>` - Include patterns
- `-e, --exclude <patterns...>` - Exclude patterns
- `--json` - Output as JSON

### Generate Documentation

Generate documentation from component source files:

```bash
tapestry generate --source ./src/Button.tsx --template component-docs
```

Options:
- `-s, --source <path>` - Source file or directory (default: `./src/components`)
- `-o, --output <path>` - Output directory (default: `./docs`)
- `-t, --template <name|path>` - Template name or path to template file
- `-f, --format <format>` - Output format: `markdown`, `mdx`, or `html` (default: `mdx`)
- `--theme <path>` - Path to custom theme file
- `--no-relationships` - Skip relationship resolution
- `--project-root <path>` - Project root for relationship resolution

### List Available Templates

List all built-in templates:

```bash
tapestry list
```

### Initialize Configuration

Initialize Tapestry configuration in the current directory:

```bash
tapestry init
```

Options:
- `--force` - Overwrite existing files

This will create:
- `tapestry.config.js` - Configuration file
- `templates/` - Directory for custom templates
- `templates/custom.taptpl.json` - Example custom template
- `custom.theme.js` - Example custom theme

## Examples

### Extract and Generate Documentation

```bash
# Extract metadata from all components
tapestry extract --root ./src/components --output ./metadata.json

# Generate documentation for a single component
tapestry generate --source ./src/Button.tsx --template component-docs --format mdx

# Generate documentation for all components in a directory
tapestry generate --source ./src/components --output ./docs --template api-reference
```

### Using Custom Templates and Themes

```bash
# Initialize Tapestry configuration
tapestry init

# Edit the generated tapestry.config.js and templates/custom.taptpl.json

# Generate docs with custom template and theme
tapestry generate --template ./templates/custom.taptpl.json --theme ./custom.theme.js
```

## Migration from Individual CLIs

If you were previously using `tapestry-extract` or `tapestry-template`, you can now use the unified `tapestry` CLI:

**Before:**
```bash
tapestry-extract extract --root ./src --output ./metadata.json
tapestry-template generate --source ./src/Button.tsx --template component-docs
tapestry-template list
tapestry-template init
```

**After:**
```bash
tapestry extract --root ./src --output ./metadata.json
tapestry generate --source ./src/Button.tsx --template component-docs
tapestry list
tapestry init
```

The individual CLIs (`tapestry-extract` and `tapestry-template`) will continue to work, but we recommend using the unified `tapestry` CLI for a better experience.

## Package Architecture

This CLI package is a thin wrapper that delegates to the underlying packages:
- `tapestry extract` → `@tapestrylab/extract`
- `tapestry generate` → `@tapestrylab/template`
- `tapestry list` → `@tapestrylab/template`
- `tapestry init` → `@tapestrylab/template`

## License

MIT
