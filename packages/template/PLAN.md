# @tapestrylabs/templates - Final Implementation Plan

**Version:** 1.0
**Date:** 2025-01-25
**Status:** Ready for Implementation

---

## 📌 Key Design Principle

**All component data structures come directly from `@tapestrylab/extract`.**

The template package uses `ComponentMetadata` and `PropMetadata` types from the extract package as its data model. This ensures:
- Zero transformation between extract → template
- Single source of truth for component structure
- No type drift or synchronization issues
- Templates work seamlessly with extract output

**Templates receive `ComponentMetadata` as the root data context**, so all fields are accessible directly: `{{name}}`, `{{description}}`, `{{props}}`, etc.

---

## 🎯 Executive Summary

A template engine for generating structured component documentation with:

- **Full pipeline integration** with @tapestrylab/extract and @tapestrylab/resolve
- **Direct use of extract types** - ComponentMetadata is the data model
- **Automatic extraction** of component metadata (props, types, JSDoc)
- **Relationship resolution** (usage sites, dependencies, dependents)
- **Zero-config defaults** that look professional out of the box
- **Progressive enhancement** from simple JSON to full customization
- **Clear migration path** to visual editing (TipTap) later
- **Theming system** for complete design control

---

## 📐 Core Architecture

### Five-Part System

```
┌─────────────────────────────────────────────────────────┐
│  0. EXTRACT (@tapestrylab/extract)                      │
│  Parse source code → component metadata                 │
│  React/Vue/Svelte → JSON with props/types/JSDoc        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  0.5 RESOLVE (@tapestrylab/resolve)                     │
│  Resolve component relationships & dependencies         │
│  Find usage sites, trace imports, build component graph│
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  1. TEMPLATES (Structure)                               │
│  JSON files defining what content to generate           │
│  { "type": "tabs", "tabs": [...] }                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  2. THEMES (Styling)                                    │
│  Component mappings and styling configuration           │
│  { components: { tabs: './MyTabs.tsx' } }             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  3. RENDERERS (Output)                                  │
│  Convert structure + theme → markdown/mdx/html          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Integration with Extract & Resolve

### Type Definitions (Direct Import from Extract)

**The template package re-exports types from @tapestrylab/extract:**

```typescript
// In @tapestrylab/templates/src/types.ts

// Import types from extract package
import type {
  ComponentMetadata,
  PropMetadata,
  ExtractResult,
  ExtractConfig
} from '@tapestrylab/extract';

// Re-export for template users
export type {
  ComponentMetadata,
  PropMetadata,
  ExtractResult,
  ExtractConfig
} from '@tapestrylab/extract';

// Extend with resolve data (optional enrichment)
export interface EnrichedComponentData extends ComponentMetadata {
  usageSites?: UsageSite[];
  dependencies?: Dependency[];
  dependents?: Dependent[];
}

// Template receives ComponentMetadata as root context
export type TemplateDataContext = ComponentMetadata | EnrichedComponentData;
```

**This ensures:**
- ✅ No type drift between extract output and template input
- ✅ Single source of truth for component metadata structure
- ✅ Automatic updates when extract types evolve
- ✅ Zero transformation needed between extract → template

### @tapestrylab/extract

**Purpose:** Parse source code to extract component metadata

**What it provides (ComponentMetadata):**
- `name: string` - Component name
- `filePath: string` - Absolute file path
- `exportType: "default" | "named"` - Export type
- `props: PropMetadata[]` - Component props
- `description?: string` - JSDoc description
- `deprecated?: string | boolean` - Deprecation status
- `returns?: string` - Return value description
- `links?: string[]` - @see references
- `since?: string` - Version introduced
- `examples?: string[]` - @example code blocks
- `extends?: string[]` - Type extensions

**Usage in templates:**
```typescript
import { extract } from '@tapestrylab/extract';
import type { ComponentMetadata } from '@tapestrylab/extract';

const result = await extract({
  root: './src/components',
  include: ['**/*.tsx'],
});

// result.metadata is ComponentMetadata[]
// Each item can be passed directly to templates
const componentData: ComponentMetadata = result.metadata[0];

// Templates access fields directly:
// {{name}}, {{description}}, {{props}}, etc.
```

### @tapestrylab/resolve

**Purpose:** Resolve component relationships and dependencies

**What it provides:**
- Usage sites (where component is imported/used)
- Dependencies (what the component imports)
- Dependents (what imports this component)
- Import paths and relationships
- Component graph data

**Usage in templates:**
```typescript
import { resolve } from '@tapestrylab/resolve';

const relationships = await resolve({
  component: './src/components/Button.tsx',
  source: './src',
});

// Returns relationship data accessible in templates:
// {{component.usageSites}}, {{component.dependencies}}, etc.
```

### Combined Pipeline

```typescript
import { extractAndResolve } from '@tapestrylabs/templates';

// One function that does both
const enrichedData = await extractAndResolve({
  source: './src/components/Button.tsx',
  projectRoot: './src',
});

