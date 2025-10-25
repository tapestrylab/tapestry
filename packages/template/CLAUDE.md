# @tapestrylab/template - Claude Code Instructions

This file provides guidance to Claude Code when working with the `@tapestrylab/template` package.

## Package Overview

**@tapestrylab/template** is a template engine for generating structured component documentation. It integrates with `@tapestrylab/extract` for component metadata and `@tapestrylab/resolve` for relationship data.

**Version:** 0.1.0 (Phase 1 MVP)
**Status:** Fully implemented (Phase 1)

## Key Design Principles

1. **Direct Type Usage**: Uses `ComponentMetadata` from `@tapestrylab/extract` as the data model - no custom types, no transformation needed
2. **Zero Dependencies**: Variable interpolation implemented from scratch (~50 lines) - no Handlebars or similar libraries
3. **Progressive Enhancement**: Simple markdown → MDX → Custom themes → Full customization
4. **Template-First**: JSON templates are hand-writable, git-friendly, and programmatically modifiable

## Architecture

### Core Components

```
src/
├── types.ts                    # Core type definitions (re-exports from extract)
├── types-theme.ts              # Theme system types
├── interpolate.ts              # Variable interpolation (~50 lines)
├── template-builder.ts         # Programmatic template API
├── matcher.ts                  # Component → template matching
├── renderer-markdown.ts        # Markdown output renderer
├── renderer-mdx.ts             # MDX output renderer
├── theme-resolver.ts           # Theme loading and merging
├── extract-wrapper.ts          # @tapestrylab/extract integration
├── resolve-wrapper.ts          # @tapestrylab/resolve integration
├── generator.ts                # Main orchestrator
└── index.ts                    # Public API exports

components/                     # Default React components for MDX
├── PropsTable.tsx
├── Tabs.tsx
├── Accordion.tsx
├── Callout.tsx
├── CodeBlock.tsx
└── index.tsx

templates/                      # Built-in templates
├── component-docs.taptpl.json
├── minimal.taptpl.json
└── api-reference.taptpl.json

themes/                         # Preset themes
├── default.theme.js
├── minimal.theme.js
└── documentation.theme.js

schema/
└── template.schema.json        # JSON Schema for validation
```

## Key Implementation Details

### Variable Interpolation (interpolate.ts)

**Zero dependencies** - implements `{{variable}}` syntax from scratch:

```typescript
const VAR_REGEX = /\{\{([^}]+)\}\}/g;

function interpolate(text: string, data: any): string {
  return text.replace(VAR_REGEX, (_, path) => {
    return getByPath(data, path.trim()) ?? '';
  });
}

function getByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => {
    // Handle array access: props[0].name
    const match = key.match(/^(\w+)\[(\d+)\]$/);
    if (match) return acc?.[match[1]]?.[parseInt(match[2])];
    return acc?.[key];
  }, obj);
}
```

**Supports**:
- Simple access: `{{name}}`
- Nested access: `{{metadata.version}}`
- Array access: `{{props[0].name}}`
- Array length: `{{props.length}}`

**Conditionals**:
- Truthy: `"description"` → checks if exists
- Comparisons: `"props.length > 0"`, `"exportType === 'named'"`
- Inequality: `"since !== undefined"`

### Template Builder (template-builder.ts)

Fluent API for programmatic template creation:

```typescript
const template = new TemplateBuilder()
  .addHeading(1, '{{name}}')
  .addParagraph('{{description}}', { if: 'description' })
  .addPropsTable('props')
  .addCallout('warning', '{{deprecated}}', { if: 'deprecated' });
```

**Methods**:
- Content: `addHeading()`, `addParagraph()`, `addCode()`, `addDivider()`
- Data: `addPropsTable()`, `addCodeBlocks()`
- Interactive: `addTabs()`, `addAccordion()`, `addCallout()`
- Relationships: `addUsageSites()`, `addDependencyList()`, `addDependents()`
- Manipulation: `updateBlock()`, `removeBlock()`, `insertBlock()`, `moveBlock()`
- I/O: `load()`, `save()`

### Renderers

**Markdown Renderer** (renderer-markdown.ts):
- Converts blocks to markdown
- Handles variable interpolation
- Evaluates conditionals
- Renders all block types
- Outputs plain markdown

**MDX Renderer** (renderer-mdx.ts):
- Extends markdown renderer
- Generates frontmatter
- Collects component imports
- Converts interactive blocks to JSX components
- Outputs MDX with React components

### Generator (generator.ts)

Main orchestrator:

```typescript
// Single component
const result = await generate({
  source: './src/Button.tsx',  // or data: componentMetadata
  template: templateObj,
  theme: themeObj,
  output: './docs/Button.mdx',
  outputFormat: 'mdx',
});

// Batch generation
const results = await generateAll({
  source: './src/components',
  outputDir: './docs',
  template: templateObj,
  includeRelationships: true,
});
```

**Pipeline**:
1. Extract component metadata (or use provided data)
2. Optionally resolve relationships
3. Match template (or use provided template)
4. Load and resolve theme
5. Render to output format
6. Write to file

