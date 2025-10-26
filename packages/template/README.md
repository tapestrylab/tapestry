# @tapestrylab/template

Template engine for generating structured component documentation with full integration with `@tapestrylab/extract` and `@tapestrylab/resolve`.

## Features

- **Full Pipeline Integration**: Seamlessly integrates with `@tapestrylab/extract` for component metadata and `@tapestrylab/resolve` for relationship data
- **Direct Type Usage**: Uses `ComponentMetadata` from `@tapestrylab/extract` as its data model
- **Zero-Config Defaults**: Works beautifully out of the box with built-in templates and themes
- **Progressive Enhancement**: Start simple, customize as needed
- **Multiple Output Formats**: Markdown, MDX, and HTML support
- **Theming System**: Complete design control with theme support
- **Programmatic API**: Build and modify templates programmatically

## Installation

```bash
pnpm add @tapestrylab/template
```

## Quick Start

### Generate Documentation from Component Source

```typescript
import { generateAll } from '@tapestrylab/template';
import { TemplateBuilder } from '@tapestrylab/template';

// Option 1: Use built-in template
await generateAll({
  source: './src/components',
  outputDir: './docs',
  template: './node_modules/@tapestrylab/template/templates/component-docs.taptpl.json',
  outputFormat: 'mdx',
});

// Option 2: Create custom template programmatically
const template = new TemplateBuilder()
  .setMetadata({ name: 'My Template', outputFormat: 'mdx' })
  .addHeading(1, '{{name}}')
  .addParagraph('{{description}}', { if: 'description' })
  .addPropsTable('props')
  .addCodeBlocks('examples', { language: 'tsx', if: 'examples.length > 0' });

await template.save('./templates/my-template.taptpl.json');
```

## Core Concepts

### Data Model: ComponentMetadata

Templates use `ComponentMetadata` from `@tapestrylab/extract` directly:

```typescript
interface ComponentMetadata {
  name: string;
  filePath: string;
  exportType: 'default' | 'named';
  props: PropMetadata[];
  description?: string;
  deprecated?: string | boolean;
  since?: string;
  examples?: string[];
  links?: string[];
  // ... and more
}
```

### Template Structure

Templates are JSON files with blocks:

```json
{
  "name": "Component Documentation",
  "outputFormat": "mdx",
  "blocks": [
    { "type": "heading", "level": 1, "text": "{{name}}" },
    { "type": "paragraph", "text": "{{description}}", "if": "description" },
    { "type": "propsTable", "dataSource": "props" }
  ]
}
```

### Variables

Use `{{variable}}` syntax to access ComponentMetadata fields:

- `{{name}}` - Component name
- `{{description}}` - Component description
- `{{props[0].name}}` - First prop name
- `{{props.length}}` - Number of props

### Conditionals

Control visibility with `if` expressions:

```json
{
  "type": "paragraph",
  "text": "{{description}}",
  "if": "description"
}
```

```json
{
  "type": "propsTable",
  "dataSource": "props",
  "if": "props.length > 0"
}
```

## API Reference

### Generate Documentation

```typescript
import { generate, generateAll } from '@tapestrylab/template';

// Generate single component
const result = await generate({
  source: './src/components/Button.tsx',
  template: templateObject,
  output: './docs/Button.mdx',
  outputFormat: 'mdx',
});

// Generate all components
const results = await generateAll({
  source: './src/components',
  outputDir: './docs',
  template: templateObject,
  outputFormat: 'mdx',
  includeRelationships: true, // Include usage sites, dependencies, etc.
});
```

### Template Builder

```typescript
import { TemplateBuilder, createTemplate } from '@tapestrylab/template';

const template = createTemplate('My Template')
  .addHeading(1, '{{name}}')
  .addParagraph('{{description}}')
  .addPropsTable('props')
  .addCallout('warning', '{{deprecated}}', { if: 'deprecated' });

await template.save('./templates/my-template.taptpl.json');
```

### Extract Components

```typescript
import { extractComponents } from '@tapestrylab/template';

const components = await extractComponents({
  root: './src/components',
  include: ['**/*.tsx'],
});
```

### Theming

```javascript
// tapestry.theme.js
export default {
  components: {
    propsTable: {
      styles: {
        table: 'border-collapse border',
        header: 'bg-gray-100',
      },
    },
  },
  global: {
    fontFamily: 'Inter, sans-serif',
    accentColor: '#3b82f6',
  },
};
```

```typescript
import { loadTheme } from '@tapestrylab/template';

const theme = await loadTheme('./tapestry.theme.js');
```

## Built-in Templates

- `component-docs.taptpl.json` - Full documentation with props, examples, and metadata
- `minimal.taptpl.json` - Minimal docs with just name and props
- `api-reference.taptpl.json` - API-focused documentation

## Built-in Themes

- `default.theme.js` - Default styling
- `minimal.theme.js` - Minimal styling
- `documentation.theme.js` - Documentation-focused styling

## Block Types

### Text Blocks
- `heading` - H1-H6 headings
- `paragraph` - Text content
- `divider` - Horizontal rule

### Code Blocks
- `code` - Single code block
- `codeBlocks` - Multiple code blocks from data source

### Data Blocks
- `propsTable` - Component props table
- `apiReference` - API documentation

### Interactive Blocks
- `tabs` - Tabbed content
- `accordion` - Collapsible sections
- `callout` - Info/warning/error boxes

### Relationship Blocks
- `usageSites` - Where component is used
- `dependencyList` - Component dependencies
- `dependents` - Components that depend on this one
- `linkList` - Related links

## License

MIT