// Returns merged data from both packages
// All fields available to template variables
```

### Template Access to Extract/Resolve Data

**Templates receive ComponentMetadata directly (no "component." prefix needed):**

```json
{
  "blocks": [
    // From @tapestrylab/extract (ComponentMetadata)
    { "type": "heading", "text": "{{name}}" },
    { "type": "paragraph", "text": "{{description}}", "if": "description" },
    { "type": "propsTable", "dataSource": "props" },
    { "type": "callout", "variant": "warning", "text": "{{deprecated}}", "if": "deprecated" },
    { "type": "codeBlocks", "dataSource": "examples", "language": "tsx" },
    { "type": "linkList", "dataSource": "links", "if": "links.length > 0" },

    // From @tapestrylab/resolve (EnrichedComponentData)
    { "type": "usageSites", "dataSource": "usageSites" },
    { "type": "dependencyList", "dataSource": "dependencies" },
    { "type": "dependents", "dataSource": "dependents" }
  ]
}
```

**Why no prefix?** The template receives the ComponentMetadata object as its root data context, so all fields are accessible directly.

---

## 📄 1. Template System

### Format: Simplified JSON (MVP)

**Why JSON?**

- ✅ Hand-writable and code-editable
- ✅ Programmatically modifiable
- ✅ Git-friendly and reviewable
- ✅ Type-safe with schema validation
- ✅ Migrates to TipTap automatically later

### Template Structure

**Uses ComponentMetadata fields from @tapestrylab/extract:**

```json
{
  "name": "Component Documentation",
  "version": "1.0.0",
  "outputFormat": "markdown",
  "blocks": [
    {
      "type": "heading",
      "level": 1,
      "text": "{{name}}"
    },
    {
      "type": "paragraph",
      "text": "{{description}}",
      "if": "description"
    },
    {
      "type": "callout",
      "variant": "warning",
      "text": "⚠️ Deprecated: {{deprecated}}",
      "if": "deprecated"
    },
    {
      "type": "paragraph",
      "text": "Since version: {{since}}",
      "if": "since"
    },
    {
      "type": "propsTable",
      "dataSource": "props",
      "if": "props.length > 0"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Examples",
      "if": "examples.length > 0"
    },
    {
      "type": "codeBlocks",
      "dataSource": "examples",
      "language": "tsx"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "See Also",
      "if": "links.length > 0"
    },
    {
      "type": "linkList",
      "dataSource": "links"
    }
  ]
}
```

### Block Types

**Text Blocks:**

- `heading` - H1-H6 headings
- `paragraph` - Text content
- `divider` - Horizontal rule

**Code Blocks:**

- `code` - Syntax-highlighted code
- `codeBlock` - Multi-line code with language

**Data Blocks:**

- `propsTable` - Component props table
- `examplesBlock` - Code examples
- `apiReference` - API documentation

**Interactive Blocks:**

- `tabs` - Tabbed content
- `accordion` - Collapsible sections
- `callout` - Info/warning/error boxes
- `componentPreview` - Live component preview

**Relationship Blocks (from @tapestrylab/resolve):**

- `usageSites` - Display where component is used (file, line, context)
- `dependencyList` - Show component dependencies
- `dependencyGraph` - Visual dependency graph
- `dependents` - Show components that depend on this one
- `relatedComponents` - Components in same module/category

### Variables

Use Handlebars-style syntax (implemented with simple string interpolation, NOT the Handlebars library):

**ComponentMetadata fields (from @tapestrylab/extract):**
```
{{name}}              // Component name
{{description}}       // Component description
{{filePath}}          // Absolute file path
{{exportType}}        // "default" or "named"
{{deprecated}}        // Deprecation message or boolean
{{since}}             // Version when introduced
{{returns}}           // Return value description
```

**Nested access:**
```
{{props[0].name}}           // First prop name
{{props[0].type}}           // First prop type
{{props[0].required}}       // Is first prop required
{{props[0].defaultValue}}   // First prop default value
```

**From @tapestrylab/resolve (enriched data):**
```
{{usageSites.length}}       // Number of usage sites
{{dependencies[0].name}}    // First dependency name
{{dependents.length}}       // Number of dependents
```

**Note:** We use the familiar `{{...}}` syntax but implement it ourselves with ~50 lines of code using regex and JSONPath. Zero dependencies required.

### Conditionals

**Using ComponentMetadata fields:**

```json
{
  "type": "callout",
  "variant": "warning",
  "text": "⚠️ Deprecated: {{deprecated}}",
  "if": "deprecated"
}
```

```json
{
  "type": "propsTable",
  "dataSource": "props",
  "if": "props.length > 0"
}
```

```json
{
  "type": "linkList",
  "dataSource": "links",
  "if": "links.length > 0"
}
```

**Supports:**

- `props.length > 0` - Has props
- `description` - Has description (exists)
- `deprecated` - Is deprecated
- `examples.length > 0` - Has examples
- `usageSites.length > 0` - Has usage sites (from resolve)
- Any JSONPath expression

### Data-Driven Blocks

**Iterate over ComponentMetadata arrays:**

```json
{
  "type": "codeBlocks",
  "dataSource": "examples",
  "language": "tsx"
}
```

```json
{
  "type": "propsTable",
  "dataSource": "props",
  "columns": [
    { "field": "name", "header": "Prop" },
    { "field": "type", "header": "Type" },
    { "field": "required", "header": "Required" },
    { "field": "defaultValue", "header": "Default" },
    { "field": "description", "header": "Description" }
  ]
}
```

**From @tapestrylab/resolve:**

```json
{
  "type": "usageSites",
  "dataSource": "usageSites"
}
```

Creates one item per element in the array using the ComponentMetadata structure.

---

## 🛠️ 2. Builder API

### Three Ways to Modify Templates

#### Option 1: Hand-Write JSON

```json
// templates/my-template.taptpl.json
{
  "name": "My Template",
  "blocks": [{ "type": "heading", "level": 1, "text": "{{component.name}}" }]
}
```

#### Option 2: Builder API

```typescript
import { TemplateBuilder } from "@tapestrylabs/templates"

