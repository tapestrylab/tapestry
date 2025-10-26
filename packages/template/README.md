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

The template package includes a flexible theming system that allows you to customize the appearance of generated documentation.

#### Using Built-in Themes

Three preset themes are included:

```typescript
import { generateAll } from '@tapestrylab/template';

await generateAll({
  source: './src/components',
  outputDir: './docs',
  template: myTemplate,
  theme: './node_modules/@tapestrylab/template/themes/default.theme.js',
  // or 'minimal.theme.js', 'documentation.theme.js'
});
```

**Built-in themes:**
- `default.theme.js` - Balanced styling with borders and backgrounds
- `minimal.theme.js` - Minimal styling, mostly unstyled
- `documentation.theme.js` - Documentation-focused with enhanced spacing and colors

#### Creating a Custom Theme

Create a theme file that exports a theme object:

```javascript
// my-theme.theme.js
export default {
  components: {
    propsTable: {
      styles: {
        table: 'border-collapse border border-gray-300',
        header: 'bg-blue-100 font-bold',
        row: 'hover:bg-gray-50',
        cell: 'px-4 py-2',
      },
    },
    callout: {
      styles: {
        container: 'p-4 rounded-lg border-l-4',
        warning: 'bg-yellow-50 border-yellow-400',
        info: 'bg-blue-50 border-blue-400',
      },
    },
    codeBlock: {
      styles: {
        pre: 'bg-gray-900 text-gray-100 rounded-lg p-4',
        code: 'font-mono text-sm',
      },
      props: {
        showLineNumbers: true,
      },
    },
  },
  global: {
    fontFamily: 'Inter, sans-serif',
    accentColor: '#3b82f6',
    borderRadius: '8px',
  },
};
```

```typescript
import { loadTheme } from '@tapestrylab/template';

const theme = await loadTheme('./my-theme.theme.js');
```

#### Extending Built-in Themes

Themes use **shallow merge** at the component level. To extend a built-in theme, manually spread the properties you want to preserve:

```javascript
// extended-theme.theme.js
import defaultTheme from '@tapestrylab/template/themes/default.theme.js';

export default {
  ...defaultTheme,
  components: {
    ...defaultTheme.components,
    // Replace entire propsTable config
    propsTable: {
      styles: {
        table: 'my-custom-table-class',
        header: 'my-custom-header-class',
      },
    },
    // Selectively override nested properties
    tabs: {
      ...defaultTheme.components.tabs,
      styles: {
        ...defaultTheme.components.tabs.styles,
        activeTab: 'border-b-2 border-brand-primary', // Override just activeTab
      },
    },
  },
  global: {
    ...defaultTheme.global,
    accentColor: '#ff6b6b', // Override just accent color
  },
};
```

#### Theme Merge Behavior

**Important:** Custom themes use **shallow merge** at the component level:

- Setting `components.propsTable` **replaces** the entire `propsTable` configuration
- To preserve nested properties, manually spread them (see example above)
- **Precedence:** custom theme > default theme

**Why shallow merge?**
- **Predictable:** You always know exactly what configuration is active
- **Explicit:** No hidden merging behavior
- **Type-safe:** Easier for TypeScript to validate
- **Standard pattern:** Same pattern used by React props, Tailwind, ESLint

**When to use each pattern:**

| Pattern | Use Case |
|---------|----------|
| Built-in theme as-is | Quick start, standard styling |
| Custom theme from scratch | Complete control, brand new design |
| Extend with spreading | Tweak specific properties, preserve defaults |
| Deep merge utility | Prefer automatic merging over manual spreading |

#### Deep Merge Utility (Optional)

If you prefer automatic deep merging over manual spreading, use the `deepMergeThemes()` helper:

```typescript
import { deepMergeThemes } from '@tapestrylab/template';
import defaultTheme from '@tapestrylab/template/themes/default.theme.js';

const customTheme = deepMergeThemes(defaultTheme, {
  components: {
    propsTable: {
      styles: {
        header: 'bg-brand-primary', // Only overrides header, preserves other styles
      },
    },
  },
  global: {
    accentColor: '#ff6b6b', // Only overrides accentColor, preserves other global settings
  },
});
```

**Trade-offs:**
- ✅ Less verbose than manual spreading
- ✅ Automatically preserves nested properties
- ⚠️ Less explicit - harder to see exactly what's being merged
- ⚠️ May merge more than intended if you're not careful

#### Available Component Styles

Each component type supports different style keys:

**propsTable:** `table`, `header`, `row`, `cell`
**tabs:** `container`, `tabList`, `tab`, `activeTab`, `panel`
**accordion:** `container`, `item`, `header`, `content`
**callout:** `container`, `icon`, `content`
**codeBlock:** `container`, `pre`, `code`

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
