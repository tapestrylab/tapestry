# React Extractor

This module extracts component metadata from React source files using `oxc-parser`, a fast Rust-based TypeScript/JSX parser.

## Architecture

The React extractor is organized into three main concerns:

```
react/
├── index.ts                    # Entry point & plugin interface
├── extraction/                 # Component & props extraction logic
│   ├── components.ts          # Component detection & metadata creation
│   └── props.ts               # Props metadata extraction
├── serialization/             # AST to string conversion
│   └── types.ts               # TypeScript type & value serialization
└── utils/                     # Shared utilities
    ├── type-guards.ts         # React/JSX detection predicates
    └── jsdoc.ts               # JSDoc comment parsing
```

## Module Responsibilities

### `index.ts`
- Exports `createReactExtractor()` plugin factory
- Handles file parsing via `oxc-parser`
- Orchestrates extraction pipeline
- Manages parse errors

### `extraction/`

#### `components.ts`
- AST traversal using Visitor pattern
- Detects React components (PascalCase functions returning JSX)
- Handles multiple export patterns (default, named)
- Coordinates props and JSDoc extraction
- Prevents duplicate component detection

#### `props.ts`
- Extracts prop metadata from function parameters
- Supports multiple patterns:
  - Destructured params with inline types
  - Destructured params with separate type annotations
  - Identifier params with type annotations
- Detects default values and required/optional status

### `serialization/`

#### `types.ts`
- Converts TypeScript AST type nodes to string representations
- Handles complex types:
  - Primitives, arrays, tuples
  - Unions, intersections, conditionals
  - Functions, generics, mapped types
  - Literal types, indexed access types
- Serializes default values from expressions

### `utils/`

#### `type-guards.ts`
- Pure predicate functions for component detection
- JSX detection (elements, fragments, expressions)
- Component pattern validation (PascalCase + JSX return)
- Arrow function vs function expression detection

#### `jsdoc.ts`
- Extracts component descriptions from JSDoc comments
- Filters out JSDoc tags (e.g., `@param`, `@returns`)
- Returns clean description text

## Data Flow

```
index.ts (parse)
    ↓
extraction/components.ts (find components)
    ↓
├─→ utils/type-guards.ts (validate component pattern)
├─→ extraction/props.ts (extract props)
│       ↓
│   serialization/types.ts (serialize types & values)
└─→ utils/jsdoc.ts (extract description)
```

## Component Detection

A valid React component must:
1. Have a PascalCase name (starts with uppercase letter)
2. Return JSX (directly or via block statement)
3. Be a function (declaration or expression/arrow function)

Supported patterns:
```typescript
// Function declaration
function Button(props) { return <button />; }

// Arrow function variable
const Button = (props) => <button />;

// Function expression variable
const Button = function(props) { return <button />; }

// Default export
export default function Button(props) { return <button />; }

// Named export
export function Button(props) { return <button />; }
```

## Props Extraction Patterns

### Destructured with Inline Type
```typescript
function Button({ title, onClick }: { title: string; onClick: () => void }) {
  // Props extracted with types from inline literal
}
```

### Destructured with Type Annotation
```typescript
interface ButtonProps {
  title: string;
  onClick: () => void;
}

function Button({ title, onClick }: ButtonProps) {
  // Props extracted from type annotation
}
```

### Identifier with Type
```typescript
function Button(props: ButtonProps) {
  // Props extracted from props type annotation
}
```

### Default Values
```typescript
function Button({ title = "Click me", onClick }: Props) {
  // Default values are captured and serialized
}
```

## Type Serialization

The type serializer handles complex TypeScript types:

- **Primitives**: `string`, `number`, `boolean`, etc.
- **Arrays**: `string[]`, `Array<number>`
- **Tuples**: `[string, number]`
- **Unions**: `string | number`
- **Intersections**: `A & B`
- **Functions**: `(x: string) => void`
- **Generics**: `Array<T>`, `Record<K, V>`
- **Literals**: `"hello"`, `42`, `true`
- **Conditionals**: `T extends U ? X : Y`
- **Mapped**: `{ [K in keyof T]: T[K] }`

## Testing

The extractor is tested via the main CLI:

```bash
pnpm test:extract  # Extracts metadata from ./test fixtures
```

## Adding Features

To extend the React extractor:

1. **New component patterns**: Update `extraction/components.ts` visitor
2. **New type support**: Add serializers to `serialization/types.ts`
3. **New prop patterns**: Extend `extraction/props.ts` logic
4. **New utilities**: Add to appropriate subdirectory (`utils/`, `serialization/`, etc.)

## Performance

The extractor is designed for performance:
- Uses `oxc-parser` (Rust-based) for extremely fast parsing
- Single-pass AST traversal with Visitor pattern
- Lazy evaluation via predicate guards
- Minimal string allocations via direct AST serialization