const template = await TemplateBuilder.load("./templates/default.json")

template
  .addHeading(2, "Custom Section")
  .addParagraph("{{description}}")
  .addPropsTable("props")
  .addCallout("warning", "{{deprecated}}", { if: "deprecated" })
  .updateBlock("examples-tabs", { defaultTab: "advanced" })
  .removeBlock("deprecated-section")

await template.save("./templates/custom.json")
```

#### Option 3: Script Generation

```typescript
import { createTemplate } from "@tapestrylabs/templates"

const template = createTemplate("React Component")
  .setMetadata({ outputFormat: "mdx" })
  .addHeading(1, "{{name}}")
  .addParagraph("{{description}}", { if: "description" })
  .addPropsTable("props")
  .addCodeBlocks("examples", { language: "tsx", if: "examples.length > 0" })
  .addLinkList("links", { if: "links.length > 0" })

await template.save("./templates/react.json")
```

### Builder API Methods

```typescript
class TemplateBuilder {
  // Metadata
  setMetadata(metadata: Partial<TemplateMetadata>): this;

  // Content blocks
  addHeading(level: 1-6, text: string, options?): this;
  addParagraph(text: string, options?): this;
  addCode(code: string, language?: string, options?): this;
  addDivider(options?): this;

  // Data blocks
  addPropsTable(dataSource: string, options?): this;
  addTabs(dataSource: string, tabTemplate, options?): this;
  addAccordion(dataSource: string, itemTemplate, options?): this;
  addCallout(variant: string, text: string, options?): this;

  // Block manipulation
  findBlock(id: string): Block | undefined;
  updateBlock(id: string, updates: Partial<Block>): this;
  removeBlock(id: string): this;
  insertBlock(index: number, block: Block): this;
  moveBlock(fromIndex: number, toIndex: number): this;

  // Utility
  getBlocks(): Block[];
  clone(): TemplateBuilder;
  toJSON(): Template;

  // I/O
  static load(filePath: string): Promise<TemplateBuilder>;
  save(filePath: string): Promise<void>;
}
```

---

## 🎨 3. Theming System

### Co-located Configuration

**Key Decision:** Component definitions include their styling (not separate).

```javascript
// tapestry.theme.js
export default {
  components: {
    // Option 1: String shorthand
    tabs: "./components/Tabs.tsx",

    // Option 2: Styles only (use default component)
    accordion: {
      styles: {
        container: "border rounded-lg",
        header: "font-bold p-4",
      },
    },

    // Option 3: Custom component + props
    code: {
      component: "./components/CodeBlock.tsx",
      props: {
        theme: "dracula",
        showLineNumbers: true,
      },
    },

    // Option 4: From package
    propsTable: "@acme/design-system/Table",

    // Option 5: Your actual component
    button: "./src/components/Button.tsx",
  },

  global: {
    fontFamily: "Inter, sans-serif",
    accentColor: "#3b82f6",
    borderRadius: "8px",
  },
}
```

### Component Resolution

```
1. Check theme.components[blockType]
   ↓
2. If defined:
   - String → Import component
   - Object with component → Import, pass props
   - Object with styles → Use default, apply styles
   ↓
3. If not defined → Use built-in default
```

### Styling Methods Supported

**Tailwind CSS:**

```javascript
tabs: {
  styles: {
    container: 'border border-gray-200 rounded-lg',
    tab: 'px-4 py-2 hover:bg-gray-100'
  }
}
```

**CSS Modules:**

```javascript
import styles from "./theme.module.css"

tabs: {
  styles: {
    container: styles.tabs
  }
}
```

**Design Tokens:**

```javascript
import { tokens } from "@acme/design-tokens"

