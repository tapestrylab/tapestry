# @tapestrylab/template

## 0.3.1

### Patch Changes

- Updated dependencies [2214bc4]
  - @tapestrylab/extract@0.3.1
  - @tapestrylab/resolve@0.2.2

## 0.3.0

### Minor Changes

- c3a851b: explicit shallow merge for resolving custom themes
- d670f48: refactor: move CLI functionality to unified @tapestrylab/cli package

  **Breaking Change for CLI users**: The `@tapestrylab/template` package no longer includes CLI functionality. All CLI commands have been moved to the new `@tapestrylab/cli` package.

  **Changes:**
  - **@tapestrylab/template**: Removed CLI functionality to focus on programmatic API
    - The package now exports only the core template engine and components
    - All programmatic APIs remain unchanged and fully functional
    - Users relying on the programmatic API are not affected
  - **@tapestrylab/cli**: New unified CLI package for all Tapestry tools
    - Single `tapestry` command for all tools
    - Commands: `extract`, `generate`, `list`, `init`
    - Provides unified interface delegating to underlying packages
    - Install via: `npm install -g @tapestrylab/cli`

  **Migration for CLI users:**

  ```bash
  # Before
  npx @tapestrylab/template generate ./Button.tsx

  # After
  npm install -g @tapestrylab/cli
  tapestry generate ./Button.tsx
  ```

  **Migration for programmatic API users:**

  No changes required - all programmatic APIs remain the same.

### Patch Changes

- Updated dependencies [b6cdc99]
  - @tapestrylab/extract@0.3.0
  - @tapestrylab/resolve@0.2.1

## 0.2.0

### Minor Changes

- bd3d3ca: - simplify by delegating to resolve package
  - add relationship resolution and high-level API
  - add component enrichment types and extraction wrapper
  - add caching and watch mode
  - add error handling, plugin hooks, and convenience functions
  - use extract package's simpler API
  - add convenience functions for common use cases
  - make config fields optional with smart defaults
  - implement Phase 1 template engine

### Patch Changes

- Updated dependencies [bd3d3ca]
- Updated dependencies [018c079]
  - @tapestrylab/extract@0.2.0
  - @tapestrylab/resolve@0.2.0
