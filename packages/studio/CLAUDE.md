# CLAUDE.md - @tapestrylab/studio

Technical documentation for Claude Code when working on the Tapestry Studio package.

> **Status**: 🚧 Planned Package - Implementation not started

## Package Overview

**Tapestry Studio** is a TipTap-based documentation editor for design systems. It provides a rich WYSIWYG editing experience with built-in templates (component, pattern, general) and custom documentation components (do's/don'ts, props tables, code examples, callouts) to streamline the creation of consistent, high-quality design system documentation.

**Package Name**: `@tapestrylab/studio`
**Type**: Web Application (React + Vite)
**Current Version**: Not yet published
**Dependencies**: `@tapestrylab/extract`, `@tapestrylab/resolve`, `@tapestrylab/template`, `@tiptap/react`

## Project Structure (Planned)

```
packages/studio/
├── src/
│   ├── app/                          # Application entry and routing
│   │   ├── app.tsx                  # Root application component
│   │   ├── router.tsx               # Route configuration
│   │   └── main.tsx                 # Vite entry point
│   ├── features/                     # Feature-based modules
│   │   ├── editor/                  # TipTap editor integration
│   │   │   ├── components/
│   │   │   │   ├── editor.tsx       # Main editor component
│   │   │   │   ├── menu-bar.tsx     # Editor toolbar
│   │   │   │   └── bubble-menu.tsx  # Floating menu
│   │   │   ├── extensions/          # Custom TipTap extensions
│   │   │   │   ├── dos-donts.ts     # Do's and Don'ts extension
│   │   │   │   ├── props-table.ts   # Props table extension
│   │   │   │   ├── code-example.ts  # Code example extension
│   │   │   │   ├── callout.ts       # Callout extension
│   │   │   │   └── comparison.ts    # Comparison extension
│   │   │   ├── hooks/
│   │   │   │   └── use-editor.ts    # Editor state hook
│   │   │   └── index.ts
│   │   ├── templates/               # Document templates
│   │   │   ├── components/
│   │   │   │   ├── template-selector.tsx
│   │   │   │   └── template-preview.tsx
│   │   │   ├── definitions/
│   │   │   │   ├── component-template.ts
│   │   │   │   ├── pattern-template.ts
│   │   │   │   └── general-template.ts
│   │   │   ├── hooks/
│   │   │   │   └── use-template.ts
│   │   │   └── index.ts
│   │   ├── export/                  # Export functionality
│   │   │   ├── components/
│   │   │   │   └── export-dialog.tsx
│   │   │   ├── exporters/
│   │   │   │   ├── markdown.ts
│   │   │   │   ├── mdx.ts
│   │   │   │   ├── html.ts
│   │   │   │   └── json.ts
│   │   │   ├── hooks/
│   │   │   │   └── use-export.ts
│   │   │   └── index.ts
│   │   ├── preview/                 # Document preview
│   │   │   ├── components/
│   │   │   │   └── preview-panel.tsx
│   │   │   └── index.ts
│   │   └── metadata/                # Component metadata extraction
│   │       ├── components/
│   │       │   └── metadata-panel.tsx
│   │       ├── hooks/
│   │       │   └── use-extract.ts
│   │       └── index.ts
│   ├── components/                  # Shared UI components
│   │   ├── layout/
│   │   │   ├── app-layout.tsx
│   │   │   └── editor-layout.tsx
│   │   └── ui/                      # Radix UI components
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── select.tsx
│   │       └── ...
│   ├── lib/                         # Shared utilities
│   │   ├── store.ts                 # Zustand store
│   │   ├── query-client.ts          # TanStack Query client
│   │   └── utils.ts                 # Utility functions
│   ├── types/                       # TypeScript type definitions
│   │   ├── editor.ts                # Editor types
│   │   ├── template.ts              # Template types
│   │   └── document.ts              # Document types
│   └── styles/                      # Global styles
│       ├── globals.css              # Global CSS
│       ├── editor.css               # TipTap editor styles
│       └── tailwind.css             # Tailwind imports
├── public/                          # Static assets
├── tests/                           # Test files
│   ├── unit/                        # Unit tests
│   └── integration/                 # Integration tests
├── index.html                       # HTML entry point
├── vite.config.ts                  # Vite configuration
├── tailwind.config.ts              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Package manifest
├── README.md                       # User-facing documentation
└── CLAUDE.md                       # This file (technical docs)
```