global: {
  accentColor: tokens.color.primary[500]
}
```

---

## 🔄 4. Migration Path to TipTap

### Current: MVP JSON

```json
{
  "type": "heading",
  "level": 1,
  "text": "{{component.name}}"
}
```

### Future: TipTap JSON

```json
{
  "type": "heading",
  "attrs": { "level": 1 },
  "content": [{ "type": "variable", "attrs": { "path": "component.name" } }]
}
```

### Automatic Migration

```bash
npx tapestry migrate-templates
```

**Converts:**

- Flat properties → `attrs` object
- `blocks`/`tabs`/`items` → `content` array
- Text strings → text nodes
- `{{variables}}` → variable nodes
- `if` conditions → conditional wrapper nodes

**Result:** No manual work needed to upgrade!

---

## 📦 5. Package Structure

```
@tapestrylabs/templates/
│
├── package.json
│   └── dependencies:
│       ├── @tapestrylab/extract      # Component metadata extraction
│       └── @tapestrylab/resolve      # Component relationship resolution
│
├── src/
│   ├── types.ts                  # Core type definitions
│   ├── types-theme.ts            # Theme system types
│   ├── template-builder.ts       # Builder API
│   ├── theme-resolver.ts         # Theme loading/merging
│   ├── interpolate.ts            # Variable interpolation (~50 lines)
│   ├── renderer-mdx.ts           # MDX output renderer
│   ├── renderer-markdown.ts      # Markdown output renderer
│   ├── renderer-html.ts          # HTML output renderer
│   ├── matcher.ts                # Component → Template matching
│   ├── generator.ts              # Main generation orchestrator
│   ├── extract-wrapper.ts        # Wrapper around @tapestrylab/extract
│   ├── resolve-wrapper.ts        # Wrapper around @tapestrylab/resolve
│   └── index.ts                  # Public API exports
│
├── components/                   # Default components
│   ├── Tabs.tsx
│   ├── Accordion.tsx
│   ├── PropsTable.tsx
│   ├── CodeBlock.tsx
│   ├── Callout.tsx
│   └── ComponentPreview.tsx
│
├── templates/                    # Built-in templates
│   ├── component-docs.taptpl.json
│   ├── api-reference.taptpl.json
│   └── minimal.taptpl.json
│
├── themes/                       # Preset themes
│   ├── default.theme.js
│   ├── minimal.theme.js
│   └── documentation.theme.js
│
├── schema/
│   └── template.schema.json      # JSON Schema validation
│
├── examples/                     # Usage examples
│   ├── usage.ts
│   ├── modify-templates.ts
│   └── builder-api-complex.ts
│
└── docs/                         # Documentation
    ├── README.md
    ├── THEMING-FINAL.md
    ├── COMPLEX-COMPONENTS-GUIDE.md
    └── MVP-VS-TIPTAP-COMPARISON.md
```

---

## 🚀 6. User Configuration

### tapestry.config.js

```javascript
export default {
  // Source directories
  source: "./src/components",

  // Output directory
  output: "./docs",

  // Templates
  templatesDir: "./templates",
  defaultTemplate: "component-docs",
  templates: [
    {
      pattern: "**/Button.tsx",
      template: "detailed-component.taptpl.json",
    },
    {
      pattern: "**/utils/**",
      template: "api-reference.taptpl.json",
    },
  ],

  // Theme
  theme: "./tapestry.theme.js",
  outputFormat: "mdx", // or 'markdown', 'html'

  // Project metadata
  project: {
    name: "@acme/components",
    version: "1.0.0",
    repository: "github.com/acme/components",
  },
}
```

### tapestry.theme.js

```javascript
export default {
  components: {
    tabs: "./docs-components/Tabs.tsx",
    accordion: {
      styles: {
        container: "border rounded-lg",
        header: "bg-gray-100 px-4 py-2",
      },
    },
    code: {
      component: "@acme/design-system/CodeBlock",
      props: { theme: "nord" },
    },
  },

  global: {
    fontFamily: "Inter, sans-serif",
    accentColor: "#3b82f6",
  },
}
```

---

## 🔧 7. Variable Interpolation

### No External Dependencies

We use `{{variable}}` syntax but **implement it ourselves** - no Handlebars library needed.

### Simple Implementation

```typescript
// Variable interpolation (~10 lines)
const VAR_REGEX = /\{\{([^}]+)\}\}/g

function interpolate(text: string, data: any): string {
  return text.replace(VAR_REGEX, (_, path) => {
    return getByPath(data, path.trim()) ?? ""
  })
}

// JSONPath getter (~5 lines)
function getByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => {
    // Handle array access: props[0].name
    const match = key.match(/^(\w+)\[(\d+)\]$/)
    if (match) {
      return acc?.[match[1]]?.[parseInt(match[2])]
    }
    return acc?.[key]
  }, obj)
}
```

### Examples

**Using ComponentMetadata from @tapestrylab/extract:**

```typescript
// Simple access (ComponentMetadata fields)
interpolate("{{name}}", componentData)
// → "Button"

interpolate("{{description}}", componentData)
// → "A customizable button component"

interpolate("{{exportType}}", componentData)
// → "named"

// Nested access
interpolate("{{props.length}}", componentData)
// → "5"

interpolate("Props: {{props.length}}", componentData)
// → "Props: 5"

// Array access (PropMetadata fields)
interpolate("{{props[0].name}}", componentData)
// → "variant"

