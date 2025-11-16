# @tapestrylab/studio

> **Status**: 🚧 Planned - Not yet implemented

An interactive web-based playground for design systems and component documentation. Tapestry Studio provides a live development environment for exploring, testing, and documenting components with real-time metadata extraction and intelligent resolution.

## Overview

Tapestry Studio is the visual interface layer of the Tapestry ecosystem, bringing together component extraction, dependency resolution, and documentation generation in an interactive browser-based environment.

## Vision

Tapestry Studio aims to solve the disconnect between design system documentation and the actual development experience by providing:

- **Live Component Playground** - Write, edit, and preview components in real-time
- **Automatic Documentation** - Extract and display component metadata automatically
- **Interactive Props Explorer** - Test components with different prop combinations
- **Dependency Visualization** - Understand component relationships and dependencies
- **Multi-Framework Support** - Work with React, Vue, Svelte, and other frameworks
- **CDN-Powered Resolution** - Load npm packages directly from CDNs without installation
- **Export & Share** - Generate shareable documentation and examples

## Key Features

### 🎨 Interactive Component Editor

```
┌─────────────────────────────────────────────────────────┐
│ Editor                   │ Preview                      │
├──────────────────────────┼──────────────────────────────┤
│ import { Button } from   │                              │
│   '@mui/material';       │  ┌────────────┐              │
│                          │  │   Click    │              │
│ export function MyBtn() {│  └────────────┘              │
│   return <Button>        │                              │
│     Click                │  Props:                      │
│   </Button>;             │  • variant: "contained"      │
│ }                        │  • color: "primary"          │
└──────────────────────────┴──────────────────────────────┘
```

- **Monaco-based editor** with TypeScript IntelliSense
- **Hot reload** component previews
- **Multiple file support** for complex examples
- **Error boundaries** with helpful debugging info

### 📊 Automatic Metadata Extraction

Powered by `@tapestrylab/extract`, Studio automatically analyzes your components to display:

- Component props with types and descriptions
- JSDoc comments and documentation
- Default values and required fields
- TypeScript generics and complex types
- Exported members and utilities

### 🔗 Smart Dependency Resolution

Using `@tapestrylab/resolve`, Studio handles dependencies intelligently:

- **CDN Resolution** - Load packages from esm.sh, unpkg, or skypack
- **Version Management** - Specify exact versions or use latest
- **Peer Dependencies** - Automatically resolve transitive dependencies
- **Local Imports** - Support for user-uploaded files and modules
- **Cache Layer** - Fast loading with intelligent caching strategies

### 📝 Live Documentation Generation

Leverage `@tapestrylab/template` to:

- Generate documentation in Markdown, MDX, or HTML
- Apply custom themes and styling
- Create shareable documentation links
- Export to common formats
- Integrate with existing documentation sites

### 🌐 Component Gallery & Discovery

- **Browse Examples** - Curated gallery of component examples
- **Search & Filter** - Find components by framework, category, or features
- **Import Templates** - Start from pre-built component templates
- **Share Playgrounds** - Create permalink URLs to share configurations

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Tapestry Studio (Web App)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐      │
│  │   Editor     │  │   Preview    │  │   Docs      │      │
│  │   Panel      │→ │   Panel      │→ │   Panel     │      │
│  └──────────────┘  └──────────────┘  └─────────────┘      │
│         │                 │                  │             │
│         ↓                 ↓                  ↓             │
│  ┌──────────────────────────────────────────────────┐     │
│  │          Studio Core (State Management)          │     │
│  └──────────────────────────────────────────────────┘     │
│         │                 │                  │             │
│         ↓                 ↓                  ↓             │
│  ┌──────────┐      ┌────────────┐    ┌──────────────┐    │
│  │ Extract  │      │  Resolve   │    │  Template    │    │
│  │ (Wasm)   │      │ (Browser)  │    │  (Browser)   │    │
│  └──────────┘      └────────────┘    └──────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
          ↓                  ↓                   ↓
   ┌──────────┐      ┌─────────────┐     ┌─────────────┐
   │  Monaco  │      │  CDN (esm)  │     │  Renderer   │
   │  Editor  │      │  Services   │     │  (iframe)   │
   └──────────┘      └─────────────┘     └─────────────┘
```

### Technology Stack

**Frontend Framework**
- **React 18+** with TypeScript
- **Vite** for fast development and building
- **TanStack Query** for async state management
- **Zustand** for client state management

**Editor & Preview**
- **Monaco Editor** - VS Code-powered editing experience
- **Sandpack** (optional) - Component preview sandboxing
- **Iframe Sandboxing** - Secure preview rendering

**Tapestry Integration**
- **@tapestrylab/extract** - Component metadata extraction (WebAssembly)
- **@tapestrylab/resolve** - CDN and local module resolution
- **@tapestrylab/template** - Documentation generation
- **@tapestrylab/graph** (future) - Component relationship querying

**Styling & UI**
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations

## Use Cases

### 1. Component Library Documentation

Create interactive documentation for your design system:

```typescript
// Users upload their Button.tsx
import { Button } from './Button';

// Studio automatically:
// 1. Extracts props (variant, size, onClick, etc.)
// 2. Shows TypeScript types
// 3. Generates documentation
// 4. Creates live preview
```

### 2. Rapid Prototyping

Quickly test ideas with real components:

```typescript
// Load Material UI from CDN
import { TextField, Button, Box } from '@mui/material';

