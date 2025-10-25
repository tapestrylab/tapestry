#!/usr/bin/env tsx

/**
 * Test script for @tapestrylab/resolve
 *
 * This script demonstrates the resolver using the test fixtures.
 * Run with: pnpm tsx scripts/test-resolver.ts
 */

import { createResolver, strategies } from '../src/index.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesRoot = join(__dirname, '../test-fixtures');

// Colorful console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title: string) {
  console.log();
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, colors.dim);
  log(`${title}`, colors.bright + colors.cyan);
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, colors.dim);
}

function printResult(id: string, result: any) {
  if (result) {
    log(`  ✓ ${id}`, colors.green);
    log(`    → ${result.path}`, colors.dim);
    log(`    → source: ${result.source}`, colors.dim);
  } else {
    log(`  ✗ ${id}`, colors.red);
    log(`    → Not resolved`, colors.dim);
  }
}

async function main() {
  log('\n🧪 Testing @tapestrylab/resolve', colors.bright + colors.magenta);
  log(`Fixtures root: ${fixturesRoot}`, colors.dim);

  // ============================================================
  // Test 1: Local Strategy Only
  // ============================================================
  section('1. Local Strategy - File Resolution');

  const localResolver = createResolver({
    strategies: [
      strategies.local({
        root: fixturesRoot,
        checkExists: true,
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      }),
    ],
  });

  const localTests = [
    'components/Button.tsx',
    './components/Button.tsx',
    'components/Input',      // Should resolve to Input.ts
    'ui/Card',               // Should resolve to Card.jsx
    'ui/index',              // Should resolve to index.js
    'ui',                    // Should resolve to ui/index.js
    'nonexistent/file.ts',   // Should fail
  ];

  log('\nTesting local file resolution:', colors.blue);
  for (const id of localTests) {
    const result = await localResolver.resolve(id);
    printResult(id, result);
  }

  // ============================================================
  // Test 2: Local Strategy with Aliases
  // ============================================================
  section('2. Local Strategy - Alias Resolution');

  const aliasResolver = createResolver({
    strategies: [
      strategies.local({
        root: fixturesRoot,
        checkExists: true,
        alias: {
          '@components': 'components',
          '@ui': 'ui',
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      }),
    ],
  });

  const aliasTests = [
    '@components/Button',
    '@components/Input',
    '@ui/Card',
    '@ui/index',
    '@nonexistent/file',
  ];

  log('\nTesting alias resolution:', colors.blue);
  for (const id of aliasTests) {
    const result = await aliasResolver.resolve(id);
    printResult(id, result);
  }

  // ============================================================
  // Test 3: CDN Strategy
  // ============================================================
  section('3. CDN Strategy - NPM Package Resolution');

  const cdnResolver = createResolver({
    strategies: [
      strategies.cdn({
        provider: 'esm.sh',
        versionMap: {
          'react': '18.3.1',
          'lodash': '4.17.21',
          '@radix-ui/react-popover': '1.0.7',
        },
        verifyAvailability: false, // Skip HEAD requests for speed
      }),
    ],
  });

  const cdnTests = [
    'react',
    'lodash',
    'lodash/debounce',
    '@radix-ui/react-popover',
    'nonexistent-package-xyz',
  ];

  log('\nTesting CDN resolution (esm.sh):', colors.blue);
  for (const id of cdnTests) {
    const result = await cdnResolver.resolve(id);
    printResult(id, result);
  }

  // ============================================================
  // Test 4: Multi-Strategy Pipeline
  // ============================================================
  section('4. Multi-Strategy Pipeline - Local + CDN Fallback');

  const multiResolver = createResolver({
    strategies: [
      strategies.local({
        root: fixturesRoot,
        checkExists: true,
        alias: {
          '@components': 'components',
          '@ui': 'ui',
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      }),
      strategies.cdn({
        provider: 'esm.sh',
        versionMap: {
          'react': '18.3.1',
        },
        verifyAvailability: false,
      }),
    ],
  });

  const multiTests = [
    '@components/Button',  // Should resolve locally
    'react',               // Should resolve to CDN
    '@ui/Card',           // Should resolve locally
    'nonexistent',        // Should fail both strategies
  ];

  log('\nTesting multi-strategy resolution (local → cdn):', colors.blue);
  for (const id of multiTests) {
    const result = await multiResolver.resolve(id);
    printResult(id, result);
  }

  // ============================================================
  // Test 5: Batch Resolution
  // ============================================================
  section('5. Parallel Batch Resolution');

  const batchTests = [
    '@components/Button',
    '@components/Input',
    '@ui/Card',
    'react',
    'lodash',
  ];

  log('\nResolving multiple IDs in parallel:', colors.blue);
  const startTime = Date.now();
  const results = await multiResolver.resolveMany(batchTests);
  const duration = Date.now() - startTime;

  for (const id of batchTests) {
    const result = results.get(id);
    printResult(id, result);
  }
  log(`\n  ⏱️  Resolved ${batchTests.length} IDs in ${duration}ms`, colors.yellow);

  // ============================================================
  // Test 6: Different CDN Providers
  // ============================================================
  section('6. CDN Providers Comparison');

  const providers = ['esm.sh', 'jsdelivr', 'unpkg'] as const;
  const testPackage = 'react';

  log('\nComparing CDN providers for "react":', colors.blue);
  for (const provider of providers) {
    const resolver = createResolver({
      strategies: [
        strategies.cdn({
          provider,
          versionMap: { react: '18.3.1' },
          verifyAvailability: false,
        }),
      ],
    });
    const result = await resolver.resolve(testPackage);
    log(`  ${provider.padEnd(10)} → ${result?.path}`, colors.cyan);
  }

  // ============================================================
  // Summary
  // ============================================================
  section('Summary');
  log('✅ All tests completed successfully!', colors.green);
  log('\nNext steps:', colors.blue);
  log('  • Modify the test cases above to experiment with different scenarios');
  log('  • Try changing the CDN provider or version mappings');
  log('  • Add your own fixtures in test-fixtures/ directory');
  log('  • Check the README.md for full API documentation\n');
}

main().catch((error) => {
  console.error(colors.red + '❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