interpolate("{{props[0].type}}", componentData)
// → "\"primary\" | \"secondary\" | \"danger\""

interpolate("{{props[0].defaultValue}}", componentData)
// → "\"primary\""

// Boolean fields
interpolate("Required: {{props[0].required}}", componentData)
// → "Required: false"

// JSDoc fields
interpolate("Since: {{since}}", componentData)
// → "Since: 1.0.0"

interpolate("{{examples[0]}}", componentData)
// → "<Button variant=\"primary\">Click me</Button>"

// Conditional existence
interpolate("{{deprecated}}", componentData)
// → "Use NewButton instead" (or "" if not deprecated)
```

### Why This Approach?

**✅ Zero dependencies** - No npm packages needed  
**✅ Familiar syntax** - Everyone knows `{{...}}`  
**✅ Simple to implement** - ~50 lines total  
**✅ Fast** - Just regex + object traversal  
**✅ Maintainable** - Easy to understand and debug

---

## 💾 8. Data Flow

### Step 0: Extract Component Metadata

```typescript
import { extract } from '@tapestrylab/extract';

// Extract metadata from source code
const metadata = await extract({
  source: './src/components/Button.tsx',
  plugins: ['react'], // React component extractor
});
```

### Step 0.5: Resolve Component Relationships (Optional)

```typescript
import { resolve } from '@tapestrylab/resolve';

// Find where Button is used and its dependencies
const relationships = await resolve({
  component: './src/components/Button.tsx',
  source: './src',
});

// Enrich metadata with relationship data
const enrichedData = {
  ...metadata,
  usageSites: relationships.usageSites,
  dependencies: relationships.dependencies,
};
```

### Input: Component Data (from @tapestrylab/extract)

**Type Definition (from `@tapestrylab/extract`):**

```typescript
import type { ComponentMetadata, PropMetadata } from '@tapestrylab/extract';

// Template package uses extract's types directly
export type { ComponentMetadata, PropMetadata } from '@tapestrylab/extract';

// Extended with resolve data
interface EnrichedComponentData extends ComponentMetadata {
  // From @tapestrylab/resolve (optional)
  usageSites?: UsageSite[];
  dependencies?: Dependency[];
  dependents?: Dependent[];
}
```

**Actual Extract Output Structure:**

```typescript
interface ComponentMetadata {
  type: "component";
  name: string;                      // Component name
  filePath: string;                  // Absolute file path
  exportType: "default" | "named";   // Export type
  props: PropMetadata[];             // Component props

  // JSDoc fields (optional)
  description?: string;              // @description or leading comment
  deprecated?: string | boolean;     // @deprecated tag
  returns?: string;                  // @returns description
  links?: string[];                  // @see references
  since?: string;                    // @since version
  examples?: string[];               // @example code blocks
  extends?: string[];                // Type extensions (e.g., "HTMLAttributes<HTMLButtonElement>")
}

interface PropMetadata {
  name: string;           // Prop name
  type: string;           // TypeScript type (serialized)
  required: boolean;      // Whether prop is required
  defaultValue?: string;  // Default value (serialized)
  description?: string;   // @param description from JSDoc
  examples?: string[];    // Generated from type + JSDoc
}
```

**Example JSON Output:**

```json
{
  "type": "component",
  "name": "Button",
  "filePath": "/absolute/path/to/src/components/Button.tsx",
  "exportType": "named",
  "description": "A customizable button component",
  "deprecated": false,
  "since": "1.0.0",
  "links": ["https://design.acme.com/button"],
  "examples": [
    "<Button variant=\"primary\">Click me</Button>",
    "<Button variant=\"danger\" disabled>Disabled</Button>"
  ],
  "props": [
    {
      "name": "variant",
      "type": "\"primary\" | \"secondary\" | \"danger\"",
      "required": false,
      "defaultValue": "\"primary\"",
      "description": "Button style variant"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "required": false,
      "description": "Whether the button is disabled"
    }
  ],
  "extends": ["ButtonHTMLAttributes<HTMLButtonElement>"]
}
```

**With @tapestrylab/resolve Data (Enriched):**

```json
{
  "type": "component",
  "name": "Button",
  "filePath": "/absolute/path/to/src/components/Button.tsx",
  "exportType": "named",
  "description": "A customizable button component",
  "props": [...],

  "_comment": "Fields below added by @tapestrylab/resolve",
  "usageSites": [
    {
      "file": "src/pages/HomePage.tsx",
      "line": 42,
      "column": 15,
      "context": "<Button variant=\"primary\">Get Started</Button>"
    }
  ],
  "dependencies": [
    {
      "name": "clsx",
      "version": "^2.0.0",
      "type": "npm"
    }
  ],
  "dependents": [
    {
      "name": "ActionBar",
      "filePath": "src/components/ActionBar.tsx"
    }
  ]
}
```

### Process

```
0. Extract metadata (@tapestrylab/extract)
   ↓
0.5 Resolve relationships (@tapestrylab/resolve)
   ↓
1. Match component to template
   ↓
2. Load template + theme
   ↓