## Technology Stack

### Editor Framework
- **TipTap 2+** - Headless rich text editor framework
- **ProseMirror** - Underlying document model and editing engine
- **@tiptap/react** - React wrapper for TipTap
- **@tiptap/starter-kit** - Basic editor extensions
- **@tiptap/extension-*** - Additional TipTap extensions

### Core Framework
- **React 18+** - UI framework
- **TypeScript 5+** - Type safety
- **Vite 6+** - Build tool and dev server

### State Management
- **Zustand** - Document and UI state
- **TanStack Query** - Async operations (metadata extraction, export)
- **React Context** - Editor-specific state

### Tapestry Packages
- **@tapestrylab/extract** - Component metadata extraction
- **@tapestrylab/resolve** - Module resolution
- **@tapestrylab/template** - Documentation rendering

### UI Components & Styling
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Icon library
- **clsx** - Conditional classNames

### Code Highlighting
- **Shiki** or **Prism** - Syntax highlighting
- **@code-hike/lighter** (optional) - Advanced code highlighting

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

## Key Implementation Details

### 1. TipTap Editor Setup

**Main Editor Component**

```typescript
// src/features/editor/components/editor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { DosDonts } from '../extensions/dos-donts';
import { PropsTable } from '../extensions/props-table';
import { CodeExample } from '../extensions/code-example';
import { Callout } from '../extensions/callout';
import { Comparison } from '../extensions/comparison';

export function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      DosDonts,
      PropsTable,
      CodeExample,
      Callout,
      Comparison,
    ],
    content: '<p>Start writing...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none',
      },
    },
  });

  return <EditorContent editor={editor} />;
}
```

### 2. Custom TipTap Extensions

**Do's and Don'ts Extension**

```typescript
// src/features/editor/extensions/dos-donts.ts
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { DosDontsComponent } from './dos-donts-component';

export const DosDonts = Node.create({
  name: 'dosDonts',

  group: 'block',

  content: 'block+',

  parseHTML() {
    return [{ tag: 'div[data-type="dos-donts"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'dos-donts' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DosDontsComponent);
  },

  addCommands() {
    return {
      insertDosDonts: () => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Do: ...' }],
            },
          ],
        });
      },
    };
  },
});
```

**Props Table Extension**

```typescript
// src/features/editor/extensions/props-table.ts
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { PropsTableComponent } from './props-table-component';

export const PropsTable = Node.create({
  name: 'propsTable',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      componentPath: {
        default: null,
      },
      props: {
        default: [],
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="props-table"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'props-table' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PropsTableComponent);
  },

  addCommands() {
    return {
      insertPropsTable: (componentPath: string) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { componentPath },
        });
      },
    };
  },
});
```

**Code Example Extension**

```typescript
// src/features/editor/extensions/code-example.ts
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CodeExampleComponent } from './code-example-component';

export const CodeExample = Node.create({
  name: 'codeExample',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      language: {
        default: 'typescript',
      },
      code: {
        default: '',
      },
      filename: {
        default: null,
      },
      showLineNumbers: {
        default: true,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="code-example"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'code-example' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeExampleComponent);
  },

  addCommands() {
    return {
      insertCodeExample: (attrs) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs,
        });
      },
    };
  },
});
```

### 3. Template System

**Template Definitions**