// Build a login form in minutes
export function LoginForm() {
  // ... prototype code
}
```

### 3. Component Testing & Exploration

Experiment with different prop combinations:

- Adjust props via GUI controls
- See live updates in preview
- Export working examples as code
- Share configurations with team

### 4. Education & Learning

Learn component development with instant feedback:

- Tutorial mode with guided examples
- See prop types and documentation inline
- Experiment without local setup
- Fork and modify examples

### 5. Design System Governance

Ensure consistency across your organization:

- Central component gallery
- Version tracking and comparison
- Usage examples and best practices
- Export guidelines and documentation

## Planned Features

### Phase 1: Core Playground (MVP)
- [x] Project structure and architecture
- [ ] Basic Monaco editor integration
- [ ] Simple component preview (React only)
- [ ] Integration with @tapestrylab/extract
- [ ] CDN resolution via @tapestrylab/resolve
- [ ] Basic UI layout (editor + preview)

### Phase 2: Enhanced Experience
- [ ] Props control panel (auto-generated from types)
- [ ] Multiple file support
- [ ] Framework detection and switching
- [ ] Documentation panel with live generation
- [ ] Error handling and debugging tools
- [ ] Shareable playground URLs

### Phase 3: Gallery & Discovery
- [ ] Component gallery with examples
- [ ] Search and filtering
- [ ] Template library
- [ ] User accounts and saved playgrounds
- [ ] Community examples and sharing

### Phase 4: Advanced Features
- [ ] Real-time collaboration
- [ ] Version history and forking
- [ ] Custom theme support
- [ ] Integration with design tools (Figma, etc.)
- [ ] API for embedding playgrounds
- [ ] Enterprise features (private galleries, SSO)

## Integration with Tapestry Ecosystem

### Extract Package

```typescript
import { extract } from '@tapestrylab/extract';

// Extract metadata from user code
const metadata = await extract({
  code: userCode,
  filePath: 'Button.tsx',
  framework: 'react'
});

// Display props, types, JSDoc in UI
displayPropsPanel(metadata.components[0].props);
```

### Resolve Package

```typescript
import { createResolver } from '@tapestrylab/resolve';

// Resolve imports from CDN
const resolver = createResolver({
  strategy: 'cdn',
  cdnProvider: 'esm.sh'
});

const resolved = await resolver.resolve('@mui/material', {
  environment: 'browser'
});

// Load resolved module into preview
loadModule(resolved.url);
```

### Template Package

```typescript
import { generateDocs } from '@tapestrylab/template';

// Generate documentation from metadata
const docs = await generateDocs({
  component: metadata,
  template: 'component-reference',
  theme: 'default',
  format: 'mdx'
});

// Display in docs panel
displayDocumentation(docs);
```

## Development Roadmap

### Milestone 1: Foundation (Q1 2025)
- Set up monorepo package structure
- Integrate Monaco editor
- Build basic React preview
- Wire up extract and resolve packages
- Create minimal viable UI

### Milestone 2: Interactive Features (Q2 2025)
- Props control panel
- Multi-file support
- Framework switching
- Shareable URLs
- Documentation generation

### Milestone 3: Gallery & Community (Q3 2025)
- Component gallery
- User accounts
- Example templates
- Community features
- Search and discovery

### Milestone 4: Enterprise & Scale (Q4 2025)
- Collaboration features
- Private galleries
- API and embeds
- Design tool integration
- Performance optimization

## Technical Considerations

### WebAssembly for Extract

The extract package should compile to WebAssembly for browser use:

```typescript
// Load extract as WASM module
import initExtract from '@tapestrylab/extract/wasm';

await initExtract();
```

### Security & Sandboxing

User code must run in a secure sandbox:

- **Iframe isolation** - Preview runs in sandboxed iframe
- **CSP headers** - Content Security Policy enforcement
- **Resource limits** - CPU and memory limits
- **No arbitrary code execution** - Controlled evaluation only

### Performance

- **Code splitting** - Lazy load editor and preview
- **Virtual scrolling** - Handle large component lists
- **Web Workers** - Offload extraction to workers
- **Caching** - Cache CDN modules and extraction results

### Accessibility

- **Keyboard navigation** - Full keyboard support
- **Screen readers** - ARIA labels and semantic HTML
- **High contrast** - Theme support for visibility
- **Focus management** - Logical tab order

## Getting Started (Future)

Once implemented, Studio will be available at:

```bash
# Run locally
pnpm --filter @tapestrylab/studio dev

# Build for production
pnpm --filter @tapestrylab/studio build

# Or use hosted version
https://studio.tapestrylab.dev
```

## API Reference (Planned)

### Embed API

Embed Studio playgrounds in your documentation:

```html
<iframe src="https://studio.tapestrylab.dev/embed?id=abc123"></iframe>
```

```typescript
// JavaScript API
import { createPlayground } from '@tapestrylab/studio-embed';

createPlayground('#container', {
  code: 'export function Button() { ... }',
  framework: 'react',
  showEditor: true,
  showPreview: true,
  showDocs: true
});
```

## Contributing

Tapestry Studio is not yet implemented. If you're interested in contributing to its development:

1. Review this README and provide feedback
2. Check the [Architecture Document](./ARCHITECTURE.md) (coming soon)
3. Join discussions in [GitHub Discussions](https://github.com/tapestrylab/tapestry/discussions)
4. Help define requirements and features

## Related Packages

- **[@tapestrylab/extract](../extract)** - Component metadata extraction
- **[@tapestrylab/resolve](../resolve)** - Module and dependency resolution
- **[@tapestrylab/template](../template)** - Documentation template engine
- **[@tapestrylab/cli](../cli)** - Command-line interface
- **[@tapestrylab/graph](../graph)** - Data model and querying (planned)

## License

MIT

---

**Note**: This package is in the planning phase. The above documentation represents the intended vision and feature set. Implementation details may change as the project evolves.