3. Resolve variables ({{component.name}})
   ↓
4. Evaluate conditionals (if: "...")
   ↓
5. Apply theme (components + styles)
   ↓
6. Render to output format
```

### Output: Generated Documentation

**MDX:**

````mdx
---
title: Button
---

import { Tabs, Tab } from "@/components/Tabs"
import { PropsTable } from "@/components/PropsTable"

# Button

A clickable button component.

## Props

<PropsTable
  data={[
    { name: "variant", type: "primary | secondary", required: false, defaultValue: "primary" },
  ]}
/>

## Examples

<Tabs>
  <Tab label="Basic Usage">
    ```tsx
    <Button>Click me</Button>
    ```
  </Tab>
</Tabs>
````

**Markdown:**

````markdown
# Button

A clickable button component.

## Props

| Prop    | Type                 | Required | Default |
| ------- | -------------------- | -------- | ------- |
| variant | primary \| secondary | No       | primary |

## Examples

### Basic Usage

```tsx
<Button>Click me</Button>
```
````

````

---

## 🎯 9. Implementation Phases

### Phase 1: Core System (MVP) ✅ COMPLETE

**Week 1-2:**
- [x] Type definitions (types.ts, types-theme.ts)
- [x] Template builder API
- [x] Template matcher (component → template)
- [x] Basic renderer (Markdown output)
- [x] Extract wrapper (@tapestrylab/extract integration)

**Week 3-4:**
- [x] Default component library
- [x] MDX renderer with theme support
- [x] Theme resolver/loader
- [x] Built-in templates (3-5 variants)
- [x] Resolve wrapper (@tapestrylab/resolve integration)
- [x] Combined extract + resolve pipeline

**Deliverable:** ✅ Working system that generates docs from components with relationship data

### Phase 2: Advanced Features

**Week 5-6:**
- [ ] Complex blocks (tabs, accordions, nested)
- [ ] Data-driven blocks (iteration)
- [ ] Conditional rendering
- [ ] Variable interpolation with mixed content
- [ ] Relationship blocks (usageSites, dependencyList, etc.)

**Week 7-8:**
- [ ] Preset themes (minimal, documentation, marketing)
- [ ] Theme validation
- [ ] HTML renderer
- [ ] Dependency graph visualization
- [ ] Smart template selection based on component metadata

**Deliverable:** Full-featured template + theme system with rich relationship data

### Phase 3: Polish & Tooling

**Week 9-10:**
- [ ] CLI integration with Tapestry
- [ ] Template validator
- [ ] Documentation site
- [ ] Example repository

**Week 11-12:**
- [ ] Performance optimization
- [ ] Error handling/messages
- [ ] Testing suite
- [ ] Migration tools

**Deliverable:** Production-ready package

### Phase 4: TipTap Integration (Future)

**Week 13+:**
- [ ] TipTap custom nodes
- [ ] Migration script (JSON → TipTap)
- [ ] Visual template editor
- [ ] Template marketplace

**Deliverable:** Visual editing experience

---

## 📊 10. Success Metrics

### Developer Experience
- ✅ Zero config generates professional docs
- ✅ 5 minutes to customize with CSS
- ✅ 30 minutes to create custom template
- ✅ 1 hour to build custom theme

### Technical
- ✅ <100ms template rendering per component
- ✅ <10KB additional bundle size per theme
- ✅ 100% type coverage
- ✅ >90% test coverage

### Adoption
- ✅ Works with React, Vue, Svelte, vanilla JS
- ✅ Integrates with Storybook, Docusaurus, Nextra
- ✅ Supports Tailwind, CSS Modules, CSS-in-JS
- ✅ Migration path to visual editing

---

## 🔧 11. API Surface

### Core Exports

```typescript
// Template Builder
export { TemplateBuilder, createTemplate } from './template-builder';

// Types
export type {
  Template,
  Block,
  TemplateMetadata,
  ComponentData
} from './types';

export type {
  TapestryTheme,
  ComponentMapping,
  StyleConfig
} from './types-theme';

// Renderer
export { render, renderToFile } from './renderer';

// Matcher
export { matchTemplate, matchTemplates } from './matcher';

// Generator
export { generate, generateAll } from './generator';

// Theme
export { loadTheme, resolveTheme } from './theme-resolver';

// Extract & Resolve Integration
export {
  extractComponents,      // Wrapper around @tapestrylab/extract
  resolveRelationships,   // Wrapper around @tapestrylab/resolve
  extractAndResolve,      // Combined extract + resolve
} from './extract-wrapper';

// Re-export for convenience
export type { ExtractResult } from '@tapestrylab/extract';
export type { ResolveResult } from '@tapestrylab/resolve';
```

### High-Level API

```typescript
import { generateAll } from '@tapestrylabs/templates';

// One-line generation (handles extract, resolve, template, render)
await generateAll({
  source: './src/components',
  output: './docs',
  template: './templates/component-docs.json', // optional
  theme: './tapestry.theme.js', // optional
  includeRelationships: true, // runs @tapestrylab/resolve
});
```

### Granular API

```typescript
import {
  extractComponents,
  resolveRelationships,
  generate
} from '@tapestrylabs/templates';

