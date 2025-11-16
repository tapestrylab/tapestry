# CLAUDE.md - @tapestrylab/studio

Technical documentation for Claude Code when working on the Tapestry Studio package.

> **Status**: 🚧 Planned Package - Implementation not started

## Package Overview

**Tapestry Studio** is an interactive web-based playground for design system components and documentation. It provides a live development environment that integrates all Tapestry packages into a cohesive visual interface.

**Package Name**: `@tapestrylab/studio`
**Type**: Web Application (React + Vite)
**Current Version**: Not yet published
**Dependencies**: `@tapestrylab/extract`, `@tapestrylab/resolve`, `@tapestrylab/template`

## Project Structure (Planned)

```
packages/studio/
├── src/
│   ├── app/                      # Application entry and routing
│   │   ├── app.tsx              # Root application component
│   │   ├── router.tsx           # Route configuration
│   │   └── main.tsx             # Vite entry point
│   ├── features/                 # Feature-based modules
│   │   ├── editor/              # Monaco editor integration
│   │   │   ├── components/      # Editor UI components
│   │   │   ├── hooks/           # Editor-specific hooks
│   │   │   └── use-editor.ts    # Main editor hook
│   │   ├── preview/             # Component preview system
│   │   │   ├── components/      # Preview UI components
│   │   │   ├── sandbox/         # Iframe sandbox logic
│   │   │   └── use-preview.ts   # Preview rendering hook
│   │   ├── metadata/            # Component metadata extraction
│   │   │   ├── components/      # Metadata display components
│   │   │   ├── extract-worker.ts # Web Worker for extraction
│   │   │   └── use-extract.ts   # Extraction hook
│   │   ├── resolver/            # Module resolution
│   │   │   ├── cdn-resolver.ts  # CDN resolution logic
│   │   │   └── use-resolve.ts   # Resolution hook
│   │   ├── docs/                # Documentation generation
│   │   │   ├── components/      # Docs display components
│   │   │   └── use-generate-docs.ts # Docs generation hook
│   │   └── gallery/             # Component gallery
│   │       ├── components/      # Gallery UI components
│   │       └── use-gallery.ts   # Gallery data hook
│   ├── components/              # Shared UI components
│   │   ├── layout/              # Layout components
│   │   ├── panels/              # Resizable panels
│   │   └── ui/                  # Base UI primitives (Radix)
│   ├── lib/                     # Shared utilities
│   │   ├── store.ts             # Zustand store
│   │   ├── query-client.ts      # TanStack Query client
│   │   └── utils.ts             # Utility functions
│   ├── types/                   # TypeScript type definitions
│   │   ├── playground.ts        # Playground state types
│   │   └── editor.ts            # Editor types
│   └── styles/                  # Global styles
│       ├── globals.css          # Global CSS
│       └── tailwind.css         # Tailwind imports
├── public/                      # Static assets
├── tests/                       # Test files
│   ├── unit/                    # Unit tests
│   └── integration/             # Integration tests
├── scripts/                     # Build and utility scripts
├── index.html                   # HTML entry point
├── vite.config.ts              # Vite configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Package manifest
├── README.md                   # User-facing documentation
└── CLAUDE.md                   # This file (technical docs)
```

## Technology Stack

### Core Framework
- **React 18+** - UI framework
- **TypeScript 5+** - Type safety
- **Vite 6+** - Build tool and dev server

### State Management
- **Zustand** - Client state (editor content, UI state)
- **TanStack Query** - Server state and async operations
- **React Context** - Component-level state

### Editor & Preview
- **Monaco Editor** - Code editor (from VS Code)
- **@monaco-editor/react** - React wrapper for Monaco
- **Iframe Sandboxing** - Secure preview rendering
- **Web Workers** - Offload heavy operations

### UI Components
- **Radix UI** - Accessible primitives
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations (optional)
- **react-resizable-panels** - Resizable layout panels

### Tapestry Packages
- **@tapestrylab/extract** - Metadata extraction (WASM)
- **@tapestrylab/resolve** - Module resolution (browser-compatible)
- **@tapestrylab/template** - Documentation generation

## Development Commands

### Installation

```bash
# From monorepo root
pnpm install

# Install studio-specific dependencies
pnpm --filter @tapestrylab/studio install
```

### Development

```bash
# Start dev server (when implemented)
pnpm --filter @tapestrylab/studio dev

# Alternative: from package directory
cd packages/studio
pnpm dev
```