### Theme System

**Theme Structure**:
```javascript
{
  components: {
    propsTable: {
      styles: { table: 'border', header: 'bg-gray-100' },
      props: { /* default props */ }
    },
    tabs: './custom/Tabs.tsx',  // Custom component path
  },
  global: {
    fontFamily: 'Inter, sans-serif',
    accentColor: '#3b82f6',
  }
}
```

**Resolution**:
1. Load theme from file (supports .js, .ts, .mjs, .cjs)
2. Merge with default theme
3. Resolve component mappings
4. Apply to rendered output

## Data Flow

```
ComponentMetadata (from @tapestrylab/extract)
    ↓
EnrichedComponentData (+ @tapestrylab/resolve data)
    ↓
Template ({{name}}, {{props}}, {{usageSites}})
    ↓
Theme (component mappings + styles)
    ↓
Renderer (markdown/mdx/html)
    ↓
Output (docs/*.md or docs/*.mdx)
```

## Testing

**Test Structure**:
- Colocated test files (`.test.ts`, `.test.tsx`)
- Vitest for all tests
- Unit tests for each module
- Integration tests for full pipeline

**Running Tests**:
```bash
pnpm test                    # Watch mode
pnpm test:ci                 # CI mode
pnpm test:ui                 # Interactive UI
pnpm test:coverage           # Coverage report
```

**Key Test Files**:
- `src/interpolate.test.ts` - Variable interpolation tests
- More tests to be added for other modules

## Build Configuration

**Build Tool**: tsdown

```typescript
// tsdown.config.ts
export default defineConfig({
  entry: ['src/index.ts', 'src/components/index.tsx'],
  format: ['esm'],
  dts: true,
});
```

**Output**:
- `dist/index.js` - Main bundle
- `dist/index.d.ts` - Type declarations
- `dist/components/index.js` - Component bundle
- `dist/components/index.d.ts` - Component types

## Dependencies

**Production**:
- `@tapestrylab/extract` (workspace:*) - Component metadata extraction
- `@tapestrylab/resolve` (workspace:*) - Relationship resolution
- `zod` (^4.1.12) - Schema validation

**Peer** (optional):
- `react` (>=18.0.0) - For MDX components

**Dev**:
- `@types/react` (^19.2.2)
- Inherited from monorepo: TypeScript, Vitest, tsdown

## Common Development Tasks

### Adding a New Block Type

1. **Add type to types.ts**:
   ```typescript
   export interface MyBlock extends BaseBlock {
     type: 'myBlock';
     // ... block-specific properties
   }
   ```

2. **Add to Block union type**:
   ```typescript
   export type Block = ... | MyBlock;
   ```

3. **Add template builder method**:
   ```typescript
   addMyBlock(/* params */, options?): this {
     this.template.blocks.push({ type: 'myBlock', /* ... */ });
     return this;
   }
   ```

4. **Add markdown renderer**:
   ```typescript
   function renderMyBlock(block: MyBlock, context): string {
     // Render logic
   }
   ```

5. **Add to renderer switch statement**

6. **Update JSON Schema**

7. **Add tests**

### Adding a New Component

1. Create component file in `src/components/`
2. Export from `src/components/index.tsx`
3. Update `src/renderer-mdx.ts` to import component
4. Add to theme types if needed

### Testing the Full Pipeline

```typescript
import { generateAll } from '@tapestrylab/template';

await generateAll({
  source: './test-fixtures/components',
  outputDir: './test-output',
  template: './templates/component-docs.taptpl.json',
  outputFormat: 'mdx',
});
```

## Phase 1 Status

**Implemented** ✅:
- Core type system
- Variable interpolation
- Template builder API
- Template matcher
- Markdown renderer
- MDX renderer
- Extract wrapper
- Resolve wrapper (stub)
- Theme system
- Generator
- Built-in templates (3)
- Built-in themes (3)
- Default components (5)
- JSON Schema
- Documentation

**Not Implemented** (Future phases):
- HTML renderer
- Advanced relationship visualization
- CLI integration
- Migration tools
- Template marketplace

## Troubleshooting

**Variables not interpolating**:
- Check data path is correct: `{{name}}` not `{{component.name}}`
- ComponentMetadata is root context

**Conditionals not working**:
- Use correct syntax: `"props.length > 0"` not `props.length > 0`
- Check field exists in ComponentMetadata

**Theme not applying**:
- Ensure theme file exports default object
- Check component names match block types

**Build errors**:
- Run `pnpm build` from package directory
- Check TypeScript errors with `pnpm type-check`

## Integration with Monorepo

- Follows monorepo patterns (see root CLAUDE.md)
- Uses workspace dependencies (`workspace:*`)
- Changesets for versioning
- Turborepo for orchestration

## Related Documentation

- **README.md**: User-facing documentation
- **PLAN.md**: Full implementation plan
- **Root CLAUDE.md**: Monorepo structure and workflow

## Future Enhancements (Phase 2+)

- Complex block iteration
- Nested data-driven blocks
- HTML renderer
- Dependency graph visualization
- Smart template selection
- CLI tool
- TipTap migration path