// Step-by-step control
const components = await extractComponents('./src/components');
const relationships = await resolveRelationships(components);

for (const component of components) {
  await generate({
    data: {
      ...component,
      ...relationships[component.filePath],
    },
    output: `./docs/${component.name}.mdx`,
  });
}
````

### CLI Integration

```bash
# Generate docs
tapestry generate

# With options
tapestry generate --templates ./templates --theme ./theme.js --output ./docs

# Validate template
tapestry validate-template ./templates/my-template.json

# Migrate to TipTap (future)
tapestry migrate-templates
```

---

## 🎨 12. Example Workflows

### Workflow 1: Quick Start (Zero Config)

```bash
npm install @tapestrylabs/templates
tapestry generate
```

**Result:** Professional docs using built-in template and theme.

### Workflow 2: Custom Styling

```javascript
// tapestry.theme.js
export default {
  components: {
    tabs: {
      styles: {
        container: "border-2 border-blue-500 rounded-xl",
      },
    },
  },
}
```

```bash
tapestry generate --theme ./tapestry.theme.js
```

**Result:** Branded docs with custom CSS.

### Workflow 3: Custom Template

```bash
# Copy and modify built-in template
cp node_modules/@tapestrylabs/templates/templates/component-docs.taptpl.json \
   ./templates/my-template.json

# Edit template
vim ./templates/my-template.json

# Generate
tapestry generate --template ./templates/my-template.json
```

**Result:** Docs with custom structure.

### Workflow 4: Design System Integration

```javascript
// tapestry.theme.js
export default {
  components: {
    tabs: "@acme/design-system/Tabs",
    accordion: "@acme/design-system/Accordion",
    button: "./src/components/Button.tsx",
  },
}
```

```bash
tapestry generate --theme ./tapestry.theme.js --output-format mdx
```

**Result:** Docs using design system components.

### Workflow 5: Programmatic Generation

```typescript
// scripts/generate-docs.ts
import { TemplateBuilder, generate } from "@tapestrylabs/templates"

// Create custom template
const template = createTemplate("Custom Docs")
  .addHeading(1, "{{component.name}}")
  .addPropsTable("component.props")

await template.save("./templates/custom.json")

// Generate docs (extract + template + render)
await generate({
  source: "./src/components",
  output: "./docs",
  template: "./templates/custom.json",
  // Extract is called automatically under the hood
})
```

```bash
tsx scripts/generate-docs.ts
```

**Result:** Fully automated doc generation.

### Workflow 6: Full Pipeline with Extract and Resolve

```typescript
// scripts/full-pipeline.ts
import { extract } from "@tapestrylab/extract"
import { resolve } from "@tapestrylab/resolve"
import { generate } from "@tapestrylabs/templates"

// Step 1: Extract all components
const components = await extract({
  source: "./src/components/**/*.tsx",
  plugins: ["react"],
})

// Step 2: Resolve relationships for each component
const enrichedComponents = await Promise.all(
  components.map(async (component) => {
    const relationships = await resolve({
      component: component.filePath,
      source: "./src",
    })

    return {
      ...component,
      usageSites: relationships.usageSites,
      dependencies: relationships.dependencies,
      dependents: relationships.dependents,
    }
  })
)

// Step 3: Generate docs with enriched data
for (const component of enrichedComponents) {
  await generate({
    data: component, // Pass pre-extracted data directly
    output: `./docs/${component.name}.mdx`,
    template: "./templates/component-docs.json",
    theme: "./tapestry.theme.js",
  })
}
```

```bash
tsx scripts/full-pipeline.ts
```

**Result:** Complete documentation with usage sites and dependency graphs.

### Workflow 7: Custom Template with Usage Sites

```json
// templates/detailed-component.taptpl.json
{
  "name": "Detailed Component Docs",
  "blocks": [
    // ComponentMetadata fields from @tapestrylab/extract
    { "type": "heading", "level": 1, "text": "{{name}}" },
    { "type": "paragraph", "text": "{{description}}", "if": "description" },

    // JSDoc metadata
    {
      "type": "callout",
      "variant": "warning",
      "text": "⚠️ Deprecated: {{deprecated}}",
      "if": "deprecated"
    },
    {
      "type": "paragraph",
      "text": "Available since: {{since}}",
      "if": "since"
    },

    // Props from ComponentMetadata
    {
      "type": "heading",
      "level": 2,
      "text": "Props"
    },
    { "type": "propsTable", "dataSource": "props" },

    // Examples from ComponentMetadata
    {
      "type": "heading",
      "level": 2,
      "text": "Examples",
      "if": "examples.length > 0"
    },
    {
      "type": "codeBlocks",
      "dataSource": "examples",
      "language": "tsx",
      "if": "examples.length > 0"
    },

    // Usage sites from @tapestrylab/resolve
    {
      "type": "heading",
      "level": 2,
      "text": "Real-World Usage",
      "if": "usageSites.length > 0"
    },
    {
      "type": "usageSites",
      "dataSource": "usageSites",
      "if": "usageSites.length > 0"
    },

    // Dependencies from @tapestrylab/resolve
    {
      "type": "heading",
      "level": 2,
      "text": "Dependencies",
      "if": "dependencies.length > 0"
    },
    {
      "type": "dependencyList",
      "dataSource": "dependencies",
      "if": "dependencies.length > 0"
    },

    // Dependents from @tapestrylab/resolve
    {
      "type": "heading",
      "level": 2,
      "text": "Used By",
      "if": "dependents.length > 0"
    },
    {
      "type": "dependents",
      "dataSource": "dependents",
      "if": "dependents.length > 0"
    },

    // See also links from ComponentMetadata
    {
      "type": "heading",
      "level": 2,
      "text": "See Also",
      "if": "links.length > 0"
    },
    {
      "type": "linkList",
      "dataSource": "links",
      "if": "links.length > 0"
    }
  ]
}
```