### Building

```bash
# Build for production
pnpm --filter @tapestrylab/studio build

# Preview production build
pnpm --filter @tapestrylab/studio preview
```

### Testing

```bash
# Run unit tests
pnpm --filter @tapestrylab/studio test

# Run tests in watch mode
pnpm --filter @tapestrylab/studio test:watch

# Run tests with UI
pnpm --filter @tapestrylab/studio test:ui

# Run integration tests
pnpm --filter @tapestrylab/studio test:integration
```

### Type Checking

```bash
# Type check
pnpm --filter @tapestrylab/studio type-check

# Type check in watch mode
pnpm --filter @tapestrylab/studio type-check --watch
```

### Linting and Formatting

```bash
# Lint code
pnpm --filter @tapestrylab/studio lint

# Format code
pnpm --filter @tapestrylab/studio format
```

## Key Implementation Details

### 1. State Management Architecture

**Zustand Store** - Client state

```typescript
// src/lib/store.ts
import { create } from 'zustand';

interface PlaygroundState {
  // Editor state
  code: string;
  setCode: (code: string) => void;

  // UI state
  activePanel: 'editor' | 'preview' | 'docs';
  setActivePanel: (panel: string) => void;

  // Configuration
  framework: 'react' | 'vue' | 'svelte';
  setFramework: (framework: string) => void;
}

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  code: '',
  setCode: (code) => set({ code }),
  activePanel: 'editor',
  setActivePanel: (panel) => set({ activePanel: panel }),
  framework: 'react',
  setFramework: (framework) => set({ framework }),
}));
```

**TanStack Query** - Async operations

```typescript
// src/features/metadata/use-extract.ts
import { useQuery } from '@tanstack/react-query';
import { extract } from '@tapestrylab/extract';

export function useExtract(code: string, framework: string) {
  return useQuery({
    queryKey: ['extract', code, framework],
    queryFn: async () => {
      return extract({
        code,
        filePath: `Component.${framework === 'react' ? 'tsx' : 'vue'}`,
        framework,
      });
    },
    enabled: code.length > 0,
    staleTime: 5000, // Cache for 5 seconds
  });
}
```

### 2. Monaco Editor Integration

```typescript
// src/features/editor/components/code-editor.tsx
import { Editor } from '@monaco-editor/react';
import { usePlaygroundStore } from '@/lib/store';

export function CodeEditor() {
  const { code, setCode } = usePlaygroundStore();

  return (
    <Editor
      height="100%"
      defaultLanguage="typescript"
      defaultValue={code}
      onChange={(value) => setCode(value || '')}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        automaticLayout: true,
      }}
    />
  );
}
```

### 3. Secure Preview Rendering

```typescript
// src/features/preview/components/preview-frame.tsx
import { useEffect, useRef } from 'react';
import { usePlaygroundStore } from '@/lib/store';

export function PreviewFrame() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { code } = usePlaygroundStore();

  useEffect(() => {
    if (!iframeRef.current) return;

    // Create sandboxed document
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <script type="module">
            ${code}
          </script>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `);
    doc.close();
  }, [code]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts allow-same-origin"
      className="w-full h-full border-0"
    />
  );
}
```

### 4. CDN Module Resolution

```typescript
// src/features/resolver/cdn-resolver.ts
import { createResolver } from '@tapestrylab/resolve';

export async function resolveFromCDN(packageName: string, version?: string) {
  const resolver = createResolver({
    strategy: 'cdn',
    cdnProvider: 'esm.sh',
  });

  const resolved = await resolver.resolve(packageName, {
    environment: 'browser',
    version,
  });

  return resolved.url;
}
```

### 5. Web Worker for Extraction

```typescript
// src/features/metadata/extract-worker.ts
import { extract } from '@tapestrylab/extract';