```typescript
// src/features/templates/definitions/component-template.ts
export const componentTemplate = {
  id: 'component',
  name: 'Component Documentation',
  description: 'Template for documenting design system components',
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Component Name' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Brief description of the component...' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Installation' }],
      },
      {
        type: 'codeExample',
        attrs: {
          language: 'bash',
          code: 'npm install @your-library/component',
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Props' }],
      },
      {
        type: 'propsTable',
        attrs: {
          componentPath: null,
        },
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Usage Guidelines' }],
      },
      {
        type: 'dosDonts',
      },
    ],
  },
};
```

**Template Selector**

```typescript
// src/features/templates/components/template-selector.tsx
import { templates } from '../definitions';
import { useTemplate } from '../hooks/use-template';

export function TemplateSelector() {
  const { applyTemplate } = useTemplate();

  return (
    <div className="grid grid-cols-3 gap-4">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => applyTemplate(template)}
          className="p-4 border rounded-lg hover:bg-gray-50"
        >
          <h3 className="font-semibold">{template.name}</h3>
          <p className="text-sm text-gray-600">{template.description}</p>
        </button>
      ))}
    </div>
  );
}
```

### 4. State Management

**Zustand Store**

```typescript
// src/lib/store.ts
import { create } from 'zustand';
import { Editor } from '@tiptap/react';

interface StudioState {
  // Editor state
  editor: Editor | null;
  setEditor: (editor: Editor) => void;

  // Document state
  currentDocument: Document | null;
  setCurrentDocument: (doc: Document) => void;

  // Template state
  selectedTemplate: string | null;
  setSelectedTemplate: (templateId: string) => void;

  // UI state
  activePanel: 'editor' | 'preview' | 'metadata';
  setActivePanel: (panel: string) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  editor: null,
  setEditor: (editor) => set({ editor }),

  currentDocument: null,
  setCurrentDocument: (doc) => set({ currentDocument: doc }),

  selectedTemplate: null,
  setSelectedTemplate: (templateId) => set({ selectedTemplate: templateId }),

  activePanel: 'editor',
  setActivePanel: (panel) => set({ activePanel: panel }),
}));
```

### 5. Metadata Extraction Integration

**Extract Component Props**

```typescript
// src/features/metadata/hooks/use-extract.ts
import { useQuery } from '@tanstack/react-query';
import { extract } from '@tapestrylab/extract';

export function useExtract(componentPath: string) {
  return useQuery({
    queryKey: ['extract', componentPath],
    queryFn: async () => {
      const metadata = await extract({
        filePath: componentPath,
        framework: 'react',
      });

      return metadata.components[0];
    },
    enabled: !!componentPath,
    staleTime: 60000, // Cache for 1 minute
  });
}
```

**Props Table Component**

```typescript
// src/features/editor/extensions/props-table-component.tsx
import { NodeViewWrapper } from '@tiptap/react';
import { useExtract } from '../../metadata/hooks/use-extract';

export function PropsTableComponent({ node, updateAttributes }) {
  const { componentPath } = node.attrs;
  const { data: component, isLoading } = useExtract(componentPath);

  if (isLoading) return <div>Loading props...</div>;

  return (
    <NodeViewWrapper>
      <table className="props-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Default</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {component?.props.map((prop) => (
            <tr key={prop.name}>
              <td><code>{prop.name}</code></td>
              <td><code>{prop.type}</code></td>
              <td>{prop.default || '-'}</td>
              <td>{prop.required ? '✓' : ''}</td>
              <td>{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </NodeViewWrapper>
  );
}
```

### 6. Export Functionality

**Markdown Export**

```typescript
// src/features/export/exporters/markdown.ts
import { generateMarkdown } from '@tiptap/core';

export async function exportToMarkdown(editor: Editor): Promise<string> {
  const json = editor.getJSON();

  // Convert TipTap JSON to Markdown
  // Handle custom extensions
  return generateMarkdown(json, {
    // Custom node handlers
    dosDonts: (node) => {
      let markdown = '\n## Do\'s and Don\'ts\n\n';
      // Process node content
      return markdown;
    },
    propsTable: (node) => {
      let markdown = '\n## Props\n\n';
      markdown += '| Name | Type | Default | Required | Description |\n';
      markdown += '|------|------|---------|----------|-------------|\n';
      // Add rows
      return markdown;
    },
  });
}
```

