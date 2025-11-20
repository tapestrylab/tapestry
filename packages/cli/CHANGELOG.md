# @tapestrylab/cli

## 0.2.1

### Patch Changes

- Updated dependencies [2214bc4]
  - @tapestrylab/extract@0.3.1
  - @tapestrylab/template@0.3.1

## 0.2.0

### Minor Changes

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
- Updated dependencies [c3a851b]
- Updated dependencies [d670f48]
  - @tapestrylab/extract@0.3.0
  - @tapestrylab/template@0.3.0