**Result:** Rich documentation with ComponentMetadata fields, JSDoc data, and relationship information.

---

## ✅ 13. Decision Log

### Key Decisions Made

1. **Use @tapestrylab/extract Types Directly**
   - Reason: Single source of truth, no type drift, perfect alignment
   - Implementation: Re-export `ComponentMetadata` and `PropMetadata` from extract
   - Benefit: Templates work seamlessly with extract output, no transformation needed
   - Alternative rejected: Custom ComponentData type (would cause sync issues)

2. **Template Format: Simplified JSON**
   - Reason: Hand-writable, code-editable, migrates to TipTap
   - Alternative rejected: Handlebars (not structured enough)

3. **Variable Syntax: {{...}} (Self-Implemented)**
   - Reason: Familiar syntax, zero dependencies, easy to implement
   - Alternative rejected: Using Handlebars library (unnecessary dependency)

4. **ComponentMetadata as Root Context**
   - Reason: Templates access fields directly ({{name}} not {{component.name}})
   - Benefit: Simpler syntax, less typing, cleaner templates
   - Alternative rejected: Wrapping in a container object

5. **Co-located Component Config**
   - Reason: More intuitive, less duplication
   - Alternative rejected: Separate components/styles sections

6. **No Render Methods**
   - Reason: Keep it simple, maintainable, serializable
   - Alternative rejected: Allow inline render functions

7. **Three Output Formats**
   - MDX: Full features, React components
   - Markdown: Universal compatibility
   - HTML: Standalone, no framework

8. **Progressive Enhancement**
   - Start: Zero config defaults
   - Middle: CSS customization
   - Advanced: Custom components
   - Expert: Component extraction + resolution

---

## 🚦 14. Success Criteria

### Must Have (MVP)

- ✅ Generate docs from component data
- ✅ Built-in templates work out of the box
- ✅ Users can override with custom templates
- ✅ Markdown output works
- ✅ Basic theming (CSS classes)

### Should Have (V1)

- ✅ MDX output with React components
- ✅ Tabs, accordions, complex blocks
- ✅ Data-driven blocks (iteration)
- ✅ Theme system (component mapping)
- ✅ Builder API for modification

### Nice to Have (V2)

- ✅ Component extraction
- ✅ Interactive previews
- ✅ Preset themes
- ✅ Visual validation

### Future (V3)

- ✅ TipTap integration
- ✅ Visual template editor
- ✅ Template marketplace

---

## 📝 15. Open Questions

1. **Should themes support dark mode variants?**
   - Lean: Yes, add `darkMode: { ... }` section

2. **How to handle responsive styling?**
   - Lean: Leave to component/CSS, don't build into system

3. **Theme versioning strategy?**
   - Lean: Semver, themes version independently

4. **Template validation: strict or loose?**
   - Lean: Strict schema, good error messages

5. **Component auto-discovery vs explicit mapping?**
   - MVP: Explicit mapping
   - Future: Auto-discovery option

---

## 🎯 Summary

**@tapestrylabs/templates** provides:

1. **Extract Integration** - Uses @tapestrylab/extract types as data model
2. **Resolve Integration** - Uses @tapestrylab/resolve for relationships
3. **Templates** - Structured JSON format for doc generation
4. **Builder API** - Programmatic template modification
5. **Themes** - Component mapping + styling system
6. **Renderers** - MDX, Markdown, HTML output

**Key innovations:**

- ✅ **Direct use of ComponentMetadata** - No custom data types, no transformation
- ✅ Full pipeline integration (extract → resolve → template → render)
- ✅ Zero config works beautifully
- ✅ Minimal dependencies (leverages existing Tapestry packages)
- ✅ Progressive enhancement (simple → advanced)
- ✅ Rich relationship data (usage sites, dependencies, dependents)
- ✅ Clear TipTap migration path
- ✅ Use actual components in docs

**Data Flow:**
```
ComponentMetadata (from extract)
    ↓
EnrichedComponentData (+ resolve data)
    ↓
Template ({{name}}, {{props}}, {{usageSites}})
    ↓
Output (MDX/Markdown/HTML)
```