**MDX Export**

```typescript
// src/features/export/exporters/mdx.ts
import { generateDocs } from '@tapestrylab/template';

export async function exportToMDX(editor: Editor): Promise<string> {
  const json = editor.getJSON();

  return generateDocs({
    content: json,
    format: 'mdx',
    components: {
      DosDonts: 'import { DosDonts } from "@/components/docs"',
      PropsTable: 'import { PropsTable } from "@/components/docs"',
    },
  });
}
```

### 7. Menu and Commands

**Slash Commands**

```typescript
// src/features/editor/extensions/slash-commands.ts
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        items: ({ query }) => {
          return [
            {
              title: 'Do\'s and Don\'ts',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).insertDosDonts().run();
              },
            },
            {
              title: 'Props Table',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).insertPropsTable('').run();
              },
            },
            {
              title: 'Code Example',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).insertCodeExample({}).run();
              },
            },
            {
              title: 'Callout',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).insertCallout('info').run();
              },
            },
          ].filter((item) =>
            item.title.toLowerCase().startsWith(query.toLowerCase())
          );
        },
      }),
    ];
  },
});
```

## Design Patterns

### Feature-Based Architecture

Organize by feature, not by file type:

```
✅ Good:
features/
  editor/
    components/
    extensions/
    hooks/

❌ Bad:
components/
  editor/
extensions/
  editor/
```

### Custom TipTap Extensions

Each custom documentation component is a TipTap extension:

- Define node schema
- Create React component for rendering
- Add commands for insertion
- Handle serialization/deserialization

### Composition

Compose complex features from smaller hooks:

```typescript
// src/features/editor/hooks/use-editor.ts
export function useEditor() {
  const { editor, setEditor } = useStudioStore();
  const { applyTemplate } = useTemplate();
  const { exportDocument } = useExport();

  return {
    editor,
    applyTemplate,
    exportDocument,
  };
}
```

## Testing Strategy

### Unit Tests

Test individual extensions:

```typescript
// src/features/editor/extensions/dos-donts.test.ts
import { createEditor } from '@tiptap/core';
import { DosDonts } from './dos-donts';

describe('DosDonts Extension', () => {
  it('inserts do\'s and don\'ts block', () => {
    const editor = createEditor({
      extensions: [DosDonts],
    });

    editor.commands.insertDosDonts();

    expect(editor.getHTML()).toContain('data-type="dos-donts"');
  });
});
```

### Integration Tests

Test feature interactions:

```typescript
// tests/integration/template-workflow.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Studio } from '@/app';

describe('Template Workflow', () => {
  it('applies component template', async () => {
    render(<Studio />);

    await userEvent.click(screen.getByText('Component Documentation'));

    expect(screen.getByText('Component Name')).toBeInTheDocument();
    expect(screen.getByText('Props')).toBeInTheDocument();
  });
});
```

## Accessibility

### Keyboard Shortcuts

Implement standard editor shortcuts:

```typescript
// Formatting
Cmd/Ctrl + B - Bold
Cmd/Ctrl + I - Italic
Cmd/Ctrl + K - Link

// Commands
/ - Slash commands
Cmd/Ctrl + / - Toggle comment
Cmd/Ctrl + Enter - Insert paragraph

// Navigation
Tab - Indent
Shift + Tab - Outdent
Cmd/Ctrl + Z - Undo
Cmd/Ctrl + Shift + Z - Redo
```

### ARIA Labels

Add labels to editor UI:

```typescript
<button
  onClick={insertDosDonts}
  aria-label="Insert Do's and Don'ts block"
>
  Insert Do's/Don'ts
</button>
```

