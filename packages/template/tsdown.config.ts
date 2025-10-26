import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/components/index.tsx', 'src/cli.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
});
