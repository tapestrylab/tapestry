# @tapestrylab/studio

> **Status**: 🚧 Planned - Not yet implemented

A powerful TipTap-based documentation editor for design systems. Tapestry Studio provides a rich editing experience with built-in templates and custom documentation components to quickly create beautiful, consistent component documentation.

## Overview

Tapestry Studio is a specialized documentation authoring tool built on TipTap that streamlines the creation of design system documentation. It provides pre-built templates and custom document components to help teams maintain consistent, high-quality documentation.

## Vision

Tapestry Studio solves the challenge of creating and maintaining design system documentation by providing:

- **Rich Text Editing** - TipTap-powered WYSIWYG editor with markdown support
- **Built-in Templates** - Pre-configured templates for components, patterns, and general docs
- **Custom Doc Components** - Specialized blocks like Do's/Don'ts, Code Examples, Props Tables
- **Consistent Styling** - Enforce design system documentation standards
- **Fast Authoring** - Quickly create professional documentation pages
- **Integration Ready** - Works seamlessly with Tapestry extract, resolve, and template packages

## Key Features

### 📝 TipTap-Powered Editor

Built on [TipTap](https://tiptap.dev), a headless editor framework based on ProseMirror:

- **WYSIWYG Editing** - Rich text editing with real-time preview
- **Markdown Support** - Write in markdown or rich text
- **Extensible** - Custom extensions for documentation-specific needs
- **Collaborative** - Built-in support for real-time collaboration (future)
- **Accessible** - Keyboard shortcuts and screen reader support

### 📋 Standard Templates

Pre-built templates for common documentation types:

**Component Template**
```
- Component Name & Description
- Installation & Import
- Props Table
- Usage Examples
- Variants & States
- Accessibility Notes
- Related Components
```

**Pattern Template**
```
- Pattern Name & Overview
- When to Use
- Anatomy & Structure
- Best Practices
- Do's and Don'ts
- Code Examples
- Variations
```

**General Documentation Template**
```
- Title & Introduction
- Table of Contents
- Content Sections
- Code Examples
- Related Resources
```

### 🎨 Custom Documentation Components

Specialized blocks for design system documentation:

**Do's and Don'ts**
```
┌─────────────────────────────────────┐
│ ✅ Do                  ❌ Don't     │
├─────────────────────────────────────┤
│ • Use consistent     • Mix button  │
│   button variants      styles      │
│ • Provide clear      • Use vague   │
│   labels               text        │
└─────────────────────────────────────┘
```

**Props Table**
- Auto-generated from component metadata
- Integration with `@tapestrylab/extract`
- Editable and customizable

**Code Example**
- Syntax highlighting
- Live preview option
- Copy to clipboard
- Multiple language support

**Callout Blocks**
- Info, Warning, Danger, Success
- Custom icons and styling
- Collapsible sections

**Before/After Comparison**
- Side-by-side or stacked views
- Image or code comparisons
- Visual diff highlighting

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│              Tapestry Studio (Web App)                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Template   │  │    TipTap    │  │   Preview    │ │
│  │   Selector   │→ │    Editor    │→ │    Panel     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                 │                  │         │
│         ↓                 ↓                  ↓         │
│  ┌──────────────────────────────────────────────────┐ │
│  │        Document Store (State Management)        │ │
│  └──────────────────────────────────────────────────┘ │
│         │                 │                  │         │
│         ↓                 ↓                  ↓         │
│  ┌──────────┐      ┌───────────┐    ┌──────────────┐ │
│  │ Extract  │      │ Template  │    │   Export     │ │
│  │  (Meta)  │      │  (Render) │    │ (MD/MDX/HTML)│ │
│  └──────────┘      └───────────┘    └──────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Editor Framework**
- **TipTap 2+** - Headless editor framework
- **ProseMirror** - Underlying editing engine
- **React 18+** - UI framework
- **TypeScript 5+** - Type safety

**State Management**
- **Zustand** - Document state
- **TanStack Query** - Async operations
- **React Context** - Editor state

**Tapestry Integration**
- **@tapestrylab/extract** - Component metadata extraction
- **@tapestrylab/resolve** - Module resolution
- **@tapestrylab/template** - Documentation rendering

**Styling & UI**
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible primitives
- **Lucide Icons** - Icon system

**Build & Dev**
- **Vite** - Fast build tool
- **Vitest** - Testing framework

## Use Cases

### 1. Component Documentation

Create comprehensive component documentation quickly:

```
1. Select "Component" template
2. Enter component name (auto-extracts metadata with @tapestrylab/extract)
3. Fill in usage examples
4. Add Do's/Don'ts blocks
5. Export to MDX for your docs site
```

### 2. Design Pattern Library

Document design patterns and best practices:

```
1. Select "Pattern" template
2. Add pattern description and anatomy
3. Use Do's/Don'ts to show best practices
4. Add code examples with live previews
5. Link to related components
```

### 3. General Documentation

Create guides, getting started pages, and more:

```
1. Select "General" template
2. Build content with rich text editor
3. Add callouts, code blocks, and images
4. Organize with headings and sections
5. Export to multiple formats
```

### 4. Team Collaboration

Maintain consistent documentation across teams:

- Shared templates ensure consistency
- Custom components enforce standards
- Version control for documentation
- Export to various formats for publishing

## Templates

### Component Template

Standard structure for component documentation:

- **Header**: Component name, description, status badge
- **Installation**: Code block with install command
- **Import**: Code example showing imports
- **Props Table**: Auto-generated from metadata
- **Basic Example**: Code + preview
- **Variants**: Different component states
- **Do's and Don'ts**: Usage guidelines
- **Accessibility**: A11y considerations
- **Related**: Links to similar components

### Pattern Template

Structure for design patterns:

- **Overview**: Pattern name and description
- **When to Use**: Use cases and scenarios
- **Anatomy**: Visual breakdown of pattern structure
- **Best Practices**: Guidelines and recommendations
- **Do's and Don'ts**: Visual examples
- **Code Examples**: Implementation examples
- **Variations**: Different pattern applications
- **Related Patterns**: Cross-references

### General Template

Flexible template for various content:

- **Title & Intro**: Page heading and overview
- **Table of Contents**: Auto-generated navigation
- **Sections**: Flexible content blocks
- **Callouts**: Highlight important information
- **Code Blocks**: Syntax-highlighted examples
- **Images**: Visual content support
- **Related Links**: Cross-references

## Custom Documentation Components

### Do's and Don'ts Component

Visual comparison of correct and incorrect usage:

**Features:**
- Side-by-side layout
- Green checkmark for Do's
- Red X for Don'ts
- Support for text, images, or code
- Optional descriptions

**Usage in Editor:**
```
/dos-donts
```

### Props Table Component

Auto-generated component props documentation:

**Features:**
- Integration with `@tapestrylab/extract`
- Columns: Name, Type, Default, Required, Description
- Sortable and filterable
- Editable for manual additions
- TypeScript type display

**Usage in Editor:**
```
/props-table
```

### Code Example Component

Syntax-highlighted code blocks with features:

**Features:**
- Multiple language support
- Line numbers
- Copy to clipboard
- Filename/title display
- Line highlighting
- Diff mode for before/after

**Usage in Editor:**
```
/code-example
```

### Callout Component

Highlight important information:

**Types:**
- Info (blue)
- Warning (yellow)
- Danger (red)
- Success (green)
- Tip (purple)

**Features:**
- Custom icons
- Collapsible
- Title and body text
- Configurable styling

**Usage in Editor:**
```
/callout
```

### Comparison Component

Before/after or side-by-side comparisons:

**Features:**
- Side-by-side or stacked layout
- Image comparisons
- Code comparisons
- Visual diff highlighting
- Labels for each side

**Usage in Editor:**
```
/comparison
```

## Planned Features

### Phase 1: Core Editor (MVP)
- [ ] TipTap editor integration
- [ ] Basic rich text editing
- [ ] Component template
- [ ] Pattern template
- [ ] General template
- [ ] Do's and Don'ts component
- [ ] Props Table component
- [ ] Code Example component
- [ ] Export to Markdown

### Phase 2: Enhanced Components
- [ ] Callout component
- [ ] Comparison component
- [ ] Image gallery component
- [ ] Tabs component
- [ ] Accordion component
- [ ] Export to MDX
- [ ] Export to HTML
- [ ] Template customization

### Phase 3: Integration & Automation
- [ ] Auto-extract component metadata
- [ ] Auto-generate props tables
- [ ] Component preview integration
- [ ] Template library
- [ ] Custom component builder
- [ ] Asset management

### Phase 4: Collaboration & Publishing
- [ ] Real-time collaboration
- [ ] Version history
- [ ] Comments and annotations
- [ ] Publishing workflows
- [ ] API for headless CMS integration
- [ ] Custom export formats

## Development Roadmap

### Milestone 1: Foundation (Q1 2025)
- Set up TipTap editor
- Build core template system
- Implement Do's/Don'ts component
- Create basic export functionality
- Integrate with extract package

### Milestone 2: Component Library (Q2 2025)
- Build all custom doc components
- Template customization system
- Multi-format export (MD/MDX/HTML)
- Asset management
- Preview system

### Milestone 3: Integration (Q3 2025)
- Deep integration with extract
- Auto-generation features
- Template library
- Component previews
- Search and organization

### Milestone 4: Collaboration (Q4 2025)
- Real-time collaboration
- Version control
- Publishing workflows
- API and integrations
- Enterprise features

## Integration with Tapestry Ecosystem

### Extract Package

Auto-generate component documentation:

```typescript
import { extract } from '@tapestrylab/extract';

// Extract component metadata
const metadata = await extract({
  filePath: 'components/Button.tsx',
  framework: 'react'
});

// Auto-populate props table
generatePropsTable(metadata.components[0].props);
```

### Template Package

Export documentation in multiple formats:

```typescript
import { generateDocs } from '@tapestrylab/template';

// Convert editor content to MDX
const mdx = await generateDocs({
  content: editorContent,
  template: 'component-reference',
  theme: 'default',
  format: 'mdx'
});
```

### Resolve Package

Link and reference components:

```typescript
import { createResolver } from '@tapestrylab/resolve';

// Resolve component imports for previews
const resolver = createResolver({
  strategy: 'local'
});

const component = await resolver.resolve('./Button');
```

## Getting Started (Future)

Once implemented:

```bash
# Run locally
pnpm --filter @tapestrylab/studio dev

# Build for production
pnpm --filter @tapestrylab/studio build

# Or use hosted version
https://studio.tapestrylab.dev
```

## Technical Considerations

### TipTap Extensions

Custom extensions for documentation components:

- `DosDonts` - Do's and Don'ts block
- `PropsTable` - Component props table
- `CodeExample` - Enhanced code blocks
- `Callout` - Information callouts
- `Comparison` - Before/after comparisons

### Document Schema

ProseMirror schema for documentation:

- Nodes: Template, Section, Component blocks
- Marks: Bold, Italic, Code, Link
- Attributes: Metadata, styling, configuration

### Export Formats

Support for multiple output formats:

- **Markdown** - Standard markdown
- **MDX** - Markdown with JSX components
- **HTML** - Styled HTML output
- **JSON** - Structured document data

## Contributing

Tapestry Studio is not yet implemented. If you're interested in contributing:

1. Review this README and provide feedback
2. Check the [Technical Documentation](./CLAUDE.md)
3. Join discussions in [GitHub Discussions](https://github.com/tapestrylab/tapestry/discussions)
4. Help define requirements and features

## Related Packages

- **[@tapestrylab/extract](../extract)** - Component metadata extraction
- **[@tapestrylab/resolve](../resolve)** - Module and component resolution
- **[@tapestrylab/template](../template)** - Documentation template engine
- **[@tapestrylab/cli](../cli)** - Command-line interface
- **[@tapestrylab/graph](../graph)** - Data model and querying (planned)

## Resources

- **TipTap**: https://tiptap.dev/
- **ProseMirror**: https://prosemirror.net/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/

## License

MIT

---

**Note**: This package is in the planning phase. The above documentation represents the intended vision and feature set. Implementation details may change as the project evolves.