### Focus Management

Ensure proper focus flow in editor:

```typescript
editor.commands.focus(); // Focus editor after operations
```

## Environment Variables

```bash
# .env.development
VITE_APP_TITLE=Tapestry Studio
VITE_ENABLE_ANALYTICS=false

# .env.production
VITE_APP_TITLE=Tapestry Studio
VITE_ENABLE_ANALYTICS=true
```

## Dependencies

### Production Dependencies

- `@tiptap/react`, `@tiptap/core`, `@tiptap/starter-kit` - Editor framework
- `@tiptap/extension-*` - Additional extensions
- `react`, `react-dom` - UI framework
- `@tapestrylab/extract` - Metadata extraction
- `@tapestrylab/resolve` - Module resolution
- `@tapestrylab/template` - Documentation rendering
- `zustand` - State management
- `@tanstack/react-query` - Async state
- `@radix-ui/react-*` - UI primitives
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `shiki` or `prismjs` - Syntax highlighting

### Development Dependencies

- `vite` - Build tool
- `typescript` - Type checking
- `vitest` - Testing framework
- `@testing-library/react` - React testing
- `@types/*` - Type definitions

## Common Tasks

### Adding a New Custom Extension

1. Create extension file: `src/features/editor/extensions/my-extension.ts`
2. Define node schema and commands
3. Create React component: `src/features/editor/extensions/my-extension-component.tsx`
4. Register in editor setup
5. Add slash command entry
6. Add export handler
7. Write tests

### Adding a New Template

1. Create template definition: `src/features/templates/definitions/my-template.ts`
2. Define document structure (TipTap JSON)
3. Add to templates array
4. Create preview component (optional)
5. Add tests

### Integrating with Tapestry Package

1. Add package dependency
2. Create feature hook: `src/features/feature-name/hooks/use-feature.ts`
3. Wrap in TanStack Query if async
4. Use in editor extension or component
5. Handle errors and loading states
6. Write tests

## Troubleshooting

### TipTap Extensions Not Rendering

Ensure extensions are registered in correct order:

```typescript
const editor = useEditor({
  extensions: [
    StarterKit, // Base extensions first
    CustomExtension, // Then custom extensions
  ],
});
```

### Custom Components Not Displaying

Check NodeView registration:

```typescript
addNodeView() {
  return ReactNodeViewRenderer(MyComponent);
}
```

### Export Not Working

Verify custom node serializers are defined:

```typescript
export function toMarkdown(doc) {
  // Handle all custom node types
}
```

## Future Enhancements

### Phase 1 (MVP)
- [ ] TipTap editor setup
- [ ] Component, Pattern, General templates
- [ ] Do's/Don'ts, Props Table, Code Example extensions
- [ ] Export to Markdown

### Phase 2 (Enhanced)
- [ ] Callout, Comparison extensions
- [ ] Export to MDX/HTML
- [ ] Template customization
- [ ] Asset management

### Phase 3 (Integration)
- [ ] Auto-metadata extraction
- [ ] Component preview
- [ ] Template library
- [ ] Search and organization

### Phase 4 (Collaboration)
- [ ] Real-time collaboration (Yjs)
- [ ] Version history
- [ ] Comments and annotations
- [ ] Publishing workflows

## Resources

- **TipTap**: https://tiptap.dev/
- **ProseMirror**: https://prosemirror.net/
- **TipTap Extensions**: https://tiptap.dev/api/extensions
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **Radix UI**: https://www.radix-ui.com/

## Related Documentation

- [README.md](./README.md) - User-facing documentation
- [packages/extract/CLAUDE.md](../extract/CLAUDE.md) - Extract package
- [packages/resolve/CLAUDE.md](../resolve/CLAUDE.md) - Resolve package
- [packages/template/CLAUDE.md](../template/CLAUDE.md) - Template package

---

**Status**: This package is planned but not yet implemented. This document serves as the technical specification for future development.
