# Commit Message Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to automate changelog generation and version bumping via Changesets.

## Format

```
<type>(<scope>): <subject>
```

**Examples:**
- `feat(extract): add support for Vue components`
- `fix(resolve): handle circular dependencies correctly`
- `docs: update installation instructions`

## Commit Types

### Types that trigger changesets:

| Type | Bump | When to Use | Changeset? |
|------|------|-------------|------------|
| `feat` | **MINOR** | New features or capabilities | ✅ Yes |
| `fix` | **PATCH** | Bug fixes | ✅ Yes |
| `perf` | **PATCH** | Performance improvements | ✅ Yes |
| `refactor` | **PATCH** | Code changes affecting public API | ✅ Yes (if API changes) |
| `build` | **PATCH** | Build changes affecting end users | ✅ Yes (if user-facing) |

### Types that DON'T trigger changesets:

| Type | When to Use | Changeset? |
|------|-------------|------------|
| `docs` | Documentation-only changes | ❌ No |
| `test` | Adding or updating tests | ❌ No |
| `chore` | Maintenance, tooling, dependencies | ❌ No |
| `style` | Formatting, whitespace (no code change) | ❌ No |
| `ci` | CI/CD configuration changes | ❌ No |
| `refactor` | Internal refactoring (no API change) | ❌ No |

### Breaking Changes (MAJOR bump):

Add `!` after the type or `BREAKING CHANGE:` in the footer:

```
feat(extract)!: remove deprecated extractComponents export
```

or

```
feat(extract): redesign plugin API

BREAKING CHANGE: Plugin interface now requires async init() method
```

## Scopes

Use package names without the `@tapestrylab/` prefix:

- `extract` - @tapestrylab/extract
- `resolve` - @tapestrylab/resolve
- `graph` - @tapestrylab/graph
- `studio` - @tapestrylab/studio
- `docs` - Documentation site
- `repo` - Monorepo-wide changes

**Multiple packages:** Use `extract,resolve` or omit scope for workspace-wide changes.

## Examples by Scenario

### Adding a new feature
```
feat(extract): support extracting props from React.forwardRef
```
→ Creates **MINOR** changeset for `@tapestrylab/extract`

### Fixing a bug
```
fix(resolve): correctly resolve barrel exports
```
→ Creates **PATCH** changeset for `@tapestrylab/resolve`

### Breaking change
```
feat(graph)!: replace query API with GraphQL interface

BREAKING CHANGE: The old query() method has been removed. Use graphql() instead.
```
→ Creates **MAJOR** changeset for `@tapestrylab/graph`

### Documentation only (no changeset)
```
docs: add examples to extract package README
```
→ No changeset created

### Internal refactoring (no changeset)
```
refactor(extract): split component extraction into modules
```
→ No changeset (internal change, no API impact)

### Refactoring with API changes (changeset needed)
```
refactor(extract): simplify plugin interface

Previously exported PluginContext is now private. Use Plugin.init() instead.
```
→ Creates **PATCH** changeset (API surface changed)

### Multiple packages
```
feat(extract,resolve): add source map support
```
→ Creates **MINOR** changeset for both packages

### Performance improvement
```
perf(extract): optimize TypeScript parsing with worker pool
```
→ Creates **PATCH** changeset

### Dependency updates
```
chore(deps): upgrade typescript to 5.6
```
→ No changeset (internal tooling)

## Automation

The pre-push git hook automatically:
1. Detects which packages have source changes
2. Parses commit messages since branch divergence
3. Infers bump type (major/minor/patch) from commit types
4. Generates changesets automatically
5. Adds and commits the changeset

**You don't need to run `pnpm changeset` manually** - just write good commit messages!

## Tips

1. **Keep commits focused** - One logical change per commit
2. **Be specific in scopes** - Helps track which package changes
3. **Use imperative mood** - "add feature" not "added feature"
4. **Keep subject under 72 characters** - Per user preference for short messages
5. **Breaking changes are rare** - Think carefully before using `!` or `BREAKING CHANGE`

## What Claude Code Knows

When Claude makes commits, it will:
- Use `feat:` for new functionality
- Use `fix:` for bug fixes
- Use `docs:` for documentation-only changes
- Use `refactor:` for internal code restructuring without API changes
- Use `test:` for test additions/updates
- Use `chore:` for tooling and maintenance
- Add `!` suffix for breaking changes (rare)
- Include appropriate scope based on which package(s) changed
