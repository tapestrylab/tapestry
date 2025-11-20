/**
 * Browser-compatible core extraction API
 *
 * This module provides pure extraction functionality without Node.js dependencies.
 * Use this in edge runtimes, browsers, or other non-Node.js environments.
 *
 * @example
 * ```typescript
 * import { createReactExtractor } from '@tapestrylab/extract/core';
 *
 * const extractor = createReactExtractor();
 * const metadata = await extractor.extract('Button.tsx', sourceCode);
 * ```
 */

// Export the React extractor (pure, no Node.js dependencies)
export { createReactExtractor } from "./extractors/react/index.js";

// Export core types (browser-compatible)
export type {
  ComponentMetadata,
  PropMetadata,
  ExtractedMetadata,
  ExtractError,
  ExtractorPlugin,
} from "./types.js";

// Re-export the error class
export { ExtractionError } from "./types.js";
