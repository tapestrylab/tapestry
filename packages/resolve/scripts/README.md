# Resolve Scripts

This directory contains utility scripts for testing and demonstrating the `@tapestrylab/resolve` package.

## test-resolver.ts

Interactive demo script that showcases the resolver's capabilities using the test fixtures.

### Usage

```bash
# From the resolve package directory
pnpm demo

# Or directly with tsx
pnpm tsx scripts/test-resolver.ts
```

### What it demonstrates

1. **Local file resolution** - Resolving files from the filesystem
2. **Alias resolution** - Using path aliases like `@components/Button`
3. **CDN resolution** - Resolving npm packages from CDNs (esm.sh, jsdelivr, unpkg)
4. **Multi-strategy pipelines** - Combining local and CDN resolution with fallbacks
5. **Batch resolution** - Resolving multiple IDs in parallel
6. **CDN provider comparison** - Comparing different CDN providers

### Fixtures

The script uses fixtures from `test-fixtures/`:
- `components/Button.tsx` - React component
- `components/Input.ts` - TypeScript component
- `ui/Card.jsx` - JavaScript component
- `ui/index.js` - Index file

### Customization

You can modify the script to:
- Test different resolution strategies
- Try different CDN providers
- Add your own test cases
- Experiment with different configurations

### Output

The script outputs colorized results showing:
- ✓ Successful resolutions with the resolved path
- ✗ Failed resolutions
- Resolution source (local, cdn, remote)
- Performance metrics for batch operations