self.addEventListener('message', async (event) => {
  const { code, filePath, framework } = event.data;

  try {
    const result = await extract({ code, filePath, framework });
    self.postMessage({ success: true, data: result });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
});
```

## Integration with Tapestry Packages

### Extract Package

```typescript
// Feature: Automatic metadata extraction
import { extract } from '@tapestrylab/extract';

// In metadata panel
const metadata = await extract({
  code: userCode,
  filePath: 'Button.tsx',
  framework: 'react',
});

// Display props
metadata.components[0].props.forEach((prop) => {
  // Render prop documentation
});
```

### Resolve Package

```typescript
// Feature: CDN module loading
import { createResolver } from '@tapestrylab/resolve';

const resolver = createResolver({
  strategy: 'cdn',
  cdnProvider: 'esm.sh',
});

// Resolve user imports
const imports = parseImports(code);
for (const imp of imports) {
  const resolved = await resolver.resolve(imp.package);
  loadScript(resolved.url);
}
```

### Template Package

```typescript
// Feature: Live documentation generation
import { generateDocs } from '@tapestrylab/template';

const docs = await generateDocs({
  component: metadata,
  template: 'component-reference',
  theme: 'studio-default',
  format: 'mdx',
});

// Render in docs panel
setDocumentation(docs);
```

## Design Patterns

### Feature-Based Architecture

Organize code by feature, not by type:

```
✅ Good:
features/
  editor/
    components/
    hooks/
    use-editor.ts

❌ Bad:
components/
  editor/
hooks/
  use-editor.ts
```

### Custom Hooks for Features

Each feature exposes a primary hook:

```typescript
// src/features/editor/use-editor.ts
export function useEditor() {
  const store = usePlaygroundStore();
  const { mutate: extractMetadata } = useExtract();

  const updateCode = (code: string) => {
    store.setCode(code);
    extractMetadata(code);
  };

  return {
    code: store.code,
    updateCode,
  };
}
```

### Compound Components

Use compound component pattern for complex UI:

```typescript
// Playground component
export function Playground() {
  return (
    <PlaygroundProvider>
      <Playground.Layout>
        <Playground.Editor />
        <Playground.Preview />
        <Playground.Docs />
      </Playground.Layout>
    </PlaygroundProvider>
  );
}

Playground.Layout = PlaygroundLayout;
Playground.Editor = EditorPanel;
Playground.Preview = PreviewPanel;
Playground.Docs = DocsPanel;
```

## Security Considerations

### Iframe Sandboxing

Always sandbox preview iframes:

```html
<iframe
  sandbox="allow-scripts allow-same-origin"
  src="about:blank"
></iframe>
```

**Never** use `allow-top-navigation` or `allow-popups`.

### Content Security Policy

Set strict CSP headers:

```typescript
// vite.config.ts
export default {
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' https://esm.sh",
        "style-src 'self' 'unsafe-inline'",
        "connect-src 'self' https://esm.sh https://unpkg.com",
      ].join('; '),
    },
  },
};
```

### Input Validation

Validate all user input:

```typescript
// Validate package names
function isValidPackageName(name: string): boolean {
  return /^[@a-z0-9][\w-./]*$/.test(name);
}

// Sanitize code before preview
function sanitizeCode(code: string): string {
  // Remove dangerous patterns
  return code
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/on\w+\s*=/gi, '');
}
```

## Performance Optimization

### Code Splitting

Split by route and feature:

```typescript
// src/app/router.tsx
import { lazy } from 'react';

const Playground = lazy(() => import('@/features/playground'));
const Gallery = lazy(() => import('@/features/gallery'));
```

### Debounced Extraction

Avoid excessive metadata extraction:

```typescript
import { useDebouncedValue } from '@/hooks/use-debounced-value';

function MetadataPanel() {
  const { code } = usePlaygroundStore();
  const debouncedCode = useDebouncedValue(code, 500);

  const { data } = useExtract(debouncedCode);
}
```

### Virtual Scrolling

For large component lists in gallery:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function ComponentList({ components }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: components.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
}
```

## Testing Strategy

### Unit Tests

Test individual features:

```typescript
// src/features/editor/use-editor.test.ts
import { renderHook, act } from '@testing-library/react';
import { useEditor } from './use-editor';

describe('useEditor', () => {
  it('updates code', () => {
    const { result } = renderHook(() => useEditor());

    act(() => {
      result.current.updateCode('const x = 1');
    });

    expect(result.current.code).toBe('const x = 1');
  });
});
```

### Integration Tests

Test feature interactions:

```typescript
// tests/integration/playground.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Playground } from '@/features/playground';

describe('Playground', () => {
  it('extracts metadata when code changes', async () => {
    render(<Playground />);

    const editor = screen.getByRole('textbox');
    await userEvent.type(editor, 'export function Button() {}');

    expect(await screen.findByText('Button')).toBeInTheDocument();
  });
});
```

## Accessibility

### Keyboard Navigation

Ensure full keyboard support:

```typescript
// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Cmd/Ctrl + S to save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      savePlayground();
    }

    // Cmd/Ctrl + Enter to run
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      runPreview();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### ARIA Labels

Provide context for screen readers:

```typescript
<button
  onClick={runPreview}
  aria-label="Run preview (Cmd+Enter)"
>
  Run
</button>
```

### Focus Management

Manage focus for panels:

```typescript
function PlaygroundLayout() {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus editor on mount
    editorRef.current?.focus();
  }, []);
}
```

## Environment Variables

```bash
# .env.development
VITE_CDN_PROVIDER=esm.sh
VITE_API_URL=http://localhost:3000
VITE_ENABLE_ANALYTICS=false

# .env.production
VITE_CDN_PROVIDER=esm.sh
VITE_API_URL=https://api.tapestrylab.dev
VITE_ENABLE_ANALYTICS=true
```

## Deployment

### Build Output

```bash
pnpm build
# Output: packages/studio/dist/
```

### Static Hosting

Deploy to Vercel, Netlify, or Cloudflare Pages:

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir=dist

# Cloudflare Pages
wrangler pages publish dist
```

## Dependencies

### Production Dependencies

- `react`, `react-dom` - UI framework
- `@monaco-editor/react` - Code editor
- `@tapestrylab/extract` - Metadata extraction
- `@tapestrylab/resolve` - Module resolution
- `@tapestrylab/template` - Documentation generation
- `zustand` - State management
- `@tanstack/react-query` - Async state
- `@radix-ui/react-*` - UI primitives
- `tailwindcss` - Styling

### Development Dependencies

- `vite` - Build tool
- `typescript` - Type checking
- `vitest` - Testing framework
- `@testing-library/react` - React testing utilities
- `@types/*` - Type definitions

## Common Tasks

### Adding a New Feature

1. Create feature directory: `src/features/my-feature/`
2. Create main hook: `src/features/my-feature/use-my-feature.ts`
3. Create components: `src/features/my-feature/components/`
4. Add tests: `src/features/my-feature/use-my-feature.test.ts`
5. Export from index: `src/features/my-feature/index.ts`

### Adding a New UI Component

1. Create in `src/components/`: `src/components/my-component.tsx`
2. Use Radix primitive if available
3. Style with Tailwind classes
4. Add TypeScript props interface
5. Write Storybook story (future)
6. Add tests

### Integrating a Tapestry Package

1. Add dependency in `package.json`
2. Create feature hook: `src/features/feature-name/use-feature.ts`
3. Wrap in TanStack Query if async
4. Handle errors gracefully
5. Add loading states
6. Write tests

## Troubleshooting

### Monaco Editor Not Loading

Ensure Vite is configured to handle Monaco assets:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['monaco-editor'],
  },
});
```

### Extract Package Not Working in Browser

Ensure WASM is loaded correctly:

```typescript
import initExtract from '@tapestrylab/extract/wasm';

// Initialize before use
await initExtract();
```

### CDN Modules Not Loading

Check CORS and CSP headers:

```typescript
// vite.config.ts - allow CDN origins
server: {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
}
```

## Future Enhancements

### Phase 1 (MVP)
- [ ] Monaco editor setup
- [ ] Basic React preview
- [ ] Extract integration
- [ ] Resolve integration
- [ ] Basic UI layout

### Phase 2 (Enhanced)
- [ ] Props control panel
- [ ] Multi-file support
- [ ] Framework switching
- [ ] Shareable URLs
- [ ] Documentation panel

### Phase 3 (Gallery)
- [ ] Component gallery
- [ ] Search and filter
- [ ] User accounts
- [ ] Community examples

### Phase 4 (Advanced)
- [ ] Real-time collaboration
- [ ] Design tool integration
- [ ] Custom themes
- [ ] Embedding API

## Resources

- **Monaco Editor**: https://microsoft.github.io/monaco-editor/
- **Vite**: https://vitejs.dev/
- **Zustand**: https://zustand-demo.pmnd.rs/
- **TanStack Query**: https://tanstack.com/query/latest
- **Radix UI**: https://www.radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/

## Related Documentation

- [README.md](./README.md) - User-facing documentation
- [packages/extract/CLAUDE.md](../extract/CLAUDE.md) - Extract package
- [packages/resolve/CLAUDE.md](../resolve/CLAUDE.md) - Resolve package
- [packages/template/CLAUDE.md](../template/CLAUDE.md) - Template package

---

**Status**: This package is planned but not yet implemented. This document serves as the technical specification for future development.
